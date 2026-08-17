const page = document.body.dataset.page;

const setActiveNav = () => {
  const current = location.pathname.split("/").pop() || "confeita-identidade.html";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("href");
    link.classList.toggle("active", target === current || (!target && current === "confeita-identidade.html"));
  });
};

const setupHomeHeader = () => {
  const header = document.querySelector("[data-home-header]");
  if (!header) return;

  const toggle = header.querySelector("[data-header-menu-toggle]");
  const drawer = header.querySelector("[data-header-drawer]");
  if (!toggle || !drawer) return;

  const closeDrawer = () => {
    drawer.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.classList.remove("is-open");
  };

  const openDrawer = () => {
    drawer.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.classList.add("is-open");
  };

  const syncDrawer = () => {
    if (window.matchMedia("(min-width: 981px)").matches) {
      closeDrawer();
    }
  };

  toggle.addEventListener("click", () => {
    if (drawer.hidden) openDrawer();
    else closeDrawer();
  });

  drawer.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && (target.closest("a") || target.matches("button[data-recipe-filter]"))) {
      if (window.matchMedia("(max-width: 980px)").matches) {
        closeDrawer();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  window.addEventListener("resize", syncDrawer);
  syncDrawer();
};

const setupCategoryPickers = () => {
  const pickers = [...document.querySelectorAll("[data-category-picker]")];
  if (!pickers.length) return;

  const closePicker = (picker) => {
    const toggle = picker.querySelector("[data-categories-toggle]");
    const menu = picker.querySelector("[data-categories-menu]");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (menu) menu.hidden = true;
    picker.classList.remove("is-open");
  };

  const openPicker = (picker) => {
    pickers.forEach((otherPicker) => {
      if (otherPicker !== picker) closePicker(otherPicker);
    });
    const toggle = picker.querySelector("[data-categories-toggle]");
    const menu = picker.querySelector("[data-categories-menu]");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (menu) menu.hidden = false;
    picker.classList.add("is-open");
  };

  const closeAll = () => {
    pickers.forEach(closePicker);
  };

  const syncCategoryState = (activeFilter) => {
    document.querySelectorAll("[data-recipe-filter]").forEach((button) => {
      const isActive = button.dataset.recipeFilter === activeFilter;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  pickers.forEach((picker) => {
    const toggle = picker.querySelector("[data-categories-toggle]");
    const menu = picker.querySelector("[data-categories-menu]");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (menu.hidden) openPicker(picker);
      else closePicker(picker);
    });

    menu.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const option = target.closest("[data-recipe-filter]");
      if (!option) return;
      if (window.__confeitaSetRecipeFilter) {
        window.__confeitaSetRecipeFilter(option.dataset.recipeFilter || "all");
      }
      closeAll();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest("[data-category-picker]")) {
      closeAll();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
  });

  window.addEventListener("resize", () => {
    closeAll();
  });

  syncCategoryState("all");
  window.__confeitaSyncRecipeFilter = syncCategoryState;
  window.__confeitaCloseRecipeCategories = closeAll;
};

const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return [h, m, r].map((part, index) => String(part).padStart(index === 0 && h ?2 : 2, "0")).join(":");
};

const API_BASE = location.protocol === "file:" ?"http://localhost:3000" : "";
const AUTH_TOKEN_KEY = "confeita_auth_token";

const RECIPE_LEVEL_LABELS = {
  basico: "🟢 Básico",
  intermediario: "🟡 Médio",
  avancado: "🔴 Difícil",
};

const RECIPES = [
  {
    id: "brownie-chocolate",
    title: "Brownie de Chocolate",
    category: "sobremesas",
    categoryLabel: "Sobremesas",
    categoryBadge: "🍫 Sobremesa",
    level: "basico",
    time: "45 min",
    yield: "9 a 12 pedaços",
    temperature: "180 °C",
    rating: "4.8",
    reviews: 128,
    summary: "Intenso, úmido e com casquinha delicada para servir em qualquer ocasião.",
    timer: "25:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.18)), url('./assets/bolo-chocolate-card.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.18)), url('./assets/brownie-chocolate-hero.png') center 54% / cover no-repeat",
    },
    ingredients: [
      {
        title: "Ingredientes",
        items: [
          "200 g de chocolate meio amargo",
          "120 g de manteiga sem sal",
          "150 g de açúcar",
          "80 g de açúcar mascavo",
          "3 ovos",
          "90 g de farinha de trigo",
          "30 g de cacau em pó 100%",
          "1 pitada de sal",
          "1 colher de chá de essência ou extrato de baunilha",
        ],
      },
    ],
    steps: [
      "Preaqueça o forno a 180 °C e forre uma forma de 20 × 20 cm com papel-manteiga.",
      "Derreta o chocolate com a manteiga em banho-maria ou no micro-ondas em intervalos curtos.",
      "Misture ovos, açúcar refinado, açúcar mascavo e baunilha.",
      "Acrescente o chocolate derretido e mexa até incorporar.",
      "Peneire farinha, cacau e sal sobre a massa.",
      "Misture apenas até não haver farinha visível.",
      "Leve à forma, nivele e asse por 22 a 28 minutos.",
      "Espere esfriar antes de cortar.",
    ],
    tip: "O palito deve sair com algumas migalhas úmidas. Se sair completamente seco, o brownie pode ter passado do ponto.",
    mistake: "Assar demais esperando que o centro fique igual a um bolo.",
    storage: "Até 3 dias em recipiente bem fechado em temperatura ambiente.",
  },
  {
    id: "bolo-caneca-chocolate",
    title: "Bolo de Chocolate de Caneca",
    category: "sobremesas",
    categoryLabel: "Sobremesas",
    categoryBadge: "☕ Bolo de caneca",
    level: "basico",
    time: "10 min",
    yield: "1 porção generosa",
    temperature: "800 W",
    rating: "4.9",
    reviews: 84,
    summary: "Um bolo de caneca macio, com centro úmido e chocolate derretido para matar a vontade rapidinho.",
    timer: "05:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.16)), url('./assets/bolo-caneca.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.16)), url('./assets/bolo-caneca.png') center center / cover no-repeat",
    },
    ingredients: [
      {
        title: "Ingredientes",
        items: [
          "4 colheres de sopa de farinha de trigo",
          "2 colheres de sopa de açúcar",
          "2 colheres de sopa de cacau em pó",
          "1/4 de colher de chá de fermento químico",
          "3 colheres de sopa de leite",
          "2 colheres de sopa de óleo",
          "1 ovo",
          "2 colheres de sopa de chocolate picado ou gotas",
        ],
      },
    ],
    steps: [
      "Em uma caneca grande, misture farinha, açúcar, cacau e fermento.",
      "Adicione o leite, o óleo e o ovo, mexendo até a massa ficar lisa.",
      "Incorpore o chocolate picado ou as gotas por cima da massa.",
      "Leve ao micro-ondas por 1 minuto e 10 segundos a 1 minuto e 30 segundos, conforme a potência.",
      "Deixe descansar por 30 segundos antes de servir.",
      "Se quiser, finalize com mais chocolate derretido ou uma bola de sorvete.",
    ],
    tip: "Não encha a caneca até a borda. A massa cresce e pode transbordar no micro-ondas.",
    mistake: "Assar tempo demais e deixar o centro seco.",
    storage: "Melhor consumir na hora. Se precisar, aqueça por poucos segundos antes de servir.",
  },
  {
    id: "bolo-cenoura-brigadeiro",
    title: "Bolo de Cenoura com Brigadeiro",
    category: "bolos",
    categoryLabel: "Bolos",
    categoryBadge: "🥕 Bolo clássico",
    level: "basico",
    time: "1 hora",
    yield: "10 a 12 porções",
    temperature: "180 °C",
    rating: "4.9",
    reviews: 214,
    summary: "Clássico, fofinho e com cobertura de brigadeiro brilhante para a vitrine ou para casa.",
    timer: "30:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(61,33,20,0.16)), url('./assets/bolo-cenoura-brigadeiro.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(61,33,20,0.16)), url('./assets/bolo-cenoura-brigadeiro.png') center center / cover no-repeat",
    },
    ingredients: [
      {
        title: "Ingredientes da massa",
        items: [
          "250 g de cenoura descascada e picada",
          "3 ovos",
          "180 ml de óleo",
          "250 g de açúcar",
          "240 g de farinha de trigo",
          "15 g de fermento químico",
        ],
      },
      {
        title: "Ingredientes da cobertura",
        items: [
          "395 g de leite condensado",
          "20 g de cacau em pó",
          "15 g de manteiga",
          "100 g de creme de leite",
        ],
      },
    ],
    steps: [
      "Preaqueça o forno a 180 °C.",
      "Bata cenoura, ovos, óleo e açúcar no liquidificador.",
      "Transfira para uma tigela e acrescente a farinha aos poucos.",
      "Misture manualmente e adicione o fermento por último.",
      "Coloque em forma untada e enfarinhada.",
      "Asse por 35 a 45 minutos.",
      "Para a cobertura, cozinhe leite condensado, cacau e manteiga em fogo baixo.",
      "Quando começar a engrossar, adicione o creme de leite e espalhe sobre o bolo.",
    ],
    tip: "Pese a cenoura. Excesso de cenoura pode deixar a massa pesada ou solada.",
    mistake: "Bater a farinha no liquidificador junto com os demais ingredientes.",
    storage: "Até 3 dias em recipiente fechado.",
  },
  {
    id: "cheesecake-frutas-vermelhas",
    title: "Cheesecake de Frutas Vermelhas",
    category: "tortas",
    categoryLabel: "Tortas",
    categoryBadge: "🍓 Cremoso",
    level: "intermediario",
    time: "2h30 + refrigeração",
    yield: "10 porções",
    temperature: "160 °C",
    rating: "4.9",
    reviews: 176,
    summary: "Uma base crocante, creme estável e calda viva de frutas vermelhas.",
    timer: "40:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.18)), url('./assets/bolo-morango-card.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.18)), url('./assets/bolo-morango-card.png') center center / cover no-repeat",
    },
    ingredients: [
      { title: "Base", items: ["200 g de biscoito tipo maisena", "90 g de manteiga sem sal derretida"] },
      {
        title: "Creme",
        items: [
          "600 g de cream cheese",
          "150 g de açúcar",
          "200 g de creme de leite",
          "3 ovos",
          "1 colher de chá de baunilha",
          "10 g de amido de milho",
        ],
      },
      {
        title: "Calda",
        items: ["250 g de frutas vermelhas", "80 g de açúcar", "1 colher de sopa de suco de limão"],
      },
    ],
    steps: [
      "Triture os biscoitos e misture com a manteiga.",
      "Pressione no fundo de uma forma de fundo removível e asse por 10 minutos a 180 °C.",
      "Reduza o forno para 160 °C.",
      "Misture cream cheese e açúcar.",
      "Acrescente creme de leite, baunilha e amido.",
      "Adicione os ovos um de cada vez.",
      "Coloque sobre a base e asse por 50 a 65 minutos.",
      "Deixe esfriar, refrigere por 6 horas e finalize com a calda fria.",
    ],
    tip: "Evite incorporar muito ar depois de adicionar os ovos.",
    mistake: "Esperar que todo o cheesecake fique completamente firme dentro do forno.",
    storage: "Até 4 dias refrigerado.",
  },
  {
    id: "torta-limao-merengue",
    title: "Torta de Limão com Merengue Suíço",
    category: "tortas",
    categoryLabel: "Tortas",
    categoryBadge: "🍋 Equilíbrio",
    level: "intermediario",
    time: "2 horas",
    yield: "8 a 10 porções",
    temperature: "180 °C",
    rating: "4.8",
    reviews: 152,
    summary: "Acidez equilibrada, creme suave e merengue leve para terminar com brilho.",
    timer: "30:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(61,33,20,0.16)), url('./assets/torta-limao-merengue-suico.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(61,33,20,0.16)), url('./assets/torta-limao-merengue-suico.png') center center / cover no-repeat",
    },
    ingredients: [
      { title: "Base", items: ["200 g de biscoito maisena", "90 g de manteiga derretida"] },
      {
        title: "Creme de limão",
        items: ["395 g de leite condensado", "200 g de creme de leite", "100 ml de suco de limão", "Raspas de 2 limões"],
      },
      { title: "Merengue suíço", items: ["3 claras, aproximadamente 100 g", "200 g de açúcar"] },
    ],
    steps: [
      "Triture os biscoitos e misture com a manteiga.",
      "Distribua no fundo e laterais da forma e asse por 10 minutos a 180 °C.",
      "Deixe esfriar.",
      "Misture leite condensado e creme de leite.",
      "Adicione o suco de limão gradualmente e acrescente as raspas.",
      "Para o merengue, aqueça claras e açúcar em banho-maria até dissolver.",
      "Bata até obter um merengue firme e brilhante.",
      "Cubra a torta e, se quiser, doure com maçarico.",
    ],
    tip: "Evite retirar a parte branca da casca do limão junto com as raspas.",
    mistake: "Deixar a tigela do merengue tocar diretamente a água do banho-maria.",
    storage: "Refrigerada por até 3 dias.",
  },
  {
    id: "mini-tortas-limao-cremosas",
    title: "Mini Tortas de Limão Cremosas",
    category: "tortas",
    categoryLabel: "Tortas",
    categoryBadge: "🍋 Mini tortas",
    level: "basico",
    time: "40 min",
    yield: "4 mini tortas",
    temperature: "180 °C",
    rating: "4.8",
    reviews: 96,
    summary: "Mini tortas com base crocante, creme de limão leve e acabamento delicado para servir geladinhas.",
    timer: "20:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.12)), url('./assets/torta-mini-limao-cremosa.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.12)), url('./assets/torta-mini-limao-cremosa.png') center center / cover no-repeat",
    },
    ingredients: [
      {
        title: "Base",
        items: ["200 g de biscoito maisena", "90 g de manteiga derretida"],
      },
      {
        title: "Creme",
        items: ["395 g de leite condensado", "200 g de creme de leite", "100 ml de suco de limão", "Raspas de 2 limões"],
      },
      {
        title: "Finalização",
        items: ["4 rodelas de limão", "Zest de limão a gosto"],
      },
    ],
    steps: [
      "Triture os biscoitos e misture com a manteiga derretida.",
      "Forre forminhas de muffin ou mini torta, pressionando bem a base.",
      "Asse por 8 a 10 minutos a 180 °C e deixe esfriar.",
      "Misture leite condensado e creme de leite.",
      "Adicione o suco de limão aos poucos até engrossar levemente.",
      "Acrescente as raspas e distribua o creme sobre as bases frias.",
      "Finalize com rodelas de limão e leve à geladeira por pelo menos 1 hora.",
    ],
    tip: "Quanto mais gelada, mais firme e cremosa ela fica na hora de servir.",
    mistake: "Colocar o creme nas bases ainda mornas.",
    storage: "Até 3 dias refrigeradas em recipiente fechado.",
  },
  {
    id: "bolo-laranja-calda-brilhante",
    title: "Bolo de Laranja com Calda Brilhante",
    category: "bolos",
    categoryLabel: "Bolos",
    categoryBadge: "🍊 Bolo cítrico",
    level: "intermediario",
    time: "55 min",
    yield: "10 a 12 porções",
    temperature: "180 °C",
    rating: "4.9",
    reviews: 117,
    summary: "Massa úmida, aroma cítrico e uma calda brilhante para finalizar com destaque.",
    timer: "25:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(61,33,20,0.14)), url('./assets/bolo-laranja-calda-brilhante.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(61,33,20,0.14)), url('./assets/bolo-laranja-calda-brilhante.png') center center / cover no-repeat",
    },
    ingredients: [
      {
        title: "Ingredientes da massa",
        items: [
          "3 ovos",
          "180 ml de óleo",
          "250 ml de suco de laranja natural",
          "250 g de açúcar",
          "260 g de farinha de trigo",
          "15 g de fermento químico",
          "Raspas de 2 laranjas",
        ],
      },
      {
        title: "Ingredientes da calda",
        items: [
          "200 ml de suco de laranja",
          "120 g de açúcar",
          "1 colher de sopa de manteiga",
        ],
      },
    ],
    steps: [
      "Preaqueça o forno a 180 °C e unte uma forma com furo central.",
      "Bata ovos, óleo, suco de laranja e açúcar até misturar bem.",
      "Acrescente a farinha aos poucos e mexa até incorporar.",
      "Adicione as raspas e o fermento por último.",
      "Despeje a massa na forma e asse por 35 a 40 minutos.",
      "Para a calda, leve suco, açúcar e manteiga ao fogo até encorpar levemente.",
      "Desenforme o bolo morno e regue com a calda brilhante.",
    ],
    tip: "Use laranjas frescas e bem suculentas para uma cor mais viva e sabor mais aromático.",
    mistake: "Colocar a calda sobre o bolo ainda muito quente e deixá-lo encharcar.",
    storage: "Até 3 dias em recipiente fechado em temperatura ambiente.",
  },
  {
    id: "entremet-morango-pistache",
    title: "Entremet de Morango e Pistache",
    category: "sobremesas",
    categoryLabel: "Sobremesas",
    categoryBadge: "🍓 Entremet premium",
    level: "avancado",
    time: "5 a 6 horas + descanso",
    yield: "10 porções",
    temperature: "160 °C",
    rating: "5.0",
    reviews: 128,
    summary: "Camadas elegantes com mousse de pistache, inserto de morango e acabamento brilhante para vitrine.",
    timer: "45:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.14)), url('./assets/entremet-morango-pistache.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.14)), url('./assets/entremet-morango-pistache.png') center center / cover no-repeat",
    },
    ingredients: [
      {
        title: "Base de pistache",
        items: [
          "2 ovos",
          "70 g de açúcar",
          "60 g de farinha de trigo",
          "20 g de farinha de pistache",
          "30 g de manteiga derretida",
        ],
      },
      {
        title: "Inserto de morango",
        items: [
          "250 g de morangos",
          "60 g de açúcar",
          "5 g de gelatina em pó sem sabor",
          "25 g de água",
          "10 ml de suco de limão",
        ],
      },
      {
        title: "Mousse de pistache",
        items: [
          "250 g de chocolate branco",
          "120 g de pasta de pistache",
          "150 g de creme de leite",
          "300 g de creme de leite fresco bem gelado",
        ],
      },
    ],
    steps: [
      "Hidrate a gelatina na água e cozinhe morangos, açúcar e limão por 8 minutos.",
      "Acrescente a gelatina hidratada, coloque em forma menor e congele completamente.",
      "Para a base, bata ovos e açúcar até ficarem claros e volumosos.",
      "Peneire farinha e farinha de pistache, incorpore delicadamente e adicione a manteiga morna.",
      "Espalhe em uma assadeira e asse por 10 a 15 minutos a 180 °C.",
      "Depois de frio, corte um disco ligeiramente menor que o molde final.",
      "Para a mousse, derreta o chocolate branco, emulsione com creme aquecido e misture a pasta de pistache.",
      "Bata o creme fresco em picos suaves e incorpore à base de pistache.",
      "Monte com mousse, inserto, mais mousse e o disco de bolo.",
      "Congele completamente, desenforme e finalize com brilho ou cobertura espelhada.",
    ],
    tip: "Deixe o inserto congelar bem antes de montar para manter as camadas limpas e definidas.",
    mistake: "Tentar desenformar antes que o entremet esteja completamente firme.",
    storage: "Depois de descongelado, manter refrigerado e consumir em até 2 a 3 dias. Não recongelar.",
  },
  {
    id: "macaron-chocolate",
    title: "Macaron de Chocolate",
    category: "macarons",
    categoryLabel: "Macarons",
    categoryBadge: "🍫 Técnicas",
    level: "avancado",
    time: "Aproximadamente 3 horas",
    yield: "18 a 22 macarons montados",
    temperature: "140 a 150 °C",
    rating: "4.9",
    reviews: 96,
    summary: "Casquinhas lisas, pés bem definidos e ganache de chocolate equilibrada.",
    timer: "35:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(61,33,20,0.18)), url('./assets/hero-macaron.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(61,33,20,0.18)), url('./assets/hero-macaron.png') center center / cover no-repeat",
    },
    ingredients: [
      {
        title: "Ingredientes dos macarons",
        items: [
          "100 g de farinha de amêndoas fina",
          "100 g de açúcar de confeiteiro",
          "100 g de claras",
          "100 g de açúcar refinado",
          "10 g de cacau em pó 100%",
        ],
      },
      {
        title: "Ganache",
        items: ["150 g de chocolate meio amargo", "120 g de creme de leite"],
      },
    ],
    steps: [
      "Peneire farinha de amêndoas, açúcar de confeiteiro e cacau.",
      "Bata as claras em velocidade média e adicione o açúcar refinado gradualmente.",
      "Bata até obter merengue firme e brilhante.",
      "Incorpore os ingredientes secos até chegar ao ponto de fita.",
      "Coloque em saco de confeitar e forme círculos de 3 a 4 cm.",
      "Bata suavemente a assadeira na bancada e deixe descansar até formar película.",
      "Asse entre 140 e 150 °C por 12 a 16 minutos.",
      "Esfrie completamente antes de rechear com a ganache.",
      "Mature os macarons refrigerados por 24 horas para melhor textura.",
    ],
    tip: "A macaronage é um dos pontos mais importantes. A massa não deve ficar nem muito firme nem excessivamente líquida.",
    mistake: "Usar a temperatura indicada sem considerar a temperatura real do próprio forno.",
    storage: "Até 4 dias refrigerado em recipiente fechado.",
  },
  {
    id: "entremet-chocolate-frutas-vermelhas",
    title: "Entremet de Chocolate e Frutas Vermelhas",
    category: "sobremesas",
    categoryLabel: "Sobremesas",
    categoryBadge: "🍓 Camadas",
    level: "avancado",
    time: "5 a 6 horas + congelamento",
    yield: "8 a 10 porções",
    temperature: "180 °C",
    rating: "5.0",
    reviews: 84,
    summary: "Camadas elegantes, inserto vibrante e mousse sedosa para uma apresentação de vitrine.",
    timer: "45:00",
    cover: {
      card: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.18)), url('./assets/torta-cookie-nutella-card.png') center center / cover no-repeat",
      hero: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(61,33,20,0.18)), url('./assets/torta-cookie-nutella-card.png') center center / cover no-repeat",
    },
    ingredients: [
      { title: "Base de chocolate", items: ["2 ovos", "70 g de açúcar", "60 g de farinha de trigo", "20 g de cacau em pó", "30 g de manteiga derretida"] },
      {
        title: "Inserto de frutas vermelhas",
        items: ["250 g de frutas vermelhas", "60 g de açúcar", "5 g de gelatina em pó sem sabor", "25 g de água", "10 ml de suco de limão"],
      },
      {
        title: "Mousse de chocolate",
        items: ["250 g de chocolate meio amargo", "150 g de creme de leite", "300 g de creme de leite fresco bem gelado"],
      },
    ],
    steps: [
      "Hidrate a gelatina na água e cozinhe frutas, açúcar e limão por 8 minutos.",
      "Acrescente a gelatina hidratada, coloque em forma menor e congele completamente.",
      "Para a base, bata ovos e açúcar até ficarem claros e volumosos.",
      "Peneire farinha e cacau, incorpore delicadamente e adicione a manteiga morna.",
      "Espalhe em uma assadeira e asse por 10 a 15 minutos a 180 °C.",
      "Depois de frio, corte um disco ligeiramente menor que o molde final.",
      "Para a mousse, derreta o chocolate, emulsione com creme aquecido e amorne.",
      "Bata o creme fresco em picos suaves e incorpore à ganache.",
      "Monte com mousse, inserto, mais mousse e o disco de bolo.",
      "Congele completamente, desenforme e descongele lentamente na geladeira antes de servir.",
    ],
    tip: "Cada camada deve estar na textura e temperatura adequadas antes da próxima etapa.",
    mistake: "Tentar desenformar antes que o entremet esteja completamente congelado.",
    storage: "Depois de descongelado, manter refrigerado e consumir em até 2 a 3 dias. Não recongelar.",
  },
];

