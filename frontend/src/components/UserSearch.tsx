import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Search, X, User } from "lucide-react";

interface UserItem { id: string; name: string; email: string; role: string; }

export function UserSearch({ onSelect, selectedUserId, placeholder }: {
  onSelect: (user: UserItem) => void;
  selectedUserId?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [filtered, setFiltered] = useState<UserItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    api.admin.getAllUsers({ limit: 50, role: "student" }).then(d => { setUsers(d.items); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered(users.filter(u => u.role === "student").slice(0, 10)); return; }
    const q = query.toLowerCase();
    setFiltered(users.filter(u => u.role === "student" && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))).slice(0, 10));
  }, [query, users]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {selectedUser ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.9rem", borderRadius: 8, background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #8a6a20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "#000" }}>
            {selectedUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{selectedUser.name}</div>
            <div style={{ fontSize: "0.72rem", color: "#555" }}>{selectedUser.email}</div>
          </div>
          <button onClick={() => { onSelect({ id: "", name: "", email: "", role: "" }); setQuery(""); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={14} /></button>
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555" }} />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder || "Search students by name or email..."}
              style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.65rem 0.9rem 0.65rem 2.2rem", color: "#fff", fontSize: "0.85rem", width: "100%", outline: "none" }}
            />
          </div>
          {open && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, maxHeight: 240, overflow: "auto", zIndex: 50, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
              {loading ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "#555", fontSize: "0.82rem" }}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "#555", fontSize: "0.82rem" }}>No students found</div>
              ) : (
                filtered.map(u => (
                  <button key={u.id} onClick={() => { onSelect(u); setOpen(false); setQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "0.7rem 0.9rem", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", textAlign: "left" as const, color: "#fff", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C, #8a6a20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "#000", flexShrink: 0 }}>
                      {u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#555" }}>{u.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
