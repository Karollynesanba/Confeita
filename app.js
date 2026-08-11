const page = document.body.dataset.page;

const setActiveNav = () => {
  const current = location.pathname.split("/").pop() || "confeita-identidade.html";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("href");
    link.classList.toggle("active", target === current || (!target && current === "confeita-identidade.html"));
  });
};

const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return [h, m, r].map((part, index) => String(part).padStart(index === 0 && h ? 2 : 2, "0")).join(":");
};

const API_BASE = location.protocol === "file:" ? "http://localhost:3000" : "";
const AUTH_TOKEN_KEY = "confeita_auth_token";

const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
const setAuthToken = (token) => {
  if (!token) localStorage.removeItem(AUTH_TOKEN_KEY);
  else localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = payload && typeof payload === "object" && payload.error ? payload.error : "Falha na requisição";
    throw new Error(error);
  }

  return payload;
};

const formatCommentDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

setActiveNav();

if (page === "home") {
  const search = document.querySelector("[data-recipe-search]");
  const cards = [...document.querySelectorAll("[data-recipe-card]")];
  const filters = [...document.querySelectorAll("[data-recipe-filter]")];
  const pantryInput = document.querySelector("[data-pantry-input]");
  const pantryResults = document.querySelector("[data-pantry-results]");
  const pantryPicks = [...document.querySelectorAll("[data-pantry-pick]")];
  let activeFilter = "all";

  const applyRecipeFilters = () => {
    const q = search?.value.trim().toLowerCase() || "";
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const category = card.dataset.recipeCategory || "all";
      const matchesSearch = !q || text.includes(q);
      const matchesFilter = activeFilter === "all" || category === activeFilter;
      card.hidden = !(matchesSearch && matchesFilter);
    });
  };

  const pantryIdeas = [
    {
      title: "Bolo de banana com chocolate",
      ingredients: ["banana", "ovo", "chocolate", "farinha"],
      time: "45 min",
      level: "Fácil",
      note: "Perfeito para aproveitar bananas maduras e pedaços de chocolate.",
    },
    {
      title: "Cookies macios com gotas de chocolate",
      ingredients: ["manteiga", "ovo", "farinha", "chocolate"],
      time: "30 min",
      level: "Fácil",
      note: "Usa itens simples e transforma sobras em um lanche bonito.",
    },
    {
      title: "Bolo de iogurte e limão",
      ingredients: ["iogurte", "ovo", "limão", "farinha"],
      time: "50 min",
      level: "Fácil",
      note: "Leve, aromatico e ótimo para o café da tarde.",
    },
    {
      title: "Pão de queijo macio",
      ingredients: ["queijo", "ovo", "leite", "polvilho"],
      time: "40 min",
      level: "Médio",
      note: "Uma boa saida para ovos, queijo e leite que estao na geladeira.",
    },
    {
      title: "Torta de maçã e canela",
      ingredients: ["maca", "manteiga", "farinha", "canela"],
      time: "1h",
      level: "Médio",
      note: "Aproveita frutas maduras e rende uma sobremesa acolhedora.",
    },
    {
      title: "Creme de colher com coco",
      ingredients: ["leite", "coco", "amido", "acucar"],
      time: "25 min",
      level: "Fácil",
      note: "Uma opção rapida para usar leite e coco sem complicacao.",
    },
  ];

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const renderPantryIdeas = () => {
    if (!pantryResults) return;
    const terms = normalize(pantryInput?.value || "")
      .split(/[,;\n]/)
      .map((term) => term.trim())
      .filter(Boolean);

    const ranked = pantryIdeas
      .map((idea) => {
        const matches = terms.filter((term) =>
          idea.ingredients.some((ingredient) => normalize(ingredient).includes(term) || term.includes(normalize(ingredient)))
        ).length;
        const bonus = terms.length === 0 ? 1 : matches;
        return { ...idea, score: bonus };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    pantryResults.innerHTML = ranked
      .map(
        (idea) => `
          <article class="pantry-idea">
            <div class="pantry-idea-head">
              <h3>${idea.title}</h3>
              <span class="pantry-level">${idea.level}</span>
            </div>
            <p>${idea.note}</p>
            <div class="pantry-idea-meta">
              <span>⏱ ${idea.time}</span>
              <span>${idea.ingredients.slice(0, 3).join(" · ")}</span>
            </div>
          </article>
        `
      )
      .join("");
  };

  if (search) {
    search.addEventListener("input", applyRecipeFilters);
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.recipeFilter || "all";
      filters.forEach((filter) => filter.classList.toggle("active", filter === button));
      applyRecipeFilters();
    });
  });

  pantryInput?.addEventListener("input", renderPantryIdeas);
  pantryPicks.forEach((button) => {
    button.addEventListener("click", () => {
      const ingredient = button.dataset.pantryPick || "";
      if (!pantryInput || !ingredient) return;
      const current = pantryInput.value.trim();
      pantryInput.value = current ? `${current}, ${ingredient}` : ingredient;
      renderPantryIdeas();
      pantryInput.focus();
    });
  });

  applyRecipeFilters();
  renderPantryIdeas();

  const countdownEls = {
    d: document.querySelector("[data-days]"),
    h: document.querySelector("[data-hours]"),
    m: document.querySelector("[data-minutes]"),
    s: document.querySelector("[data-seconds]"),
  };
  const target = new Date();
  target.setDate(target.getDate() + 3);
  target.setHours(18, 0, 0, 0);
  const tick = () => {
    const diff = Math.max(0, target - new Date());
    const total = Math.floor(diff / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (countdownEls.d) countdownEls.d.textContent = String(days).padStart(2, "0");
    if (countdownEls.h) countdownEls.h.textContent = String(hours).padStart(2, "0");
    if (countdownEls.m) countdownEls.m.textContent = String(mins).padStart(2, "0");
    if (countdownEls.s) countdownEls.s.textContent = String(secs).padStart(2, "0");
  };
  tick();
  setInterval(tick, 1000);

  document.querySelectorAll("[data-faq]").forEach((item) => {
    const button = item.querySelector(".faq-q");
    button?.addEventListener("click", () => item.classList.toggle("open"));
  });
}

