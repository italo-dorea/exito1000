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

  // 2) Defina as listas de imagens para cada slot (pode ser diferente por slot)
  const imagesBySlot = [
    ["./assets/alunos/aluno1.webp", "./assets/alunos/aluno5.webp", "./assets/alunos/aluno9.webp"],
    ["./assets/alunos/aluno2.webp", "./assets/alunos/aluno6.webp", "./assets/alunos/aluno10.webp"],
    ["./assets/alunos/aluno3.webp", "./assets/alunos/aluno7.webp", "./assets/alunos/aluno11.webp"],
    ["./assets/alunos/aluno4.webp", "./assets/alunos/aluno8.webp", "./assets/alunos/aluno12.webp"],
  ];

  const intervalMs = 3500;   // tempo entre trocas
  const fadeMs = 600;        // deve bater com o transition do CSS (.6s)

  // opcional: pré-carregar pra evitar "piscada"
  imagesBySlot.flat().forEach(src => { const i = new Image(); i.src = src; });

  // índice atual por slot
  const idx = new Array(slots.length).fill(0);

  function swapImage(slotIndex) {
    const img = slots[slotIndex];
    const list = imagesBySlot[slotIndex] || [];
    if (!img || list.length < 2) return;

    idx[slotIndex] = (idx[slotIndex] + 1) % list.length;
    const nextSrc = list[idx[slotIndex]];

    // fade-out
    img.classList.add("is-fading");

    // troca no meio do fade, depois volta (fade-in)
    setTimeout(() => {
      img.src = nextSrc;
      img.classList.remove("is-fading");
    }, fadeMs);
  }

  // troca todos ao mesmo tempo
  setInterval(() => {
    for (let i = 0; i < slots.length; i++) swapImage(i);
  }, intervalMs);

