
// ================================================
// MENTOR MENTEE - STUDENT DASHBOARD
// Independent JavaScript
// ================================================


// ================================================
// SESSION MANAGEMENT
// ================================================

const TOKEN_KEY = "ms.token";
const ROLE_KEY = "ms.role";

const session = {

    get token() {
        return (
            localStorage.getItem(TOKEN_KEY) ||
            sessionStorage.getItem(TOKEN_KEY)
        );
    },

    get role() {
        return (
            localStorage.getItem(ROLE_KEY) ||
            sessionStorage.getItem(ROLE_KEY)
        );
    },

    clear() {
        [localStorage, sessionStorage].forEach(store => {
            store.removeItem(TOKEN_KEY);
            store.removeItem(ROLE_KEY);
        });
    }

};


// ================================================
// AUTHENTICATION GUARD
// ================================================

if (!session.token) {

    window.location.replace("/login");

} else if (session.role !== "student") {

    if (session.role) {
        window.location.replace(`/${session.role}/dashboard`);
    } else {
        session.clear();
        window.location.replace("/login");
    }

}


// ================================================
// API ENDPOINTS
// Same endpoints as original project
// ================================================

const endpoints = {

    notifications: "/api/notifications",

    tasks: "/api/tasks",

    student: {
        attendanceSummary: "/api/attendance/student/me/summary"
    }

};


// ================================================
// API ERROR CLASS
// ================================================

class ApiError extends Error {

    constructor(message, code, status) {

        super(message);

        this.name = "ApiError";
        this.code = code;
        this.status = status;

    }

}


// ================================================
// API REQUEST HANDLER
// ================================================

async function request(method, url, { params, body } = {}) {

    const query = params
        ? "?" + new URLSearchParams(
            Object.entries(params).filter(
                ([, value]) => value !== "" && value != null
            )
        )
        : "";

    const headers = {
        Accept: "application/json"
    };

    if (body) {
        headers["Content-Type"] = "application/json";
    }

    if (session.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }

    let response;

    try {

        response = await fetch(url + query, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

    } catch (error) {

        throw new ApiError(
            "Unable to reach the server. Check your connection.",
            "NETWORK_ERROR",
            0
        );

    }

    const payload = await response.json().catch(() => null);


    // Authentication failure

    if (
        response.status === 401 &&
        payload?.error_code === "UNAUTHENTICATED"
    ) {

        session.clear();

        window.location.assign("/login");

        throw new ApiError(
            "Authentication required.",
            "UNAUTHENTICATED",
            401
        );

    }


    // API error handling

    if (!payload || !payload.success) {

        throw new ApiError(
            payload?.message ||
            "Something went wrong. Please try again.",

            payload?.error_code,

            response.status
        );

    }

    return payload.data;

}


// ================================================
// API METHODS
// ================================================

const api = {

    get: (url, params) =>
        request("GET", url, { params }),

    post: (url, body) =>
        request("POST", url, { body }),

    patch: (url, body) =>
        request("PATCH", url, { body }),

    del: (url) =>
        request("DELETE", url)

};


// ================================================
// DOM HELPER
// ================================================

const $ = id => document.getElementById(id);


// ================================================
// HTML ESCAPING
// ================================================

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


// ================================================
// DATE FORMATTER
// ================================================

function formatDateTime(iso) {

    return iso
        ? new Date(iso).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        })
        : "—";

}


// ================================================
// TOAST NOTIFICATIONS
// ================================================

function toast(message, type = "info") {

    let container = document.querySelector(".toast-stack");

    if (!container) {

        container = document.createElement("div");

        container.className = "toast-stack";

        container.setAttribute("aria-live", "polite");

        document.body.append(container);

    }

    const item = document.createElement("div");

    item.className = `toast-item ${type}`;

    item.setAttribute(
        "role",
        type === "error" ? "alert" : "status"
    );

    item.textContent = message;

    container.append(item);

    setTimeout(() => {
        item.remove();
    }, 4500);

}


// ================================================
// EMPTY STATE
// ================================================

function stateBox(icon, message) {

    return `
        <div class="state-box">
            <i class="fa-regular ${icon}" aria-hidden="true"></i>
            ${escapeHtml(message)}
        </div>
    `;

}


// ================================================
// LOADING STATE
// ================================================

function loadingBox() {

    return `
        <div class="state-box">
            <div class="loading-spinner"></div>
            <span>Loading...</span>
        </div>
    `;

}


// ================================================
// METRICS RENDERING
// ================================================

function renderMetrics({
    overall,
    present,
    absent,
    threshold
}) {

    const overallElement = $("metric-overall");

    const presentElement = $("metric-present");

    const absentElement = $("metric-absent");


    const low =
        overall != null && overall < threshold;


    overallElement.textContent =
        overall == null ? "—" : `${overall}%`;


    overallElement.classList.toggle(
        "text-danger",
        low
    );


    presentElement.textContent = present;

    absentElement.textContent = absent;

}


// ================================================
// LIST RENDERING
// ================================================

function renderList(element, items, emptyMessage, rowRenderer) {

    element.innerHTML = items.length
        ? items.map(rowRenderer).join("")
        : stateBox("fa-folder-open", emptyMessage);

}


// ================================================
// CHART COLORS
// ================================================

function getCSSVariable(name) {

    return getComputedStyle(
        document.documentElement
    ).getPropertyValue(name).trim();

}


function getChartPalette() {

    return {

        primary: getCSSVariable("--primary"),

        primary2: getCSSVariable("--primary-dark"),

        bad: getCSSVariable("--red"),

        grid: getCSSVariable("--border"),

        text: getCSSVariable("--muted")

    };

}


// ================================================
// CHART GRADIENT
// ================================================

