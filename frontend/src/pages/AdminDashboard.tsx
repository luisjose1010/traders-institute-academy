import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserSearch } from "@/components/UserSearch";
import {
  Plus, UserPlus, X, BookOpen, CheckCircle2, Loader2, RefreshCw, Database, Pencil, Trash2, ListVideo, Eye, ShieldCheck, GraduationCap, Users, Archive
} from "lucide-react";

interface Course { id: number; name: string; description: string; status: string; }
interface Lesson { id: number; courseId: number; title: string; videoUrl: string; orderIndex: number; }

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseTab, setCourseTab] = useState<"active" | "archived">("active");

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPass, setNewStudentPass] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [lastStudentId, setLastStudentId] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [grantCourseId, setGrantCourseId] = useState("");
  const [granting, setGranting] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const [managingCourseId, setManagingCourseId] = useState<number | null>(null);
  const [managingCourseName, setManagingCourseName] = useState("");
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonUrl, setNewLessonUrl] = useState("");
  const [newLessonOrder, setNewLessonOrder] = useState(1);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonUrl, setEditLessonUrl] = useState("");
  const [editLessonOrder, setEditLessonOrder] = useState(1);

  const [viewingAccessUserId, setViewingAccessUserId] = useState<string | null>(null);
  const [viewingAccessName, setViewingAccessName] = useState("");
  const [studentAccessList, setStudentAccessList] = useState<{ courseId: number; courseName: string }[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);

  const showMsg = (type: "success" | "error", text: string) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const loadCourses = () => { setLoading(true); api.admin.getAllCourses().then(d => { setCourses(d); setLoading(false); }).catch(() => setLoading(false)); };
  const loadStudents = () => { api.admin.getAllUsers().then(d => setStudents(d.filter(u => u.role === "student"))).catch(() => {}); };
  useEffect(() => { loadCourses(); loadStudents(); }, []);

  const filteredCourses = courses.filter(c => courseTab === "active" ? c.status === "active" : c.status !== "active");

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newCourseName || !newCourseDesc) return;
    setCreatingCourse(true);
    try { const res = await api.admin.createCourse({ name: newCourseName, description: newCourseDesc }); showMsg("success", "Course created: " + res.name); setNewCourseName(""); setNewCourseDesc(""); loadCourses(); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setCreatingCourse(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newStudentName || !newStudentEmail || !newStudentPass) return;
    setCreatingStudent(true);
    try { const res = await api.admin.createUser({ name: newStudentName, email: newStudentEmail, password: newStudentPass, role: "student" }); showMsg("success", "Student created: " + res.name); setLastStudentId(res.id); setNewStudentName(""); setNewStudentEmail(""); setNewStudentPass(""); loadStudents(); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setCreatingStudent(false);
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedUserId || !grantCourseId) return;
    setGranting(true);
    try { await api.admin.grantAccess({ userId: selectedUserId, courseId: parseInt(grantCourseId) }); showMsg("success", "Access granted!"); setSelectedUserId(""); setGrantCourseId(""); if (viewingAccessUserId) loadStudentAccess(viewingAccessUserId, viewingAccessName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setGranting(false);
  };

  const startEdit = (course: Course) => { setEditingCourse(course); setEditName(course.name); setEditDesc(course.description); setEditStatus(course.status); };
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingCourse) return;
    setSaving(true);
    try { await api.admin.updateCourse(editingCourse.id, { name: editName, description: editDesc, status: editStatus as "active" | "inactive" }); showMsg("success", "Course updated"); setEditingCourse(null); loadCourses(); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setSaving(false);
  };
  const handleArchiveCourse = async (courseId: number, name: string) => { if (!confirm(`Archive "${name}"?`)) return; try { await api.admin.deleteCourse(courseId); showMsg("success", "Archived: " + name); loadCourses(); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };

  const loadLessons = (courseId: number, courseName: string) => { setManagingCourseId(courseId); setManagingCourseName(courseName); setLessonsLoading(true); api.admin.getLessonsByCourse(courseId).then(d => setCourseLessons(d)).catch(() => {}).finally(() => setLessonsLoading(false)); };
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault(); if (!managingCourseId || !newLessonTitle || !newLessonUrl) return;
    setAddingLesson(true);
    try { await api.admin.createLesson(managingCourseId, { title: newLessonTitle, videoUrl: newLessonUrl, orderIndex: newLessonOrder }); showMsg("success", "Lesson added"); setNewLessonTitle(""); setNewLessonUrl(""); setNewLessonOrder(newLessonOrder + 1); loadLessons(managingCourseId, managingCourseName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setAddingLesson(false);
  };
  const startEditLesson = (lesson: Lesson) => { setEditingLesson(lesson); setEditLessonTitle(lesson.title); setEditLessonUrl(lesson.videoUrl); setEditLessonOrder(lesson.orderIndex); };
  const handleUpdateLesson = async (e: React.FormEvent) => { e.preventDefault(); if (!editingLesson) return; try { await api.admin.updateLesson(editingLesson.id, { title: editLessonTitle, videoUrl: editLessonUrl, orderIndex: editLessonOrder }); showMsg("success", "Lesson updated"); setEditingLesson(null); if (managingCourseId) loadLessons(managingCourseId, managingCourseName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };
  const handleDeleteLesson = async (lessonId: number, title: string) => { if (!confirm(`Delete "${title}"?`)) return; try { await api.admin.deleteLesson(lessonId); showMsg("success", "Lesson deleted"); if (managingCourseId) loadLessons(managingCourseId, managingCourseName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };

  const loadStudentAccess = (userId: string, name: string) => { setViewingAccessUserId(userId); setViewingAccessName(name); setAccessLoading(true); api.admin.getStudentAccess(userId).then(d => setStudentAccessList(d)).catch(() => {}).finally(() => setAccessLoading(false)); };
  const handleRevokeAccess = async (courseId: number, courseName: string) => { if (!viewingAccessUserId) return; if (!confirm(`Revoke "${courseName}"?`)) return; try { await api.admin.revokeAccess({ userId: viewingAccessUserId, courseId }); showMsg("success", "Revoked: " + courseName); loadStudentAccess(viewingAccessUserId, viewingAccessName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };

  const inputStyle: React.CSSProperties = { background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.75rem 1rem", color: "#fff", fontSize: "0.9rem", width: "100%", outline: "none" };
  const cardStyle: React.CSSProperties = { background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.5rem" };
  const labelStyle: React.CSSProperties = { fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "#999", textTransform: "uppercase" as const, marginBottom: 8, display: "block" };
  const btnPrimary: React.CSSProperties = { background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
  const btnDanger: React.CSSProperties = { background: "none", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#e74c3c" };
  const btnGhost: React.CSSProperties = { background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#888" };

  const layoutTitle = managingCourseId ? `${managingCourseName} — Lessons` : undefined;

  return (
    <DashboardLayout activeSection={activeSection} onSection={(s) => { setActiveSection(s); setManagingCourseId(null); }} title={layoutTitle} onBack={managingCourseId ? () => setManagingCourseId(null) : undefined}>
      {message && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1.5rem", background: message.type === "success" ? "rgba(39,174,96,0.1)" : "rgba(231,76,60,0.1)", border: "1px solid " + (message.type === "success" ? "rgba(39,174,96,0.3)" : "rgba(231,76,60,0.3)"), color: message.type === "success" ? "#27ae60" : "#e74c3c", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
          {message.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
          {message.text}
        </div>
      )}

      {activeSection === "dashboard" && !managingCourseId && (
        <>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>Admin Dashboard</h1>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>Manage courses, students, and access.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Courses", value: courses.filter(c => c.status === "active").length, icon: BookOpen, color: "#C9A84C" },
              { label: "Archived", value: courses.filter(c => c.status !== "active").length, icon: Archive, color: "#666" },
              { label: "Students", value: students.length, icon: Users, color: "#27ae60" },
            ].map(stat => { const StatIcon = stat.icon; return (
              <div key={stat.label} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "#555", fontWeight: 500 }}>{stat.label.toUpperCase()}</span>
                  <StatIcon size={14} color={stat.color} />
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: stat.color, fontFamily: "Poppins, sans-serif" }}>{stat.value}</div>
              </div>
            ); })}
          </div>
          <div style={{ ...cardStyle, textAlign: "center", padding: "2.5rem" }}>
            <Database size={40} color="#333" style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#888", margin: "0 0 8px" }}>Quick Actions</h3>
            <p style={{ color: "#555", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Use the sidebar to navigate between sections.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setActiveSection("courses")} style={{ ...btnPrimary, fontSize: "0.85rem" }}>Courses</button>
              <button onClick={() => setActiveSection("students")} style={{ background: "rgba(39,174,96,0.12)", border: "1px solid rgba(39,174,96,0.25)", color: "#27ae60", borderRadius: 8, padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Students</button>
              <button onClick={() => setActiveSection("access")} style={{ background: "rgba(155,89,182,0.12)", border: "1px solid rgba(155,89,182,0.25)", color: "#9b59b6", borderRadius: 8, padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Grant Access</button>
            </div>
          </div>
        </>
      )}

      {activeSection === "courses" && !managingCourseId && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} color="#C9A84C" /> Create New Course</h3>
            <form onSubmit={handleCreateCourse} style={{ display: "grid", gap: "0.75rem" }}>
              <div><label style={labelStyle}>Course Name</label><input value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="e.g. Forex Fundamentals" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Description</label><textarea value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} placeholder="What students will learn..." style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const }} required /></div>
              <button type="submit" disabled={creatingCourse} style={btnPrimary}>{creatingCourse ? <><Loader2 size={16} /> Creating...</> : <><Plus size={16} /> Create Course</>}</button>
            </form>
          </div>

          {editingCourse && (
            <div style={{ ...cardStyle, border: "1px solid rgba(201,168,76,0.3)" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                <Pencil size={16} color="#C9A84C" /> Edit Course
                <button onClick={() => setEditingCourse(null)} style={{ marginLeft: "auto", ...btnGhost }}><X size={14} /></button>
              </h3>
              <form onSubmit={handleUpdateCourse} style={{ display: "grid", gap: "0.75rem" }}>
                <div><label style={labelStyle}>Name</label><input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Description</label><textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const }} required /></div>
                <div><label style={labelStyle}>Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="active">Active</option>
                    <option value="inactive">Archived</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" disabled={saving} style={btnPrimary}>{saving ? "Saving..." : "Save"}</button>
                  <button type="button" onClick={() => setEditingCourse(null)} style={{ ...btnGhost, padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={() => setCourseTab("active")} style={{ padding: "8px 16px", borderRadius: 8, background: courseTab === "active" ? "rgba(201,168,76,0.12)" : "transparent", border: "none", color: courseTab === "active" ? "#C9A84C" : "#666", fontSize: "0.82rem", fontWeight: courseTab === "active" ? 700 : 400, cursor: "pointer" }}>Active ({courses.filter(c => c.status === "active").length})</button>
                <button onClick={() => setCourseTab("archived")} style={{ padding: "8px 16px", borderRadius: 8, background: courseTab === "archived" ? "rgba(255,255,255,0.06)" : "transparent", border: "none", color: courseTab === "archived" ? "#888" : "#555", fontSize: "0.82rem", fontWeight: courseTab === "archived" ? 700 : 400, cursor: "pointer" }}>Archived ({courses.filter(c => c.status !== "active").length})</button>
              </div>
              <button onClick={loadCourses} style={{ ...btnGhost, marginLeft: "auto" }}><RefreshCw size={14} /></button>
            </div>
            {loading ? <p style={{ color: "#555" }}>Loading...</p> : filteredCourses.length === 0 ? <p style={{ color: "#555", padding: "1rem 0" }}>{courseTab === "active" ? "No active courses." : "No archived courses."}</p> : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {filteredCourses.map(c => (
                  <div key={c.id} onClick={() => startEdit(c)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: 10, background: editingCourse?.id === c.id ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", border: editingCourse?.id === c.id ? "1px solid rgba(201,168,76,0.15)" : "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = editingCourse?.id === c.id ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)")}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#555" }}>{c.description.slice(0, 100)}{c.description.length > 100 ? "..." : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: c.status === "active" ? "rgba(39,174,96,0.12)" : "rgba(255,255,255,0.05)", color: c.status === "active" ? "#27ae60" : "#555" }}>{c.status.toUpperCase()}</span>
                      <button onClick={e => { e.stopPropagation(); loadLessons(c.id, c.name); }} title="Lessons" style={{ ...btnGhost, padding: "8px" }}><ListVideo size={16} /></button>
                      {c.status === "active" && <button onClick={e => { e.stopPropagation(); handleArchiveCourse(c.id, c.name); }} title="Archive" style={{ ...btnDanger, padding: "8px" }}><Trash2 size={14} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "courses" && managingCourseId && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><ListVideo size={16} color="#C9A84C" /> Lessons ({courseLessons.length})</h3>
            </div>
            <form onSubmit={handleAddLesson} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <input value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} placeholder="Title" style={inputStyle} required />
              <input value={newLessonUrl} onChange={e => setNewLessonUrl(e.target.value)} placeholder="YouTube or video URL" style={inputStyle} required />
              <input type="number" value={newLessonOrder} onChange={e => setNewLessonOrder(parseInt(e.target.value) || 1)} placeholder="#" style={{ ...inputStyle, width: 70, textAlign: "center" }} min={1} required />
              <button type="submit" disabled={addingLesson} style={btnPrimary}>{addingLesson ? <Loader2 size={16} /> : <Plus size={16} />} Add</button>
            </form>
            {lessonsLoading ? <p style={{ color: "#555" }}>Loading...</p> : courseLessons.length === 0 ? <p style={{ color: "#555", padding: "1rem 0" }}>No lessons yet. Add one above.</p> : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {courseLessons.map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: "0.7rem", color: "#555", fontWeight: 700, width: 24, textAlign: "center" }}>{l.orderIndex}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{l.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{l.videoUrl}</div>
                    </div>
                    <button onClick={() => startEditLesson(l)} style={{ ...btnGhost, padding: "8px" }}><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteLesson(l.id, l.title)} style={{ ...btnDanger, padding: "8px" }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            {editingLesson && (
              <div style={{ marginTop: "1.25rem", padding: "1.25rem", borderRadius: 10, background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <h4 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 600, color: "#C9A84C" }}>Edit: {editingLesson.title}</h4>
                <form onSubmit={handleUpdateLesson} style={{ display: "grid", gap: "0.75rem" }}>
                  <input value={editLessonTitle} onChange={e => setEditLessonTitle(e.target.value)} style={inputStyle} required />
                  <input value={editLessonUrl} onChange={e => setEditLessonUrl(e.target.value)} style={inputStyle} required />
                  <input type="number" value={editLessonOrder} onChange={e => setEditLessonOrder(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 70, textAlign: "center" }} min={1} required />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" style={btnPrimary}>Save</button>
                    <button type="button" onClick={() => setEditingLesson(null)} style={{ ...btnGhost, padding: "0.75rem 1.5rem" }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "students" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><UserPlus size={16} color="#27ae60" /> Create Student</h3>
            <form onSubmit={handleCreateStudent} style={{ display: "grid", gap: "0.75rem" }}>
              <div><label style={labelStyle}>Full Name</label><input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="John Doe" style={inputStyle} required /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><label style={labelStyle}>Email</label><input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} placeholder="john@example.com" style={inputStyle} required /></div>
                <div><label style={labelStyle}>Password</label><input type="password" value={newStudentPass} onChange={e => setNewStudentPass(e.target.value)} placeholder="Min 6 characters" style={inputStyle} required /></div>
              </div>
              <button type="submit" disabled={creatingStudent} style={{ ...btnPrimary, background: "#27ae60" }}>{creatingStudent ? <><Loader2 size={16} /> Creating...</> : <><UserPlus size={16} /> Create Student</>}</button>
            </form>
          </div>

          {lastStudentId && (
            <div style={{ ...cardStyle, background: "rgba(39,174,96,0.05)", border: "1px solid rgba(39,174,96,0.15)", padding: "1rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} color="#27ae60" />
                <span style={{ fontSize: "0.85rem", color: "#27ae60", fontWeight: 600 }}>Student created! ID:</span>
                <code style={{ color: "#C9A84C", background: "rgba(201,168,76,0.1)", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem" }}>{lastStudentId}</code>
              </div>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>Students ({students.length})</h3>
              <button onClick={loadStudents} style={btnGhost}><RefreshCw size={14} /></button>
            </div>
            {students.length === 0 ? <p style={{ color: "#555" }}>No students yet.</p> : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {students.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: 10, background: viewingAccessUserId === s.id ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", border: viewingAccessUserId === s.id ? "1px solid rgba(201,168,76,0.15)" : "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#555" }}>{s.email}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <button onClick={() => loadStudentAccess(s.id, s.name)} title="View Access" style={{ ...btnGhost, padding: "8px" }}><Eye size={16} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(s.id); showMsg("success", "ID copied"); }} style={{ ...btnGhost, padding: "8px", fontSize: "0.72rem" }}>Copy ID</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {viewingAccessUserId && (
            <div style={{ ...cardStyle, border: "1px solid rgba(201,168,76,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><ShieldCheck size={16} color="#C9A84C" /> {viewingAccessName}</h3>
                <button onClick={() => setViewingAccessUserId(null)} style={btnGhost}><X size={14} /></button>
              </div>
              {accessLoading ? <p style={{ color: "#555" }}>Loading...</p> : studentAccessList.length === 0 ? <p style={{ color: "#555" }}>No course access.</p> : (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {studentAccessList.map(a => (
                    <div key={a.courseId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div><span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{a.courseName}</span><span style={{ fontSize: "0.7rem", color: "#555", marginLeft: 8 }}>#{a.courseId}</span></div>
                      <button onClick={() => handleRevokeAccess(a.courseId, a.courseName)} style={{ ...btnDanger, fontSize: "0.78rem", fontWeight: 600, padding: "8px 14px" }}>Revoke</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeSection === "access" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><ShieldCheck size={16} color="#9b59b6" /> Grant Course Access</h3>
            <form onSubmit={handleGrantAccess} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Student</label>
                <UserSearch onSelect={u => setSelectedUserId(u.id)} selectedUserId={selectedUserId} />
              </div>
              <div>
                <label style={labelStyle}>Course</label>
                <select value={grantCourseId} onChange={e => setGrantCourseId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} required>
                  <option value="">Select a course...</option>
                  {courses.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={granting || !selectedUserId} style={{ ...btnPrimary, background: "#9b59b6", opacity: !selectedUserId ? 0.5 : 1 }}>{granting ? <><Loader2 size={16} /> Granting...</> : <><ShieldCheck size={16} /> Grant Access</>}</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
