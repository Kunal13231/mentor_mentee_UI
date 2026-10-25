import { api } from "../core/api.js";
import { endpoints } from "../core/endpoints.js";
import { escapeHtml, formatDateTime, stateBox, toast } from "../core/ui.js";
import { attendanceBarChart } from "../components/charts.js";

const $ = (id) => document.getElementById(id);

function renderAttendance({ overall, present, absent, threshold }) {
  const low = overall != null && overall < threshold;
  const ring = $("attendance-ring");
  ring.style.setProperty("--pct", overall ?? 0);
  ring.style.setProperty("--ring", low ? "var(--bad)" : "var(--primary)");
  $("metric-overall").textContent = overall == null ? "—" : `${overall}%`;
  $("metric-present").textContent = present;
  $("metric-absent").textContent = absent;
  $("attendance-note").textContent = overall == null
    ? "No classes have been conducted yet."
    : low ? `Below the ${threshold}% requirement. Please attend regularly.` : `You meet the ${threshold}% requirement.`;
}

const row = (icon, title, detail, unread = false) => `
  <div class="list-row ${unread ? "unread" : ""}">
    <span class="tile"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
    <div class="body"><div class="title">${escapeHtml(title)}</div><div class="muted small">${escapeHtml(detail)}</div></div>
  </div>`;

function renderList(el, items, emptyText, render) {
  el.innerHTML = items.length ? items.map(render).join("") : stateBox("fa-folder-open", emptyText);
}

async function init() {
  const [summary, notes, tasks] = await Promise.all([
    api.get(endpoints.student.attendanceSummary),
    api.get(endpoints.notifications, { per_page: 5 }),
    api.get(endpoints.tasks, { mine: 1, status: "pending", per_page: 5 }),
  ]);
  renderAttendance(summary);
  attendanceBarChart($("subject-chart"), summary.subjects, summary.threshold);
  renderList($("recent-notifications"), notes.items, "No notifications yet.", (n) =>
    row("fa-bell", n.title, `${n.message} · ${formatDateTime(n.created_at)}`, !n.is_read));
  renderList($("pending-tasks"), tasks.items, "No pending tasks.", (t) =>
    row("fa-list-check", t.title, `Due ${formatDateTime(t.due_at)}`));
}

init().catch((err) => toast(err.message, "error"));
