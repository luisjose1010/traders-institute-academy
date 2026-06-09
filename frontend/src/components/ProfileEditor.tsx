import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { User, Lock, Save, CheckCircle2, AlertCircle } from "lucide-react";

export function ProfileEditor() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !password) return;
    const newName = name; const newPass = password;
    setName(""); setPassword("");
    setSaving(true);
    setMsg({ type: "success", text: "Profile updated!" });
    try {
      const data: { name?: string; password?: string } = {};
      if (newName) data.name = newName;
      if (newPass) data.password = newPass;
      const updatedUser = await api.auth.updateProfile(data);
      updateUser(updatedUser);
    } catch (err: unknown) {
      setName(newName); setPassword(newPass);
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update" });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-[#0f0f0f] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
          <User size={18} className="text-[#C9A84C]" />
          <h3 className="text-base font-bold font-['Poppins']">Profile</h3>
        </div>

        <div className="p-6">
          {msg && (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4 text-sm ${
              msg.type === "success"
                ? "bg-[rgba(39,174,96,0.1)] border border-[rgba(39,174,96,0.3)] text-[#27ae60]"
                : "bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.3)] text-[#e74c3c]"
            }`}>
              {msg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {msg.text}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8a6a20] flex items-center justify-center text-sm font-bold text-black flex-shrink-0">
              {user?.initials ?? "?"}
            </div>
            <div>
              <div className="text-base font-semibold">{user?.name}</div>
              <div className="text-sm text-[#555]">{user?.email}</div>
              <div className="text-xs font-bold text-[#C9A84C] uppercase mt-0.5">{user?.role}</div>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#888] uppercase mb-1.5">Display Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={user?.name}
                  className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[rgba(201,168,76,0.3)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#888] uppercase mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-[#080808] border border-[rgba(255,255,255,0.1)] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white outline-none focus:border-[rgba(201,168,76,0.3)] transition-colors"
                  />
                  <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555]" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#C9A84C] text-black border-none rounded-lg py-2.5 font-bold text-sm cursor-pointer disabled:opacity-60 transition-opacity"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
