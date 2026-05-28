import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, ShieldCheck, Star } from "lucide-react";

const ticker = [
  { icon: Users, label: "4,500+ Active Traders" },
  { icon: TrendingUp, label: "$50M+ Capital Managed" },
  { icon: ShieldCheck, label: "92% Funded Rate" },
  { icon: Star, label: "4.9/5 Student Rating" },
];

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/75 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-20" />
        <img
          src="/images/hero-bg.png"
          alt="Trading War Room"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/4 blur-[100px] rounded-full pointer-events-none z-10" />

      <div className="container relative z-30 mx-auto px-4 md:px-6 flex-1 flex items-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold tracking-wide">Next cohort opens in 14 days</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.05] text-white font-serif">
              Master the{" "}
              <span className="relative">
                Markets.
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 to-transparent" />
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40">
                Command Your Future.
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Join the elite circle of consistently profitable traders. Institutional-grade strategies, bulletproof risk management, and the psychology of high-performance execution.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <a href="#enroll">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base h-13 px-8 group shadow-[0_0_30px_-8px_hsl(var(--primary))] hover:shadow-[0_0_45px_-8px_hsl(var(--primary))] transition-all duration-300"
                >
                  Begin Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="#modules">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base h-13 px-8 border-border hover:bg-secondary hover:border-primary/30 transition-all duration-300"
                >
                  Explore Curriculum
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Ticker stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {ticker.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5"
      >
        <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-primary/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