const RECIPE_LOOKUP = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getRecipeById = (recipeId) => RECIPE_LOOKUP.get(recipeId) || RECIPES[0];

const buildCoverStyle = (recipe, variant = "card") => `background: ${recipe.cover?.[variant] || recipe.cover?.card || "linear-gradient(135deg, #f3e6dd, #e7cdb8)"};`;

const renderRecipeCard = (recipe) => `
  <a class="recipe-tile" data-recipe-card data-recipe-category="${recipe.category}" href="./receita.html?recipe=${encodeURIComponent(recipe.id)}" aria-label="${escapeHtml(recipe.title)}">
    <div class="recipe-thumb ${recipe.id}" style="${buildCoverStyle(recipe, "card")}"></div>
    <div class="recipe-body">
      <span class="tag ${recipe.level === "basico" ? "basic" : recipe.level === "intermediario" ? "warning" : "danger"}">${RECIPE_LEVEL_LABELS[recipe.level] || "🟢 Básico"}</span>
      <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
      <div class="recipe-meta">
        <span>${escapeHtml(recipe.time)}</span>
        <span>${escapeHtml(recipe.yield)}</span>
      </div>
      <div class="recipe-card-actions">
        <span class="recipe-card-cta">Ver receita</span>
      </div>
    </div>
  </a>
`;

