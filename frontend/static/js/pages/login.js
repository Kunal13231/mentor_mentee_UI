import { api, session } from "../core/api.js";
import { endpoints } from "../core/endpoints.js";
import { setBusy } from "../core/ui.js";

const form = document.getElementById("login-form");
const alertBox = document.getElementById("login-error");
const password = document.getElementById("password");

if (session.token && session.role) window.location.replace(`/${session.role}/dashboard`);

document.getElementById("toggle-password").addEventListener("click", (e) => {
  const show = password.type === "password";
  password.type = show ? "text" : "password";
  e.currentTarget.setAttribute("aria-label", show ? "Hide password" : "Show password");
  e.currentTarget.firstElementChild.className = `fa-regular ${show ? "fa-eye-slash" : "fa-eye"}`;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertBox.classList.add("d-none");
  if (!form.checkValidity()) return form.classList.add("was-validated");

  const button = form.querySelector("button[type=submit]");
  setBusy(button, true, "Signing in");
  try {
    const data = await api.post(endpoints.login, {
      email: form.email.value, password: password.value,
    });
    session.save(data.access_token, data.role, form.remember.checked);
    window.location.assign(data.redirect);
  } catch (err) {
    alertBox.textContent = err.message;
    alertBox.classList.remove("d-none");
    setBusy(button, false);
  }
});
