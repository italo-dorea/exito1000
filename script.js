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
