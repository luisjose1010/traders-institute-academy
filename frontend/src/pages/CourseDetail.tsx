import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { api } from "@/lib/api";
import { ArrowLeft, Clock, Play, BookOpen, Lock, CheckCircle2 } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

interface Course { id: number; name: string; description: string; status: string; }
interface Lesson { id: number; title: string; videoUrl: string; orderIndex: number; }

export default function CourseDetail() {
  const [, params] = useRoute("/dashboard/course/:id");
  const [, navigate] = useLocation();
  const courseId = params?.id ? parseInt(params.id) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) { navigate("/dashboard"); return; }
    setLoading(true);
    Promise.all([api.student.getCourse(courseId), api.student.getCourseLessons(courseId)])
      .then(([c, l]) => { setCourse(c); setLessons(l); if (l.length > 0) setActiveLesson(l[0]); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  const markedComplete = new Set<number>();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555" }}>Loading course...</p>
    </div>
  );

  if (error || !course) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <p style={{ color: "#e74c3c" }}>{error || "Course not found"}</p>
      <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#888", cursor: "pointer" }}>Back to Dashboard</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <header style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 1.5rem", background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 20, gap: 12 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><ArrowLeft size={18} /> <span style={{ fontSize: "0.85rem" }}>Back</span></button>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{course.name}</span>
      </header>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }} className="lg:flex-row">
        <div style={{ flex: 1, padding: "1.5rem 0" }}>
          {activeLesson ? (
            <>
              <VideoPlayer url={activeLesson.videoUrl} title={activeLesson.title} />
              <div style={{ padding: "1.25rem 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "#C9A84C" }}>LESSON {activeLesson.orderIndex}</span>
                </div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.5rem", fontFamily: "Poppins, sans-serif" }}>{activeLesson.title}</h2>
                <p style={{ color: "#666", fontSize: "0.85rem" }}>{course.description}</p>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center" }}>
              <BookOpen size={40} color="#333" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#888", marginBottom: 8 }}>No lessons available</h3>
              <p style={{ color: "#555", fontSize: "0.85rem" }}>This course has no lessons yet.</p>
            </div>
          )}
        </div>

        <div style={{ width: "100%" }} className="lg:w-80">
          <div style={{ padding: "1.25rem 1rem", borderLeft: "none" }} className="lg:border-l lg:border-[rgba(255,255,255,0.06)]">
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 1rem", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={14} color="#C9A84C" /> Course Content
              <span style={{ fontSize: "0.7rem", color: "#555", fontWeight: 400, marginLeft: "auto" }}>{lessons.length} lessons</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {lessons.map(lesson => {
                const active = activeLesson?.id === lesson.id;
                const completed = markedComplete.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "0.7rem 0.8rem", borderRadius: 8,
                      background: active ? "rgba(201,168,76,0.08)" : "transparent",
                      border: active ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
                      color: active ? "#C9A84C" : completed ? "#27ae60" : "#888",
                      cursor: "pointer", textAlign: "left", width: "100%",
                      transition: "all 0.12s", fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ marginTop: 1, flexShrink: 0 }}>
                      {completed ? <CheckCircle2 size={14} /> : active ? <Play size={14} /> : <Lock size={14} />}
                    </span>
                    <div>
                      <div style={{ fontWeight: active ? 600 : 400, lineHeight: 1.3 }}>{lesson.title}</div>
                      <div style={{ fontSize: "0.68rem", color: "#444", marginTop: 2 }}>Lesson {lesson.orderIndex}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
