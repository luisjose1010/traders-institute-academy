import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { X, Pencil, ShieldCheck, UserPlus, Check, Loader2 } from "lucide-react";

interface Student { id: string; name: string; email: string; role: string; }
interface CourseAccess { courseId: number; courseName: string; }
interface Course { id: number; name: string; description: string; status: string; }

type ModalTab = "info" | "courses";

export function StudentEditorModal({
  student,
  onClose,
  onRefresh,
}: {
  student: Student;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<ModalTab>("info");
  const [accessList, setAccessList] = useState<CourseAccess[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Info form state
  const [editName, setEditName] = useState(student.name);
  const [editEmail, setEditEmail] = useState(student.email);
  const [editPass, setEditPass] = useState("");
  const [saving, setSaving] = useState(false);

  // Pending operations for optimistic rollback
  const [pendingGrants, setPendingGrants] = useState<Set<number>>(new Set());
  const [pendingRevokes, setPendingRevokes] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      api.admin.getStudentAccess(student.id),
      api.admin.getAllCourses({ limit: 50 }),
    ]).then(([access, courses]) => {
      setAccessList(access);
      setAllCourses(courses.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [student.id]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName && !editEmail && !editPass) return;
    setSaving(true);
    try {
      const data: { name?: string; email?: string; password?: string } = {};
      if (editName) data.name = editName;
      if (editEmail) data.email = editEmail;
      if (editPass) data.password = editPass;
      await api.admin.updateUser(student.id, data);
      onRefresh();
      setEditPass("");
    } catch {
      // revert on error
    }
    setSaving(false);
  };

  const handleGrant = async (courseId: number, courseName: string) => {
    // Optimistic: add immediately
    setAccessList(prev => [...prev, { courseId, courseName }]);
    setPendingGrants(prev => new Set(prev).add(courseId));
    try {
      await api.admin.grantAccess({ userId: student.id, courseId });
      setPendingGrants(prev => { const n = new Set(prev); n.delete(courseId); return n; });
    } catch {
      // Rollback
      setAccessList(prev => prev.filter(a => a.courseId !== courseId));
      setPendingGrants(prev => { const n = new Set(prev); n.delete(courseId); return n; });
    }
  };

  const handleRevoke = async (courseId: number, courseName: string) => {
    if (!confirm(`Revoke "${courseName}"?`)) return;
    // Optimistic: remove immediately
    setAccessList(prev => prev.filter(a => a.courseId !== courseId));
    setPendingRevokes(prev => new Set(prev).add(courseId));
    try {
      await api.admin.revokeAccess({ userId: student.id, courseId });
      setPendingRevokes(prev => { const n = new Set(prev); n.delete(courseId); return n; });
    } catch {
      // Rollback
      setAccessList(prev => [...prev, { courseId, courseName }]);
      setPendingRevokes(prev => { const n = new Set(prev); n.delete(courseId); return n; });
    }
  };

  const availableCourses = allCourses.filter(
    c => c.status === "active" && !accessList.find(a => a.courseId === c.id)
  );

  const initials = student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8a6a20] flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold font-['Poppins'] truncate">{student.name}</div>
            <div className="text-xs text-[#555] truncate">{student.email}</div>
          </div>
          <button onClick={onClose} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg p-1.5 cursor-pointer text-[#888] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-b-2 transition-colors ${
              tab === "info"
                ? "border-[#C9A84C] text-[#C9A84C]"
                : "border-transparent text-[#555] hover:text-[#888]"
            }`}
          >
            <span className="flex items-center justify-center gap-2"><Pencil size={14} /> Info</span>
          </button>
          <button
            onClick={() => setTab("courses")}
            className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-b-2 transition-colors ${
              tab === "courses"
                ? "border-[#C9A84C] text-[#C9A84C]"
                : "border-transparent text-[#555] hover:text-[#888]"
            }`}
          >
            <span className="flex items-center justify-center gap-2"><ShieldCheck size={14} /> Courses ({accessList.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "info" ? (
            <form onSubmit={handleSaveInfo} className="grid gap-4">
              <div>
                <label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-1.5">Full Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder={student.name} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[rgba(201,168,76,0.3)]" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-1.5">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder={student.email} className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[rgba(201,168,76,0.3)]" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wide text-[#999] uppercase mb-1.5">New Password <span className="font-normal text-[#555]">(leave blank to keep)</span></label>
                <input type="password" value={editPass} onChange={e => setEditPass(e.target.value)} placeholder="Min 6 characters" className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[rgba(201,168,76,0.3)]" />
              </div>
              <button type="submit" disabled={saving || (!editName && !editEmail && !editPass)} className="bg-[#C9A84C] text-black border-none rounded-lg px-6 py-3 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Pencil size={16} /> Save Changes</>}
              </button>
            </form>
          ) : (
            <div className="grid gap-4">
              {/* Current access */}
              {loading ? (
                <p className="text-[#555] text-sm text-center py-4">Loading...</p>
              ) : accessList.length === 0 ? (
                <div className="text-center py-6">
                  <ShieldCheck size={24} className="text-[#555] mx-auto mb-2" />
                  <p className="text-[#555] text-sm">No course access yet.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {accessList.map(a => {
                    const pending = pendingRevokes.has(a.courseId);
                    return (
                      <div key={a.courseId} className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${pending ? "opacity-40 border-[rgba(231,76,60,0.1)]" : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.04)]"}`}>
                        <span className="text-sm font-semibold">{a.courseName}</span>
                        <button
                          onClick={() => handleRevoke(a.courseId, a.courseName)}
                          disabled={pending}
                          className="bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.2)] rounded-lg px-3 py-1.5 cursor-pointer text-[#e74c3c] text-xs font-bold hover:bg-[rgba(231,76,60,0.2)] transition-colors disabled:opacity-50"
                        >
                          {pending ? "..." : "Revoke"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Grant new access */}
              {availableCourses.length > 0 && (
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <h4 className="text-xs font-bold tracking-wide text-[#999] uppercase mb-3 flex items-center gap-2">
                    <UserPlus size={14} className="text-[#27ae60]" /> Grant Access
                  </h4>
                  <div className="grid gap-1.5 max-h-[200px] overflow-y-auto">
                    {availableCourses.map(c => {
                      const pending = pendingGrants.has(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleGrant(c.id, c.name)}
                          disabled={pending}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-[rgba(255,255,255,0.04)] transition-colors disabled:opacity-50"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${pending ? "bg-[#27ae60] border-[#27ae60]" : "border-[rgba(255,255,255,0.2)]"}`}>
                            {pending && <Check size={10} className="text-black" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{c.name}</div>
                            <div className="text-xs text-[#555] truncate">{c.description.slice(0, 60)}</div>
                          </div>
                          <span className={`text-xs font-bold ${pending ? "text-[#555]" : "text-[#27ae60]"}`}>
                            {pending ? "..." : "Grant"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
