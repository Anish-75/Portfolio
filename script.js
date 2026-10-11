"use strict";

const root = document.documentElement;
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("#nav-menu");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const themeToggle = document.querySelector(".theme-toggle");
const siteHeader = document.querySelector(".site-header");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function setTheme(theme, persist = false) {
    root.dataset.theme = theme;
    const isLight = theme === "light";
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
    themeColorMeta.setAttribute("content", isLight ? "#f8faff" : "#080808");

    if (persist) {
        try {
            localStorage.setItem("portfolio-theme", theme);
        } catch (error) {
            console.warn("Unable to save the selected theme in localStorage.", error);
        }
    }
}

function getSavedTheme() {
    try {
        return localStorage.getItem("portfolio-theme");
    } catch (error) {
        console.warn("Unable to read the saved theme from localStorage.", error);
        return null;
    }
}

function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navMenu.classList.remove("is-open");
}

const savedTheme = getSavedTheme();
if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
} else {
    setTheme("dark");
}

themeToggle.addEventListener("click", () => {
    const currentTheme = root.dataset.theme || "dark";
    setTheme(currentTheme === "light" ? "dark" : "light", true);
});

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
    navMenu.classList.toggle("is-open", !isExpanded);
});

navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});

const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter((section) => section instanceof HTMLElement);

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            navLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${entry.target.id}`;
                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
                link.classList.toggle("is-active", isActive);
            });
        });
    }, {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
    });

    sections.forEach((section) => sectionObserver.observe(section));

    const revealElements = document.querySelectorAll(".reveal");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionPreference.matches) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    entry.target.classList.remove("is-pending");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });

        revealElements.forEach((element) => {
            element.classList.add("is-pending");

            element.querySelectorAll(".timeline-entry, .project-card, .skill-list, .compact-card")
                .forEach((card, index) => {
                    card.style.setProperty("--reveal-delay", `${Math.min(index * 90, 360)}ms`);
                });

            revealObserver.observe(element);
        });
    }
}

function updateHeaderOnScroll() {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
}

updateHeaderOnScroll();
window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });

document.querySelector("#current-year").textContent = String(new Date().getFullYear());