if (page === "login") {
  const loginForm = document.querySelector("[data-login-form]");
  const authStatus = document.querySelector("[data-auth-status]");
  const authHint = document.querySelector("[data-login-hint]");
  const continueButton = document.querySelector("[data-login-continue]");

  const showLoggedIn = (name) => {
    if (authStatus) authStatus.textContent = `Logado como ${name}`;
    if (authHint) {
      authHint.textContent = "Sua conta já está ativa. Você pode voltar para a home ou continuar navegando.";
    }
    if (continueButton) continueButton.hidden = false;
  };

  const loadMe = async () => {
    try {
      const me = await apiRequest("/api/me");
      showLoggedIn(me.name || "sua conta");
    } catch {
      if (authStatus) authStatus.textContent = "Faça login para comentar e salvar suas receitas favoritas.";
      if (authHint) authHint.textContent = "Use seu e-mail e senha cadastrados para entrar.";
      if (continueButton) continueButton.hidden = true;
    }
  };

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    try {
      const result = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        }),
      });
      setAuthToken(result.token);
      loginForm.reset();
      showLoggedIn(result.user?.name || "sua conta");
      await loadMe();
    } catch (error) {
      if (authStatus) authStatus.textContent = error.message;
    }
  });

  continueButton?.addEventListener("click", () => {
    location.href = "./confeita-identidade.html";
  });

  loadMe();
}

