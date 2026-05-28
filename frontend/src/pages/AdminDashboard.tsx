import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  LogOut, LayoutDashboard, GraduationCap, Users, Plus, UserPlus,
  ShieldCheck, Bell, Settings, Menu, X, BookOpen, CheckCircle2, Loader2, RefreshCw, Database
} from "lucide-react";

interface Course { id: number; name: string; description: string; status: string; }

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPass, setNewStudentPass] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [lastStudentId, setLastStudentId] = useState<string | null>(null);

  const [grantUserId, setGrantUserId] = useState("");
  const [grantCourseId, setGrantCourseId] = useState("");
  const [granting, setGranting] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (type: "success" | "error", text: string) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const loadCourses = () => {
    setLoading(true);
    api.admin.getAllCourses().then(d => { setCourses(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName || !newCourseDesc) return;
    setCreatingCourse(true);
    try {
      const res = await api.admin.createCourse({ name: newCourseName, description: newCourseDesc });
      showMsg("success", "Course created: " + res.name);
      setNewCourseName(""); setNewCourseDesc("");
      loadCourses();
    } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setCreatingCourse(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail || !newStudentPass) return;
    setCreatingStudent(true);
    try {
      const res = await api.admin.createUser({ name: newStudentName, email: newStudentEmail, password: newStudentPass, role: "student" });
      showMsg("success", "Student created: " + res.name);
      setLastStudentId(res.id);
      setNewStudentName(""); setNewStudentEmail(""); setNewStudentPass("");
    } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setCreatingStudent(false);
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId || !grantCourseId) return;
    setGranting(true);
    try {
      await api.admin.grantAccess({ userId: grantUserId, courseId: parseInt(grantCourseId) });
      showMsg("success", "Access granted!");
      setGrantUserId(""); setGrantCourseId("");
    } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setGranting(false);
  };

  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: GraduationCap },
    { id: "students", label: "Students", icon: Users },
    { id: "access", label: "Grant Access", icon: ShieldCheck },
  ];

  const inputStyle: React.CSSProperties = { background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.6rem 0.9rem", color: "#fff", fontSize: "0.85rem", width: "100%", outline: "none" };
  const cardStyle: React.CSSProperties = { background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.5rem" };
  const labelStyle: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase" as const, marginBottom: 6, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside style={{ width: 240, background: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" as const, position: "fixed" as const, top: 0, left: 0, bottom: 0, zIndex: 40, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s ease" }} className="md:translate-x-0">
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/traders-logo.png" alt="TIA" style={{ height: 30 }} />
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div style={{ padding: "0.75rem 1.5rem" }}><span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", color: "#e74c3c", textTransform: "uppercase" as const }}>Admin Panel</span></div>
        <nav style={{ flex: 1, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {navItems.map(item => { const active = activeSection === item.id; const Icon = item.icon; return (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.65rem 0.9rem", borderRadius: 8, background: active ? "rgba(231,76,60,0.1)" : "transparent", border: active ? "1px solid rgba(231,76,60,0.2)" : "1px solid transparent", color: active ? "#e74c3c" : "#777", fontSize: "0.85rem", fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left" as const, width: "100%", transition: "all 0.15s" }}>
              <Icon size={16} />{item.label}
            </button>
          ); })}
        </nav>
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.65rem 0.9rem", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #e74c3c, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>{user?.initials ?? "A"}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user?.name ?? "Admin"}</div>
              <div style={{ fontSize: "0.6rem", color: "#e74c3c", fontWeight: 700 }}>ADMINISTRATOR</div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#e74c3c", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", padding: "2px 8px", borderRadius: 4 }}>ADMIN</div>
          </div>
        </header>

        <main style={{ padding: "2rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
          {message && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1.5rem", background: message.type === "success" ? "rgba(39,174,96,0.1)" : "rgba(231,76,60,0.1)", border: "1px solid " + (message.type === "success" ? "rgba(39,174,96,0.3)" : "rgba(231,76,60,0.3)"), color: message.type === "success" ? "#27ae60" : "#e74c3c", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
              {message.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
              {message.text}
            </div>
          )}

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>Admin Dashboard</h1>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>Manage courses, students, and access permissions.</p>
          </div>

          {activeSection === "dashboard" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem", marginBottom: "2rem" }}>
                {[
                  { label: "Total Courses", value: courses.length, icon: BookOpen, color: "#C9A84C" },
                  { label: "Active", value: courses.filter(c => c.status === "active").length, icon: CheckCircle2, color: "#27ae60" },
                  { label: "Role", value: "Admin", icon: ShieldCheck, color: "#e74c3c" },
                ].map(stat => { const StatIcon = stat.icon; return (
                  <div key={stat.label} style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.7rem", color: "#555", fontWeight: 500 }}>{stat.label.toUpperCase()}</span>
                      <StatIcon size={13} color={stat.color} />
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color, fontFamily: "Poppins, sans-serif" }}>{stat.value}</div>
                  </div>
                ); })}
              </div>
              <div style={{ ...cardStyle, textAlign: "center", padding: "3rem" }}>
                <Database size={40} color="#333" style={{ marginBottom: 12 }} />
                <h3 style={{ color: "#888", margin: "0 0 8px" }}>Quick Actions</h3>
                <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Use the sidebar to manage courses, students, and access permissions.</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => setActiveSection("courses")} style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", borderRadius: 8, padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Manage Courses</button>
                  <button onClick={() => setActiveSection("students")} style={{ background: "rgba(39,174,96,0.12)", border: "1px solid rgba(39,174,96,0.25)", color: "#27ae60", borderRadius: 8, padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Create Student</button>
                  <button onClick={() => setActiveSection("access")} style={{ background: "rgba(155,89,182,0.12)", border: "1px solid rgba(155,89,182,0.25)", color: "#9b59b6", borderRadius: 8, padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Grant Access</button>
                </div>
              </div>
            </>
          )}

          {activeSection === "courses" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} color="#C9A84C" /> Create New Course</h3>
                <form onSubmit={handleCreateCourse} style={{ display: "grid", gap: "0.75rem" }}>
                  <div><label style={labelStyle}>Course Name</label><input value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="e.g. Forex Fundamentals" style={inputStyle} required /></div>
                  <div><label style={labelStyle}>Description</label><textarea value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} placeholder="What students will learn..." style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const }} required /></div>
                  <button type="submit" disabled={creatingCourse} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "0.65rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {creatingCourse ? <><Loader2 size={14} /> Creating...</> : <><Plus size={14} /> Create Course</>}
                  </button>
                </form>
              </div>

              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>Existing Courses ({courses.length})</h3>
                  <button onClick={loadCourses} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#666" }}><RefreshCw size={14} /></button>
                </div>
                {loading ? <p style={{ color: "#555" }}>Loading...</p> : courses.length === 0 ? <p style={{ color: "#555" }}>No courses yet. Create one above.</p> : (
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {courses.map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#555" }}>{c.description.slice(0, 80)}{c.description.length > 80 ? "..." : ""}</div>
                        </div>
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: c.status === "active" ? "rgba(39,174,96,0.12)" : "rgba(255,255,255,0.05)", color: c.status === "active" ? "#27ae60" : "#555" }}>{c.status.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "students" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><UserPlus size={16} color="#27ae60" /> Create New Student</h3>
                <form onSubmit={handleCreateStudent} style={{ display: "grid", gap: "0.75rem" }}>
                  <div><label style={labelStyle}>Full Name</label><input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="John Doe" style={inputStyle} required /></div>
                  <div><label style={labelStyle}>Email</label><input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} placeholder="john@example.com" style={inputStyle} required /></div>
                  <div><label style={labelStyle}>Password</label><input type="password" value={newStudentPass} onChange={e => setNewStudentPass(e.target.value)} placeholder="Min 6 characters" style={inputStyle} required /></div>
                  <button type="submit" disabled={creatingStudent} style={{ background: "#27ae60", color: "#fff", border: "none", borderRadius: 8, padding: "0.65rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {creatingStudent ? <><Loader2 size={14} /> Creating...</> : <><UserPlus size={14} /> Create Student</>}
                  </button>
                </form>
              </div>

              {lastStudentId && (
                <div style={{ ...cardStyle, background: "rgba(39,174,96,0.05)", border: "1px solid rgba(39,174,96,0.15)" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#27ae60" }}>Last Created Student</h4>
                  <p style={{ fontSize: "0.82rem", color: "#888", margin: 0 }}>User ID: <code style={{ color: "#C9A84C", background: "rgba(201,168,76,0.1)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>{lastStudentId}</code></p>
                  <p style={{ fontSize: "0.75rem", color: "#555", margin: "4px 0 0" }}>Use this ID to grant course access in the Grant Access tab.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === "access" && (
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><ShieldCheck size={16} color="#9b59b6" /> Grant Course Access</h3>
              <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>Assign a student to a course by entering their User ID and the Course ID.</p>
              <form onSubmit={handleGrantAccess} style={{ display: "grid", gap: "0.75rem" }}>
                <div><label style={labelStyle}>Student User ID</label><input value={grantUserId} onChange={e => setGrantUserId(e.target.value)} placeholder="uuid-of-student" style={inputStyle} required /></div>
                <div><label style={labelStyle}>Course ID</label><input type="number" value={grantCourseId} onChange={e => setGrantCourseId(e.target.value)} placeholder="1" style={inputStyle} required /></div>
                <button type="submit" disabled={granting} style={{ background: "#9b59b6", color: "#fff", border: "none", borderRadius: 8, padding: "0.65rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {granting ? <><Loader2 size={14} /> Granting...</> : <><ShieldCheck size={14} /> Grant Access</>}
                </button>
              </form>
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: 8, background: "rgba(155,89,182,0.05)", border: "1px solid rgba(155,89,182,0.15)" }}>
                <p style={{ fontSize: "0.75rem", color: "#9b59b6", margin: 0, fontWeight: 600 }}>Tip:</p>
                <p style={{ fontSize: "0.75rem", color: "#666", margin: "4px 0 0" }}>Create a student first, copy their User ID from the Students tab, then come back here to grant access to specific courses.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
