import { useState, useRef, useEffect } from "react";
import {
  Search, Heart, Star, Play, MessageCircle, User, Users,
  ArrowRight, Check, Clock, Send, X, Menu,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Timer, Home, BookOpen, MoreHorizontal, Mic, Flame, Trophy, Bookmark
} from "lucide-react";

type Page = "home" | "recipe" | "ai-chat" | "cook-mode" | "profile";
type RecipeTab = "ingredients" | "steps" | "comments";
type ProfileTab = "achievements" | "favorites" | "published";

// ── Image registry ─────────────────────────────────────────────────────────────
const IMG = {
  hero:         "https://images.unsplash.com/photo-1752652015532-ab8f793bdaf4?w=900&h=700&fit=crop&auto=format",
  cakePink:     "https://images.unsplash.com/photo-1724627557695-0f2ffdf63a46?w=400&h=320&fit=crop&auto=format",
  cakeChoco:    "https://images.unsplash.com/photo-1635282530626-d8c4c325b204?w=400&h=320&fit=crop&auto=format",
  cupcakes:     "https://images.unsplash.com/photo-1645725406080-c597c2f0c100?w=400&h=320&fit=crop&auto=format",
  croissant:    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=320&fit=crop&auto=format",
  birthday:     "https://images.unsplash.com/photo-1777573642690-89bd49cc86a8?w=400&h=320&fit=crop&auto=format",
  dessertTable: "https://images.unsplash.com/photo-1764380746818-18c01e96df12?w=400&h=320&fit=crop&auto=format",
  goldDesserts: "https://images.unsplash.com/photo-1769812343628-81300c21753c?w=900&h=500&fit=crop&auto=format",
  bakingWoman:  "https://images.unsplash.com/photo-1783768204400-7e6f402f3738?w=700&h=500&fit=crop&auto=format",
  baking2:      "https://images.unsplash.com/photo-1752652015387-365082ac8c48?w=900&h=700&fit=crop&auto=format",
};

// ── Static data ────────────────────────────────────────────────────────────────
const RECIPES = [
  { id: 1, title: "Bolo de Morango com Chantilly", time: "1h 20min", difficulty: "Médio",    rating: 4.8, reviews: 234, image: IMG.cakePink,     category: "Bolos",    saved: false },
  { id: 2, title: "Bolo de Chocolate Belga",        time: "2h",      difficulty: "Avançado",  rating: 4.9, reviews: 412, image: IMG.cakeChoco,    category: "Bolos",    saved: true  },
  { id: 3, title: "Cupcakes de Baunilha e Rosa",    time: "45min",   difficulty: "Fácil",     rating: 4.7, reviews: 189, image: IMG.cupcakes,     category: "Cupcakes", saved: false },
  { id: 4, title: "Croissant Clássico Francês",     time: "4h",      difficulty: "Avançado",  rating: 4.6, reviews: 98,  image: IMG.croissant,    category: "Pães",     saved: false },
  { id: 5, title: "Bolo de Aniversário Especial",   time: "3h",      difficulty: "Médio",     rating: 4.8, reviews: 356, image: IMG.birthday,     category: "Bolos",    saved: true  },
  { id: 6, title: "Mesa de Doces para Festa",       time: "6h",      difficulty: "Expert",    rating: 5.0, reviews: 127, image: IMG.dessertTable, category: "Eventos",  saved: false },
];

const CATEGORIES = [
  { name: "Bolos",      emoji: "🎂", bg: "#FFDEE9" },
  { name: "Cupcakes",   emoji: "🧁", bg: "#FFE8D6" },
  { name: "Tortas",     emoji: "🥧", bg: "#FFF3D6" },
  { name: "Brigadeiros",emoji: "🍫", bg: "#E8D5C4" },
  { name: "Pães",       emoji: "🥐", bg: "#FFF3E0" },
  { name: "Mousses",    emoji: "🍮", bg: "#E8F5E9" },
  { name: "Macarons",   emoji: "🫐", bg: "#F3E5F5" },
  { name: "Sobremesas", emoji: "🍰", bg: "#FCE4EC" },
];

const TESTIMONIALS = [
  { name: "Ana Claudia S.", text: "A Confeita transformou minha cozinha! Aprendi a fazer macarons em apenas 3 semanas com a ajuda do Chef IA.", initials: "AC", role: "Confeiteira amadora" },
  { name: "Mariana Oliveira",  text: "O Chef IA é incrível! Toda vez que tenho dúvida ele explica de forma super clara e personalizada para o meu nível.", initials: "MO", role: "Estudante de gastronomia" },
  { name: "Patricia Lima",    text: "Os desafios semanais são viciantes! Já fiz 12 e a melhora foi absurda. Comunidade top demais!", initials: "PL", role: "Apaixonada por confeitaria" },
];

const FAQS = [
  { q: "A Confeita é adequada para iniciantes?", a: "Sim! Temos receitas e trilhas para todos os níveis. Iniciantes começam com técnicas básicas e avançam gradualmente. O Chef IA também está disponível 24h para tirar dúvidas." },
  { q: "Como funciona o Chef IA?", a: "O Chef IA é um assistente especializado em confeitaria. Ele responde perguntas sobre técnicas, ingredientes, substituições e dicas em tempo real — como um chef pessoal sempre disponível." },
  { q: "Posso usar offline?", a: "Sim! Com o app mobile você pode baixar receitas para usar sem internet. Ideal para quando estiver com as mãos na massa!" },
  { q: "Os vídeos estão disponíveis em todos os planos?", a: "Vídeos completos em HD estão nos planos Plus e Pro. No gratuito você tem acesso ao preview dos primeiros 2 minutos de cada aula." },
  { q: "Como funcionam os desafios semanais?", a: "Todo domingo lançamos um novo desafio. Você segue a receita, fotografa seu resultado, posta na comunidade e concorre a prêmios. É a forma mais divertida de evoluir!" },
];

