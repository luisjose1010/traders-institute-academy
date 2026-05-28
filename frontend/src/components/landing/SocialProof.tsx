import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const stats = [
  { value: "$50M+", label: "Student Capital Managed" },
  { value: "4,500+", label: "Active Traders" },
  { value: "92%", label: "Funded Rate" },
  { value: "4.9/5", label: "Average Rating" },
];

const testimonials = [
  {
    quote: "Traders Institute Academy completely rewired my understanding of market structure. I went from blowing accounts to consistent, measured profitability within 6 months.",
    name: "Marcus T.",
    role: "Prop Firm Funded Trader",
    stars: 5,
  },
  {
    quote: "The risk management module alone was worth the entire tuition. I finally understood why I was losing — and exactly how to stop. Life-changing material.",
    name: "Sofia R.",
    role: "Full-Time Forex Trader",
    stars: 5,
  },
  {
    quote: "Coming in with zero experience, I expected to be lost. The foundations module is perfectly paced. Six months later I'm trading live and profitable.",
    name: "Daniel K.",
    role: "Swing Trader, S&P 500",
    stars: 5,
  },
];

export function SocialProof() {
  return (
    <section id="proof" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tighter font-serif">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 font-serif">
            Traders Who Made the Leap
          </h2>
          <p className="text-muted-foreground">
            Real results from students across the globe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/30 transition-colors duration-300"
            >
              <Quote className="w-7 h-7 text-primary/40 flex-shrink-0" />
              <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-primary text-xs uppercase tracking-wider mt-0.5">{t.role}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
