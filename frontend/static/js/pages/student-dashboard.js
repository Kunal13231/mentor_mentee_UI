import { api } from "../core/api.js";
import { endpoints } from "../core/endpoints.js";
import { escapeHtml, formatDateTime, stateBox, toast } from "../core/ui.js";
import { attendanceBarChart } from "../components/charts.js";

const $ = (id) => document.getElementById(id);

function renderMetrics({ overall, present, absent, threshold }) {
  const low = overall != null && overall < threshold;
  $("metric-overall").textContent = overall == null ? "—" : `${overall}%`;
  $("metric-overall").classList.toggle("text-danger", low);
  $("metric-present").textContent = present;
  $("metric-absent").textContent = absent;
}

function renderList(el, items, empty, row) {
  el.innerHTML = items.length ? items.map(row).join("") : stateBox("fa-folder-open", empty);
}

async function init() {
  const [summary, notes, tasks] = await Promise.all([
    api.get(endpoints.student.attendanceSummary),
    api.get(endpoints.notifications, { per_page: 5 }),
    api.get(endpoints.tasks, { mine: 1, status: "pending", per_page: 5 }),
  ]);
  renderMetrics(summary);
  attendanceBarChart($("subject-chart"), summary.subjects, summary.threshold);
  renderList($("recent-notifications"), notes.items, "No notifications yet.", (n) =>
    `<div class="list-group-item ${n.is_read ? "" : "unread"}"><div class="fw-semibold">${escapeHtml(n.title)}</div>
     <div class="small text-muted">${escapeHtml(n.message)} · ${formatDateTime(n.created_at)}</div></div>`);
  renderList($("pending-tasks"), tasks.items, "No pending tasks.", (t) =>
    `<div class="list-group-item d-flex justify-content-between"><span>${escapeHtml(t.title)}</span>
     <span class="small text-muted">Due ${formatDateTime(t.due_at)}</span></div>`);
}

init().catch((err) => toast(err.message, "error"));
