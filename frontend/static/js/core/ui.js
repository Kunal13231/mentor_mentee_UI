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
  button.innerHTML = busy ? `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}` : button.dataset.label;
}

export const stateBox = (icon, text) =>
  `<div class="state-box"><i class="fa-regular ${icon}" aria-hidden="true"></i>${escapeHtml(text)}</div>`;

export const loadingBox = () =>
  `<div class="state-box"><div class="spinner-border spinner-border-sm" role="status"></div><div class="mt-2">Loading…</div></div>`;

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function statusBadge(label, tone) {
  return `<span class="badge-status badge-${tone}">${escapeHtml(label)}</span>`;
}
