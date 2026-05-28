import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle } from "lucide-react";

export function LoginModal({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      setOpen(false);
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setError(""); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] bg-[#0f0f0f] border-[rgba(255,255,255,0.1)]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <img src="/traders-logo.png" alt="Traders Institute Academy" className="h-10 w-auto" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-center" style={{ fontFamily: "Poppins, sans-serif" }}>
            Student Portal
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center text-sm">
            Sign in to access your courses and progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="flex items-center gap-2 text-sm text-[#e74c3c] bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.2)] rounded-lg px-3 py-2">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="modal-email" className="text-xs font-semibold tracking-wider uppercase text-[#888]">Email</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="bg-[#080808] border-[rgba(255,255,255,0.1)] focus:border-[#C9A84C] focus:ring-[#C9A84C] h-11"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-password" className="text-xs font-semibold tracking-wider uppercase text-[#888]">Password</Label>
              <button type="button" className="text-xs text-[#C9A84C] hover:underline">Forgot?</button>
            </div>
            <Input
              id="modal-password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="bg-[#080808] border-[rgba(255,255,255,0.1)] focus:border-[#C9A84C] focus:ring-[#C9A84C] h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-semibold text-sm tracking-wide"
            style={{ background: "#C9A84C", color: "#000" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : "Sign In"}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-1">
            Not enrolled?{" "}
            <a
              href="#enroll"
              className="text-[#C9A84C] hover:underline"
              onClick={() => setOpen(false)}
            >
              Apply now
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