const renderIngredientSections = (recipe) =>
  recipe.ingredients
    .map(
      (section) => `
        <section class="recipe-ingredient-section">
          ${section.title ?`<h3>${escapeHtml(section.title)}</h3>` : ""}
          <div class="checklist recipe-checklist-group">
            ${section.items
              .map(
                (item) => `
                  <label class="check-item"><input type="checkbox" data-ingredient-check /> ${escapeHtml(item)}</label>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");

const renderSteps = (recipe) =>
  recipe.steps
    .map((step) => `<div class="step">${escapeHtml(step)}</div>`)
    .join("");

const renderNotes = (recipe) => `
  <article class="recipe-note">
    <strong>Dica do confeiteiro</strong>
    <p>${escapeHtml(recipe.tip)}</p>
  </article>
  <article class="recipe-note">
    <strong>Erro comum</strong>
    <p>${escapeHtml(recipe.mistake)}</p>
  </article>
  <article class="recipe-note">
    <strong>Conservação</strong>
    <p>${escapeHtml(recipe.storage)}</p>
  </article>
  <article class="recipe-note">
    <strong>Temperatura</strong>
    <p>${escapeHtml(recipe.temperature)}</p>
  </article>
`;

const updateIngredientProgress = () => {
  const recipePanel = document.querySelector("[data-recipe-ingredients]");
  if (!recipePanel) return;
  const checks = [...recipePanel.querySelectorAll("[data-ingredient-check]")];
  const count = checks.filter((input) => input.checked).length;
  const countLabel = document.querySelector("[data-ingredient-count]");
  const progress = document.querySelector("[data-ingredient-progress]");
  if (countLabel) countLabel.textContent = `${count} de ${checks.length} selecionados`;
  if (progress) progress.style.width = `${checks.length ?Math.max(12, (count / checks.length) * 100) : 12}%`;
};

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
    ?await response.json()
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
setupHomeHeader();
setupCategoryPickers();

if (page === "home") {
  const search = document.querySelector("[data-recipe-search]");
  const recipeList = document.querySelector("[data-recipe-list]");
  const pantryInput = document.querySelector("[data-pantry-input]");
  const pantryResults = document.querySelector("[data-pantry-results]");
  const pantryPicks = [...document.querySelectorAll("[data-pantry-pick]")];
  let activeFilter = "all";
  let cards = [];

  if (recipeList) {
    recipeList.innerHTML = RECIPES.map(renderRecipeCard).join("");
    cards = [...document.querySelectorAll("[data-recipe-card]")];
  }

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

  window.__confeitaSetRecipeFilter = (nextFilter) => {
    activeFilter = nextFilter || "all";
    if (typeof window.__confeitaSyncRecipeFilter === "function") {
      window.__confeitaSyncRecipeFilter(activeFilter);
    }
    applyRecipeFilters();
    if (typeof window.__confeitaCloseRecipeCategories === "function") {
      window.__confeitaCloseRecipeCategories();
    }
  };

  const pantryIdeas = [
    {
      title: "Bolo de banana com chocolate",
      ingredients: ["banana", "ovo", "chocolate", "farinha"],
      time: "45 min",
      level: "Fácil",
      note: "Ótimo para bananas maduras e chocolate.",
    },
    {
      title: "Cookies macios com gotas de chocolate",
      ingredients: ["manteiga", "ovo", "farinha", "chocolate"],
      time: "30 min",
      level: "Fácil",
      note: "Itens simples, lanche bonito.",
    },
    {
      title: "Bolo de iogurte e limão",
      ingredients: ["iogurte", "ovo", "limão", "farinha"],
      time: "50 min",
      level: "Fácil",
      note: "Leve, aromático e ótimo para a tarde.",
    },
    {
      title: "Pão de queijo macio",
      ingredients: ["queijo", "ovo", "leite", "polvilho"],
      time: "40 min",
      level: "Médio",
      note: "Ótima saída para ovos, queijo e leite.",
    },
    {
      title: "Torta de maçã e canela",
      ingredients: ["maçã", "manteiga", "farinha", "canela"],
      time: "1h",
      level: "Médio",
      note: "Aproveita frutas maduras.",
    },
    {
      title: "Creme de colher com coco",
      ingredients: ["leite", "coco", "amido", "acucar"],
      time: "25 min",
      level: "Fácil",
      note: "Rápido para usar leite e coco.",
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
        const bonus = terms.length === 0 ?1 : matches;
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

  pantryInput?.addEventListener("input", renderPantryIdeas);
  pantryPicks.forEach((button) => {
    button.addEventListener("click", () => {
      const ingredient = button.dataset.pantryPick || "";
      if (!pantryInput || !ingredient) return;
      const current = pantryInput.value.trim();
      pantryInput.value = current ?`${current}, ${ingredient}` : ingredient;
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
      authHint.textContent = "Conta ativa.";
    }
    if (continueButton) continueButton.hidden = false;
  };

  const loadMe = async () => {
    try {
      const me = await apiRequest("/api/me");
      showLoggedIn(me.name || "sua conta");
    } catch {
      if (authStatus) authStatus.textContent = "Faça login.";
      if (authHint) authHint.textContent = "Use seu e-mail e senha.";
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
  const recipePage = document.querySelector(".recipe-page");
  const recipeId = new URLSearchParams(location.search).get("recipe") || recipePage?.dataset.recipe || RECIPES[0].id;
  const recipe = getRecipeById(recipeId);
  const heroCover = document.querySelector("[data-recipe-cover]");
  const categoryLabel = document.querySelector("[data-recipe-category]");
  const titleEl = document.querySelector("[data-recipe-title]");
  const summaryEl = document.querySelector("[data-recipe-summary]");
  const ratingEl = document.querySelector("[data-recipe-rating]");
  const timeEl = document.querySelector("[data-recipe-time]");
  const levelEl = document.querySelector("[data-recipe-level]");
  const yieldEl = document.querySelector("[data-recipe-yield]");
  const tempEl = document.querySelector("[data-recipe-temperature]");
  const ingredientPanel = document.querySelector("[data-recipe-ingredients]");
  const stepPanel = document.querySelector("[data-recipe-steps]");
  const notesPanel = document.querySelector("[data-recipe-notes]");
  const clock = document.querySelector("[data-timer]");
  const progress = document.querySelector("[data-progress]");
  const backButton = document.querySelector(".hero-fab.back");
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const duration = (() => {
    const match = String(recipe.timer || "25:00").match(/^(\d+):(\d{2})$/);
    if (!match) return 25 * 60;
    return Number(match[1]) * 60 + Number(match[2]);
  })();
  let remaining = duration;
  let timer = null;

  document.title = `Confeita - ${recipe.title}`;
  if (heroCover) heroCover.style.background = recipe.cover?.hero || recipe.cover?.card || "linear-gradient(135deg, #cfc4bc 0%, #b9aa9c 18%, #e9e2dd 42%, #cfaeaa 68%, #8f6a57 100%)";
  if (categoryLabel) categoryLabel.textContent = recipe.categoryBadge || recipe.categoryLabel || "🍰 Receita";
  if (titleEl) titleEl.textContent = recipe.title;
  if (summaryEl) summaryEl.textContent = recipe.summary || "";
  if (ratingEl) ratingEl.innerHTML = `★ ${recipe.rating} <small>(${recipe.reviews} avaliações)</small>`;
  if (timeEl) timeEl.textContent = `⏱ ${recipe.time}`;
  if (yieldEl) yieldEl.textContent = `🍽 ${recipe.yield}`;
  if (tempEl) tempEl.textContent = `🔥 ${recipe.temperature}`;
  if (ingredientPanel) ingredientPanel.innerHTML = renderIngredientSections(recipe);
  if (stepPanel) stepPanel.innerHTML = renderSteps(recipe);
  if (notesPanel) notesPanel.innerHTML = renderNotes(recipe);

  const paint = () => {
    if (clock) clock.textContent = formatTime(remaining);
    if (progress) progress.style.width = `${((duration - remaining) / duration) * 100}%`;
    updateIngredientProgress();
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
  backButton?.addEventListener("click", () => {
    location.href = "./confeita-identidade.html#receitas";
  });

  paint();
  document.querySelector("[data-start-timer]")?.addEventListener("click", startTimer);
  document.querySelector("[data-reset-timer]")?.addEventListener("click", () => {
    remaining = duration;
    clearInterval(timer);
    timer = null;
    paint();
  });
  document.querySelectorAll("[data-ingredient-check]").forEach((check) => {
    check.addEventListener("change", updateIngredientProgress);
  });
  updateIngredientProgress();

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === id));
    });
  });

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
      authStatus.textContent = loggedIn ?`Logado como ${currentUser.name}` : "Entre para comentar";
    }
    if (authForms) authForms.hidden = loggedIn;
    if (composer) composer.hidden = !loggedIn;
    if (commentHint) {
      commentHint.textContent = loggedIn
        ? `Comentando como ${currentUser.name}.`
        : "Crie uma conta para publicar.";
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
      const data = await apiRequest(`/api/comments?recipe=${encodeURIComponent(recipe.id)}`);
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
      if (commentHint) commentHint.textContent = "Digite algo antes.";
      return;
    }
    if (!currentUser) {
      if (commentHint) commentHint.textContent = "Entre ou crie conta.";
      return;
    }
    try {
      commentSubmit.disabled = true;
      await apiRequest("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          recipe: recipe.id,
          text,
        }),
      });
      if (commentText) commentText.value = "";
      await loadComments();
      if (commentHint) commentHint.textContent = "Publicado.";
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
    bubble.className = `message${user ?" me" : ""}`;
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
  const filterHint = document.querySelector("[data-community-filter-hint]");
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
  let activeFilter = "all";
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
      ?((state.xp - tier.min) / Math.max(1, nextTier.min - tier.min)) * 100
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

  const initialPosts = feed
    ? [...feed.querySelectorAll("[data-community-post]")].map((post) => ({
        title: post.querySelector("h3")?.textContent?.trim() || "",
        level: post.dataset.level || "basico",
        recipeId: post.dataset.recipeId || "",
        thumb: post.dataset.thumb || post.querySelector(".community-thumb")?.classList?.[1] || "",
        time: post.querySelector(".community-meta span")?.textContent.replace(/^⏱\s*/, "").trim() || "",
        likes: post.querySelectorAll(".community-meta span")[1]?.textContent.replace(/^❤\s*/, "").trim() || "0",
        comments: post.querySelectorAll(".community-meta span")[2]?.textContent.replace(/^💬\s*/, "").trim() || "0",
        description: post.querySelector(":scope > p.muted")?.textContent?.trim() || "",
        author: post.querySelector(".author-chip strong")?.textContent?.trim() || "",
        subtitle: post.querySelector(".author-chip small")?.textContent?.trim() || "",
        initials: post.querySelector(".avatar-circle")?.textContent?.trim() || "VC",
        tags: post.querySelector(".chip")?.textContent?.trim() || "",
      }))
    : [];

  const createPost = (post) => {
    const article = document.createElement("article");
    article.className = "community-post";
    article.dataset.communityPost = "true";
    article.dataset.level = post.level;
    if (post.recipeId) article.dataset.recipeId = post.recipeId;
    const titleMarkup = post.recipeId
      ? `<h3><a href="./receita.html?recipe=${encodeURIComponent(post.recipeId)}">${post.title}</a></h3>`
      : `<h3>${post.title}</h3>`;
    article.innerHTML = `
      <div class="community-thumb ${post.thumb || thumbClass(post.level)}"></div>
      <div class="community-post-head">
        <div>
          <span class="community-level ${levelClass(post.level)}">${post.levelLabel || levelMap[post.level] || "Básico"}</span>
          ${titleMarkup}
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
        <span class="chip ${post.level === "basico" ?"mint" : post.level === "intermediario" ?"gold" : "dark"}">${post.tags}</span>
      </div>
    `;
    return article;
  };

  const getAllPosts = () => [
    ...storedPosts.slice().reverse().map((post) => ({
      ...post,
      levelLabel: levelMap[post.level] || "Básico",
    })),
    ...initialPosts.map((post) => ({
      ...post,
      levelLabel: levelMap[post.level] || "Básico",
    })),
  ];

  const renderFeed = () => {
    if (!feed) return;
    const matchingPosts = getAllPosts().filter((post) => activeFilter === "all" || post.level === activeFilter);
    feed.innerHTML = "";

    if (!matchingPosts.length) {
      const empty = document.createElement("article");
      empty.className = "community-post community-empty";
      empty.innerHTML = `
        <div class="community-post-head">
          <div>
            <span class="community-level basic">Sem resultados</span>
            <h3>Nenhuma publicação neste nível</h3>
          </div>
        </div>
        <p class="muted">Tente outro filtro ou publique uma nova receita para aparecer aqui.</p>
      `;
      feed.append(empty);
      if (filterHint) {
        filterHint.textContent = `Mostrando 0 publicações para ${activeFilter === "all" ? "todos os níveis" : levelMap[activeFilter].toLowerCase()}.`;
      }
      return;
    }

    matchingPosts.forEach((post) => {
      feed.append(createPost(post));
    });

    if (filterHint) {
      const label = activeFilter === "all" ? "todos os níveis" : levelMap[activeFilter].toLowerCase();
      filterHint.textContent = `Mostrando ${matchingPosts.length} ${matchingPosts.length === 1 ? "publicação" : "publicações"} para ${label}.`;
    }
  };

  const applyFilter = (filter) => {
    activeFilter = filter || "all";
    filters.forEach((button) => button.classList.toggle("active", button.dataset.communityFilter === activeFilter));
    renderFeed();
  };

  const storedPosts = (() => {
    try {
      return JSON.parse(localStorage.getItem(postsKey) || "[]");
    } catch {
      return [];
    }
  })();

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

    storedPosts.push(post);
    try {
      localStorage.setItem(postsKey, JSON.stringify(storedPosts.slice(-24)));
    } catch {
      // Non-blocking.
    }

    state.xp += xpGain[level] || 18;
    persistState();
    renderState();
    applyFilter(activeFilter);
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
