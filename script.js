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

