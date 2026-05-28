import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need previous trading experience?",
    answer: "No. The Foundations module takes you from absolute zero to executing your first live trades with confidence. That said, experienced traders consistently report our advanced technical and institutional modules as transformational — regardless of prior background.",
  },
  {
    question: "How much capital do I need to start?",
    answer: "We recommend starting with a simulated (paper) account while you learn. Once you're consistently profitable in simulation, you can begin live trading with as little as $500 — or apply for prop firm funding, which our curriculum specifically prepares you for.",
  },
  {
    question: "Is this for day trading, swing trading, or both?",
    answer: "Both. The market mechanics we teach — liquidity, supply/demand, risk management — apply to all timeframes. Whether you're scalping the 1-minute chart or swing trading the daily, the underlying principles remain the same.",
  },
  {
    question: "Do I get lifetime access to all materials?",
    answer: "Yes. Your enrollment grants you lifetime access to the entire curriculum, including all future updates. The markets evolve, and so does our material. You'll never pay again for new content.",
  },
  {
    question: "What trading platforms and markets do you cover?",
    answer: "We primarily use TradingView for analysis and MetaTrader or NinjaTrader for execution — but the principles are platform-agnostic. We cover Forex, Indices, Commodities, and Crypto with the same institutional framework.",
  },
  {
    question: "How long until I can trade profitably?",
    answer: "Results vary. Most dedicated students complete the curriculum in 8–12 weeks and begin live trading with a defined edge. Profitability depends entirely on discipline and application. We equip you with the complete system — the execution is yours.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-widest text-primary uppercase mb-4 block">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 font-serif">
            Common Questions
          </h2>
          <p className="text-muted-foreground">Clear answers for serious inquiries.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/25 transition-colors"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:text-primary transition-colors py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
