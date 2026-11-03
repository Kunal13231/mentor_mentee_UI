
import { session } from "../core/api.js";
import { renderSidebar, guardPage } from "../components/navigation.js";

const API_BASE = "";
const TOKEN_KEY = "ms.token";
const ROLE_KEY = "ms.role";

const token =
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY);

const $ = (id) => document.getElementById(id);

let attendanceRecords = [];
let subjectChart = null;
let displayedMonth = new Date();
let selectedDate = null;


// Escape HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}


// API GET request
async function apiGet(path) {
    const currentToken =
        session.token ||
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY);

    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${currentToken}`,
            Accept: "application/json"
        }
    });

    const payload = await response.json().catch(() => ({}));

    if (response.status === 401) {
        session.clear();
        window.location.replace("/login");
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok || payload.success === false) {
        throw new Error(
            payload.message || "Unable to load attendance data."
        );
    }

    return payload.data || {};
}


// Show errors
function showError(message) {
    if ($("attendance-history")) {
        $("attendance-history").innerHTML = `
            <tr>
                <td colspan="4" class="table-state">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;
    }

    if ($("calendar-selection")) {
        $("calendar-selection").textContent = message;
    }
}


// Render attendance statistics
function renderStats(summary) {
    const overall = Number(summary.overall ?? 0);

    $("att-overall").textContent = `${overall}%`;
    $("att-present").textContent = summary.present ?? 0;
    $("att-absent").textContent = summary.absent ?? 0;
    $("att-threshold").textContent =
        `${summary.threshold ?? 75}%`;

    $("att-progress").style.width =
        `${Math.max(0, Math.min(100, overall))}%`;
}


// Render subject chart
function renderSubjects(subjects = []) {
    const labels = subjects.map(
        item => item.subject || "Subject"
    );

    const values = subjects.map(
        item => Number(item.percentage ?? 0)
    );

    $("subject-list").innerHTML = subjects.length
        ? subjects.map(item => {
            const pct = Math.max(
                0,
                Math.min(100, Number(item.percentage ?? 0))
            );

            return `
                <div class="subject-row">
                    <span>${escapeHTML(item.subject)}</span>

                    <div class="subject-track">
                        <span style="width:${pct}%"></span>
                    </div>

                    <strong>${pct}%</strong>
                </div>
            `;
        }).join("")
        : `<div class="table-state">No subject data available.</div>`;

    if (subjectChart) {
        subjectChart.destroy();
        subjectChart = null;
    }

    if (window.Chart && labels.length) {
        subjectChart = new Chart(
            $("attendance-subject-chart"),
            {
                type: "bar",

                data: {
                    labels,

                    datasets: [{
                        data: values,

                        backgroundColor: [
                            "#347df3",
                            "#5b9bfa",
                            "#7caffb",
                            "#9ac4ff",
                            "#8a78e8"
                        ],

                        borderRadius: 8,
                        maxBarThickness: 34
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        },

                        tooltip: {
                            callbacks: {
                                label: ctx =>
                                    `${ctx.raw}% attendance`
                            }
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,

                            ticks: {
                                stepSize: 20,
                                callback: value => `${value}%`
                            },

                            grid: {
                                color: "rgba(130,145,175,.16)"
                            }
                        },

                        x: {
                            grid: {
                                display: false
                            },

                            ticks: {
                                color: "#7f8ba6",
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            }
        );
    }
}


// Date formatting
function dateKey(date) {
    const y = date.getFullYear();

    const m = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
        date.getDate()
    ).padStart(2, "0");

    return `${y}-${m}-${d}`;
}


// Render monthly calendar
function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    $("calendar-month").textContent =
        displayedMonth.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
        });

    const firstDay = new Date(
        year,
        month,
        1
    ).getDay();

    const days = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const recordMap = new Map(
        attendanceRecords.map(record => [
            record.date,
            record
        ])
    );

    const weekdays = [
        "Sun", "Mon", "Tue", "Wed",
        "Thu", "Fri", "Sat"
    ];

    let html = weekdays.map(day =>
        `<div class="calendar-weekday">${day}</div>`
    ).join("");

    for (let i = 0; i < firstDay; i++) {
        html += `
            <button
                class="calendar-day"
                disabled
                aria-hidden="true">
            </button>
        `;
    }

    for (let day = 1; day <= days; day++) {
        const date = new Date(year, month, day);
        const key = dateKey(date);
        const record = recordMap.get(key);

        const status =
            record?.status === "present"
                ? "is-present"
                : record?.status === "absent"
                    ? "is-absent"
                    : "";

        const selected =
            selectedDate === key
                ? "is-selected"
                : "";

        const today =
            key === dateKey(new Date())
                ? "is-today"
                : "";

        html += `
            <button
                type="button"
                class="calendar-day ${status} ${selected} ${today}"
                data-date="${key}"
                ${record ? "" : "disabled"}
                aria-label="${key}"
            >
                <span class="day-number">${day}</span>
                <span class="day-status"></span>
            </button>
        `;
    }

    $("attendance-calendar").innerHTML = html;

    $("attendance-calendar")
        .querySelectorAll("[data-date]")
        .forEach(button => {
            button.addEventListener("click", () => {
                selectedDate = button.dataset.date;

                const record = recordMap.get(selectedDate);

                if (!record) return;

                const formattedDate = new Date(
                    `${selectedDate}T00:00:00`
                ).toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });

                $("calendar-selection").textContent =
                    `${formattedDate} · ${record.subject} · ${record.status.toUpperCase()}`;

                renderCalendar();
            });
        });
}


