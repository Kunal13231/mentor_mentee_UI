
from flask import Flask, jsonify, redirect, render_template, request
from jinja2 import TemplateNotFound
from frontend.src.db import get_connection,init_db


ROLES = ("student", "mentor", "staff", "hod", "admin")
LOW_ATTENDANCE_THRESHOLD = 75

# Pages that exist as real templates: (role, page) -> template
BUILT_PAGES = {
    ("student", "dashboard"): "student/dashboard.html",
    ("mentor", "students"): "mentor/students.html",
}

app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")


# ---------------------------------------------------------------- pages
@app.get("/")
def index():
    return redirect("/login")


@app.get("/login")
def login_page():
    return render_template("login.html")


@app.get("/<role>/<path:page>")
def role_page(role, page):
    if role not in ROLES:
        return render_template("placeholder.html", role="student", title="Page not found"), 404
    template = BUILT_PAGES.get((role, page), "placeholder.html")
    title = page.split("/")[0].replace("-", " ").title()
    try:
        return render_template(template, role=role, title=title)
    except TemplateNotFound:
        return render_template("placeholder.html", role=role, title=title)


# ---------------------------------------------------------- API (stubs)
DEMO_USERS = {
    "student@college.edu": ("student123", "student"),
    "mentor@college.edu": ("mentor123", "mentor"),
    "staff@college.edu": ("staff123", "staff"),
    "hod@college.edu": ("hod123", "hod"),
    "admin@college.edu": ("admin123", "admin"),
}

STUDENTS = [
    (1, "CS21001", "Aarav Deshmukh", "A", 88), (2, "CS21002", "Sneha Kulkarni", "A", 73),
    (3, "CS21003", "Rahul Patil", "A", 71), (4, "CS21004", "Priya Joshi", "A", 94),
    (5, "CS21005", "Amit Shinde", "B", 68), (6, "CS21006", "Neha Pawar", "B", 91),
    (7, "CS21007", "Rohan Jadhav", "B", 82), (8, "CS21008", "Kavya Nair", "B", 96),
    (9, "CS21009", "Siddharth More", "A", 79), (10, "CS21010", "Ishita Gaikwad", "B", 85),
]


def _ok(data=None, message="OK"):
    return jsonify({"success": True, "message": message, "data": data or {}})


def _fail(message, code, status):
    return jsonify({"success": False, "message": message, "error_code": code}), status


@app.before_request
def require_token_for_api():
    if request.path.startswith("/api/") and request.path != "/api/auth/login":
        if not request.headers.get("Authorization", "").startswith("Bearer "):
            return _fail("Authentication required", "UNAUTHENTICATED", 401)


@app.post("/api/auth/login")
def api_login():
    payload = request.get_json(silent=True) or {}
    record = DEMO_USERS.get(str(payload.get("email", "")).strip().lower())
    if not record or record[0] != payload.get("password"):
        return _fail("Invalid email or password", "INVALID_CREDENTIALS", 401)
    role = record[1]
    return _ok({"access_token": f"dev-token-{role}", "role": role, "redirect": f"/{role}/dashboard"}, "Login successful")


@app.get("/api/attendance/student/me/summary")
def api_attendance_summary():
    subjects = [("DBMS", 88), ("AI", 79), ("CN", 91), ("SE", 76)]
    return _ok({
        "overall": 82, "present": 82, "absent": 18, "threshold": LOW_ATTENDANCE_THRESHOLD,
        "subjects": [{"subject": name, "percentage": pct} for name, pct in subjects],
    })


@app.get("/api/notifications")
def api_notifications():
    items = [
        {"title": "Assignment submission", "message": "Submit the DBMS assignment by 5:00 PM.", "is_read": False, "created_at": "2026-10-05T04:30:00+00:00"},
        {"title": "Attendance update", "message": "Your SE attendance is close to the threshold.", "is_read": True, "created_at": "2026-10-03T09:10:00+00:00"},
    ]
    return _ok({"items": items, "total": len(items)})


@app.get("/api/tasks")
def api_tasks():
    items = [{"title": "Mini project abstract", "due_at": "2026-10-08T12:00:00+00:00"}]
    return _ok({"items": items, "total": len(items)})


@app.get("/api/mentors/me/students")
def api_mentor_students():
    args = request.args
    rows = [
        {"id": i, "roll_no": roll, "full_name": name, "division": div, "attendance": pct,
         "is_low": pct < LOW_ATTENDANCE_THRESHOLD}
        for i, roll, name, div, pct in STUDENTS
    ]
    by_attendance = sorted(rows, key=lambda r: r["attendance"])
    view = args.get("view", "")
    if view == "top5":
        rows = by_attendance[::-1][:5]
    elif view == "attention":
        rows = by_attendance[:5]
    elif view == "below_threshold":
        rows = [r for r in rows if r["is_low"]]

    query = args.get("q", "").lower()
    if query:
        rows = [r for r in rows if query in r["full_name"].lower() or query in r["roll_no"].lower()]
    if args.get("sort") in ("roll_no", "full_name", "attendance"):
        rows = sorted(rows, key=lambda r: r[args["sort"]], reverse=args.get("order") == "desc")

    per_page = max(1, int(args.get("per_page", 10)))
    start = (max(1, int(args.get("page", 1))) - 1) * per_page
    return _ok({"items": rows[start:start + per_page], "total": len(rows)})


   
# ======================================
# Start Server 
# ======================================
if __name__ == "__main__":
    app.run(debug=True)      #Run the Application on Local Server
    
    