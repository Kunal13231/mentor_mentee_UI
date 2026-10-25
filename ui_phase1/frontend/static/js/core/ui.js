const stack = () => {
  let el = document.querySelector(".toast-stack");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast-stack";
    el.setAttribute("aria-live", "polite");
    document.body.append(el);
  }
  return el;
};

export function toast(message, type = "info") {
  const item = document.createElement("div");
  item.className = `toast-item ${type}`;
  item.setAttribute("role", type === "error" ? "alert" : "status");
  item.textContent = message;
  stack().append(item);
  setTimeout(() => item.remove(), 4500);
}

export function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

export function setBusy(button, busy, label) {
  button.disabled = busy;
  if (busy) button.dataset.label = button.innerHTML;
  button.innerHTML = busy ? `<span class="spinner" aria-hidden="true"></span>${label}` : button.dataset.label;
}

export const stateBox = (icon, text) =>
  `<div class="state-box"><i class="fa-regular ${icon}" aria-hidden="true"></i>${escapeHtml(text)}</div>`;

export const loadingBox = () =>
  `<div class="state-box"><div class="spinner" role="status"></div><div style="margin-top:8px">Loading…</div></div>`;

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function statusBadge(label, tone) {
  return `<span class="pill pill-${tone}">${escapeHtml(label)}</span>`;
}