function barFill(color, color2) {

    return context => {

        const { chart } = context;

        if (!chart.chartArea) {
            return color;
        }

        const { top, bottom } = chart.chartArea;

        const gradient = chart.ctx.createLinearGradient(
            0,
            top,
            0,
            bottom
        );

        gradient.addColorStop(0, color2);

        gradient.addColorStop(1, color);

        return gradient;

    };

}


// ================================================
// ATTENDANCE BAR CHART
// ================================================

let attendanceChart = null;


function attendanceBarChart(canvas, items, threshold) {

    if (typeof Chart === "undefined") {

        throw new Error("Chart.js library could not be loaded.");

    }

    if (attendanceChart) {
        attendanceChart.destroy();
    }

    Chart.defaults.font.family =
        getComputedStyle(document.body).fontFamily;

    const palette = getChartPalette();


    attendanceChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: items.map(item => item.subject),

            datasets: [{

                data: items.map(item => item.percentage),

                backgroundColor: context => {

                    const item = items[context.dataIndex];

                    const current = getChartPalette();

                    return item.percentage < threshold
                        ? barFill(current.bad, current.bad)(context)
                        : barFill(
                            current.primary,
                            current.primary2
                        )(context);

                },

                borderRadius: 14,

                borderSkipped: false,

                maxBarThickness: 40

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

                    cornerRadius: 12,

                    padding: 10,

                    callbacks: {

                        label: context =>
                            `${context.parsed.y}%`

                    }

                }

            },

            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    border: {
                        display: false
                    },

                    ticks: {
                        color: palette.text
                    }

                },

                y: {

                    min: 0,

                    max: 100,

                    grid: {
                        color: palette.grid
                    },

                    border: {
                        display: false
                    },

                    ticks: {

                        color: palette.text,

                        callback: value => `${value}%`

                    }

                }

            }

        }

    });

    return attendanceChart;

}


// ================================================
// THEME MANAGEMENT
// ================================================

const themeButton = $("theme-toggle");


function currentTheme() {

    return document.documentElement.dataset.theme || "light";

}


function setTheme(value) {

    document.documentElement.dataset.theme = value;

    localStorage.setItem("ms.theme", value);

    window.dispatchEvent(
        new CustomEvent("themechange", {
            detail: value
        })
    );

}


function syncThemeIcon() {

    const dark = currentTheme() === "dark";

    themeButton.innerHTML = dark
        ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';

    themeButton.setAttribute(
        "aria-label",
        dark ? "Switch to light theme" : "Switch to dark theme"
    );

    themeButton.title = themeButton.getAttribute("aria-label");

}


themeButton.addEventListener("click", () => {

    const next =
        currentTheme() === "dark" ? "light" : "dark";

    setTheme(next);

    syncThemeIcon();

    if (attendanceChart) {

        const palette = getChartPalette();

        attendanceChart.options.scales.x.ticks.color =
            palette.text;

        attendanceChart.options.scales.y.ticks.color =
            palette.text;

        attendanceChart.options.scales.y.grid.color =
            palette.grid;

        attendanceChart.update();

    }

});


syncThemeIcon();


// ================================================
// MOBILE SIDEBAR
// ================================================

const sidebar = $("sidebar");

const sidebarToggle = $("sidebar-toggle");


sidebarToggle.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});


document.addEventListener("click", event => {

    if (
        window.innerWidth <= 850 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !sidebarToggle.contains(event.target)
    ) {

        sidebar.classList.remove("open");

    }

});


// ================================================
// LOGOUT
// ================================================

$("logout").addEventListener("click", () => {

    session.clear();

    window.location.assign("/login");

});


// ================================================
// STUDENT DASHBOARD INITIALIZATION
// ================================================

async function init() {

    try {

        // Load all three API responses together

        const [
            summary,
            notes,
            tasks
        ] = await Promise.all([

            api.get(
                endpoints.student.attendanceSummary
            ),

            api.get(
                endpoints.notifications,
                { per_page: 5 }
            ),

            api.get(
                endpoints.tasks,
                {
                    mine: 1,
                    status: "pending",
                    per_page: 5
                }
            )

        ]);


        // Render attendance metrics

        renderMetrics(summary);


        // Render subject attendance chart

        attendanceBarChart(
            $("subject-chart"),
            summary.subjects,
            summary.threshold
        );


        // Render recent notifications

        renderList(
            $("recent-notifications"),
            notes.items,
            "No notifications yet.",
            n => `
                <div class="list-group-item ${n.is_read ? "" : "unread"}">

                    <div class="fw-semibold">
                        ${escapeHtml(n.title)}
                    </div>

                    <div class="small text-muted">
                        ${escapeHtml(n.message)}
                        · ${formatDateTime(n.created_at)}
                    </div>

                </div>
            `
        );


        // Render pending tasks

        renderList(
            $("pending-tasks"),
            tasks.items,
            "No pending tasks.",
            t => `
                <div class="list-group-item d-flex justify-content-between align-items-center gap-3">

                    <span class="fw-semibold">
                        ${escapeHtml(t.title)}
                    </span>

                    <span class="small text-muted text-nowrap">
                        Due ${formatDateTime(t.due_at)}
                    </span>

                </div>
            `
        );

    } catch (error) {

        console.error(
            "Student Dashboard Error:",
            error
        );

        toast(error.message, "error");

        if (error.code !== "UNAUTHENTICATED") {

            $("pending-tasks").innerHTML =
                stateBox(
                    "fa-circle-exclamation",
                    "Unable to load pending tasks."
                );

            $("recent-notifications").innerHTML =
                stateBox(
                    "fa-circle-exclamation",
                    "Unable to load notifications."
                );

        }

    }

}


// ================================================
// START DASHBOARD
// ================================================

if (
    session.token &&
    session.role === "student"
) {

    init();

}
