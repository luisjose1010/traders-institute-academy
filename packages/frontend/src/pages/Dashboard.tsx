import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { COURSES, LEVEL_COLORS } from "@/data/courses";
import {
  Clock, BookOpen, LogOut, PlayCircle, Lock, CheckCircle2,
  Bell, LayoutDashboard, GraduationCap, User, Settings,
  ChevronRight, TrendingUp, Award, Flame, Menu, X
} from "lucide-react";

const PROGRESS: Record<string, number> = {
  "course-foundations": 100,
  "course-technical-analysis": 45,
  "course-risk-management": 0,
  "course-advanced-strategies": 0,
};

const SORTED = [...COURSES].sort((a, b) => a.order - b.order);

function Sidebar({ open, onClose, onLogout, user, activeSection, onSection }: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: { name: string; email: string; initials: string } | null;
  activeSection: string;
  onSection: (s: string) => void;
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: GraduationCap },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        style={{
          width: 240,
          background: "#0a0a0a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column" as const,
          position: "fixed" as const,
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
        className="md:translate-x-0"
      >
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/traders-logo.png" alt="TIA" style={{ height: 30, width: "auto" }} />
          <button onClick={onClose} className="md:hidden" style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {/* Label */}
        <div style={{ padding: "0.75rem 1.5rem" }}>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", color: "#C9A84C", textTransform: "uppercase" as const }}>
            Student Portal
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {navItems.map(item => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onSection(item.id); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "0.65rem 0.9rem", borderRadius: 8,
                  background: active ? "rgba(201,168,76,0.1)" : "transparent",
                  border: active ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
                  color: active ? "#C9A84C" : "#777",
                  fontSize: "0.85rem", fontWeight: active ? 600 : 400,
                  cursor: "pointer", textAlign: "left" as const, width: "100%",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#ccc"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#777"; } }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.65rem 0.9rem", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #C9A84C, #8a6a20)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem", fontWeight: 700, color: "#000",
            }}>
              {user?.initials ?? "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user?.name ?? "Student"}</div>
              <div style={{ fontSize: "0.7rem", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "0.6rem 0.9rem", borderRadius: 8,
              background: "none", border: "none",
              color: "#666", fontSize: "0.82rem", cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e74c3c")}
            onMouseLeave={e => (e.currentTarget.style.color = "#666")}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function CourseCard({ course, index }: { course: typeof COURSES[0]; index: number }) {
  const progress = PROGRESS[course.id] ?? 0;
  const isLocked = index > 0 && PROGRESS[SORTED[index - 1].id] < 100;
  const isCompleted = progress === 100;
  const isActive = !isLocked && !isCompleted && progress > 0;
  const levelStyle = LEVEL_COLORS[course.level];
  const Icon = course.icon;

  return (
    <div
      style={{
        background: "#0f0f0f",
        border: `1px solid ${isActive ? "rgba(201,168,76,0.35)" : isCompleted ? "rgba(39,174,96,0.2)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14,
        overflow: "hidden",
        opacity: isLocked ? 0.45 : 1,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: isLocked ? "not-allowed" : "pointer",
        position: "relative" as const,
      }}
      onMouseEnter={e => { if (!isLocked) { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      {/* Color band top */}
      <div style={{ height: 3, background: isCompleted ? "#27ae60" : isActive ? "linear-gradient(90deg, #C9A84C, #e8c96a)" : "rgba(255,255,255,0.05)" }} />

      <div style={{ padding: "1.25rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "0.9rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: isCompleted ? "rgba(39,174,96,0.1)" : "rgba(201,168,76,0.1)",
            border: `1px solid ${isCompleted ? "rgba(39,174,96,0.25)" : "rgba(201,168,76,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isLocked ? <Lock size={17} color="#444" /> : isCompleted ? <CheckCircle2 size={17} color="#27ae60" /> : <Icon size={17} color="#C9A84C" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "#555" }}>
                MOD {String(course.order).padStart(2, "0")}
              </span>
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em",
                padding: "1px 6px", borderRadius: 3,
                background: levelStyle.bg, color: levelStyle.text,
              }}>
                {course.level.toUpperCase()}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
              {course.title}
            </h3>
          </div>
          {isActive && (
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", boxShadow: "0 0 8px #C9A84C", flexShrink: 0, marginTop: 3 }} />
          )}
        </div>

        <p style={{ fontSize: "0.8rem", color: "#777", lineHeight: 1.6, marginBottom: "1rem" }}>
          {course.description}
        </p>

        {/* Meta */}
        <div style={{ display: "flex", gap: 14, marginBottom: "1rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#555" }}>
            <Clock size={11} /> {course.duration}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#555" }}>
            <BookOpen size={11} /> {course.lessonsCount} lessons
          </span>
        </div>

        {/* Progress / CTA */}
        {isLocked ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#444" }}>
            <Lock size={11} /> Complete previous module to unlock
          </div>
        ) : (
          <>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 8 }}>
              <div style={{
                height: "100%", borderRadius: 3,
                background: isCompleted ? "#27ae60" : "linear-gradient(90deg, #C9A84C, #e8c96a)",
                width: `${progress}%`,
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: isCompleted ? "#27ae60" : "#666" }}>
                {isCompleted ? "✓ Completed" : progress > 0 ? `${progress}%` : "Not started"}
              </span>
              {!isCompleted && (
                <button style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)",
                  color: "#C9A84C", borderRadius: 6, padding: "4px 10px",
                  fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                }}>
                  <PlayCircle size={11} /> {progress > 0 ? "Continue" : "Start"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogout = () => { logout(); navigate("/"); };

  const completedCount = SORTED.filter(c => PROGRESS[c.id] === 100).length;
  const inProgressCount = SORTED.filter(c => PROGRESS[c.id] > 0 && PROGRESS[c.id] < 100).length;
  const totalProgress = Math.round(SORTED.reduce((s, c) => s + (PROGRESS[c.id] ?? 0), 0) / SORTED.length);
  const nextCourse = SORTED.find(c => (PROGRESS[c.id] ?? 0) < 100 && (SORTED.indexOf(c) === 0 || PROGRESS[SORTED[SORTED.indexOf(c) - 1].id] === 100));
  const NextIcon = nextCourse?.icon;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex" }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
        activeSection={activeSection}
        onSection={setActiveSection}
      />

      {/* Main area, pushed right on md+ */}
      <div style={{ flex: 1, minWidth: 0 }} className="md:ml-[240px]">
        {/* Top bar */}
        <header style={{
          height: 60,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem",
          background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)",
          position: "sticky" as const, top: 0, zIndex: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ background: "none", border: "none", color: "#888", cursor: "pointer", padding: 4 }}
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#888", textTransform: "capitalize" as const }}>
              {activeSection}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{
              background: "none", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#666",
              position: "relative" as const,
            }}>
              <Bell size={16} />
              <span style={{
                position: "absolute" as const, top: 4, right: 4, width: 5, height: 5,
                borderRadius: "50%", background: "#C9A84C",
              }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A84C, #8a6a20)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700, color: "#000",
              }}>
                {user?.initials ?? "U"}
              </div>
              <span style={{ fontSize: "0.83rem", color: "#ccc", fontWeight: 500 }}>{user?.name}</span>
            </div>
          </div>
        </header>

        <main style={{ padding: "2rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
          {/* Welcome row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" as const }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px", fontFamily: "Poppins, sans-serif" }}>
                Welcome back, <span style={{ color: "#C9A84C" }}>{user?.name ?? "Student"}</span>
              </h1>
              <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {nextCourse && NextIcon && (
              <button style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.06))",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: 10, padding: "0.75rem 1rem",
                cursor: "pointer", color: "#fff", textAlign: "left" as const,
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <NextIcon size={16} color="#C9A84C" />
                </div>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "#C9A84C", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 1 }}>CONTINUE LEARNING</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{nextCourse.title}</div>
                </div>
                <ChevronRight size={14} color="#C9A84C" />
              </button>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.875rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Modules", value: SORTED.length, icon: GraduationCap, color: "#C9A84C" },
              { label: "Completed", value: completedCount, icon: CheckCircle2, color: "#27ae60" },
              { label: "In Progress", value: inProgressCount, icon: Flame, color: "#C9A84C" },
              { label: "Overall Progress", value: `${totalProgress}%`, icon: TrendingUp, color: "#C9A84C" },
            ].map(stat => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} style={{
                  background: "#0f0f0f",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "1.1rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.7rem", color: "#555", fontWeight: 500, letterSpacing: "0.04em" }}>
                      {stat.label.toUpperCase()}
                    </span>
                    <StatIcon size={13} color={stat.color} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color, fontFamily: "Poppins, sans-serif", lineHeight: 1 }}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{
            background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "1.25rem", marginBottom: "2rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={15} color="#C9A84C" />
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Program Progress</span>
              </div>
              <span style={{ color: "#C9A84C", fontWeight: 700, fontSize: "0.9rem" }}>{totalProgress}%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
              <div style={{
                height: "100%", borderRadius: 3,
                background: "linear-gradient(90deg, #C9A84C, #e8c96a)",
                width: `${totalProgress}%`,
                transition: "width 1s ease",
                boxShadow: "0 0 10px rgba(201,168,76,0.4)",
              }} />
            </div>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: 10 }}>
              <span style={{ fontSize: "0.72rem", color: "#27ae60", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={11} /> {completedCount} completed
              </span>
              {inProgressCount > 0 && (
                <span style={{ fontSize: "0.72rem", color: "#C9A84C", display: "flex", alignItems: "center", gap: 4 }}>
                  <Flame size={11} /> {inProgressCount} in progress
                </span>
              )}
              <span style={{ fontSize: "0.72rem", color: "#555" }}>
                {SORTED.length - completedCount - inProgressCount} locked
              </span>
            </div>
          </div>

          {/* Courses */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, fontFamily: "Poppins, sans-serif" }}>
                Your Modules
              </h2>
              <span style={{ fontSize: "0.75rem", color: "#555" }}>{SORTED.length} total</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {SORTED.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