if (page === "recipe") {
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === id));
    });
  });

  const duration = 34 * 60;
  const clock = document.querySelector("[data-timer]");
  const progress = document.querySelector("[data-progress]");
  let remaining = duration;
  let timer = null;

  const paint = () => {
    if (clock) clock.textContent = formatTime(remaining);
    if (progress) progress.style.width = `${((duration - remaining) / duration) * 100}%`;
  };
  const startTimer = () => {
    if (timer) return;
    timer = setInterval(() => {
      remaining -= 1;
      paint();
      if (remaining <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  };
  paint();
  document.querySelector("[data-start-timer]")?.addEventListener("click", startTimer);
  document.querySelector("[data-reset-timer]")?.addEventListener("click", () => {
    remaining = duration;
    clearInterval(timer);
    timer = null;
    paint();
  });

  const recipeId = document.querySelector("[data-recipe]")?.dataset.recipe || "bolo-morango-chantilly";
  const authStatus = document.querySelector("[data-auth-status]");
  const authForms = document.querySelector("[data-auth-forms]");
  const loginForm = document.querySelector("[data-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
  const composer = document.querySelector("[data-comment-composer]");
  const logoutButton = document.querySelector("[data-logout-button]");
  const commentText = document.querySelector("[data-comment-text]");
  const commentSubmit = document.querySelector("[data-comment-submit]");
  const commentList = document.querySelector("[data-comment-list]");
  const commentHint = document.querySelector("[data-comment-hint]");

  let currentUser = null;

  const renderAuthState = () => {
    const loggedIn = Boolean(currentUser);
    if (authStatus) {
      authStatus.textContent = loggedIn ? `Logado como ${currentUser.name}` : "Entre para comentar";
    }
    if (authForms) authForms.hidden = loggedIn;
    if (composer) composer.hidden = !loggedIn;
    if (commentHint) {
      commentHint.textContent = loggedIn
        ? `Você está comentando como ${currentUser.name}.`
        : "Você precisa criar uma conta para publicar um comentário.";
    }
    if (commentSubmit) commentSubmit.disabled = !loggedIn;
  };

  const renderComments = (comments) => {
    if (!commentList) return;
    commentList.innerHTML = "";
    if (!comments.length) {
      commentList.innerHTML = '<div class="comment-skeleton">Ainda não há comentários nesta receita.</div>';
      return;
    }
    comments.forEach((comment) => {
      const item = document.createElement("article");
      item.className = "comment-item";
      item.innerHTML = `
        <div class="comment-item-head">
          <div>
            <strong>${comment.userName}</strong>
            <div class="rating">★★★★★</div>
          </div>
          <span class="comment-time">${formatCommentDate(comment.createdAt)}</span>
        </div>
        <p>${comment.text}</p>
      `;
      commentList.appendChild(item);
    });
  };

  const loadMe = async () => {
    try {
      currentUser = await apiRequest("/api/me");
    } catch {
      currentUser = null;
    }
    renderAuthState();
  };

  const loadComments = async () => {
    if (!commentList) return;
    try {
      const data = await apiRequest(`/api/comments?recipe=${encodeURIComponent(recipeId)}`);
      renderComments(data.comments || []);
    } catch (error) {
      commentList.innerHTML = `<div class="comment-skeleton">Não foi possível carregar comentários: ${error.message}</div>`;
    }
  };

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    try {
      const result = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        }),
      });
      setAuthToken(result.token);
      currentUser = result.user;
      loginForm.reset();
      renderAuthState();
      await loadComments();
    } catch (error) {
      if (authStatus) authStatus.textContent = error.message;
    }
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    try {
      const result = await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify({
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        }),
      });
      setAuthToken(result.token);
      currentUser = result.user;
      registerForm.reset();
      renderAuthState();
      await loadComments();
    } catch (error) {
      if (authStatus) authStatus.textContent = error.message;
    }
  });

  logoutButton?.addEventListener("click", async () => {
    try {
      await apiRequest("/api/logout", { method: "POST" });
    } catch {
      // logout should still clear local state
    }
    setAuthToken(null);
    currentUser = null;
    renderAuthState();
  });

  commentSubmit?.addEventListener("click", async () => {
    const text = commentText?.value.trim() || "";
    if (!text) {
      if (commentHint) commentHint.textContent = "Escreva um comentário antes de publicar.";
      return;
    }
    if (!currentUser) {
      if (commentHint) commentHint.textContent = "Entre ou crie uma conta para comentar.";
      return;
    }
    try {
      commentSubmit.disabled = true;
      await apiRequest("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          recipe: recipeId,
          text,
        }),
      });
      if (commentText) commentText.value = "";
      await loadComments();
      if (commentHint) commentHint.textContent = "Comentário publicado com sucesso.";
    } catch (error) {
      if (commentHint) commentHint.textContent = error.message;
    } finally {
      renderAuthState();
    }
  });

  loadMe().then(loadComments);
}

