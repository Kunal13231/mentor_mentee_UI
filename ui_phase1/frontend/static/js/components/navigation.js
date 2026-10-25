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
    return `<a href="${href}"${current}><i class="fa-solid ${icon}" aria-hidden="true"></i>${label}</a>`;
  });
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = `
    <div class="brand"><span class="brand-mark" aria-hidden="true">MM</span><span>Mentor Mentee<br>System</span></div>
    <nav class="nav" aria-label="Main navigation">${links.join("")}</nav>
    <div class="sidebar-foot">
      <span class="avatar" aria-hidden="true">${role[0].toUpperCase()}</span>
      <div style="flex:1"><div style="font-weight:600;text-transform:capitalize">${role}</div></div>
      <button class="btn btn-tonal btn-sm btn-icon" id="logout" aria-label="Sign out"><i class="fa-solid fa-right-from-bracket"></i></button>
    </div>`;

  document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const toggle = () => sidebar.classList.toggle("open");
  document.getElementById("sidebar-toggle").addEventListener("click", toggle);
  document.getElementById("scrim").addEventListener("click", toggle);
  document.getElementById("logout").addEventListener("click", () => {
    session.clear();
    window.location.assign("/login");
  });
}
