const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("tia_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      ),
  },
  admin: {
    getAllCourses: () =>
      request<{ id: number; name: string; description: string; status: string }[]>(
        "/api/admin/courses"
      ),
    getAllUsers: () =>
      request<{ id: string; name: string; email: string; role: string }[]>(
        "/api/admin/users"
      ),
    createCourse: (data: { name: string; description: string; status?: string }) =>
      request<{ id: number; name: string; description: string; status: string }>(
        "/api/admin/courses",
        { method: "POST", body: JSON.stringify(data) }
      ),
    createUser: (data: { name: string; email: string; password: string; role: string }) =>
      request<{ id: string; name: string; email: string; role: string }>(
        "/api/admin/users",
        { method: "POST", body: JSON.stringify(data) }
      ),
    grantAccess: (data: { userId: string; courseId: number }) =>
      request<{ granted: boolean }>(
        "/api/admin/grant-access",
        { method: "POST", body: JSON.stringify(data) }
      ),
  },
  student: {
    getMyCourses: () =>
      request<{ id: number; name: string; description: string; status: string }[]>(
        "/api/student/my-courses"
      ),
    getCourseLessons: (courseId: number) =>
      request<{ id: number; title: string; videoUrl: string; orderIndex: number }[]>(
        `/api/student/course/${courseId}/lessons`
      ),
  },
};