if (page === "chat") {
  const input = document.querySelector("[data-chat-input]");
  const stream = document.querySelector("[data-chat-stream]");
  const pills = [...document.querySelectorAll("[data-prompt]")];

  const send = (text, user = true) => {
    if (!stream) return;
    const bubble = document.createElement("div");
    bubble.className = `message${user ? " me" : ""}`;
    bubble.textContent = text;
    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const prompt = pill.dataset.prompt || "";
      if (input) input.value = prompt;
      send(prompt, true);
      const typing = document.createElement("div");
      typing.className = "typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      stream.appendChild(typing);
      stream.scrollTop = stream.scrollHeight;
      setTimeout(() => {
        typing.remove();
        send("Perfeito. Posso adaptar a receita, sugerir trocas e explicar o passo a passo em linguagem simples.", false);
      }, 1100);
    });
  });

  document.querySelector("[data-chat-send]")?.addEventListener("click", () => {
    const value = input?.value.trim();
    if (!value) return;
    send(value, true);
    if (input) input.value = "";
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    stream.appendChild(typing);
    stream.scrollTop = stream.scrollHeight;
    setTimeout(() => {
      typing.remove();
      send("Vou te responder como um confeiteiro atento: com contexto, medida certa e sem complicar.", false);
    }, 1200);
  });
}

if (page === "community") {
  const feed = document.querySelector("[data-community-feed]");
  const filters = [...document.querySelectorAll("[data-community-filter]")];
  const form = document.querySelector("[data-community-form]");
  const titleInput = document.querySelector("[data-community-title]");
  const levelInput = document.querySelector("[data-community-level]");
  const timeInput = document.querySelector("[data-community-time]");
  const tagsInput = document.querySelector("[data-community-tags]");
  const descriptionInput = document.querySelector("[data-community-description]");
  const xpValue = document.querySelector("[data-community-xp]");
  const levelLabel = document.querySelector("[data-community-level-label]");
  const progressBar = document.querySelector("[data-community-progress]");
  const stateKey = "confeita_community_state";
  const postsKey = "confeita_community_posts";

  const tierList = [
    { name: "Básico", min: 0, max: 59 },
    { name: "Aprendiz", min: 60, max: 119 },
    { name: "Intermediário", min: 120, max: 219 },
    { name: "Avançado", min: 220, max: 359 },
    { name: "Mestre", min: 360, max: Infinity },
  ];

  const levelMap = {
    basico: "Básico",
    intermediario: "Intermediário",
    avancado: "Avançado",
  };

  const xpGain = {
    basico: 18,
    intermediario: 28,
    avancado: 40,
  };

  let state = { xp: 180 };
  try {
    const rawState = localStorage.getItem(stateKey);
    if (rawState) state = { ...state, ...JSON.parse(rawState) };
  } catch {
    // Keep defaults when storage is unavailable.
  }

  const getTier = (xp) => {
    for (let index = tierList.length - 1; index >= 0; index -= 1) {
      if (xp >= tierList[index].min) return tierList[index];
    }
    return tierList[0];
  };

  const persistState = () => {
    try {
      localStorage.setItem(stateKey, JSON.stringify(state));
    } catch {
      // Non-blocking.
    }
  };

  const renderState = () => {
    const tier = getTier(state.xp);
    const nextTier = tierList[tierList.indexOf(tier) + 1];
    const progress = nextTier && Number.isFinite(nextTier.min)
      ? ((state.xp - tier.min) / Math.max(1, nextTier.min - tier.min)) * 100
      : 100;

    if (xpValue) xpValue.textContent = `${state.xp}`;
    if (levelLabel) levelLabel.textContent = tier.name;
    if (progressBar) progressBar.style.width = `${Math.max(12, Math.min(100, progress))}%`;
  };

  const levelClass = (level) => {
    if (level === "avancado") return "advanced";
    if (level === "intermediario") return "intermediate";
    return "basic";
  };

  const thumbClass = (level) => {
    if (level === "avancado") return "brownie";
    if (level === "intermediario") return "macaron";
    return "cake";
  };

  const createPost = (post) => {
    const article = document.createElement("article");
    article.className = "community-post";
    article.dataset.communityPost = "true";
    article.dataset.level = post.level;
    article.innerHTML = `
      <div class="community-thumb ${thumbClass(post.level)}"></div>
      <div class="community-post-head">
        <div>
          <span class="community-level ${levelClass(post.level)}">${levelMap[post.level] || "Básico"}</span>
          <h3>${post.title}</h3>
        </div>
        <div class="community-meta">
          <span>⏱ ${post.time}</span>
          <span>❤ ${post.likes}</span>
          <span>💬 ${post.comments}</span>
        </div>
      </div>
      <p class="muted">${post.description}</p>
      <div class="community-post-footer">
        <div class="author-chip">
          <span class="avatar-circle">${post.initials}</span>
          <div>
            <strong>${post.author}</strong>
            <small class="muted">${post.subtitle}</small>
          </div>
        </div>
        <span class="chip ${post.level === "basico" ? "mint" : post.level === "intermediario" ? "gold" : "dark"}">${post.tags}</span>
      </div>
    `;
    return article;
  };

  const applyFilter = (filter) => {
    filters.forEach((button) => button.classList.toggle("active", button.dataset.communityFilter === filter));
    document.querySelectorAll("[data-community-post]").forEach((post) => {
      post.hidden = filter !== "all" && post.dataset.level !== filter;
    });
  };

  const storedPosts = (() => {
    try {
      return JSON.parse(localStorage.getItem(postsKey) || "[]");
    } catch {
      return [];
    }
  })();

  if (feed && storedPosts.length) {
    storedPosts.slice().reverse().forEach((post) => {
      feed.prepend(createPost(post));
    });
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.communityFilter || "all"));
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = String(titleInput?.value || "").trim();
    const level = String(levelInput?.value || "basico");
    const time = String(timeInput?.value || "").trim();
    const tags = String(tagsInput?.value || "").trim();
    const description = String(descriptionInput?.value || "").trim();
    if (!title || !time || !tags || !description || !feed) return;

    const post = {
      title,
      level,
      time,
      tags: tags.split(",").slice(0, 2).join(" · ").trim() || tags,
      description,
      author: "Você",
      subtitle: "Acabou de publicar na comunidade",
      initials: "VC",
      likes: 0,
      comments: 0,
    };

    feed.prepend(createPost(post));
    storedPosts.push(post);
    try {
      localStorage.setItem(postsKey, JSON.stringify(storedPosts.slice(-24)));
    } catch {
      // Non-blocking.
    }

    state.xp += xpGain[level] || 18;
    persistState();
    renderState();
    applyFilter(filters.find((button) => button.classList.contains("active"))?.dataset.communityFilter || "all");
    form.reset();
    if (levelInput) levelInput.value = "basico";
    if (titleInput) titleInput.focus();
  });

  renderState();
  applyFilter("all");
}

