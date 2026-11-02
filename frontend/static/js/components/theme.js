const KEY = "ms.theme";

export const theme = {
  get: () => document.documentElement.dataset.theme || "light",
  set(value) {
    document.documentElement.dataset.theme = value;
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new CustomEvent("themechange", { detail: value }));
  },
  toggle() { this.set(this.get() === "dark" ? "light" : "dark"); },
};

export function initThemeToggle(button) {
  if (!button) return;
  const sync = () => {
    const dark = theme.get() === "dark";
    button.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    button.title = button.getAttribute("aria-label");
  };
  button.addEventListener("click", () => { theme.toggle(); sync(); });
  sync();
}
