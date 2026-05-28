import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-28 relative overflow-hidden border-t border-border">
      {/* Background effects */}
      <div className="absolute inset-0 bg-primary/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-primary/8 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container relative z-10 mx-auto px-4 md:px-6 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Icon */}
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 items-center justify-center mb-8">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-serif leading-tight">
            The Market Is Open.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
              Are You Ready?
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Start executing. Join the ranks of traders who treat this as a profession — and are paid like it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#enroll">
              <Button
                size="lg"
                className="h-14 text-lg px-12 group shadow-[0_0_40px_-8px_hsl(var(--primary))] hover:shadow-[0_0_60px_-8px_hsl(var(--primary))] transition-all duration-300"
              >
                Apply for Next Cohort
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#modules">
              <Button
                size="lg"
                variant="ghost"
                className="h-14 text-base px-8 text-muted-foreground hover:text-foreground"
              >
                View Curriculum
              </Button>
            </a>
          </div>

          <p className="mt-8 text-xs text-muted-foreground/50 tracking-wide">
            14-day money-back guarantee · Lifetime access · Limited seats per cohort
          </p>
        </motion.div>
      </div>
    </section>
  );
}
