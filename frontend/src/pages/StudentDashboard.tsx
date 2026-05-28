import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  Clock, BookOpen, LogOut, PlayCircle, Bell, LayoutDashboard,
  GraduationCap, User, Settings, Menu, X
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
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.student.getMyCourses().then(d => { setCourses(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: GraduationCap },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside style={{ width: 240, background: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" as const, position: "fixed" as const, top: 0, left: 0, bottom: 0, zIndex: 40, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s ease" }} className="md:translate-x-0">
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/traders-logo.png" alt="TIA" style={{ height: 30 }} />
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div style={{ padding: "0.75rem 1.5rem" }}><span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", color: "#C9A84C", textTransform: "uppercase" as const }}>Student Portal</span></div>
        <nav style={{ flex: 1, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {navItems.map(item => { const active = activeSection === item.id; const Icon = item.icon; return (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.65rem 0.9rem", borderRadius: 8, background: active ? "rgba(201,168,76,0.1)" : "transparent", border: active ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent", color: active ? "#C9A84C" : "#777", fontSize: "0.85rem", fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left" as const, width: "100%", transition: "all 0.15s" }}>
              <Icon size={16} />{item.label}
            </button>
          ); })}
        </nav>
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.65rem 0.9rem", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #8a6a20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#000" }}>{user?.initials ?? "U"}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user?.name ?? "Student"}</div>
              <div style={{ fontSize: "0.7rem", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "0.6rem 0.9rem", borderRadius: 8, background: "none", border: "none", color: "#666", fontSize: "0.82rem", cursor: "pointer" }}><LogOut size={15} /> Sign Out</button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }} className="md:ml-[240px]">
        <header style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", position: "sticky" as const, top: 0, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}><Menu size={20} /></button>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#888", textTransform: "capitalize" as const }}>{activeSection}</span>
          </div>
        </header>

        <main style={{ padding: "2rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>Welcome back, <span style={{ color: "#C9A84C" }}>{user?.name ?? "Student"}</span></h1>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>

          {loading ? (
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
                    <div key={course.id} style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
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
                        <button style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", borderRadius: 6, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}><PlayCircle size={11} /> Start Course</button>
                      </div>
                    </div>
                  ); })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
