import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Plus, UserPlus, X, BookOpen, CheckCircle2, Loader2, RefreshCw, Database, Pencil, Trash2, ListVideo, Eye, ShieldCheck, GraduationCap, Users
} from "lucide-react";

interface Course { id: number; name: string; description: string; status: string; }
interface Lesson { id: number; courseId: number; title: string; videoUrl: string; orderIndex: number; }

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
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

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
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
    e.preventDefault(); if (!grantUserId || !grantCourseId) return;
    setGranting(true);
    try { await api.admin.grantAccess({ userId: grantUserId, courseId: parseInt(grantCourseId) }); showMsg("success", "Access granted!"); setGrantUserId(""); setGrantCourseId(""); if (viewingAccessUserId) loadStudentAccess(viewingAccessUserId, viewingAccessName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setGranting(false);
  };

  const startEdit = (course: Course) => { setEditingCourse(course); setEditName(course.name); setEditDesc(course.description); };
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingCourse) return;
    setSaving(true);
    try { await api.admin.updateCourse(editingCourse.id, { name: editName, description: editDesc }); showMsg("success", "Course updated: " + editName); setEditingCourse(null); loadCourses(); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setSaving(false);
  };
  const handleDeleteCourse = async (courseId: number, name: string) => { if (!confirm(`Archive "${name}"?`)) return; try { await api.admin.deleteCourse(courseId); showMsg("success", "Course archived: " + name); loadCourses(); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };

  const loadLessons = (courseId: number, courseName: string) => { setManagingCourseId(courseId); setManagingCourseName(courseName); setLessonsLoading(true); api.admin.getLessonsByCourse(courseId).then(d => setCourseLessons(d)).catch(() => {}).finally(() => setLessonsLoading(false)); };
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault(); if (!managingCourseId || !newLessonTitle || !newLessonUrl) return;
    setAddingLesson(true);
    try { await api.admin.createLesson(managingCourseId, { title: newLessonTitle, videoUrl: newLessonUrl, orderIndex: newLessonOrder }); showMsg("success", "Lesson added: " + newLessonTitle); setNewLessonTitle(""); setNewLessonUrl(""); setNewLessonOrder(newLessonOrder + 1); loadLessons(managingCourseId, managingCourseName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setAddingLesson(false);
  };
  const startEditLesson = (lesson: Lesson) => { setEditingLesson(lesson); setEditLessonTitle(lesson.title); setEditLessonUrl(lesson.videoUrl); setEditLessonOrder(lesson.orderIndex); };
  const handleUpdateLesson = async (e: React.FormEvent) => { e.preventDefault(); if (!editingLesson) return; try { await api.admin.updateLesson(editingLesson.id, { title: editLessonTitle, videoUrl: editLessonUrl, orderIndex: editLessonOrder }); showMsg("success", "Lesson updated"); setEditingLesson(null); if (managingCourseId) loadLessons(managingCourseId, managingCourseName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };
  const handleDeleteLesson = async (lessonId: number, title: string) => { if (!confirm(`Delete "${title}"?`)) return; try { await api.admin.deleteLesson(lessonId); showMsg("success", "Lesson deleted"); if (managingCourseId) loadLessons(managingCourseId, managingCourseName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };

  const loadStudentAccess = (userId: string, name: string) => { setViewingAccessUserId(userId); setViewingAccessName(name); setAccessLoading(true); api.admin.getStudentAccess(userId).then(d => setStudentAccessList(d)).catch(() => {}).finally(() => setAccessLoading(false)); };
  const handleRevokeAccess = async (courseId: number, courseName: string) => { if (!viewingAccessUserId) return; if (!confirm(`Revoke "${courseName}"?`)) return; try { await api.admin.revokeAccess({ userId: viewingAccessUserId, courseId }); showMsg("success", "Access revoked: " + courseName); loadStudentAccess(viewingAccessUserId, viewingAccessName); } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); } };

  const inputStyle: React.CSSProperties = { background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.6rem 0.9rem", color: "#fff", fontSize: "0.85rem", width: "100%", outline: "none" };
  const cardStyle: React.CSSProperties = { background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "1.5rem" };
  const labelStyle: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase" as const, marginBottom: 6, display: "block" };

  const layoutTitle = managingCourseId ? `Courses / ${managingCourseName} Lessons` : undefined;

  return (
    <DashboardLayout activeSection={activeSection} onSection={(s) => { setActiveSection(s); setManagingCourseId(null); }} title={layoutTitle}>
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
            <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>Manage courses, students, and access permissions.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Courses", value: courses.length, icon: BookOpen, color: "#C9A84C" },
              { label: "Active", value: courses.filter(c => c.status === "active").length, icon: CheckCircle2, color: "#27ae60" },
              { label: "Students", value: students.length, icon: Users, color: "#C9A84C" },
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

      {activeSection === "courses" && !managingCourseId && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>Courses</h1>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>Create, edit, and manage courses and their lessons.</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} color="#C9A84C" /> Create New Course</h3>
            <form onSubmit={handleCreateCourse} style={{ display: "grid", gap: "0.75rem" }}>
              <div><label style={labelStyle}>Course Name</label><input value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="e.g. Forex Fundamentals" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Description</label><textarea value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} placeholder="What students will learn..." style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const }} required /></div>
              <button type="submit" disabled={creatingCourse} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "0.65rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{creatingCourse ? <><Loader2 size={14} /> Creating...</> : <><Plus size={14} /> Create Course</>}</button>
            </form>
          </div>

          {editingCourse && (
            <div style={{ ...cardStyle, border: "1px solid rgba(201,168,76,0.3)" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                <Pencil size={16} color="#C9A84C" /> Edit: {editingCourse.name}
                <button onClick={() => setEditingCourse(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={16} /></button>
              </h3>
              <form onSubmit={handleUpdateCourse} style={{ display: "grid", gap: "0.75rem" }}>
                <div><label style={labelStyle}>Course Name</label><input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Description</label><textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const }} required /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" disabled={saving} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "0.65rem 1.5rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>{saving ? "Saving..." : "Save Changes"}</button>
                  <button type="button" onClick={() => setEditingCourse(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.65rem 1rem", color: "#888", cursor: "pointer", fontSize: "0.85rem" }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>All Courses ({courses.length})</h3>
              <button onClick={loadCourses} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#666" }}><RefreshCw size={14} /></button>
            </div>
            {loading ? <p style={{ color: "#555" }}>Loading...</p> : courses.length === 0 ? <p style={{ color: "#555" }}>No courses yet. Create one above.</p> : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {courses.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#555" }}>{c.description.slice(0, 80)}{c.description.length > 80 ? "..." : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: c.status === "active" ? "rgba(39,174,96,0.12)" : "rgba(255,255,255,0.05)", color: c.status === "active" ? "#27ae60" : "#555" }}>{c.status.toUpperCase()}</span>
                      <button onClick={() => loadLessons(c.id, c.name)} title="Lessons" style={{ background: "none", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#C9A84C" }}><ListVideo size={12} /></button>
                      <button onClick={() => startEdit(c)} title="Edit" style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#888" }}><Pencil size={12} /></button>
                      <button onClick={() => handleDeleteCourse(c.id, c.name)} title="Archive" style={{ background: "none", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#e74c3c" }}><Trash2 size={12} /></button>
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
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><ListVideo size={16} color="#C9A84C" /> Lessons ({courseLessons.length})</h3>
            <form onSubmit={handleAddLesson} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: "0.5rem", marginBottom: "1rem" }}>
              <input value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} placeholder="Lesson title" style={inputStyle} required />
              <input value={newLessonUrl} onChange={e => setNewLessonUrl(e.target.value)} placeholder="Video URL" style={inputStyle} required />
              <input type="number" value={newLessonOrder} onChange={e => setNewLessonOrder(parseInt(e.target.value) || 1)} placeholder="#" style={{ ...inputStyle, width: 60 }} min={1} required />
              <button type="submit" disabled={addingLesson} style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "0.6rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{addingLesson ? <Loader2 size={14} /> : <Plus size={14} />} Add</button>
            </form>
            {lessonsLoading ? <p style={{ color: "#555" }}>Loading...</p> : courseLessons.length === 0 ? <p style={{ color: "#555" }}>No lessons yet.</p> : (
              <div style={{ display: "grid", gap: "0.4rem" }}>
                {courseLessons.map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.8rem", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: "0.65rem", color: "#555", fontWeight: 700, width: 20, textAlign: "center" }}>{l.orderIndex}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{l.title}</div>
                      <div style={{ fontSize: "0.7rem", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{l.videoUrl}</div>
                    </div>
                    <button onClick={() => startEditLesson(l)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#888" }}><Pencil size={11} /></button>
                    <button onClick={() => handleDeleteLesson(l.id, l.title)} style={{ background: "none", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#e74c3c" }}><Trash2 size={11} /></button>
                  </div>
                ))}
              </div>
            )}
            {editingLesson && (
              <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: 8, background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", fontWeight: 600, color: "#C9A84C" }}>Edit: {editingLesson.title}</h4>
                <form onSubmit={handleUpdateLesson} style={{ display: "grid", gap: "0.5rem" }}>
                  <input value={editLessonTitle} onChange={e => setEditLessonTitle(e.target.value)} style={inputStyle} required />
                  <input value={editLessonUrl} onChange={e => setEditLessonUrl(e.target.value)} style={inputStyle} required />
                  <input type="number" value={editLessonOrder} onChange={e => setEditLessonOrder(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 60 }} min={1} required />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" style={{ background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Save</button>
                    <button type="button" onClick={() => setEditingLesson(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.5rem 1rem", color: "#888", cursor: "pointer", fontSize: "0.82rem" }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "students" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>Students</h1>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>Create student accounts, manage access, and verify payments.</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><UserPlus size={16} color="#27ae60" /> Create New Student</h3>
            <form onSubmit={handleCreateStudent} style={{ display: "grid", gap: "0.75rem" }}>
              <div><label style={labelStyle}>Full Name</label><input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="John Doe" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Email</label><input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} placeholder="john@example.com" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Password</label><input type="password" value={newStudentPass} onChange={e => setNewStudentPass(e.target.value)} placeholder="Min 6 characters" style={inputStyle} required /></div>
              <button type="submit" disabled={creatingStudent} style={{ background: "#27ae60", color: "#fff", border: "none", borderRadius: 8, padding: "0.65rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{creatingStudent ? <><Loader2 size={14} /> Creating...</> : <><UserPlus size={14} /> Create Student</>}</button>
            </form>
          </div>

          {lastStudentId && (
            <div style={{ ...cardStyle, background: "rgba(39,174,96,0.05)", border: "1px solid rgba(39,174,96,0.15)" }}>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#27ae60" }}>Last Created Student</h4>
              <p style={{ fontSize: "0.82rem", color: "#888", margin: 0 }}>User ID: <code style={{ color: "#C9A84C", background: "rgba(201,168,76,0.1)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>{lastStudentId}</code></p>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>All Students ({students.length})</h3>
              <button onClick={loadStudents} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#666" }}><RefreshCw size={14} /></button>
            </div>
            {students.length === 0 ? <p style={{ color: "#555" }}>No students yet.</p> : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {students.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: 8, background: viewingAccessUserId === s.id ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)", border: viewingAccessUserId === s.id ? "1px solid rgba(201,168,76,0.15)" : "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#555" }}>{s.email}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => loadStudentAccess(s.id, s.name)} title="View Access" style={{ background: "none", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: "#C9A84C" }}><Eye size={12} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(s.id); showMsg("success", "ID copied!"); }} style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#C9A84C", fontSize: "0.72rem", fontWeight: 600 }}>Copy ID</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {viewingAccessUserId && (
            <div style={{ ...cardStyle, border: "1px solid rgba(201,168,76,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><ShieldCheck size={16} color="#C9A84C" /> Access: {viewingAccessName}</h3>
                <button onClick={() => setViewingAccessUserId(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={16} /></button>
              </div>
              {accessLoading ? <p style={{ color: "#555" }}>Loading...</p> : studentAccessList.length === 0 ? <p style={{ color: "#555" }}>No course access.</p> : (
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  {studentAccessList.map(a => (
                    <div key={a.courseId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.8rem", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div><span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{a.courseName}</span><span style={{ fontSize: "0.65rem", color: "#555", marginLeft: 8 }}>ID: {a.courseId}</span></div>
                      <button onClick={() => handleRevokeAccess(a.courseId, a.courseName)} style={{ background: "none", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#e74c3c", fontSize: "0.72rem", fontWeight: 600 }}>Revoke</button>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: "0.7rem", color: "#444", margin: "0.75rem 0 0" }}>User ID: {viewingAccessUserId}</p>
            </div>
          )}
        </div>
      )}

      {activeSection === "access" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>Grant Access</h1>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>Assign students to courses.</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", gap: 8 }}><ShieldCheck size={16} color="#9b59b6" /> Grant Course Access</h3>
            <form onSubmit={handleGrantAccess} style={{ display: "grid", gap: "0.75rem" }}>
              <div><label style={labelStyle}>Student User ID</label><input value={grantUserId} onChange={e => setGrantUserId(e.target.value)} placeholder="uuid-of-student" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Course ID</label><input type="number" value={grantCourseId} onChange={e => setGrantCourseId(e.target.value)} placeholder="1" style={inputStyle} required /></div>
              <button type="submit" disabled={granting} style={{ background: "#9b59b6", color: "#fff", border: "none", borderRadius: 8, padding: "0.65rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{granting ? <><Loader2 size={14} /> Granting...</> : <><ShieldCheck size={14} /> Grant Access</>}</button>
            </form>
            <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: 8, background: "rgba(155,89,182,0.05)", border: "1px solid rgba(155,89,182,0.15)" }}>
              <p style={{ fontSize: "0.75rem", color: "#9b59b6", margin: 0, fontWeight: 600 }}>Tip:</p>
              <p style={{ fontSize: "0.75rem", color: "#666", margin: "4px 0 0" }}>Go to Students tab, click the eye icon to view a student's access, or copy their User ID to grant access here.</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
