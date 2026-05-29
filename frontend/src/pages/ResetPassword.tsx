import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("No reset token found. Please use the link from your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password. The link may have expired.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "2rem", maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img src="/traders-logo.png" alt="TIA" style={{ height: 40, marginBottom: 16 }} />
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 8px", fontFamily: "Poppins, sans-serif" }}>
            {success ? "Password Reset!" : "Set New Password"}
          </h1>
          <p style={{ color: "#666", fontSize: "0.85rem", margin: 0 }}>
            {success ? "Your password has been updated." : "Enter your new password below."}
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <CheckCircle2 size={48} color="#27ae60" style={{ marginBottom: 16 }} />
            <Button onClick={() => navigate("/")} style={{ background: "#C9A84C", color: "#000", width: "100%", height: 44, fontWeight: 700 }}>
              Go to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.8rem", borderRadius: 8, background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", color: "#e74c3c", fontSize: "0.82rem" }}>
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div>
              <Label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase", marginBottom: 6, display: "block" }}>New Password</Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.1)", height: 44 }}
              />
            </div>

            <div>
              <Label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.1)", height: 44 }}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              style={{ background: "#C9A84C", color: "#000", width: "100%", height: 44, fontWeight: 700, fontSize: "0.9rem" }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>

            <div style={{ textAlign: "center" }}>
              <button type="button" onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#C9A84C", cursor: "pointer", fontSize: "0.82rem" }}>
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