if (page === "cook") {
  const steps = [...document.querySelectorAll("[data-cook-step]")];
  const fill = document.querySelector("[data-cook-progress]");
  const tip = document.querySelector("[data-cook-tip]");
  const timerEl = document.querySelector("[data-cook-timer]");
  let active = 0;
  let remaining = 9 * 60;
  let timer = null;

  const tips = [
    "Mexa sempre em fogo médio para manter a textura cremosa.",
    "Se a massa engrossar cedo, respire: o ponto melhora nos últimos minutos.",
    "Finalizar com descanso deixa a cobertura mais estável e brilhante.",
    "Uma pitada de sal faz o chocolate parecer ainda mais intenso."
  ];

  const render = () => {
    steps.forEach((step, index) => step.classList.toggle("done", index <= active));
    if (fill) fill.style.width = `${((active + 1) / steps.length) * 100}%`;
    if (tip) tip.textContent = tips[active] || tips[0];
  };
  const paintTimer = () => {
    if (timerEl) timerEl.textContent = formatTime(remaining);
  };
  const next = () => {
    active = Math.min(steps.length - 1, active + 1);
    render();
  };
  const prev = () => {
    active = Math.max(0, active - 1);
    render();
  };

  document.querySelector("[data-cook-next]")?.addEventListener("click", next);
  document.querySelector("[data-cook-prev]")?.addEventListener("click", prev);
  document.querySelector("[data-cook-start]")?.addEventListener("click", () => {
    if (timer) return;
    timer = setInterval(() => {
      remaining -= 1;
      paintTimer();
      if (remaining <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  });
  document.querySelector("[data-cook-reset]")?.addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
    remaining = 9 * 60;
    active = 0;
    paintTimer();
    render();
  });

  paintTimer();
  render();
}

if (page === "profile") {
  const tabs = [...document.querySelectorAll("[data-profile-tab]")];
  const panels = [...document.querySelectorAll("[data-profile-panel]")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.profileTab;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.profilePanel === id));
    });
  });
}
