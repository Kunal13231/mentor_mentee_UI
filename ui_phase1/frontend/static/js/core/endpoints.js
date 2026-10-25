// Single source of truth for the REST contract the UI depends on.
export const endpoints = {
  login: "/api/auth/login",
  me: "/api/auth/me",
  notifications: "/api/notifications",
  notificationsReadAll: "/api/notifications/read-all",
  tasks: "/api/tasks",
  student: { attendanceSummary: "/api/attendance/student/me/summary" },
  mentor: { students: "/api/mentors/me/students" },
};
