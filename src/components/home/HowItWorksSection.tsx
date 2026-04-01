import { ScrollReveal } from "@/components/ScrollReveal";
import { CreditCard, UserCheck, Rocket, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Subscribe",
    description: "Pick a plan that fits your scale. Checkout takes less than 2 minutes — no contracts, cancel anytime.",
    detail: "Simple, transparent pricing with instant activation.",
    icon: CreditCard,
  },
  {
    number: "02",
    title: "Onboard",
    description: "Create your account on our platform and complete a quick onboarding. We'll set up your entire infrastructure for you.",
    detail: "Full portal access with dedicated support.",
    icon: UserCheck,
  },
  {
    number: "03",
    title: "Launch",
    description: "Your ad accounts are live within 1–2 hours. Start scaling immediately with unlimited spend capacity.",
    detail: "No waiting. No limits. Just growth.",
    icon: Rocket,
  },
];

export const HowItWorksSection = () => {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => Math.max(0, a - 1));
  const next = () => setActive((a) => Math.min(steps.length - 1, a + 1));

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Live in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From signup to scaling — we get you running faster than anyone else.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          {/* Step tabs */}
          <div className="flex gap-2 mb-8">
            {steps.map((step, i) => (
              <button
                key={step.number}
                onClick={() => setActive(i)}
                className={`flex-1 relative rounded-xl px-5 py-4 text-left transition-all duration-300 border ${
                  active === i
                    ? "bg-primary/10 border-primary/40"
                    : "glass border-border/30 hover:border-border/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                      active === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`font-display font-semibold text-sm transition-colors duration-300 ${
                      active === i ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {/* Active indicator bar */}
                {active === i && (
                  <motion.div
                    layoutId="step-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Step content card */}
          <div className="glass rounded-2xl border border-border/30 p-8 md:p-12 min-h-[240px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col md:flex-row items-start gap-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  {(() => {
                    const Icon = steps[active].icon;
                    return <Icon className="w-8 h-8 text-primary" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-2xl md:text-3xl mb-4">
                    {steps[active].title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 max-w-lg">
                    {steps[active].description}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {steps[active].detail}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/20">
              <button
                onClick={prev}
                disabled={active === 0}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === active ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={active === steps.length - 1}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
