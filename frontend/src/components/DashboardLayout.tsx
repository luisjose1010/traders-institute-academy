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
  const accentBg = isAdmin ? "bg-[rgba(231,76,60,0.1)]" : "bg-[rgba(201,168,76,0.1)]";
  const accentBorder = isAdmin ? "border-[rgba(231,76,60,0.2)]" : "border-[rgba(201,168,76,0.2)]";

  const handleLogout = () => { logout(); navigate("/"); };

  const sectionTitle = title ?? navItems.find(n => n.id === activeSection)?.label ?? activeSection;

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 bottom-0 z-40 w-[240px] glass-panel border-r border-white/5 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.8)] flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
          <img src="/traders-logo.png" alt="TIA" className="h-[30px] cursor-pointer" onClick={() => { onSection("dashboard"); navigate("/dashboard"); }} />
          <button onClick={() => setSidebarOpen(false)} className="md:hidden bg-none border-none text-[#666] cursor-pointer"><X size={18} /></button>
        </div>
        <div className="px-6 py-3">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: accentColor }}>
            {isAdmin ? "Admin Panel" : "Student Portal"}
          </span>
        </div>
        <nav className="flex-1 py-2 px-3 flex flex-col gap-0.5">
          {navItems.map(item => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { onSection(item.id); setSidebarOpen(false); navigate("/dashboard"); }} className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-left w-full transition-all text-sm ${active ? `${accentBg} border ${accentBorder} font-semibold` : "bg-transparent border border-transparent font-normal"} `} style={{ color: active ? accentColor : "#777" }}>
                <Icon size={18} />{item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.06)]">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-none border-none text-[#555] text-xs cursor-pointer hover:text-[#888] transition-colors">
            <ArrowLeft size={14} /> Back to site
          </button>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl glass-card mb-2 hover:bg-white/[0.04] transition-colors cursor-default">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: isAdmin ? "linear-gradient(135deg, #e74c3c, #c0392b)" : "linear-gradient(135deg, #C9A84C, #8a6a20)", color: isAdmin ? "#fff" : "#000" }}>{user?.initials ?? "?"}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#ddd] overflow-hidden text-ellipsis whitespace-nowrap">{user?.name ?? "User"}</div>
              <div className="text-[10px] font-bold" style={{ color: accentColor }}>{user?.role?.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 rounded-lg bg-none border-none text-[#666] text-sm cursor-pointer"><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>

      <div className="md:ml-[240px]">
        <header className="h-[64px] border-b border-white/5 flex items-center px-6 glass-panel sticky top-0 z-20 gap-3 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.8)]">
          <button className="md:hidden bg-none border-none text-[#888] cursor-pointer p-1" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          {onBack && (
            <button onClick={onBack} className="bg-none border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 cursor-pointer text-[#888] flex items-center gap-1 text-xs">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <span className="text-sm font-semibold text-[#ccc]">{sectionTitle}</span>
          <div className="flex items-center gap-2 ml-auto">
            <NotificationBell />
            {isAdmin && <span className="text-[10px] font-bold text-[#e74c3c] bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.2)] px-2 py-0.5 rounded">ADMIN</span>}
          </div>
        </header>
        <main className="px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
