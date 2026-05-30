import { Twitter, Youtube, Instagram, MessageCircle } from "lucide-react";
import { LoginModal } from "./LoginModal";
import { Button } from "@/components/ui/button";

const socials = [
  { icon: Twitter, label: "Twitter / X", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: MessageCircle, label: "Discord", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-14 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-10 md:gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/traders-logo.png" alt="Traders Institute Academy" className="h-9 w-auto mb-4" />
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">
              Forging elite traders through institutional-grade education, rigorous risk management, and an unparalleled community of serious operators.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border hover:border-primary/30 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-muted-foreground">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Curriculum", href: "#modules" },
                { label: "Results", href: "#proof" },
                { label: "Enrollment", href: "#enroll" },
                { label: "FAQ", href: "#faq" },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <LoginModal>
                  <Button variant="link" className="text-sm text-muted-foreground hover:text-primary transition-colors p-0 h-auto">
                    Student Login
                  </Button>
                </LoginModal>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-muted-foreground">Legal</h4>
            <ul className="space-y-2.5">
              {["Terms of Service", "Privacy Policy", "Risk Disclaimer", "Cookie Policy"].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Traders Institute Academy. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground/50 max-w-xl md:text-right leading-relaxed">
            Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. Please consider your risk tolerance carefully.
          </div>
        </div>
      </div>
    </footer>
  );
}
