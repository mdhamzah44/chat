const launchDate = new Date("January 26, 2026 06:15:00").getTime();

const countdownPage = document.getElementById("countdown-page");
const introPage = document.getElementById("intro-page");
const nav = document.getElementById("navigation");

const pages = [
    introPage,
    document.getElementById("page-1"),
    document.getElementById("page-2"),
    document.getElementById("page-3"),
    document.getElementById("page-4"),
    document.getElementById("page-5"),
    document.getElementById("page-6"),
    document.getElementById("page-7"),
    document.getElementById("page-8"),
    document.getElementById("page-9"),
    document.getElementById("page-10")
];

let currentPage = 0;

// COUNTDOWN
function updateCountdown() {
    const now = new Date().getTime();
    const distance = launchDate - now;

    if (distance <= 0) {
        clearInterval(timer);
        countdownPage.classList.add("hidden");
        introPage.classList.remove("hidden");
        nav.classList.remove("hidden");
        return;
    }

    document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
    document.getElementById("hours").innerText = Math.floor((distance / (1000 * 60 * 60)) % 24);
    document.getElementById("minutes").innerText = Math.floor((distance / (1000 * 60)) % 60);
    document.getElementById("seconds").innerText = Math.floor((distance / 1000) % 60);
}

const timer = setInterval(updateCountdown, 1000);
updateCountdown();

// PAGE NAVIGATION
function showPage(index) {
    pages.forEach(p => p.classList.add("hidden"));
    pages[index].classList.remove("hidden");
}

function nextPage() {
    if (currentPage < pages.length - 1) {
        currentPage++;
        showPage(currentPage);
    }
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        showPage(currentPage);
    }
}