// Render attendance history
function renderHistory() {
    const filter = $("history-filter").value;

    const filtered = attendanceRecords
        .filter(record =>
            filter === "all" ||
            record.status === filter
        )
        .sort((a, b) =>
            b.date.localeCompare(a.date)
        );

    if (!filtered.length) {
        $("attendance-history").innerHTML = `
            <tr>
                <td colspan="4" class="table-state">
                    No attendance records found.
                </td>
            </tr>
        `;
    } else {
        $("attendance-history").innerHTML =
            filtered.map(record => {
                const date = new Date(
                    `${record.date}T00:00:00`
                ).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });

                const present =
                    record.status === "present";

                return `
                    <tr>
                        <td>${date}</td>

                        <td>
                            ${escapeHTML(record.subject)}
                        </td>

                        <td>
                            ${escapeHTML(
                                record.session || "Regular lecture"
                            )}
                        </td>

                        <td>
                            <span class="status-pill ${present ? "present" : "absent"}">
                                <i class="fa-solid ${
                                    present
                                        ? "fa-circle-check"
                                        : "fa-circle-xmark"
                                }"></i>

                                ${present ? "Present" : "Absent"}
                            </span>
                        </td>
                    </tr>
                `;
            }).join("");
    }

    $("history-count").textContent =
        `Showing ${filtered.length} of ${attendanceRecords.length} records`;
}


// Page controls
function setupControls() {
    $("prev-month")?.addEventListener("click", () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() - 1,
            1
        );

        renderCalendar();
    });

    $("next-month")?.addEventListener("click", () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() + 1,
            1
        );

        renderCalendar();
    });

    $("history-filter")?.addEventListener(
        "change",
        renderHistory
    );

    $("theme-toggle")?.addEventListener("click", () => {
        const next =
            document.documentElement.dataset.theme === "dark"
                ? "light"
                : "dark";

        document.documentElement.dataset.theme = next;

        localStorage.setItem("ms.theme", next);

        const icon = $("theme-toggle").querySelector("i");

        if (icon) {
            icon.className =
                `fa-solid ${
                    next === "dark"
                        ? "fa-sun"
                        : "fa-moon"
                }`;
        }
    });
}


// Initialize attendance page
async function init() {
    if (!token || !session.token) {
        window.location.replace("/login");
        return;
    }

    guardPage("student");

    // Generate dynamic sidebar
    renderSidebar("student");

    // Setup attendance controls
    setupControls();

    try {
        const [summary, history] = await Promise.all([
            apiGet("/api/attendance/student/me/summary"),

            apiGet("/api/attendance/student/me/history")
        ]);

        renderStats(summary);

        renderSubjects(summary.subjects || []);

        attendanceRecords = Array.isArray(history.items)
            ? history.items
            : [];

        renderCalendar();

        renderHistory();

    } catch (error) {
        console.error("Attendance loading error:", error);

        showError(
            error.message ||
            "Unable to load attendance data."
        );
    }
}

init();
