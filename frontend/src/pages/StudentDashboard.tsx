import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Clock, BookOpen, PlayCircle, GraduationCap, Settings
} from "lucide-react";

interface ApiCourse { id: number; name: string; description: string; status: string; }

const COURSE_META: Record<number, { level: string; duration: string }> = {
  1: { level: "Beginner", duration: "2 Weeks" },
  2: { level: "Intermediate", duration: "4 Weeks" },
  3: { level: "Essential", duration: "2 Weeks" },
  4: { level: "Advanced", duration: "4 Weeks" },
};
const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: "rgba(39,174,96,0.12)",  text: "#27ae60" },
  Intermediate: { bg: "rgba(201,168,76,0.12)", text: "#C9A84C" },
  Essential:    { bg: "rgba(231,76,60,0.12)",  text: "#e74c3c" },
  Advanced:     { bg: "rgba(155,89,182,0.12)", text: "#9b59b6" },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [progress, setProgress] = useState<Record<number, { total: number; completed: number; percent: number }>>({});
  const [loading, setLoading] = useState(true);

  const [profileName, setProfileName] = useState("");
  const [profilePass, setProfilePass] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    api.student.getMyCourses().then(async d => {
      setCourses(d);
      const progressMap: Record<number, { total: number; completed: number; percent: number }> = {};
      await Promise.all(d.map(async c => {
        try { progressMap[c.id] = await api.student.getCourseProgress(c.id); } catch {}
      }));
      setProgress(progressMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCourseClick = (courseId: number) => { navigate(`/dashboard/course/${courseId}`); };
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName && !profilePass) return;
    setSavingProfile(true);
    try {
      const data: { name?: string; password?: string } = {};
      if (profileName) data.name = profileName;
      if (profilePass) data.password = profilePass;
      await api.auth.updateProfile(data);
      setProfileMsg("Profile updated!");
      setProfilePass("");
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: unknown) { setProfileMsg(err instanceof Error ? err.message : "Failed"); }
    setSavingProfile(false);
  };

  const inputStyle: React.CSSProperties = { background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.6rem 0.9rem", color: "#fff", fontSize: "0.85rem", width: "100%", outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: "#888", textTransform: "uppercase" as const, marginBottom: 6, display: "block" };

  return (
    <DashboardLayout activeSection={activeSection} onSection={setActiveSection}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>Welcome back, <span style={{ color: "#C9A84C" }}>{user?.name ?? "Student"}</span></h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {activeSection === "profile" && (
        <div style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.5rem", maxWidth: 480 }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>Profile</h3>
          {profileMsg && <div style={{ padding: "0.6rem 0.8rem", borderRadius: 8, marginBottom: "1rem", background: profileMsg.includes("updated") ? "rgba(39,174,96,0.1)" : "rgba(231,76,60,0.1)", border: "1px solid " + (profileMsg.includes("updated") ? "rgba(39,174,96,0.3)" : "rgba(231,76,60,0.3)"), color: profileMsg.includes("updated") ? "#27ae60" : "#e74c3c", fontSize: "0.82rem" }}>{profileMsg}</div>}
          <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize: "0.7rem", color: "#555", marginBottom: 4 }}>EMAIL</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user?.email}</div>
          </div>
          <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "0.75rem" }}>
            <div><label style={labelStyle}>Name</label><input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder={user?.name} style={inputStyle} /></div>
            <div><label style={labelStyle}>New Password</label><input type="password" value={profilePass} onChange={e => setProfilePass(e.target.value)} placeholder="Leave blank to keep current" style={inputStyle} /></div>
            <button type="submit" disabled={savingProfile} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "0.65rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>{savingProfile ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      )}

      {activeSection === "dashboard" && (
        loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#555" }}>Loading your courses...</div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <GraduationCap size={48} color="#333" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#888", marginBottom: 8 }}>No courses yet</h3>
            <p style={{ color: "#555", fontSize: "0.85rem" }}>You haven't been enrolled in any courses yet. Contact your administrator.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.875rem", marginBottom: "2rem" }}>
              <div style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "#555", fontWeight: 500 }}>ENROLLED</span>
                  <GraduationCap size={13} color="#C9A84C" />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#C9A84C", fontFamily: "Poppins, sans-serif" }}>{courses.length}</div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, fontFamily: "Poppins, sans-serif" }}>Your Courses</h2>
                <span style={{ fontSize: "0.75rem", color: "#555" }}>{courses.length} total</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {courses.map((course, i) => { const meta = COURSE_META[course.id] || COURSE_META[1]; const levelStyle = LEVEL_COLORS[meta.level] || LEVEL_COLORS.Beginner; return (
                  <div key={course.id} onClick={() => handleCourseClick(course.id)} style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg, #C9A84C, #e8c96a)" }} />
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "0.9rem" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={17} color="#C9A84C" /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "#555" }}>MOD {String(i + 1).padStart(2, "0")}</span>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: levelStyle.bg, color: levelStyle.text }}>{meta.level.toUpperCase()}</span>
                          </div>
                          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>{course.name}</h3>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#777", lineHeight: 1.6, marginBottom: "1rem" }}>{course.description}</p>
                      <div style={{ display: "flex", gap: 14, marginBottom: "1rem" }}><span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#555" }}><Clock size={11} /> {meta.duration}</span></div>
                      {progress[course.id] && progress[course.id].total > 0 && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: "0.68rem", color: "#666" }}>{progress[course.id].completed}/{progress[course.id].total} lessons</span>
                            <span style={{ fontSize: "0.68rem", color: "#C9A84C", fontWeight: 600 }}>{progress[course.id].percent}%</span>
                          </div>
                          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                            <div style={{ height: "100%", borderRadius: 2, background: progress[course.id].percent === 100 ? "#27ae60" : "linear-gradient(90deg, #C9A84C, #e8c96a)", width: `${progress[course.id].percent}%`, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      )}
                      <button style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", borderRadius: 6, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}><PlayCircle size={11} /> {progress[course.id]?.percent === 100 ? "Review" : progress[course.id]?.percent > 0 ? "Continue" : "Start Course"}</button>
                    </div>
                  </div>
                ); })}
              </div>
            </div>
          </>
        )
      )}

      {activeSection !== "dashboard" && activeSection !== "profile" && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <Settings size={40} color="#333" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#888", marginBottom: 8 }}>Coming soon</h3>
          <p style={{ color: "#555", fontSize: "0.85rem" }}>This section is under development.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
