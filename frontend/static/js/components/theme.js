
const KEY = "ms.theme";

// Theme management
export const theme = {
    get() {
        return document.documentElement.dataset.theme || "light";
    },

    set(value) {
        document.documentElement.dataset.theme = value;
        localStorage.setItem(KEY, value);

        window.dispatchEvent(
            new CustomEvent("themechange", {
                detail: value
            })
        );
    },

    toggle() {
        this.set(this.get() === "dark" ? "light" : "dark");
    },

    init() {
        const savedTheme = localStorage.getItem(KEY) || "light";
        document.documentElement.dataset.theme = savedTheme;
    }
};

// Initialize theme button
export function initThemeToggle(button) {
    if (!button || button.dataset.themeInitialized === "true") return;

    button.dataset.themeInitialized = "true";

    const syncIcon = () => {
        const dark = theme.get() === "dark";

        button.innerHTML = dark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        button.setAttribute(
            "aria-label",
            dark ? "Switch to light theme" : "Switch to dark theme"
        );

        button.title = button.getAttribute("aria-label");
    };

    button.addEventListener("click", () => {
        theme.toggle();
        syncIcon();
    });

    window.addEventListener("themechange", syncIcon);

    syncIcon();
}

// Apply saved theme
theme.init();

// Automatically initialize the button on every page
function initializeTheme() {
    initThemeToggle(document.getElementById("theme-toggle"));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTheme);
} else {
    initializeTheme();
}
