import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileEditor } from "@/components/ProfileEditor";
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
const LEVEL_STYLES: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: "bg-[rgba(39,174,96,0.12)]", text: "text-[#27ae60]" },
  Intermediate: { bg: "bg-[rgba(201,168,76,0.12)]", text: "text-[#C9A84C]" },
  Essential:    { bg: "bg-[rgba(231,76,60,0.12)]", text: "text-[#e74c3c]" },
  Advanced:     { bg: "bg-[rgba(155,89,182,0.12)]", text: "text-[#9b59b6]" },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [progress, setProgress] = useState<Record<number, { total: number; completed: number; percent: number }>>({});
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout activeSection={activeSection} onSection={setActiveSection}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 font-['Poppins']">Welcome back, <span className="text-[#C9A84C]">{user?.name ?? "Student"}</span></h1>
        <p className="text-[#666] m-0 text-sm">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {activeSection === "profile" && <ProfileEditor />}

      {activeSection === "dashboard" && (
        loading ? (
          <div className="text-center py-16 text-[#555]">Loading your courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap size={48} className="text-[#333] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#888] mb-2">No courses yet</h3>
            <p className="text-[#555] text-sm">You haven't been enrolled in any courses yet. Contact your administrator.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5 mb-8">
              <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#555] font-medium">ENROLLED</span>
                  <GraduationCap size={13} className="text-[#C9A84C]" />
                </div>
                <div className="text-2xl font-bold text-[#C9A84C] font-['Poppins']">{courses.length}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold m-0 font-['Poppins']">Your Courses</h2>
                <span className="text-xs text-[#555]">{courses.length} total</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {courses.map((course, i) => { const meta = COURSE_META[course.id] || COURSE_META[1]; const ls = LEVEL_STYLES[meta.level] || LEVEL_STYLES.Beginner; return (
                  <div key={course.id} onClick={() => handleCourseClick(course.id)} className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                    <div className="h-[3px] bg-gradient-to-r from-[#C9A84C] to-[#e8c96a]" />
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3.5">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center flex-shrink-0"><BookOpen size={17} className="text-[#C9A84C]" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold tracking-widest text-[#555]">MOD {String(i + 1).padStart(2, "0")}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ls.bg} ${ls.text}`}>{meta.level.toUpperCase()}</span>
                          </div>
                          <h3 className="m-0 text-sm font-bold text-white leading-tight">{course.name}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-[#777] leading-relaxed mb-4">{course.description}</p>
                      <div className="flex gap-3.5 mb-4"><span className="flex items-center gap-1 text-xs text-[#555]"><Clock size={11} /> {meta.duration}</span></div>
                      {progress[course.id] && progress[course.id].total > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-[#666]">{progress[course.id].completed}/{progress[course.id].total} lessons</span>
                            <span className="text-[10px] text-[#C9A84C] font-semibold">{progress[course.id].percent}%</span>
                          </div>
                          <div className="h-[3px] rounded-sm bg-[rgba(255,255,255,0.06)]">
                            <div className="h-full rounded-sm bg-gradient-to-r from-[#C9A84C] to-[#e8c96a] transition-all duration-500" style={{ width: `${progress[course.id].percent}%`, background: progress[course.id].percent === 100 ? "#27ae60" : undefined }} />
                          </div>
                        </div>
                      )}
                      <button className="flex items-center gap-1 bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-[#C9A84C] rounded-md px-2.5 py-1 text-[10px] font-semibold cursor-pointer"><PlayCircle size={11} /> {progress[course.id]?.percent === 100 ? "Review" : progress[course.id]?.percent > 0 ? "Continue" : "Start Course"}</button>
                    </div>
                  </div>
                ); })}
              </div>
            </div>
          </>
        )
      )}

      {activeSection !== "dashboard" && activeSection !== "profile" && (
        <div className="text-center py-16">
          <Settings size={40} className="text-[#333] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#888] mb-2">Coming soon</h3>
          <p className="text-[#555] text-sm">This section is under development.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
