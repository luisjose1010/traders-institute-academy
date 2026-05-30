import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import {
  LogOut, LayoutDashboard, GraduationCap, Users, ShieldCheck,
  Menu, X, User, ArrowLeft
} from "lucide-react";

const studentNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: GraduationCap },
  { id: "profile", label: "Profile", icon: User },
];

const adminNav = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "students", label: "Students", icon: Users },
  { id: "access", label: "Grant Access", icon: ShieldCheck },
  { id: "profile", label: "Profile", icon: User },
];

export function DashboardLayout({ children, activeSection, onSection, title, onBack }: {
  children: React.ReactNode;
  activeSection: string;
  onSection: (s: string) => void;
  title?: string;
  onBack?: () => void;
}) {
  const { user, isAdmin, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = isAdmin ? adminNav : studentNav;
  const accentColor = isAdmin ? "#e74c3c" : "#C9A84C";
  const accentBg = isAdmin ? "rgba(231,76,60,0.1)" : "rgba(201,168,76,0.1)";
  const accentBorder = isAdmin ? "rgba(231,76,60,0.2)" : "rgba(201,168,76,0.2)";

  const handleLogout = () => { logout(); navigate("/"); };

  const sectionTitle = title ?? navItems.find(n => n.id === activeSection)?.label ?? activeSection;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[240px] bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.06)] flex flex-col transition-transform duration-250 ease ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/traders-logo.png" alt="TIA" style={{ height: 30, cursor: "pointer" }} onClick={() => { onSection("dashboard"); navigate("/dashboard"); }} />
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div style={{ padding: "0.75rem 1.5rem" }}>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", color: accentColor, textTransform: "uppercase" as const }}>
            {isAdmin ? "Admin Panel" : "Student Portal"}
          </span>
        </div>
        <nav style={{ flex: 1, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column" as const, gap: 2 }}>
          {navItems.map(item => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { onSection(item.id); setSidebarOpen(false); navigate("/dashboard"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", borderRadius: 8, background: active ? accentBg : "transparent", border: active ? `1px solid ${accentBorder}` : "1px solid transparent", color: active ? accentColor : "#777", fontSize: "0.9rem", fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left" as const, width: "100%", transition: "all 0.15s" }}>
                <Icon size={18} />{item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: isAdmin ? "linear-gradient(135deg, #e74c3c, #c0392b)" : "linear-gradient(135deg, #C9A84C, #8a6a20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: isAdmin ? "#fff" : "#000" }}>{user?.initials ?? "?"}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user?.name ?? "User"}</div>
              <div style={{ fontSize: "0.62rem", color: accentColor, fontWeight: 700 }}>{user?.role?.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "0.75rem 1rem", borderRadius: 8, background: "none", border: "none", color: "#666", fontSize: "0.85rem", cursor: "pointer" }}><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }} className="md:ml-[240px]">
        <header style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 1.5rem", background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", position: "sticky" as const, top: 0, zIndex: 20, gap: 8 }}>
          <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", padding: 4 }}><Menu size={22} /></button>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem" }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ccc" }}>{sectionTitle}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <NotificationBell />
            {isAdmin && <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#e74c3c", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", padding: "3px 8px", borderRadius: 4 }}>ADMIN</span>}
          </div>
        </header>
        <main style={{ padding: "1.5rem 2rem" }} className="md:ml-[240px]">
          {children}
        </main>
      </div>
    </div>
  );
}
