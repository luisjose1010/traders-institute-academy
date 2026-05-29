import { useState } from "react";
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
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPasswordModal({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setEmail(""); setError(""); setSent(false); }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) handleClose(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] bg-[#0f0f0f] border-[rgba(255,255,255,0.1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-center" style={{ fontFamily: "Poppins, sans-serif" }}>
            {sent ? "Check Your Email" : "Reset Password"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center text-sm">
            {sent
              ? `We sent a password reset link to ${email}. It expires in 1 hour.`
              : "Enter your email and we'll send you a reset link."}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 mt-4">
            <CheckCircle2 size={48} className="text-[#27ae60]" />
            <p className="text-sm text-center text-muted-foreground">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <Button variant="ghost" onClick={handleClose} className="text-sm">
              <ArrowLeft size={14} className="mr-2" /> Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {error && (
              <div className="flex items-center gap-2 text-sm text-[#e74c3c] bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.2)] rounded-lg px-3 py-2">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-xs font-semibold tracking-wider uppercase text-[#888]">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Button type="button" variant="ghost" onClick={handleClose} className="text-sm text-muted-foreground">
                <ArrowLeft size={14} className="mr-2" /> Back to Sign In
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
