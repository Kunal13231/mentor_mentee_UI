import { session } from "../core/api.js";

const NAV = {
  student: [
    ["Dashboard", "/student/dashboard", "fa-gauge"], ["My Attendance", "/student/attendance", "fa-calendar-check"],
    ["Instructions", "/student/instructions", "fa-bullhorn"], ["Tasks", "/student/tasks", "fa-list-check"],
    ["Notifications", "/student/notifications", "fa-bell"], ["Profile", "/student/profile", "fa-user"],
  ],
  mentor: [
    ["Dashboard", "/mentor/dashboard", "fa-gauge"], ["My Students", "/mentor/students", "fa-users"],
    ["Attendance", "/mentor/attendance", "fa-calendar-check"], ["Instructions", "/mentor/instructions", "fa-bullhorn"],
    ["Broadcast", "/mentor/broadcast", "fa-tower-broadcast"], ["Tasks", "/mentor/tasks", "fa-list-check"],
    ["Notifications", "/mentor/notifications", "fa-bell"], ["Reports", "/mentor/reports", "fa-file-lines"],
  ],
  staff: [
    ["Dashboard", "/staff/dashboard", "fa-gauge"], ["Attendance", "/staff/attendance", "fa-calendar-check"],
    ["My Tasks", "/staff/tasks", "fa-list-check"], ["Notifications", "/staff/notifications", "fa-bell"],
  ],
  hod: [
    ["Dashboard", "/hod/dashboard", "fa-gauge"], ["Students", "/hod/students", "fa-users"], ["Staff", "/hod/staff", "fa-user-tie"],
    ["Attendance", "/hod/attendance", "fa-calendar-check"], ["Tasks", "/hod/tasks", "fa-list-check"],
    ["Analytics", "/hod/analytics", "fa-chart-line"], ["Reports", "/hod/reports", "fa-file-lines"],
  ],
  admin: [
    ["Dashboard", "/admin/dashboard", "fa-gauge"], ["Users", "/admin/users", "fa-users-gear"], ["Students", "/admin/students", "fa-users"],
    ["Mentors", "/admin/mentors", "fa-user-group"], ["Staff", "/admin/staff", "fa-user-tie"],
    ["Devices", "/admin/devices", "fa-fingerprint"], ["System Settings", "/admin/settings", "fa-gear"], ["Audit Logs", "/admin/audit", "fa-clipboard-list"],
  ],
};

// Client-side guard is for UX only; every endpoint enforces roles on the server.
export function guardPage(requiredRole) {
  if (!session.token) return window.location.replace("/login");
  if (session.role !== requiredRole) window.location.replace(`/${session.role}/dashboard`);
}

export function renderSidebar(role) {
  const links = NAV[role].map(([label, href, icon]) => {
    const current = window.location.pathname === href ? ' aria-current="page"' : "";
    return `<a href="${href}"${current}><span class="nav-ico"><i class="fa-solid ${icon}" aria-hidden="true"></i></span><span class="nav-text">${label}</span></a>`;
  });
  document.getElementById("sidebar").innerHTML =
    `<div class="brand">
    <img
        src="/static/web_favicon.png"
        alt="Mentor Mentee Logo"
        class="brand-logo"
    >
    <span>Mentor Mentee<br>System</span>
</div>
<nav aria-label="Main navigation">${links.join("")}</nav>`;
  document.getElementById("sidebar-toggle")?.addEventListener("click", () =>
    document.getElementById("sidebar").classList.toggle("open"));
  // Keep the current item visible when the sidebar is shown as the floating bottom dock.
  const active = document.querySelector('#sidebar nav a[aria-current="page"]');
  if (active) active.parentElement.scrollLeft = active.offsetLeft - (active.parentElement.clientWidth - active.offsetWidth) / 2;
  document.getElementById("logout")?.addEventListener("click", () => {
    session.clear();
    window.location.assign("/login");
  });
}
