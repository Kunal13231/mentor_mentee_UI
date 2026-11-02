import { DataTable } from "../components/dataTable.js";
import { endpoints } from "../core/endpoints.js";
import { escapeHtml, statusBadge } from "../core/ui.js";

const table = new DataTable({
  root: document.getElementById("students-table"),
  endpoint: endpoints.mentor.students,
  emptyText: "No students match your filters.",
  columns: [
    { key: "roll_no", label: "Roll No", sortable: true },
    { key: "full_name", label: "Name", sortable: true, render: (s) => `<a href="/mentor/student/${s.id}">${escapeHtml(s.full_name)}</a>` },
    { key: "division", label: "Division" },
    { key: "attendance", label: "Attendance", sortable: true, render: (s) => (s.attendance == null ? "—" : `${s.attendance}%`) },
    { key: "status", label: "Status", render: (s) => (s.is_low ? statusBadge("Needs attention", "warn") : statusBadge("Regular", "ok")) },
  ],
});

table.addFilter({
  name: "view",
  label: "All students",
  options: [["top5", "Top 5 attendance"], ["attention", "Students requiring attention"], ["below_threshold", "Below threshold"]],
});
