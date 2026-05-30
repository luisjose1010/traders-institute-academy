import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { User, Lock, Save, CheckCircle2, AlertCircle } from "lucide-react";

export function ProfileEditor() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !password) return;
    setSaving(true);
    try {
      const data: { name?: string; password?: string } = {};
      if (name) data.name = name;
      if (password) data.password = password;
      await api.auth.updateProfile(data);
      setMsg({ type: "success", text: "Profile updated!" });
      setName("");
      setPassword("");
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update" });
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    padding: "0.65rem 0.9rem", color: "#fff", fontSize: "0.85rem", width: "100%", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.7rem", fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6, display: "block",
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <User size={18} color="#C9A84C" />
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>Profile</h3>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {msg && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.8rem", borderRadius: 8, marginBottom: "1rem",
              background: msg.type === "success" ? "rgba(39,174,96,0.1)" : "rgba(231,76,60,0.1)",
              border: `1px solid ${msg.type === "success" ? "rgba(39,174,96,0.3)" : "rgba(231,76,60,0.3)"}`,
              color: msg.type === "success" ? "#27ae60" : "#e74c3c", fontSize: "0.82rem",
            }}>
              {msg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msg.text}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem", padding: "1rem", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #C9A84C, #8a6a20)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem", fontWeight: 700, color: "#000",
            }}>
              {user?.initials ?? "?"}
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#555" }}>{user?.email}</div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#C9A84C", textTransform: "uppercase", marginTop: 2 }}>{user?.role}</div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={user?.name} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" style={{ ...inputStyle, paddingRight: 36 }} />
                <Lock size={14} color="#555" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>
            <button type="submit" disabled={saving} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#C9A84C", color: "#000", border: "none", borderRadius: 8,
              padding: "0.7rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
              opacity: saving ? 0.6 : 1, transition: "opacity 0.15s",
            }}>
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