// ── Logo SVG ───────────────────────────────────────────────────────────────────
function ConFeitaIcon({ size = 40, variant = "color" }: { size?: number; variant?: "color" | "white" | "dark" | "mono" }) {
  const c = {
    color: { bowl: "#F58FB1", rim: "#E66A94", cream: "#FFF8F2", gold: "#F6C667", choco: "#5C3A2E" },
    white: { bowl: "rgba(255,255,255,0.95)", rim: "rgba(255,255,255,0.6)", cream: "rgba(255,255,255,0.18)", gold: "rgba(255,255,255,0.95)", choco: "rgba(255,255,255,0.85)" },
    dark:  { bowl: "#5C3A2E", rim: "#3d2218", cream: "#F4E3D7", gold: "#3d2218", choco: "#fff" },
    mono:  { bowl: "#bbb",    rim: "#888",    cream: "#e5e5e5",  gold: "#aaa",    choco: "#555" },
  }[variant];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo Confeita">
      <ellipse cx="50" cy="86" rx="24" ry="4" fill={c.choco} opacity="0.06" />
      {/* Bowl body */}
      <path d="M15 48 Q13 80 50 85 Q87 80 85 48 Z" fill={c.bowl} />
      {/* Rim */}
      <ellipse cx="50" cy="48" rx="35" ry="10" fill={c.rim} />
      {/* Cream dome */}
      <path d="M22 46 Q38 27 62 32 Q78 36 78 46 Q62 38 50 38 Q38 38 22 46 Z" fill={c.cream} />
      {/* Bowl highlight */}
      <path d="M21 60 Q20 74 28 82" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <circle cx="41" cy="61" r="3.2" fill={c.choco} />
      <circle cx="59" cy="61" r="3.2" fill={c.choco} />
      <circle cx="42.2" cy="59.7" r="1.1" fill="rgba(255,255,255,0.65)" />
      <circle cx="60.2" cy="59.7" r="1.1" fill="rgba(255,255,255,0.65)" />
      {/* Rosy cheeks */}
      <circle cx="32" cy="67" r="5.5" fill={c.rim} opacity="0.28" />
      <circle cx="68" cy="67" r="5.5" fill={c.rim} opacity="0.28" />
      {/* Smile */}
      <path d="M43 68 Q50 77 57 68" stroke={c.choco} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Whisk handle */}
      <line x1="74" y1="44" x2="87" y2="17" stroke={c.gold} strokeWidth="3.5" strokeLinecap="round" />
      {/* Whisk head loops */}
      <path d="M70 49 C77 41 83 31 78 23 C73 32 68 42 70 49Z" fill={c.gold} />
      <path d="M74 47 C81 39 86 29 81 21 C76 30 71 40 74 47Z" fill={c.gold} opacity="0.52" />
      {/* Sparkle large */}
      <path d="M22 27 L24 21 L26 27 L32 29 L26 31 L24 37 L22 31 L16 29 Z" fill={c.gold} />
      {/* Sparkle small */}
      <path d="M57 11 L58.3 7.5 L59.6 11 L63 12.3 L59.6 13.6 L58.3 17 L57 13.6 L53.5 12.3 Z" fill={c.gold} opacity="0.9" />
      {/* Dot sparkles */}
      <circle cx="37" cy="16" r="2.2" fill={c.gold} opacity="0.6" />
      <circle cx="83" cy="24" r="1.4" fill={c.gold} opacity="0.5" />
      {/* Heart */}
      <path d="M76 73 C77.5 70 74 67 74 70.5 C74 67 70.5 70 70.5 73 C70.5 76 74 79 74 79 C74 79 77.5 76 76 73 Z" fill={c.rim} opacity="0.9" />
    </svg>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar({ onNav }: { onNav: (p: Page) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: { label: string; page: Page }[] = [
    { label: "Receitas",    page: "recipe"   },
    { label: "Desafios",    page: "home"     },
    { label: "Comunidade",  page: "home"     },
    { label: "Chef IA",     page: "ai-chat"  },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button className="flex items-center gap-2" onClick={() => onNav("home")}>
          <ConFeitaIcon size={36} />
          <span className="text-xl font-semibold text-[#5C3A2E] tracking-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>confeita</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <button key={l.label} onClick={() => onNav(l.page)} className="text-sm text-[#5C3A2E]/65 hover:text-[#5C3A2E] transition-colors font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm text-[#5C3A2E] font-medium hover:text-[#E66A94] transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>Entrar</button>
          <button onClick={() => onNav("home")} className="px-5 py-2.5 rounded-full bg-[#F58FB1] text-white text-sm font-semibold hover:bg-[#E66A94] transition-colors shadow-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Começar grátis
          </button>
        </div>

        <button className="md:hidden p-2 rounded-xl text-[#5C3A2E]" onClick={() => setMenuOpen(m => !m)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#F4E3D7] px-4 py-4 flex flex-col gap-1">
          {links.map(l => (
            <button key={l.label} onClick={() => { onNav(l.page); setMenuOpen(false); }} className="text-left py-3 px-2 text-[#5C3A2E] font-medium border-b border-[#F4E3D7] last:border-0 text-sm">
              {l.label}
            </button>
          ))}
          <button onClick={() => { onNav("home"); setMenuOpen(false); }} className="mt-3 py-3 rounded-full bg-[#F58FB1] text-white font-semibold text-center text-sm">
            Começar grátis
          </button>
        </div>
      )}
    </nav>
  );
}

// ── Home Page ──────────────────────────────────────────────────────────────────
function HomePage({ onNav }: { onNav: (p: Page) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set([2, 5]));
  const [search, setSearch] = useState("");

  const toggleSaved = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSet(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const diffBadge = (d: string) => ({
    Fácil:     "text-emerald-600",
    Médio:     "text-amber-500",
    Avançado:  "text-[#F58FB1]",
    Expert:    "text-[#E66A94]",
  }[d] ?? "text-[#9B7560]");

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F2", fontFamily: "'Poppins', sans-serif" }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F58FB1] opacity-[0.07] blur-3xl pointer-events-none" />
        <div className="absolute top-48 -left-32 w-96 h-96 rounded-full bg-[#F6C667] opacity-[0.08] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#BDE8D2] opacity-[0.12] blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F4E3D7] rounded-full text-xs font-semibold text-[#5C3A2E] tracking-wide">
              <span>🎂</span> Plataforma #1 de confeitaria no Brasil
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-[#3D2010] leading-[1.15]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Aprenda confeitaria{" "}
              <span className="relative inline-block">
                <span className="text-[#E66A94]">de um jeito</span>
              </span>
              <br />
              <span className="relative">
                mais doce
                <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 260 10" fill="none" preserveAspectRatio="none">
                  <path d="M2 7 Q130 2 258 7" stroke="#F6C667" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-[#9B7560] text-lg leading-relaxed max-w-md">
              Receitas exclusivas, Chef IA personalizado, desafios semanais e uma comunidade apaixonada. Do iniciante ao expert.
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C4A99A]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar receitas, técnicas, ingredientes..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-[#F4E3D7] text-[#5C3A2E] placeholder:text-[#C4A99A] text-sm focus:outline-none focus:ring-2 focus:ring-[#F58FB1]/25 shadow-sm"
              />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button onClick={() => onNav("recipe")} className="px-7 py-3.5 rounded-full bg-[#F58FB1] text-white font-semibold text-sm hover:bg-[#E66A94] active:scale-95 transition-all shadow-md hover:shadow-[#F58FB1]/30 hover:shadow-lg">
                Começar Agora ✨
              </button>
              <button onClick={() => onNav("recipe")} className="px-7 py-3.5 rounded-full bg-white text-[#5C3A2E] font-semibold text-sm border border-[#F4E3D7] hover:border-[#F58FB1]/40 hover:bg-[#FFF8F2] transition-all shadow-sm">
                Explorar Receitas
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex -space-x-2.5">
                {["AC","MO","PL","RS","JF"].map((init, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F58FB1] to-[#E66A94] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#FFF8F2]" style={{ zIndex: 5 - i }}>
                    {init[0]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-[#F6C667] text-[#F6C667]" />)}
                  <span className="text-sm font-semibold text-[#5C3A2E] ml-1">4.9</span>
                </div>
                <p className="text-xs text-[#9B7560]">+47.000 confeiteiras felizes</p>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative order-1 md:order-2">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#F58FB1]/12 aspect-[4/5] bg-[#F4E3D7]">
              <img src={IMG.hero} alt="Mãe e filha aprendendo confeitaria" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5C3A2E]/15 via-transparent to-transparent" />
            </div>
            {/* Floating cards */}
            <div className="absolute -left-4 top-1/3 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2.5 max-w-[168px]">
              <div className="w-10 h-10 rounded-xl bg-[#F4E3D7] flex items-center justify-center text-xl flex-shrink-0">🏆</div>
              <div>
                <p className="text-xs font-bold text-[#5C3A2E] leading-tight">Desafio da semana</p>
                <p className="text-xs text-[#9B7560]">Macaron francês</p>
              </div>
            </div>
            <div className="absolute -right-3 bottom-1/3 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BDE8D2] to-[#F58FB1]/60 flex items-center justify-center text-xl flex-shrink-0">🤖</div>
              <div>
                <p className="text-xs font-bold text-[#5C3A2E]">Chef IA</p>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><p className="text-xs text-[#9B7560]">Online agora</p></div>
              </div>
            </div>
            {/* Decorative rings */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full border-2 border-[#F58FB1]/20 pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-60 h-60 rounded-full border border-[#F6C667]/15 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── LOGO IDENTITY STRIP ────────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 border-y border-[#F4E3D7]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold text-[#9B7560] uppercase tracking-widest mb-6">Identidade Visual — Sistema de Logos</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {/* Color */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-[#FFF8F2] border border-[#F4E3D7] flex items-center justify-center shadow-sm">
                <ConFeitaIcon size={52} variant="color" />
              </div>
              <span className="text-[10px] text-[#9B7560] font-medium">Colorida</span>
            </div>
            {/* Brand lock-up */}
            <div className="flex flex-col items-center gap-2">
              <div className="px-5 py-3 rounded-2xl bg-[#FFF8F2] border border-[#F4E3D7] flex items-center gap-2.5 shadow-sm">
                <ConFeitaIcon size={40} variant="color" />
                <span className="text-2xl font-semibold text-[#5C3A2E]" style={{ fontFamily: "'Fredoka', sans-serif" }}>confeita</span>
              </div>
              <span className="text-[10px] text-[#9B7560] font-medium">Marca completa</span>
            </div>
            {/* Dark */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-[#5C3A2E] flex items-center justify-center shadow-sm">
                <ConFeitaIcon size={52} variant="white" />
              </div>
              <span className="text-[10px] text-[#9B7560] font-medium">Versão escura</span>
            </div>
            {/* White on pink */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-[#F58FB1] flex items-center justify-center shadow-sm">
                <ConFeitaIcon size={52} variant="white" />
              </div>
              <span className="text-[10px] text-[#9B7560] font-medium">Versão rosa</span>
            </div>
            {/* Mono */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-[#F4E3D7] flex items-center justify-center shadow-sm">
                <ConFeitaIcon size={52} variant="mono" />
              </div>
              <span className="text-[10px] text-[#9B7560] font-medium">Monocromática</span>
            </div>
            {/* Favicon */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-end gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#F4E3D7] shadow flex items-center justify-center">
                  <ConFeitaIcon size={26} variant="color" />
                </div>
                <div className="w-6 h-6 rounded-lg bg-[#F58FB1] flex items-center justify-center shadow">
                  <ConFeitaIcon size={16} variant="white" />
                </div>
                <div className="w-4 h-4 rounded-md bg-[#5C3A2E] flex items-center justify-center shadow">
                  <ConFeitaIcon size={12} variant="white" />
                </div>
              </div>
              <span className="text-[10px] text-[#9B7560] font-medium">Favicon / App icon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED RECIPES ──────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#3D2010]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>Receitas em destaque</h2>
              <p className="text-sm text-[#9B7560] mt-0.5">As mais amadas da semana</p>
            </div>
            <button onClick={() => onNav("recipe")} className="flex items-center gap-1 text-sm font-semibold text-[#E66A94] hover:text-[#F58FB1] transition-colors">
              Ver todas <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollSnapType: "x mandatory" }}>
            {RECIPES.map(r => (
              <div
                key={r.id}
                style={{ scrollSnapAlign: "start" }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex-shrink-0 w-60 border border-[#F4E3D7]/60"
                onClick={() => onNav("recipe")}
              >
                <div className="relative h-40 bg-[#F4E3D7] overflow-hidden">
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={e => toggleSaved(r.id, e)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <Heart size={13} className={savedSet.has(r.id) ? "fill-[#E66A94] text-[#E66A94]" : "text-[#9B7560]"} />
                  </button>
                  <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 ${diffBadge(r.difficulty)}`}>
                    {r.difficulty}
                  </div>
                </div>
                <div className="p-3.5">
                  <h3 className="font-semibold text-[#3D2010] text-sm leading-snug mb-2 line-clamp-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{r.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[#9B7560]">
                    <span className="flex items-center gap-1"><Clock size={11} />{r.time}</span>
                    <span className="flex items-center gap-0.5">
                      <Star size={11} className="fill-[#F6C667] text-[#F6C667]" />
                      <span className="font-semibold text-[#5C3A2E]">{r.rating}</span>
                      <span className="text-[#C4A99A]">({r.reviews})</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#3D2010] mb-6" style={{ fontFamily: "'Baloo 2', sans-serif" }}>Categorias</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.name} className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:scale-105 hover:shadow-md transition-all duration-200" style={{ background: cat.bg }}>
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-semibold text-[#5C3A2E] text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEEKLY CHALLENGE ──────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-[#3D2010]">
            <img src={IMG.goldDesserts} alt="Desafio da semana" className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity" />
            <div className="relative px-8 py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F6C667] rounded-full text-xs font-bold text-[#5C3A2E] mb-5">
                  🏆 Desafio da Semana
                </div>
                <h2 className="text-3xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  Macaron Francês Colorido
                </h2>
                <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-6">
                  Mostre suas habilidades e concorra a um kit completo de confeitaria profissional. Publique sua foto até domingo!
                </p>
                <div className="flex items-baseline gap-5 mb-7">
                  {[["03", "Dias"], ["14", "Horas"], ["37", "Min"]].map(([v, l]) => (
                    <div key={l} className="text-center">
                      <div className="text-3xl font-bold text-[#F6C667]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{v}</div>
                      <div className="text-white/50 text-xs mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => onNav("recipe")} className="px-6 py-3 bg-[#F58FB1] text-white rounded-full font-semibold text-sm hover:bg-[#E66A94] transition-colors shadow-lg">
                  Participar do desafio →
                </button>
              </div>
              <div className="hidden md:flex flex-col gap-3 min-w-[160px]">
                {[["Participantes", "1.847"], ["Prêmio", "Kit Confeitaria Pro"], ["Nível", "Intermediário"]].map(([l, v]) => (
                  <div key={l} className="bg-white/12 backdrop-blur-sm rounded-2xl px-4 py-3">
                    <p className="text-white/55 text-[11px] mb-0.5">{l}</p>
                    <p className="text-white font-semibold text-sm">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI CHEF ───────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#BDE8D2]/50 rounded-full text-xs font-bold text-[#1B6B46] mb-5">
              ✨ Inteligência Artificial
            </div>
            <h2 className="text-3xl font-bold text-[#3D2010] mb-4 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Conheça o<br />Chef IA Confeita
            </h2>
            <p className="text-[#9B7560] leading-relaxed mb-6">
              Seu assistente pessoal de confeitaria. Tire dúvidas sobre técnicas, adapte receitas, descubra substituições e receba orientação passo a passo — qualquer hora, qualquer receita.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Adaptação de receitas para restrições alimentares",
                "Sugestões personalizadas pelo seu nível",
                "Explicação de técnicas com exemplos práticos",
                "Dicas de apresentação e decoração profissional",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#BDE8D2] flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-[#1B6B46]" />
                  </div>
                  <span className="text-sm text-[#5C3A2E]">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onNav("ai-chat")} className="px-6 py-3 bg-[#BDE8D2] text-[#1B6B46] rounded-full font-semibold text-sm hover:bg-[#A8DEC5] transition-colors">
              Falar com o Chef IA 🤖
            </button>
          </div>

          {/* Chat preview */}
          <div className="bg-white rounded-3xl shadow-lg p-5 border border-[#F4E3D7]">
            <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[#F4E3D7]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BDE8D2] to-[#F58FB1] flex items-center justify-center text-lg">🤖</div>
              <div className="flex-1">
                <p className="font-bold text-[#5C3A2E] text-sm">Chef IA</p>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-xs text-[#9B7560]">Online agora</span></div>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#BDE8D2] to-[#F58FB1] flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="bg-[#F4E3D7] rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[240px]">
                  <p className="text-xs text-[#5C3A2E]">Olá! Sou o Chef IA da Confeita 🎂 Com o que posso te ajudar hoje?</p>
                </div>
              </div>
              <div className="flex gap-2 items-end justify-end">
                <div className="bg-[#F58FB1] rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[220px]">
                  <p className="text-xs text-white">Como faço o ganache ficar brilhante?</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#F4E3D7] flex items-center justify-center text-sm flex-shrink-0">👩</div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#BDE8D2] to-[#F58FB1] flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="bg-[#F4E3D7] rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[260px]">
                  <p className="text-xs text-[#5C3A2E]">Ótima pergunta! ✨ Use proporção 1:1, adicione manteiga no final e mexa sem incorporar ar. O segredo está na temperatura...</p>
                </div>
              </div>
            </div>
            <button onClick={() => onNav("ai-chat")} className="w-full py-2.5 rounded-2xl bg-[#F58FB1]/12 text-[#E66A94] text-xs font-semibold hover:bg-[#F58FB1]/20 transition-colors">
              Continuar conversa →
            </button>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ─────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6" style={{ background: "rgba(244,227,215,0.35)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-3">
            {[IMG.cupcakes, IMG.cakePink, IMG.birthday, IMG.cakeChoco].map((src, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden bg-[#F4E3D7] ${i % 2 === 1 ? (i === 1 ? "mt-6" : "-mt-6") : ""}`} style={{ height: "170px" }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F58FB1]/18 rounded-full text-xs font-bold text-[#E66A94] mb-5">
              👥 Comunidade
            </div>
            <h2 className="text-3xl font-bold text-[#3D2010] mb-4 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Uma comunidade apaixonada por confeitaria
            </h2>
            <p className="text-[#9B7560] leading-relaxed mb-7">
              Compartilhe suas criações, receba feedback, participe de desafios e inspire-se com milhares de receitas criadas pela comunidade.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-7">
              {[["47k+","Membros"],["120k+","Receitas"],["98%","Satisfação"]].map(([v,l]) => (
                <div key={l} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-[#F4E3D7]">
                  <div className="text-xl font-bold text-[#E66A94]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{v}</div>
                  <div className="text-xs text-[#9B7560] mt-0.5">{l}</div>
                </div>
              ))}
            </div>
            <button className="px-6 py-3 bg-[#F58FB1] text-white rounded-full font-semibold text-sm hover:bg-[#E66A94] transition-colors shadow-md">
              Entrar na comunidade
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#3D2010]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>O que dizem nossas confeiteiras</h2>
            <p className="text-[#9B7560] mt-2 text-sm">Histórias reais de transformação na cozinha</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-[#F4E3D7] hover:shadow-md hover:border-[#F58FB1]/20 transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} size={13} className="fill-[#F6C667] text-[#F6C667]" />)}
                </div>
                <p className="text-[#5C3A2E] text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58FB1] to-[#E66A94] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{t.initials}</div>
                  <div>
                    <p className="font-semibold text-[#5C3A2E] text-sm">{t.name}</p>
                    <p className="text-xs text-[#9B7560]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6" style={{ background: "rgba(244,227,215,0.28)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#3D2010]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F4E3D7]">
                <button className="w-full px-5 py-4 flex items-center justify-between text-left gap-4" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-[#5C3A2E] text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={15} className="text-[#E66A94] flex-shrink-0" />
                    : <ChevronDown size={15} className="text-[#9B7560] flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-[#9B7560] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🎂</div>
          <h2 className="text-3xl font-bold text-[#3D2010] mb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>Pronta para começar?</h2>
          <p className="text-[#9B7560] mb-8 text-base">Junte-se a 47.000 confeiteiras e comece a aprender hoje. Grátis para sempre.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => onNav("recipe")} className="px-8 py-4 rounded-full bg-[#F58FB1] text-white font-semibold hover:bg-[#E66A94] transition-all shadow-lg hover:shadow-[#F58FB1]/30 active:scale-95">
              Criar conta gratuita ✨
            </button>
            <button onClick={() => onNav("ai-chat")} className="px-8 py-4 rounded-full bg-white text-[#5C3A2E] font-semibold border border-[#F4E3D7] hover:border-[#F58FB1]/40 transition-all shadow-sm">
              Falar com Chef IA 🤖
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#3D2010] text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ConFeitaIcon size={30} variant="white" />
                <span className="text-xl font-semibold" style={{ fontFamily: "'Fredoka', sans-serif" }}>confeita</span>
              </div>
              <p className="text-white/55 text-sm leading-relaxed">A melhor plataforma para aprender confeitaria em casa, do iniciante ao expert.</p>
            </div>
            {[
              { title: "Plataforma", links: ["Receitas","Desafios","Chef IA","Comunidade"] },
              { title: "Empresa",   links: ["Sobre","Blog","Carreiras","Imprensa"] },
              { title: "Suporte",   links: ["Ajuda","Contato","Privacidade","Termos"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4 text-white/85">{col.title}</h4>
                <div className="space-y-2">
                  {col.links.map(l => <button key={l} className="block text-sm text-white/50 hover:text-white/75 transition-colors">{l}</button>)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/35 text-xs">© 2025 Confeita. Feito com 🩷 no Brasil.</p>
            <div className="flex gap-4">
              {["Instagram","Pinterest","TikTok","YouTube"].map(s => (
                <button key={s} className="text-xs text-white/35 hover:text-white/60 transition-colors">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Recipe Page ────────────────────────────────────────────────────────────────
function RecipePage({ onNav }: { onNav: (p: Page) => void }) {
  const [tab, setTab] = useState<RecipeTab>("ingredients");
  const [timerSecs, setTimerSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimerSecs(s => { if (s <= 0) { clearInterval(timerRef.current); setRunning(false); return 0; } return s - 1; });
      }, 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const ingredients = [
    "300g de farinha de trigo", "200g de açúcar refinado", "150g de manteiga sem sal (ponto pomada)",
    "3 ovos grandes em temperatura ambiente", "200ml de leite integral", "1 colher de chá de extrato de baunilha",
    "1 colher de sopa de fermento em pó", "200g de morangos frescos fatiados",
    "300ml de creme de leite fresco gelado", "2 col. de sopa de açúcar de confeiteiro",
  ];

  const steps = [
    { title: "Pré-aqueça o forno",       desc: "Pré-aqueça o forno a 180°C e unte uma forma de 22cm com manteiga e farinha. Reserve." },
    { title: "Prepare os secos",          desc: "Em uma tigela, peneire a farinha com o fermento em pó. Isso garante uma massa sem grumos." },
    { title: "Bata a manteiga",           desc: "Na batedeira, bata a manteiga com o açúcar em velocidade média por 5 minutos, até obter creme claro." },
    { title: "Adicione os ovos",          desc: "Acrescente os ovos um a um, batendo 30 segundos entre cada adição. Raspe as laterais da tigela." },
    { title: "Incorpore secos e leite",   desc: "Alterne farinha e leite em 3 adições (farinha → leite → farinha → leite → farinha). Adicione a baunilha. Não misture em excesso." },
    { title: "Asse por 30–35 minutos",   desc: "Despeje na forma e asse até que um palito saía limpo. Não abra o forno nos primeiros 25 minutos." },
    { title: "Prepare o chantilly",       desc: "Bata o creme gelado com o açúcar de confeiteiro até o ponto firme. Mantenha a tigela fria." },
    { title: "Monte e decore",            desc: "Corte o bolo ao meio, recheie com chantilly e morangos. Cubra e decore com mais morangos frescos." },
  ];

  const comments = [
    { initials: "CM", name: "Carla Mendes",    time: "2h",    rating: 5, text: "Fiz essa receita ontem e ficou incrível! Segui o passo a passo do Modo Cozinhar. Super recomendo!" },
    { initials: "JF", name: "Juliana Ferreira", time: "1 dia", rating: 5, text: "Delicioso! Substituí o leite por leite de amêndoas e ficou perfeito para intolerantes à lactose." },
    { initials: "RS", name: "Rebeca Santos",   time: "3 dias", rating: 4, text: "Perfeito para o aniversário da minha filha. Decorei com morangos extras e ficou lindo!" },
  ];

  const toggle = (i: number) => setChecked(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F2", fontFamily: "'Poppins', sans-serif" }}>
      {/* Hero image */}
      <div className="relative h-72 md:h-96 bg-[#F4E3D7]">
        <img src={IMG.cakePink} alt="Bolo de Morango com Chantilly" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3D2010]/65 via-[#3D2010]/10 to-[#3D2010]/20" />
        <button onClick={() => onNav("home")} className="absolute top-14 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <ChevronLeft size={18} className="text-[#5C3A2E]" />
        </button>
        <div className="absolute top-14 right-4 flex gap-2">
          <button onClick={() => setSaved(v => !v)} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Heart size={16} className={saved ? "fill-[#E66A94] text-[#E66A94]" : "text-[#9B7560]"} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Bookmark size={16} className="text-[#9B7560]" />
          </button>
        </div>
        {/* Play button */}
        <button className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/22 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/40">
            <Play size={20} className="text-white ml-1" fill="white" />
          </div>
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F6C667] rounded-full text-xs font-bold text-[#5C3A2E] mb-2">🎂 Bolos</div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>Bolo de Morango com Chantilly</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Meta strip */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#F4E3D7] px-4 py-3.5 -mt-5 mb-5 flex flex-wrap gap-4 items-center">
          <span className="flex items-center gap-1"><Star size={14} className="fill-[#F6C667] text-[#F6C667]" /><strong className="text-[#5C3A2E] text-sm">4.8</strong><span className="text-xs text-[#9B7560]">(234 avaliações)</span></span>
          <span className="flex items-center gap-1.5 text-sm text-[#9B7560]"><Clock size={13} />1h 20min</span>
          <span className="flex items-center gap-1.5 text-sm text-[#9B7560]"><Flame size={13} />Médio</span>
          <span className="flex items-center gap-1.5 text-sm text-[#9B7560]"><Users size={13} />8 porções</span>
        </div>

        {/* Author */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F58FB1] to-[#E66A94] flex items-center justify-center text-white text-sm font-bold">SA</div>
            <div>
              <p className="font-semibold text-[#5C3A2E] text-sm">Chef Sofia Almeida</p>
              <p className="text-xs text-[#9B7560]">Confeiteira profissional · 128 receitas</p>
            </div>
          </div>
          <button className="px-4 py-1.5 rounded-full border border-[#F58FB1] text-[#E66A94] text-xs font-semibold hover:bg-[#F58FB1]/10 transition-colors">Seguir</button>
        </div>

        {/* Timer */}
        <div className="bg-[#F4E3D7] rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer size={18} className="text-[#E66A94]" />
            <div>
              <p className="text-[10px] text-[#9B7560] uppercase tracking-wide font-medium">Timer de preparo</p>
              <p className="text-2xl font-bold text-[#3D2010]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{fmt(timerSecs)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRunning(r => !r)} className="px-4 py-2 rounded-xl bg-[#F58FB1] text-white text-xs font-semibold hover:bg-[#E66A94] transition-colors">
              {running ? "Pausar" : "Iniciar"}
            </button>
            <button onClick={() => { setRunning(false); setTimerSecs(25 * 60); }} className="px-3 py-2 rounded-xl bg-white text-[#9B7560] text-xs font-semibold">Reset</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F4E3D7]/50 rounded-2xl p-1 mb-5">
          {(["ingredients","steps","comments"] as RecipeTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === t ? "bg-white text-[#E66A94] shadow-sm" : "text-[#9B7560] hover:text-[#5C3A2E]"}`}>
              {t === "ingredients" ? "Ingredientes" : t === "steps" ? "Modo de Preparo" : "Comentários"}
            </button>
          ))}
        </div>

        {/* Ingredients */}
        {tab === "ingredients" && (
          <div className="space-y-2 mb-8">
            {ingredients.map((ing, i) => (
              <button key={i} onClick={() => toggle(i)} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${checked.has(i) ? "bg-[#BDE8D2]/30 border-[#BDE8D2]" : "bg-white border-[#F4E3D7] hover:border-[#F58FB1]/30"}`}>
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${checked.has(i) ? "bg-[#BDE8D2] border-[#BDE8D2]" : "border-[#D4B8A8]"}`}>
                  {checked.has(i) && <Check size={10} className="text-[#1B6B46]" />}
                </div>
                <span className={`text-sm ${checked.has(i) ? "line-through text-[#9B7560]" : "text-[#5C3A2E]"}`}>{ing}</span>
              </button>
            ))}
            <div className="flex items-center justify-between px-1 pt-2 text-xs text-[#9B7560]">
              <span>{checked.size} de {ingredients.length} selecionados</span>
              <div className="h-1.5 w-32 bg-[#F4E3D7] rounded-full overflow-hidden">
                <div className="h-full bg-[#BDE8D2] rounded-full transition-all" style={{ width: `${(checked.size / ingredients.length) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        {tab === "steps" && (
          <div className="space-y-1 mb-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#F58FB1] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                  {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-[#F4E3D7] my-1.5" />}
                </div>
                <div className="pb-5 flex-1">
                  <h4 className="font-semibold text-[#5C3A2E] text-sm mb-1">{step.title}</h4>
                  <p className="text-[#9B7560] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments */}
        {tab === "comments" && (
          <div className="space-y-4 mb-8">
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-2xl border border-[#F4E3D7] px-4 py-3">
                <input placeholder="Adicione um comentário..." className="w-full text-sm text-[#5C3A2E] placeholder:text-[#C4A99A] bg-transparent focus:outline-none" />
              </div>
              <button className="w-11 h-11 rounded-2xl bg-[#F58FB1] flex items-center justify-center flex-shrink-0 hover:bg-[#E66A94] transition-colors">
                <Send size={14} className="text-white" />
              </button>
            </div>
            {comments.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-[#F4E3D7]">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F58FB1] to-[#E66A94] flex items-center justify-center text-white text-xs font-bold">{c.initials}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#5C3A2E]">{c.name}</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= c.rating ? "fill-[#F6C667] text-[#F6C667]" : "text-[#F4E3D7]"} />)}</div>
                    </div>
                    <span className="text-xs text-[#9B7560]">{c.time}</span>
                  </div>
                </div>
                <p className="text-sm text-[#5C3A2E] leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pb-24">
          <button onClick={() => onNav("cook-mode")} className="flex-1 py-4 bg-[#F58FB1] text-white rounded-2xl font-semibold text-sm hover:bg-[#E66A94] transition-colors shadow-md">
            🍳 Iniciar Modo Cozinhar
          </button>
          <button onClick={() => onNav("ai-chat")} className="flex-1 py-4 bg-[#BDE8D2] text-[#1B6B46] rounded-2xl font-semibold text-sm hover:bg-[#A8DEC5] transition-colors">
            🤖 Perguntar à IA
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AI Chef Chat Page ──────────────────────────────────────────────────────────
function AIChefPage({ onNav }: { onNav: (p: Page) => void }) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "bot", text: "Olá! Sou o Chef IA da Confeita! 🎂 Estou aqui para te ajudar com qualquer dúvida de confeitaria. Sobre o que posso te ajudar hoje?" },
    { from: "bot", text: "Posso ajudar com técnicas, substituições, dicas de decoração e muito mais. É só perguntar!" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Como fazer ganache brilhante?",
    "Meu bolo afundou, o que fazer?",
    "Posso trocar manteiga por óleo?",
    "Segredo do chantilly firme",
    "Como evitar macaron rachado?",
  ];

  const responses: Record<string, string> = {
    "Como fazer ganache brilhante?": "Para um ganache brilhante, use proporção 1:1 de chocolate e creme de leite. Ferva o creme, despeje sobre o chocolate picado, aguarde 2 min antes de mexer e adicione uma colher de manteiga no final! ✨",
    "Meu bolo afundou, o que fazer?": "O afundamento geralmente indica: excesso de fermento, forno aberto muito cedo, mistura excessiva, ou temperatura incorreta. Teste com palito e não abra o forno nos primeiros 25 min! 🎂",
    "Posso trocar manteiga por óleo?": "Sim! Use 75% da quantidade (100g manteiga = 75ml óleo). O bolo fica mais úmido, mas perde o sabor amanteigado. Funciona muito bem para cupcakes! 🧁",
    "Segredo do chantilly firme?": "Creme bem gelado (24h na geladeira), tigela e batedores frios, açúcar de confeiteiro. Adicione 1 col. de chá de gelatina sem sabor diluída para estabilizar ainda mais! 🍦",
    "Como evitar macaron rachado?": "Faça macaronage correto (massa flui como lava), deixe descansar 40 min antes de assar, use 150°C e farinha de amêndoa bem seca. Paciência é a chave! 🫐",
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { from: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = responses[text.trim()] ?? "Ótima pergunta! A técnica correta envolve atenção à temperatura, qualidade dos ingredientes e treino. Quer que eu detalhe mais algum aspecto? 🎂";
      setMsgs(m => [...m, { from: "bot", text: reply }]);
      setTyping(false);
    }, 1200);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FFF8F2", fontFamily: "'Poppins', sans-serif" }}>
      <div className="bg-white border-b border-[#F4E3D7] px-4 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => onNav("home")} className="w-9 h-9 rounded-full bg-[#F4E3D7] flex items-center justify-center">
          <ChevronLeft size={16} className="text-[#5C3A2E]" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BDE8D2] to-[#F58FB1] flex items-center justify-center text-xl">🤖</div>
        <div className="flex-1">
          <p className="font-bold text-[#5C3A2E] text-sm">Chef IA</p>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs text-[#9B7560]">Especialista em confeitaria</span></div>
        </div>
        <button className="w-9 h-9 rounded-full bg-[#F4E3D7] flex items-center justify-center">
          <MoreHorizontal size={15} className="text-[#9B7560]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 items-end ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "bot" && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#BDE8D2] to-[#F58FB1] flex items-center justify-center text-sm flex-shrink-0">🤖</div>}
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.from === "user" ? "bg-[#F58FB1] text-white rounded-br-sm" : "bg-white text-[#5C3A2E] rounded-bl-sm shadow-sm border border-[#F4E3D7]"}`}>
              {m.text}
            </div>
            {m.from === "user" && <div className="w-7 h-7 rounded-full bg-[#F4E3D7] flex items-center justify-center text-sm flex-shrink-0">👩</div>}
          </div>
        ))}
        {typing && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#BDE8D2] to-[#F58FB1] flex items-center justify-center text-sm">🤖</div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-[#F4E3D7] flex gap-1 items-center h-10">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#F58FB1] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => send(s)} className="flex-shrink-0 px-3 py-1.5 bg-white border border-[#F4E3D7] rounded-full text-xs text-[#5C3A2E] hover:border-[#F58FB1] hover:bg-[#FFF8F2] transition-colors whitespace-nowrap shadow-sm">
            {s}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 pt-2 bg-white border-t border-[#F4E3D7]">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#F4E3D7]/60 rounded-2xl px-4 py-2.5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Pergunte ao Chef IA..."
              className="flex-1 bg-transparent text-sm text-[#5C3A2E] placeholder:text-[#C4A99A] focus:outline-none"
            />
            <button className="text-[#9B7560] hover:text-[#E66A94] transition-colors"><Mic size={15} /></button>
          </div>
          <button onClick={() => send(input)} disabled={!input.trim()} className="w-11 h-11 rounded-2xl bg-[#F58FB1] flex items-center justify-center disabled:opacity-40 hover:bg-[#E66A94] transition-colors flex-shrink-0">
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cook Mode Page ─────────────────────────────────────────────────────────────
function CookModePage({ onNav }: { onNav: (p: Page) => void }) {
  const steps = [
    { icon: "🔥", title: "Pré-aqueça o forno",       desc: "Pré-aqueça o forno a 180°C e unte uma forma de 22cm com manteiga e farinha.", tip: "Deixe a forma pronta enquanto prepara a massa para ganhar tempo." },
    { icon: "🌾", title: "Peneire os secos",          desc: "Em uma tigela grande, peneire a farinha de trigo com o fermento em pó. Reserve.", tip: "Peneirar incorpora ar e garante uma massa mais leve e sem grumos." },
    { icon: "🧈", title: "Bata a manteiga",           desc: "Na batedeira, bata a manteiga (ponto pomada) com o açúcar por 5 minutos até creme claro e fofo.", tip: "A manteiga deve estar mole, nem gelada nem derretida." },
    { icon: "🥚", title: "Adicione os ovos",          desc: "Adicione os ovos um a um, batendo bem por 30 segundos entre cada adição.", tip: "Ovos em temperatura ambiente incorporam melhor à massa." },
    { icon: "🥛", title: "Incorpore secos e leite",   desc: "Alterne farinha e leite em 3 adições, começando e terminando com a farinha. Adicione a baunilha por último.", tip: "Não misture em excesso — apenas até os ingredientes se combinarem." },
    { icon: "⏱️", title: "Asse por 30–35 minutos",   desc: "Despeje na forma preparada e asse. Teste com palito — deve sair limpo.", tip: "Não abra o forno antes de 25 minutos. Cada forno é único!" },
    { icon: "🍦", title: "Prepare o chantilly",       desc: "Com o creme bem gelado, bata com açúcar de confeiteiro até o ponto firme.", tip: "Tigela e batedores frios fazem toda a diferença aqui." },
    { icon: "🎂", title: "Monte e decore",            desc: "Corte o bolo ao meio, recheie com chantilly e morangos fatiados. Cubra e decore a gosto.", tip: "Use um palito para nivelar as camadas antes de colocar a cobertura." },
  ];

  const [step, setStep] = useState(0);
  const [secs, setSecs] = useState(0);
  const [going, setGoing] = useState(false);
  const tRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (going) tRef.current = setInterval(() => setSecs(s => s + 1), 1000);
    else clearInterval(tRef.current);
    return () => clearInterval(tRef.current);
  }, [going]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const progress = ((step + 1) / steps.length) * 100;
  const cur = steps[step];

  const next = () => { if (step === steps.length - 1) { onNav("home"); } else { setStep(s => s + 1); setSecs(0); setGoing(false); } };
  const prev = () => { setStep(s => Math.max(0, s - 1)); setSecs(0); setGoing(false); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#3D2010", fontFamily: "'Poppins', sans-serif" }}>
      <div className="px-4 pt-12 pb-3 flex items-center justify-between">
        <button onClick={() => onNav("recipe")} className="w-9 h-9 rounded-full bg-white/12 flex items-center justify-center hover:bg-white/18 transition-colors">
          <X size={16} className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-white/50 text-xs">Bolo de Morango</p>
          <p className="text-white font-semibold text-sm">Passo {step + 1} de {steps.length}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/12 flex items-center justify-center">
          <Timer size={14} className="text-white/70" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-5">
        <div className="h-1.5 bg-white/12 rounded-full overflow-hidden">
          <div className="h-full bg-[#F6C667] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= step ? "bg-[#F6C667]" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 flex flex-col">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{cur.icon}</div>
          <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{cur.title}</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-4 flex-1 flex flex-col justify-between">
          <p className="text-white text-base leading-relaxed mb-5">{cur.desc}</p>
          <div className="flex gap-2.5 items-start bg-[#F6C667]/18 rounded-2xl p-4">
            <span className="text-[#F6C667] text-xl flex-shrink-0">💡</span>
            <p className="text-[#F6C667] text-sm leading-relaxed">{cur.tip}</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wide font-medium">Tempo neste passo</p>
            <p className="text-white font-bold text-2xl mt-0.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{fmt(secs)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setGoing(g => !g)} className="px-5 py-2.5 rounded-xl bg-[#F58FB1] text-white text-sm font-semibold hover:bg-[#E66A94] transition-colors">
              {going ? "Pausar" : "Iniciar"}
            </button>
            <button onClick={() => { setGoing(false); setSecs(0); }} className="px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm">
              Reset
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button onClick={prev} disabled={step === 0} className="flex-1 py-4 rounded-2xl bg-white/12 text-white font-semibold text-sm disabled:opacity-25 hover:bg-white/18 transition-colors flex items-center justify-center gap-2">
            <ChevronLeft size={16} /> Anterior
          </button>
          <button onClick={next} className="flex-[2] py-4 rounded-2xl bg-[#F58FB1] text-white font-semibold text-sm hover:bg-[#E66A94] transition-colors flex items-center justify-center gap-2">
            {step === steps.length - 1 ? "Concluir! 🎉" : <><span>Próximo passo</span><ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Profile Page ───────────────────────────────────────────────────────────────
function ProfilePage({ onNav }: { onNav: (p: Page) => void }) {
  const [tab, setTab] = useState<ProfileTab>("achievements");

  const achievements = [
    { icon: "🏆", name: "Primeira receita",    desc: "Publicou sua primeira receita",      unlocked: true  },
    { icon: "⭐", name: "Top 10 da semana",    desc: "Entrou no ranking semanal",           unlocked: true  },
    { icon: "🎂", name: "Mestra dos bolos",    desc: "Completou 10 receitas de bolos",      unlocked: true  },
    { icon: "🤖", name: "Fã do Chef IA",       desc: "Fez 20 perguntas ao Chef IA",         unlocked: true  },
    { icon: "👥", name: "Influenciadora",      desc: "Conquistou 100 seguidoras",            unlocked: true  },
    { icon: "🏅", name: "Desafiadora",         desc: "Participou de 5 desafios",             unlocked: false },
    { icon: "💎", name: "Diamante",            desc: "365 dias consecutivos na plataforma", unlocked: false },
    { icon: "🌟", name: "Expert completa",     desc: "Completou todos os cursos avançados", unlocked: false },
  ];

  const favs = RECIPES.filter((_, i) => i < 4);
  const pubs = [RECIPES[0], RECIPES[2]];

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F2", fontFamily: "'Poppins', sans-serif" }}>
      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-br from-[#F58FB1] to-[#E66A94]">
        <img src={IMG.bakingWoman} alt="Capa" className="w-full h-full object-cover opacity-35" />
        <button onClick={() => onNav("home")} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
          <ChevronLeft size={16} className="text-white" />
        </button>
        <button className="absolute top-12 right-4 w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
          <MoreHorizontal size={15} className="text-white" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Avatar + edit */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#F58FB1] to-[#E66A94] flex items-center justify-center text-white text-3xl font-bold ring-4 ring-[#FFF8F2] shadow-xl">
            MO
          </div>
          <button className="mb-2 px-4 py-2 bg-[#F58FB1] text-white rounded-full text-sm font-semibold hover:bg-[#E66A94] transition-colors shadow-sm">
            Editar perfil
          </button>
        </div>

        <h1 className="text-xl font-bold text-[#3D2010]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>Mariana Oliveira</h1>
        <p className="text-sm text-[#9B7560] mb-3">Confeiteira amadora apaixonada por macarons 🫐</p>

        {/* XP progress */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-[#F4E3D7] shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#5C3A2E]">Nível 7 — Confeiteira Avançada</span>
            <span className="text-xs text-[#9B7560]">2.340 / 3.000 XP</span>
          </div>
          <div className="h-2 bg-[#F4E3D7] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#F58FB1] to-[#E66A94] transition-all" style={{ width: "78%" }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[["23","Receitas"],["847","Seguidoras"],["312","Seguindo"],["5","Desafios"]].map(([v,l]) => (
            <div key={l} className="bg-white rounded-2xl p-3 text-center border border-[#F4E3D7] shadow-sm">
              <div className="font-bold text-[#E66A94] text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{v}</div>
              <div className="text-[10px] text-[#9B7560] mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F4E3D7]/50 rounded-2xl p-1 mb-5">
          {(["achievements","favorites","published"] as ProfileTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === t ? "bg-white text-[#E66A94] shadow-sm" : "text-[#9B7560] hover:text-[#5C3A2E]"}`}>
              {t === "achievements" ? "Conquistas" : t === "favorites" ? "Favoritos" : "Publicações"}
            </button>
          ))}
        </div>

        {/* Achievements */}
        {tab === "achievements" && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {achievements.map((a, i) => (
              <div key={i} className={`p-4 rounded-2xl border shadow-sm ${a.unlocked ? "bg-white border-[#F4E3D7]" : "bg-[#F4E3D7]/30 border-[#F4E3D7]/60 opacity-55"}`}>
                <div className="text-3xl mb-2">{a.icon}</div>
                <p className="font-semibold text-[#5C3A2E] text-sm leading-tight mb-1">{a.name}</p>
                <p className="text-xs text-[#9B7560] leading-snug">{a.desc}</p>
                {a.unlocked && (
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-[#BDE8D2] rounded-full text-xs text-[#1B6B46] font-semibold">
                    <Check size={9} /> Conquistado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Favorites */}
        {tab === "favorites" && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {favs.map(r => (
              <div key={r.id} onClick={() => onNav("recipe")} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F4E3D7] cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-28 bg-[#F4E3D7] overflow-hidden">
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-[#5C3A2E] text-xs leading-snug line-clamp-2 mb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{r.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-[#9B7560]"><Star size={10} className="fill-[#F6C667] text-[#F6C667]" /><span className="font-medium text-[#5C3A2E]">{r.rating}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Published */}
        {tab === "published" && (
          <div className="space-y-3 mb-8">
            {pubs.map(r => (
              <div key={r.id} onClick={() => onNav("recipe")} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F4E3D7] cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3 p-3">
                <div className="w-16 h-16 rounded-xl bg-[#F4E3D7] overflow-hidden flex-shrink-0">
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#5C3A2E] text-sm leading-snug truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{r.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#9B7560]">
                    <span className="flex items-center gap-0.5"><Star size={10} className="fill-[#F6C667] text-[#F6C667]" />{r.rating}</span>
                    <span className="flex items-center gap-0.5"><Heart size={10} />{r.reviews}</span>
                    <span className="flex items-center gap-0.5"><Clock size={10} />{r.time}</span>
                  </div>
                </div>
                <Trophy size={14} className="text-[#F6C667] flex-shrink-0" />
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-[#F4E3D7] text-[#9B7560] text-sm font-medium hover:border-[#F58FB1]/40 hover:text-[#E66A94] transition-colors">
              + Publicar nova receita
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bottom Tab Bar ─────────────────────────────────────────────────────────────
function BottomTabBar({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  if (page === "cook-mode") return null;
  const tabs: { id: Page; Icon: typeof Home; label: string }[] = [
    { id: "home",     Icon: Home,           label: "Início"    },
    { id: "recipe",   Icon: BookOpen,       label: "Receitas"  },
    { id: "ai-chat",  Icon: MessageCircle,  label: "Chef IA"   },
    { id: "profile",  Icon: User,           label: "Perfil"    },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/96 backdrop-blur-md border-t border-[#F4E3D7] px-2 pb-4 md:hidden shadow-lg z-40">
      <div className="flex">
        {tabs.map(({ id, Icon, label }) => {
          const active = page === id;
          return (
            <button key={id} onClick={() => onNav(id)} className="flex-1 flex flex-col items-center gap-0.5 pt-3">
              {id === "ai-chat" ? (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center -mt-5 shadow-lg ${active ? "bg-[#E66A94]" : "bg-[#F58FB1]"}`}>
                  <Icon size={18} className="text-white" />
                </div>
              ) : (
                <Icon size={20} className={active ? "text-[#E66A94]" : "text-[#C4A99A]"} />
              )}
              <span className={`text-[10px] font-medium ${active ? "text-[#E66A94]" : "text-[#C4A99A]"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");

  const nav = (p: Page) => { setPage(p); window.scrollTo({ top: 0, behavior: "instant" }); };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {page !== "cook-mode" && page !== "ai-chat" && <Navbar onNav={nav} />}
      {page === "home"      && <HomePage     onNav={nav} />}
      {page === "recipe"    && <RecipePage   onNav={nav} />}
      {page === "ai-chat"   && <AIChefPage   onNav={nav} />}
      {page === "cook-mode" && <CookModePage onNav={nav} />}
      {page === "profile"   && <ProfilePage  onNav={nav} />}
      <BottomTabBar page={page} onNav={nav} />
    </div>
  );
}
