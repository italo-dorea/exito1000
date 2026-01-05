const menuToggle = document.querySelector(".menu-toggle");
const navMobile = document.querySelector("#nav-mobile");
const closeMenu = document.querySelector("#close-menu");

// abre o menu
menuToggle.addEventListener("click", () => {
  navMobile.classList.add("active");
});

// fecha o menu
closeMenu.addEventListener("click", () => {
  navMobile.classList.remove("active");
});

// fecha ao clicar nos links
document.querySelectorAll("#nav-mobile a").forEach(link => {
  link.addEventListener("click", () => {
    navMobile.classList.remove("active");
  });
});


//effect FADE elements
document.addEventListener('DOMContentLoaded', function () {
  AOS.init({
    duration: 1200,      // duração da animação (ms)
    easing: 'ease-out', // suavização
    once: false,         // anima só na primeira vez
    offset: 80,         // dispara um pouco antes do elemento entrar
    mirror: true       // não reanima ao subir a página
  });
});

//fade de imagens do banner principal
// 1) Pegue os <img> existentes (na ordem que aparecem)
const slots = Array.from(document.querySelectorAll(".galeria-alunos img.foto"));

const imagesBySlot = [
  ["./assets/alunos/aluno1.webp", "./assets/alunos/aluno5.webp", "./assets/alunos/aluno9.webp"],
  ["./assets/alunos/aluno2.webp", "./assets/alunos/aluno6.webp", "./assets/alunos/aluno10.webp"],
  ["./assets/alunos/aluno3.webp", "./assets/alunos/aluno7.webp", "./assets/alunos/aluno11.webp"],
  ["./assets/alunos/aluno4.webp", "./assets/alunos/aluno8.webp", "./assets/alunos/aluno12.webp"],
];

const intervalMs = 3500;

// índice atual por slot
const idx = new Array(slots.length).fill(0);

// preload inicial (ok manter)
imagesBySlot.flat().forEach(src => { const i = new Image(); i.src = src; });

async function preloadAndDecode(src) {
  const im = new Image();
  im.src = src;

  // espera carregar
  await new Promise((res, rej) => {
    im.onload = res;
    im.onerror = rej;
  });

  // tenta decodificar (melhora MUITO no iOS)
  if (im.decode) {
    try { await im.decode(); } catch { }
  }
}

async function swapImage(slotIndex) {
  const img = slots[slotIndex];
  const list = imagesBySlot[slotIndex] || [];
  if (!img || list.length < 2) return;

  const nextIndex = (idx[slotIndex] + 1) % list.length;
  const nextSrc = list[nextIndex];

  // garante que a próxima imagem está pronta antes do fade
  try {
    await preloadAndDecode(nextSrc);
  } catch {
    // se falhar, ainda tenta trocar (não trava)
  }

  // 1) fade-out
  img.classList.add("is-fading");

  // 2) quando terminar o fade-out, troca src e faz fade-in
  const onEnd = (e) => {
    if (e.propertyName !== "opacity") return;
    img.removeEventListener("transitionend", onEnd);

    img.src = nextSrc;
    idx[slotIndex] = nextIndex;

    // garante que o browser “registre” a troca antes de voltar opacidade
    requestAnimationFrame(() => {
      img.classList.remove("is-fading");
    });
  };

  img.addEventListener("transitionend", onEnd);
}

// loop sem overlap (mais estável que setInterval no mobile)
async function runLoop() {
  for (let i = 0; i < slots.length; i++) {
    // roda em paralelo
    swapImage(i);
  }
  setTimeout(runLoop, intervalMs);
}

runLoop();


//altera imagem da seção "realizar seu sonho"
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".right-dreams");
  const imgs = Array.from(container.querySelectorAll(".dreams-img"));

  const sources = [
    "./assets/alunos/aluno18.jpg",
    "./assets/alunos/aluno15.jpg",
    "./assets/alunos/aluno16.jpg",
    "./assets/alunos/aluno17.jpg",
  ];

  const intervalMs = 3500;
  const fadeMs = 700; // igual ao transition

  // pré-carregar
  sources.forEach(src => { const i = new Image(); i.src = src; });

  let index = 0;         // imagem atual
  let top = 0;           // qual <img> está visível (0 ou 1)

  // garante estado inicial
  imgs[0].src = sources[0];
  imgs[0].classList.add("is-active");
  imgs[1].classList.remove("is-active");

  setInterval(() => {
    const nextIndex = (index + 1) % sources.length;
    const nextImg = imgs[1 - top];
    const currentImg = imgs[top];

    nextImg.src = sources[nextIndex];

    // força a classe pra iniciar a transição corretamente
    nextImg.classList.add("is-active");
    currentImg.classList.remove("is-active");

    // após o fade, atualiza os índices
    setTimeout(() => {
      index = nextIndex;
      top = 1 - top;
    }, fadeMs);
  }, intervalMs);
});

//abrir dialog do video planos
(function setupVideoDialog() {
  const dialog = document.getElementById("videoDialog");
  const closeBtn = document.getElementById("videoDialogClose");
  const player = document.getElementById("videoDialogPlayer");

  // Vídeos "genéricos" temporários (troque pelos seus .mp4 reais quando hospedar)
  // Coloque os arquivos em /assets/videos/ no seu projeto.
  const VIDEO_BY_PLAN = {
    "#diamante": "https://redacaoexito1000.com.br/midias/disponivel.mp4",
    "#premium": "https://redacaoexito1000.com.br/midias/disponivel.mp4",
  };

  // fallback caso passe algo diferente
  const FALLBACK_VIDEO = "/assets/videos/generico.mp4";

  // Função global para você chamar no onclick ou em qualquer lugar
  window.openPlanVideo = function openPlanVideo(planHash) {
    const src = VIDEO_BY_PLAN[planHash] || FALLBACK_VIDEO;

    // Atualiza o src do vídeo e abre o dialog
    player.pause();
    player.removeAttribute("src");
    player.load();

    player.src = src;

    // Abre modal (dialog nativo)
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      // fallback simples se o browser não suportar <dialog>
      dialog.setAttribute("open", "true");
    }

    // tenta dar play (pode ser bloqueado no mobile; o controls resolve)
    player.play().catch(() => { });
  };

  function closeDialog() {
    player.pause();
    dialog.close?.();
    dialog.removeAttribute("open");
  }

  // Fechar botão
  closeBtn.addEventListener("click", closeDialog);

  // Fechar clicando no backdrop (fora do conteúdo)
  dialog.addEventListener("click", (e) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!clickedInside) closeDialog();
  });

  // Fechar com ESC
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeDialog();
  });
})();

