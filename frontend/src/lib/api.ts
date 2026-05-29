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
    updateProfile: (data: { name?: string; password?: string }) =>
      request<{ id: string; name: string; email: string; role: string }>(
        "/api/auth/profile",
        { method: "PUT", body: JSON.stringify(data) }
      ),
    forgotPassword: (email: string) =>
      request<{ sent: boolean }>(
        "/api/auth/forgot-password",
        { method: "POST", body: JSON.stringify({ email }) }
      ),
    resetPassword: (token: string, password: string) =>
      request<{ reset: boolean }>(
        "/api/auth/reset-password",
        { method: "POST", body: JSON.stringify({ token, password }) }
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
    updateCourse: (courseId: number, data: { name?: string; description?: string; status?: string }) =>
      request<{ id: number; name: string; description: string; status: string }>(
        `/api/admin/courses/${courseId}`,
        { method: "PUT", body: JSON.stringify(data) }
      ),
    deleteCourse: (courseId: number) =>
      request<{ id: number; name: string; description: string; status: string }>(
        `/api/admin/courses/${courseId}`,
        { method: "DELETE" }
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
    revokeAccess: (data: { userId: string; courseId: number }) =>
      request<{ revoked: boolean }>(
        "/api/admin/revoke-access",
        { method: "POST", body: JSON.stringify(data) }
      ),
    getStudentAccess: (userId: string) =>
      request<{ courseId: number; courseName: string }[]>(
        `/api/admin/users/${userId}/access`
      ),
    getLessonsByCourse: (courseId: number) =>
      request<{ id: number; courseId: number; title: string; videoUrl: string; orderIndex: number }[]>(
        `/api/admin/courses/${courseId}/lessons`
      ),
    createLesson: (courseId: number, data: { title: string; videoUrl: string; orderIndex: number }) =>
      request<{ id: number; courseId: number; title: string; videoUrl: string; orderIndex: number }>(
        `/api/admin/courses/${courseId}/lessons`,
        { method: "POST", body: JSON.stringify(data) }
      ),
    updateLesson: (lessonId: number, data: { title?: string; videoUrl?: string; orderIndex?: number }) =>
      request<{ id: number; title: string; videoUrl: string; orderIndex: number }>(
        `/api/admin/lessons/${lessonId}`,
        { method: "PUT", body: JSON.stringify(data) }
      ),
    deleteLesson: (lessonId: number) =>
      request<{ id: number }>(
        `/api/admin/lessons/${lessonId}`,
        { method: "DELETE" }
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
    getCourse: (courseId: number) =>
      request<{ id: number; name: string; description: string; status: string }>(
        `/api/student/courses/${courseId}`
      ),
    getCourseProgress: (courseId: number) =>
      request<{ courseId: number; total: number; completed: number; percent: number }>(
        `/api/student/course/${courseId}/progress`
      ),
    markLessonComplete: (courseId: number, lessonId: number) =>
      request<{ lessonId: number; completed: boolean }>(
        `/api/student/course/${courseId}/complete-lesson`,
        { method: "POST", body: JSON.stringify({ lessonId }) }
      ),
    getMyProgress: () =>
      request<{ lessonId: number; completedAt: string }[]>(
        "/api/student/progress"
      ),
  },
};
