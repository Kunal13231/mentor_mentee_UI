# Mentor_Mentee
# 🎓 Mentor Mentee Management System

A web-based **Mentor Mentee Management System** designed to simplify communication, student monitoring, attendance management, task tracking, and academic administration within a college.

The system provides role-based dashboards for Admin, HOD, Mentors, Staff, and Students, making academic management more organized and efficient.

## 🚀 Project Overview

The Mentor Mentee Management System helps colleges manage student-mentor interactions through a centralized web application.

It provides different dashboards and navigation options according to user roles, allowing users to access relevant information and perform their assigned activities.

## ✨ Key Features

### 👨‍💼 Admin Module
- Admin Dashboard
- User Management
- Student Management
- Mentor Management
- Staff Management
- Device Management
- System Settings
- Audit Logs

### 🎓 HOD Module
- HOD Dashboard
- Student Management
- Staff Management
- Attendance Monitoring
- Task Management
- Analytics
- Reports

### 👨‍🏫 Mentor Module
- Mentor Dashboard
- My Students
- Attendance Management
- Instructions
- Broadcast Messages
- Task Management
- Notifications
- Reports

### 👨‍💻 Staff Module
- Staff Dashboard
- Attendance
- My Tasks
- Notifications

### 👨‍🎓 Student Module
- Student Dashboard
- Overall Attendance Summary
- Subject-wise Attendance
- Pending Tasks
- Recent Notifications
- Student Profile

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | Web application framework and API |
| MySQL | Database management |
| HTML5 | Webpage structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Bootstrap | Responsive UI components |
| Chart.js | Dashboard charts |
| Font Awesome | Icons |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
mentor_mentee_UI/
│
├── app.py
├── requirements.txt
│
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   │   └── app.css
│   │   │
│   │   ├── js/
│   │   │   ├── components/
│   │   │   │   ├── charts.js
│   │   │   │   ├── dataTable.js
│   │   │   │   ├── navigation.js
│   │   │   │   └── theme.js
│   │   │   │
│   │   │   ├── core/
│   │   │   │   ├── api.js
│   │   │   │   ├── endpoints.js
│   │   │   │   └── ui.js
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── login.js
│   │   │       ├── mentor-students.js
│   │   │       └── student-dashboard.js
│   │   │
│   │   ├── web_favicon.png
│   │   └── 2.ico
│   │
│   └── templates/
│       ├── base.html
│       ├── login.html
│       ├── placeholder.html
│       ├── mentor/
│       │   └── students.html
│       └── student/
│           └── dashboard.html
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Kunal13231/mentor_mentee_UI.git
```

### 2. Open the Project Folder

```bash
cd mentor_mentee_UI
```

### 3. Create a Virtual Environment

```bash
python -m venv .venv
```

### 4. Activate Virtual Environment

For Windows PowerShell:

```powershell
.venv\Scripts\Activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Configure MySQL Database

Make sure MySQL Server is installed and running.

Configure the following environment variables according to your MySQL setup:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=campus_connect
MYSQL_PORT=3306
SESSION_SECRET=your_secret_key
```

**Note:** Replace the example values with your actual database credentials. Do not upload your `.env` file or database password to GitHub.

### 7. Run the Application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:8080
```

## 🔐 User Roles

The system supports the following user roles:

- Admin
- HOD
- Mentor
- Staff
- Student

Each role has its own dashboard and role-based navigation.

## 🎯 Project Objectives

- To simplify student and mentor management.
- To provide centralized academic information.
- To improve communication between mentors and students.
- To monitor student attendance.
- To manage academic tasks and notifications.
- To provide role-based access to different users.
- To make college administration more efficient.

## 🔮 Future Scope

- Fingerprint-based attendance integration using ESP32.
- Automated attendance recording.
- Email and SMS notifications.
- Advanced student performance analytics.
- Downloadable attendance and academic reports.
- Mobile-friendly application enhancements.

## 👨‍💻 Developed By

**Kunal Vitthal Shinde**

GitHub: https://github.com/Kunal13231

Project Repository: https://github.com/Kunal13231/mentor_mentee_UI

---

⭐ If you find this project useful, consider giving the repository a star!