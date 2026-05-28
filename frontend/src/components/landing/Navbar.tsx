import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/traders-logo.png" alt="Traders Institute Academy" className="h-8 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#modules" className="text-muted-foreground hover:text-foreground transition-colors">
            Curriculum
          </a>
          <a href="#proof" className="text-muted-foreground hover:text-foreground transition-colors">
            Results
          </a>
          <a href="#enroll" className="text-muted-foreground hover:text-foreground transition-colors">
            Admissions
          </a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 text-primary"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard size={15} />
                My Courses
              </Button>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #8a6a20)" }}
                >
                  {user?.initials}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <LoginModal>
                <Button variant="ghost" className="hidden md:flex">
                  Sign In
                </Button>
              </LoginModal>
              <a href="#enroll">
                <Button>Enroll Now</Button>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
