const http = require("http");
const fs = require("fs/promises");
const fssync = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STORE_FILE = path.join(DATA_DIR, "confeita-store.json");
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const initialStore = {
  users: [],
  sessions: {},
  comments: [
    {
      id: crypto.randomUUID(),
      recipe: "bolo-morango-chantilly",
      userId: "seed",
      userName: "Ana Claudia S.",
      text: "A massa ficou fofinha e o passo a passo é muito claro.",
      createdAt: new Date("2026-08-01T11:30:00-03:00").toISOString(),
    },
    {
      id: crypto.randomUUID(),
      recipe: "bolo-morango-chantilly",
      userId: "seed",
      userName: "Mariana Oliveira",
      text: "Ótima receita para festa. O chantilly fica leve e bonito.",
      createdAt: new Date("2026-08-02T16:05:00-03:00").toISOString(),
    },
  ],
};

let store = null;

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  if (!fssync.existsSync(STORE_FILE)) {
    await fs.writeFile(STORE_FILE, JSON.stringify(initialStore, null, 2), "utf8");
  }
  const raw = await fs.readFile(STORE_FILE, "utf8");
  store = JSON.parse(raw);
  store.users ??= [];
  store.sessions ??= {};
  store.comments ??= [];
}

async function persistStore() {
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function json(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    ...extraHeaders,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 1_000_000) {
        reject(new Error("Payload muito grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeName(name) {
  return String(name || "").trim().slice(0, 60);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  const candidate = crypto.pbkdf2Sync(String(password), user.salt, 120000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  store.sessions[token] = {
    userId,
    createdAt: new Date().toISOString(),
  };
  return token;
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

function getUserFromRequest(req) {
  const token = getToken(req);
  if (!token) return null;
  const session = store.sessions[token];
  if (!session) return null;
  return store.users.find((user) => user.id === session.userId) || null;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  fssync.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

async function handleRegister(req, res) {
  const body = await readBody(req);
  const name = normalizeName(body.name);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!name) return json(res, 400, { error: "Informe seu nome." });
  if (!email || !email.includes("@")) return json(res, 400, { error: "Informe um e-mail válido." });
  if (password.length < 6) return json(res, 400, { error: "A senha precisa ter no mínimo 6 caracteres." });
  if (store.users.some((user) => user.email === email)) {
    return json(res, 409, { error: "Esse e-mail já está cadastrado." });
  }

  const { salt, hash } = hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  const token = createSession(user.id);
  await persistStore();
  return json(res, 200, { token, user: sanitizeUser(user) });
}

async function handleLogin(req, res) {
  const body = await readBody(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const user = store.users.find((item) => item.email === email);

  if (!user) return json(res, 401, { error: "E-mail ou senha inválidos." });
  if (!verifyPassword(password, user)) return json(res, 401, { error: "E-mail ou senha inválidos." });

  const token = createSession(user.id);
  await persistStore();
  return json(res, 200, { token, user: sanitizeUser(user) });
}

async function handleLogout(req, res) {
  const token = getToken(req);
  if (token && store.sessions[token]) {
    delete store.sessions[token];
    await persistStore();
  }
  return json(res, 200, { ok: true });
}

function handleMe(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return json(res, 401, { error: "Não autenticado." });
  return json(res, 200, sanitizeUser(user));
}

function handleCommentsList(urlObj, res) {
  const recipe = String(urlObj.searchParams.get("recipe") || "");
  const comments = store.comments
    .filter((comment) => comment.recipe === recipe)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((comment) => ({
      id: comment.id,
      userName: comment.userName,
      text: comment.text,
      createdAt: comment.createdAt,
    }));
  return json(res, 200, { comments });
}

async function handleCommentCreate(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return json(res, 401, { error: "Você precisa entrar na conta para comentar." });

  const body = await readBody(req);
  const recipe = String(body.recipe || "").trim();
  const text = String(body.text || "").trim();

  if (!recipe) return json(res, 400, { error: "Informe a receita." });
  if (!text) return json(res, 400, { error: "Escreva um comentário." });
  if (text.length > 500) return json(res, 400, { error: "O comentário deve ter no máximo 500 caracteres." });

  const comment = {
    id: crypto.randomUUID(),
    recipe,
    userId: user.id,
    userName: user.name,
    text,
    createdAt: new Date().toISOString(),
  };

  store.comments.push(comment);
  await persistStore();
  return json(res, 201, {
    comment: {
      id: comment.id,
      userName: comment.userName,
      text: comment.text,
      createdAt: comment.createdAt,
    },
  });
}

async function ensureAuthAndStore() {
  if (!store) await ensureStore();
}

async function main() {
  await ensureAuthAndStore();

  const server = http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);

      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        });
        res.end();
        return;
      }

      if (urlObj.pathname === "/api/register" && req.method === "POST") {
        await handleRegister(req, res);
        return;
      }

      if (urlObj.pathname === "/api/login" && req.method === "POST") {
        await handleLogin(req, res);
        return;
      }

      if (urlObj.pathname === "/api/logout" && req.method === "POST") {
        await handleLogout(req, res);
        return;
      }

      if (urlObj.pathname === "/api/me" && req.method === "GET") {
        handleMe(req, res);
        return;
      }

      if (urlObj.pathname === "/api/comments" && req.method === "GET") {
        handleCommentsList(urlObj, res);
        return;
      }

      if (urlObj.pathname === "/api/comments" && req.method === "POST") {
        await handleCommentCreate(req, res);
        return;
      }

      let pathname = urlObj.pathname === "/" ? "/index.html" : urlObj.pathname;
      pathname = pathname.replace(/\\/g, "/");
      const filePath = path.join(ROOT, pathname);
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }
      if (fssync.existsSync(filePath) && fssync.statSync(filePath).isFile()) {
        serveStaticFile(res, filePath);
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: error.message || "Erro interno" }));
    }
  });

  server.listen(PORT, () => {
    console.log(`Confeita backend rodando em http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
