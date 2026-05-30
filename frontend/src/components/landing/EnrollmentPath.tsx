import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./LoginModal";
import { CheckCircle2, ChevronRight, Clock, Users, Zap, Lock } from "lucide-react";

const included = [
  "All curriculum modules with lifetime access",
  "Live weekly mentorship & Q&A sessions",
  "Private community of serious traders",
  "Proprietary tools, indicators & playbooks",
  "Prop firm preparation & challenge support",
  "Free curriculum updates — forever",
];

const steps = [
  { step: "01", title: "Apply", desc: "Submit your application and trading background. No experience required." },
  { step: "02", title: "Review", desc: "Our team reviews for commitment and coachability — not prior knowledge." },
  { step: "03", title: "Access", desc: "Accepted students receive portal access and immediate course entry." },
];

export function EnrollmentPath() {
  return (
    <section id="enroll" className="py-24 bg-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.04),transparent_60%)]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-primary uppercase mb-4 block">
            Enrollment
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-serif">
            Your Path to Mastery Begins Here.
          </h2>
          <p className="text-muted-foreground text-lg">
            Trading is a profession. Treat it like one. Join the next cohort and begin immediately.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-3xl rounded-3xl" />
            <div className="relative bg-card border border-primary/25 rounded-2xl p-8 shadow-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide mb-6">
                <Zap className="w-3 h-3" />
                MOST POPULAR
              </div>

              <h3 className="text-2xl font-bold mb-2 font-serif">Full Access</h3>
              <p className="text-muted-foreground text-sm mb-6">Complete program — everything you need to go from beginner to funded.</p>

              <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-border">
                <span className="text-5xl font-bold tracking-tighter font-serif">$2,995</span>
                <div>
                  <div className="text-muted-foreground text-sm">USD</div>
                  <div className="text-primary text-xs font-semibold">Lifetime access</div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {included.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <LoginModal>
                <Button size="lg" className="w-full h-13 text-base group shadow-[0_0_25px_-8px_hsl(var(--primary))] hover:shadow-[0_0_40px_-8px_hsl(var(--primary))] transition-all">
                  Secure Your Spot
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </LoginModal>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure checkout</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Limited seats</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 14-day guarantee</span>
              </div>
            </div>
          </motion.div>

          {/* Application process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col justify-center"
          >
            <h3 className="text-xl font-bold mb-8 font-serif">How It Works</h3>
            <div className="space-y-0">
              {steps.map((item, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-primary text-sm border border-primary/20 shrink-0">
                      {item.step}
                    </div>
                    {i !== steps.length - 1 && (
                      <div className="w-px flex-1 bg-border my-2 min-h-[32px]" />
                    )}
                  </div>
                  <div className={`pb-8 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                    <h4 className="font-bold text-base mb-1">{item.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-primary/5 border border-primary/15 rounded-xl p-5">
              <div className="text-sm font-semibold mb-1 text-primary">14-Day Money-Back Guarantee</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Not satisfied in the first 14 days? We'll refund your investment, no questions asked. We stand behind our curriculum completely.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
