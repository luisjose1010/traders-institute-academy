import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, type PaginatedResult } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileEditor } from "@/components/ProfileEditor";
import { Pagination } from "@/components/Pagination";
import { UserSearch } from "@/components/UserSearch";
import { CourseMultiSelect } from "@/components/CourseMultiSelect";
import {
  Plus, UserPlus, X, BookOpen, CheckCircle2, Loader2, RefreshCw, Pencil, Trash2, ListVideo, Eye, ShieldCheck, GraduationCap, Users, Archive
} from "lucide-react";

interface Course { id: number; name: string; description: string; status: string; }
interface Lesson { id: number; courseId: number; title: string; videoUrl: string; orderIndex: number; }
interface Student { id: string; name: string; email: string; role: string; }

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseTab, setCourseTab] = useState<"active" | "archived">("active");

  const [coursePage, setCoursePage] = useState(1);
  const [courseLimit, setCourseLimit] = useState(10);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseTotal, setCourseTotal] = useState(0);
  const [courseTotalPages, setCourseTotalPages] = useState(1);

  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(10);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentTotal, setStudentTotal] = useState(0);
  const [studentTotalPages, setStudentTotalPages] = useState(1);

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPass, setNewStudentPass] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [lastStudentId, setLastStudentId] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [grantCourseIds, setGrantCourseIds] = useState<number[]>([]);
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

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStudentPass, setEditStudentPass] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);

  const showMsg = (type: "success" | "error", text: string) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 4000); };

  const loadCourses = () => {
    setCoursesLoading(true);
    api.admin.getAllCourses({ page: coursePage, limit: courseLimit, search: courseSearch, status: courseTab }).then(d => {
      setCourses(d.items); setCourseTotal(d.total); setCourseTotalPages(d.totalPages); setCoursesLoading(false);
    }).catch(() => setCoursesLoading(false));
  };
  const loadStudents = () => {
    api.admin.getAllUsers({ page: studentPage, limit: studentLimit, search: studentSearch, role: "student" }).then(d => {
      setStudents(d.items); setStudentTotal(d.total); setStudentTotalPages(d.totalPages);
    }).catch(() => {});
  };
  useEffect(() => { loadCourses(); }, [coursePage, courseLimit, courseSearch, courseTab]);
  useEffect(() => { loadStudents(); }, [studentPage, studentLimit, studentSearch]);

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
    e.preventDefault(); if (!selectedUserId || grantCourseIds.length === 0) return;
    setGranting(true);
    try {
      await Promise.all(grantCourseIds.map(cid => api.admin.grantAccess({ userId: selectedUserId, courseId: cid })));
      showMsg("success", `Access granted to ${grantCourseIds.length} course(s)!`);
      setSelectedUserId(""); setGrantCourseIds([]);
      if (viewingAccessUserId) loadStudentAccess(viewingAccessUserId, viewingAccessName);
    } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
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

  const startEditStudent = (s: Student) => { setEditingStudentId(s.id); setEditStudentName(s.name); setEditStudentEmail(s.email); setEditStudentPass(""); setViewingAccessUserId(null); };
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingStudentId || (!editStudentName && !editStudentEmail && !editStudentPass)) return;
    setSavingStudent(true);
    try {
      const data: { name?: string; email?: string; password?: string } = {};
      if (editStudentName) data.name = editStudentName;
      if (editStudentEmail) data.email = editStudentEmail;
      if (editStudentPass) data.password = editStudentPass;
      await api.admin.updateUser(editingStudentId, data);
      showMsg("success", "Student updated!");
      setEditingStudentId(null);
      loadStudents();
    } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
    setSavingStudent(false);
  };

  const layoutTitle = managingCourseId ? `${managingCourseName} — Lessons` : undefined;

  return (
    <DashboardLayout activeSection={activeSection} onSection={(s) => { setActiveSection(s); setManagingCourseId(null); }} title={layoutTitle} onBack={managingCourseId ? () => setManagingCourseId(null) : undefined}>
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 text-sm ${message.type === "success" ? "bg-[rgba(39,174,96,0.1)] border border-[rgba(39,174,96,0.3)] text-[#27ae60]" : "bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.3)] text-[#e74c3c]"}`}>
          {message.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
          {message.text}
        </div>
      )}

      {activeSection === "dashboard" && !managingCourseId && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 font-['Poppins']">Admin Dashboard</h1>
            <p className="text-[#666] text-sm m-0">Manage courses, students, and access.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,220px))] gap-4 mb-6">
            {[
              { label: "Courses", value: courses.filter(c => c.status === "active").length, icon: BookOpen, color: "#C9A84C" },
              { label: "Archived", value: courses.filter(c => c.status !== "active").length, icon: Archive, color: "#666" },
              { label: "Students", value: students.length, icon: Users, color: "#27ae60" },
            ].map(stat => { const StatIcon = stat.icon; return (
              <div key={stat.label} className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#555] font-medium">{stat.label.toUpperCase()}</span>
                  <StatIcon size={14} style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-bold font-['Poppins']" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ); })}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setActiveSection("courses")} className="bg-[#C9A84C] text-black border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer flex items-center justify-center gap-2">Manage Courses</button>
            <button onClick={() => setActiveSection("students")} className="bg-[rgba(39,174,96,0.12)] border border-[rgba(39,174,96,0.25)] text-[#27ae60] rounded-lg px-6 py-3 font-bold text-sm cursor-pointer">Manage Students</button>
            <button onClick={() => setActiveSection("access")} className="bg-[rgba(155,89,182,0.12)] border border-[rgba(155,89,182,0.25)] text-[#9b59b6] rounded-lg px-6 py-3 font-bold text-sm cursor-pointer">Grant Access</button>
          </div>
        </>
      )}

      {activeSection === "courses" && !managingCourseId && (
        <div className="grid gap-6">
          <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="text-base font-bold font-['Poppins'] flex items-center gap-2 mb-4"><Plus size={16} className="text-[#C9A84C]" /> Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="grid gap-3">
              <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Course Name</label><input value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="e.g. Forex Fundamentals" className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required /></div>
              <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Description</label><textarea value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} placeholder="What students will learn..." className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none min-h-[80px] resize-y" required /></div>
              <button type="submit" disabled={creatingCourse} className="bg-[#C9A84C] text-black border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">{creatingCourse ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Course</>}</button>
            </form>
          </div>

          {editingCourse && (
            <div className="bg-[#0f0f0f] border border-[rgba(201,168,76,0.3)] rounded-xl p-6">
              <h3 className="text-base font-bold font-['Poppins'] flex items-center gap-2 mb-4">
                <Pencil size={16} className="text-[#C9A84C]" /> Edit Course
                <button onClick={() => setEditingCourse(null)} className="ml-auto bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 cursor-pointer text-[#888] text-xs"><X size={14} /></button>
              </h3>
              <form onSubmit={handleUpdateCourse} className="grid gap-3">
                <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Name</label><input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required /></div>
                <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Description</label><textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none min-h-[80px] resize-y" required /></div>
                <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none cursor-pointer">
                    <option value="active">Active</option>
                    <option value="inactive">Archived</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="bg-[#C9A84C] text-black border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
                  <button type="button" onClick={() => setEditingCourse(null)} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-6 py-3 cursor-pointer text-[#888] text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex bg-[rgba(255,255,255,0.03)] rounded-lg border border-[rgba(255,255,255,0.06)]">
                <button onClick={() => { setCourseTab("active"); setCoursePage(1); }} className={`px-4 py-2 rounded-lg border-none text-sm cursor-pointer ${courseTab === "active" ? "bg-[rgba(201,168,76,0.12)] text-[#C9A84C] font-bold" : "bg-transparent text-[#666] font-normal"}`}>Active</button>
                <button onClick={() => { setCourseTab("archived"); setCoursePage(1); }} className={`px-4 py-2 rounded-lg border-none text-sm cursor-pointer ${courseTab === "archived" ? "bg-[rgba(255,255,255,0.06)] text-[#888] font-bold" : "bg-transparent text-[#555] font-normal"}`}>Archived</button>
              </div>
              <input value={courseSearch} onChange={e => { setCourseSearch(e.target.value); setCoursePage(1); }} placeholder="Search courses..." className="bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-[#fff] text-sm outline-none w-[200px]" />
              <button onClick={loadCourses} className="ml-auto bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 cursor-pointer text-[#888]"><RefreshCw size={14} /></button>
            </div>
            {coursesLoading && courses.length === 0 ? <p className="text-[#555]">Loading...</p> : courses.length === 0 ? <p className="text-[#555] py-4">{courseTab === "active" ? "No active courses." : "No archived courses."}</p> : (
              <>
                <div className="grid gap-2">
                  {courses.map(c => (
                    <div key={c.id} onClick={() => startEdit(c)} className={`flex items-center justify-between px-4 py-4 rounded-lg cursor-pointer transition-all ${editingCourse?.id === c.id ? "bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)]" : "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"}`}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = editingCourse?.id === c.id ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)")}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold mb-0.5">{c.name}</div>
                        <div className="text-xs text-[#555]">{c.description.slice(0, 100)}{c.description.length > 100 ? "..." : ""}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${c.status === "active" ? "bg-[rgba(39,174,96,0.12)] text-[#27ae60]" : "bg-[rgba(255,255,255,0.05)] text-[#555]"}`}>{c.status.toUpperCase()}</span>
                        <button onClick={e => { e.stopPropagation(); loadLessons(c.id, c.name); }} title="Lessons" className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg p-2 cursor-pointer text-[#888]"><ListVideo size={16} /></button>
                        {c.status === "active" && <button onClick={e => { e.stopPropagation(); handleArchiveCourse(c.id, c.name); }} title="Archive" className="bg-none border border-[rgba(231,76,60,0.2)] rounded-lg p-2 cursor-pointer text-[#e74c3c]"><Trash2 size={14} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination page={coursePage} totalPages={courseTotalPages} total={courseTotal} limit={courseLimit} onPageChange={setCoursePage} onLimitChange={l => { setCourseLimit(l); setCoursePage(1); }} />
              </>
            )}
          </div>
        </div>
      )}

      {activeSection === "courses" && managingCourseId && (
        <div className="grid gap-6">
          <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-['Poppins'] flex items-center gap-2"><ListVideo size={16} className="text-[#C9A84C]" /> Lessons ({courseLessons.length})</h3>
            </div>
            <form onSubmit={handleAddLesson} className="grid grid-cols-[1fr_2fr_auto_auto] gap-2 mb-5">
              <input value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} placeholder="Title" className="bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required />
              <input value={newLessonUrl} onChange={e => setNewLessonUrl(e.target.value)} placeholder="YouTube or video URL" className="bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required />
              <input type="number" value={newLessonOrder} onChange={e => setNewLessonOrder(parseInt(e.target.value) || 1)} placeholder="#" className="bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none w-[70px] text-center" min={1} required />
              <button type="submit" disabled={addingLesson} className="bg-[#C9A84C] text-black border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">{addingLesson ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add</button>
            </form>
            {lessonsLoading ? <p className="text-[#555]">Loading...</p> : courseLessons.length === 0 ? <p className="text-[#555] py-4">No lessons yet. Add one above.</p> : (
              <div className="grid gap-2">
                {courseLessons.map(l => (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                    <span className="text-xs text-[#555] font-bold w-6 text-center">{l.orderIndex}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{l.title}</div>
                      <div className="text-xs text-[#444] overflow-hidden text-ellipsis whitespace-nowrap">{l.videoUrl}</div>
                    </div>
                    <button onClick={() => startEditLesson(l)} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg p-2 cursor-pointer text-[#888]"><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteLesson(l.id, l.title)} className="bg-none border border-[rgba(231,76,60,0.2)] rounded-lg p-2 cursor-pointer text-[#e74c3c]"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            {editingLesson && (
              <div className="mt-5 p-5 rounded-lg bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)]">
                <h4 className="text-sm font-semibold text-[#C9A84C] mb-4">Edit: {editingLesson.title}</h4>
                <form onSubmit={handleUpdateLesson} className="grid gap-3">
                  <input value={editLessonTitle} onChange={e => setEditLessonTitle(e.target.value)} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required />
                  <input value={editLessonUrl} onChange={e => setEditLessonUrl(e.target.value)} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required />
                  <input type="number" value={editLessonOrder} onChange={e => setEditLessonOrder(parseInt(e.target.value) || 1)} className="w-[70px] bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none text-center" min={1} required />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-[#C9A84C] text-black border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer">Save</button>
                    <button type="button" onClick={() => setEditingLesson(null)} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-6 py-3 cursor-pointer text-[#888] text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "students" && (
        <div className="grid gap-6">
          <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="text-base font-bold font-['Poppins'] flex items-center gap-2 mb-4"><UserPlus size={16} className="text-[#27ae60]" /> Create Student</h3>
            <form onSubmit={handleCreateStudent} className="grid gap-3">
              <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Full Name</label><input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="John Doe" className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Email</label><input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} placeholder="john@example.com" className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required /></div>
                <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Password</label><input type="password" value={newStudentPass} onChange={e => setNewStudentPass(e.target.value)} placeholder="Min 6 characters" className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none" required /></div>
              </div>
              <button type="submit" disabled={creatingStudent} className="bg-[#27ae60] text-black border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">{creatingStudent ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><UserPlus size={16} /> Create Student</>}</button>
            </form>
          </div>

          <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h3 className="text-base font-bold font-['Poppins'] m-0">Students</h3>
              <div className="ml-auto flex gap-2">
                <input value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }} placeholder="Search by name..." className="bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-[#fff] text-sm outline-none w-[200px]" />
                <button onClick={loadStudents} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 cursor-pointer text-[#888]"><RefreshCw size={14} /></button>
              </div>
            </div>
            {students.length === 0 && studentTotal === 0 ? <p className="text-[#555]">No students yet.</p> : students.length === 0 ? <p className="text-[#555]">No results.</p> : (
              <>
                <div className="grid gap-2">
                  {students.map(s => (
                    editingStudentId === s.id ? (
                      <div key={s.id} className="bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Pencil size={14} className="text-[#C9A84C]" />
                          <h4 className="text-sm font-bold text-[#C9A84C] font-['Poppins']">Edit: {s.name}</h4>
                          <button onClick={() => setEditingStudentId(null)} className="ml-auto bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-1 cursor-pointer text-[#888]"><X size={14} /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="grid gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-1.5">Name</label><input value={editStudentName} onChange={e => setEditStudentName(e.target.value)} placeholder={s.name} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white text-sm outline-none" /></div>
                            <div><label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-1.5">Email</label><input type="email" value={editStudentEmail} onChange={e => setEditStudentEmail(e.target.value)} placeholder={s.email} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white text-sm outline-none" /></div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-1.5">New Password <span className="font-normal text-[#555]">(leave blank to keep)</span></label>
                            <input type="password" value={editStudentPass} onChange={e => setEditStudentPass(e.target.value)} placeholder="Min 6 characters" className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white text-sm outline-none" />
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" disabled={savingStudent} className="bg-[#C9A84C] text-black border-none rounded-lg px-5 py-2 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">{savingStudent ? "Saving..." : "Save"}</button>
                            <button type="button" onClick={() => setEditingStudentId(null)} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-5 py-2 cursor-pointer text-[#888] text-sm">Cancel</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                    <div key={s.id} onClick={() => loadStudentAccess(s.id, s.name)} className={`flex items-center justify-between px-4 py-4 rounded-lg cursor-pointer transition-all ${viewingAccessUserId === s.id ? "bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)]" : "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"}`}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = viewingAccessUserId === s.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)")}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8a6a20] flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                          {s.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{s.name}</div>
                          <div className="text-xs text-[#555]">{s.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button onClick={e => { e.stopPropagation(); startEditStudent(s); }} title="Edit" className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg p-1.5 cursor-pointer text-[#888]"><Pencil size={13} /></button>
                        <Eye size={14} className={viewingAccessUserId === s.id ? "text-[#C9A84C]" : "text-[#555]"} />
                      </div>
                    </div>
                    )))}
                </div>
                <Pagination page={studentPage} totalPages={studentTotalPages} total={studentTotal} limit={studentLimit} onPageChange={setStudentPage} onLimitChange={l => { setStudentLimit(l); setStudentPage(1); }} />
              </>
            )}
          </div>

          {viewingAccessUserId && (
            <div className="bg-[#0f0f0f] border border-[rgba(201,168,76,0.2)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold font-['Poppins'] flex items-center gap-2"><ShieldCheck size={16} className="text-[#C9A84C]" /> {viewingAccessName}</h3>
                <button onClick={() => setViewingAccessUserId(null)} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 cursor-pointer text-[#888]"><X size={14} /></button>
              </div>
              {accessLoading ? <p className="text-[#555]">Loading...</p> : studentAccessList.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[#555] mb-3">No course access yet.</p>
                  <button onClick={() => setActiveSection("access")} className="bg-[#9b59b6] text-white border-none rounded-lg px-5 py-2.5 font-bold text-sm cursor-pointer">Grant Access</button>
                </div>
              ) : (
                <div className="grid gap-2">
                  {studentAccessList.map(a => (
                    <div key={a.courseId} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                      <span className="text-sm font-semibold">{a.courseName}</span>
                      <button onClick={e => { e.stopPropagation(); handleRevokeAccess(a.courseId, a.courseName); }} className="bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.2)] rounded-lg px-3 py-1.5 cursor-pointer text-[#e74c3c] text-xs font-bold">Revoke</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeSection === "access" && (
        <div className="grid gap-6">
          <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h3 className="text-base font-bold font-['Poppins'] flex items-center gap-2 mb-4"><ShieldCheck size={16} className="text-[#9b59b6]" /> Grant Course Access</h3>
            <form onSubmit={handleGrantAccess} className="grid gap-4">
              <div>
                <label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Student</label>
                <UserSearch onSelect={u => setSelectedUserId(u.id)} selectedUserId={selectedUserId} />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-2">Courses <span className="font-normal text-[#555]">(select multiple)</span></label>
                <CourseMultiSelect selectedIds={grantCourseIds} onChange={setGrantCourseIds} placeholder="Search and select courses..." />
              </div>
              <button type="submit" disabled={granting || !selectedUserId || grantCourseIds.length === 0} className="bg-[#9b59b6] text-white border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">{granting ? <><Loader2 size={16} className="animate-spin" /> Granting...</> : <><ShieldCheck size={16} /> Grant Access to {grantCourseIds.length > 0 ? `${grantCourseIds.length} course(s)` : "Course"}</>}</button>
            </form>
          </div>
        </div>
      )}

      {activeSection === "profile" && <ProfileEditor />}
    </DashboardLayout>
  );
}
