import { motion } from "framer-motion";
import { Target, Zap, Shield, Trophy, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Institutional Perspective",
    description: "Stop trading retail. We teach you to identify liquidity pools, algorithmic footprints, and smart money concepts that move the market.",
    icon: Target,
    number: "01",
  },
  {
    title: "Execution Precision",
    description: "Millisecond advantages matter. Learn professional order routing, slippage reduction, and platform mastery used by institutional desks.",
    icon: Zap,
    number: "02",
  },
  {
    title: "Capital Preservation",
    description: "The house edge. We drill strict risk parameters, daily loss limits, and portfolio volatility management that keep you in the game long-term.",
    icon: Shield,
    number: "03",
  },
  {
    title: "Performance Psychology",
    description: "Master your mind. Overcome FOMO, revenge trading, and emotional drawdowns through structured mental frameworks and discipline systems.",
    icon: Trophy,
    number: "04",
  },
];

export function TheEdge() {
  return (
    <section className="py-24 bg-secondary/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/4 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-primary/3 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs font-bold tracking-widest text-primary uppercase mb-4 block">
            What Sets Us Apart
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 font-serif">
            The Traders Institute Edge
          </h2>
          <p className="text-xl text-muted-foreground">
            We don't teach patterns. We teach market mechanics. Understand why price moves, and you'll never need to guess where it's going.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/40 font-mono">
                    {feature.number}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2.5 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
