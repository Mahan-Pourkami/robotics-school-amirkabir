document.getElementById('themeBtn').addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('ak-theme', document.body.classList.contains('light') ? 'light' : 'dark')
});
if (localStorage.getItem('ak-theme') === 'light') document.body.classList.add('light');

const menuToggle = document.getElementById("menuToggle");
const mainMenu = document.getElementById("mainMenu");

menuToggle.addEventListener("click", () => {
    const isOpen = mainMenu.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", isOpen);
});

mainMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        mainMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});