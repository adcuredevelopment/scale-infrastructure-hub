import { ScrollReveal } from "@/components/ScrollReveal";
import { CreditCard, UserCheck, Rocket, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Subscribe",
    description: "Pick a plan that fits your scale. Checkout takes less than 2 minutes — no contracts, cancel anytime.",
    highlight: "Simple checkout. No lengthy paperwork.",
    icon: CreditCard,
  },
  {
    number: "02",
    title: "Onboard",
    description: "Create your account on our platform and complete a quick onboarding. We'll set up your entire infrastructure.",
    highlight: "Dedicated onboarding specialist assigned.",
    icon: UserCheck,
  },
  {
    number: "03",
    title: "Launch",
    description: "Your ad accounts are live within 1–2 hours. Start scaling immediately with unlimited spend capacity.",
    highlight: "Live within 1–2 hours. No waiting.",
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
              From subscription to <span className="text-gradient">scaling</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Step list */}
          <div className="flex flex-col gap-2">
            {steps.map((step, i) => {
              const isActive = active === i;
              const Icon = step.icon;
              return (
                <button
                  key={step.number}
                  onClick={() => setActive(i)}
                  className={`relative text-left rounded-xl px-5 py-5 transition-all duration-300 border ${
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-transparent hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-display font-bold text-base transition-colors duration-300 ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <span
                          className={`text-xs font-mono transition-colors duration-300 ${
                            isActive ? "text-primary" : "text-muted-foreground/50"
                          }`}
                        >
                          {step.number}
                        </span>
                      </div>
                      <p
                        className={`text-sm mt-1 leading-relaxed transition-colors duration-300 ${
                          isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Detail card */}
          <div className="flex flex-col gap-0">
            {/* Visual card with large number */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent aspect-[4/3] flex items-center justify-center overflow-hidden"
              >
                {/* Large background number */}
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[160px] md:text-[200px] font-display font-bold text-primary/10 leading-none select-none">
                  {steps[active].number}
                </span>
                {/* Center icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  {(() => {
                    const Icon = steps[active].icon;
                    return <Icon className="w-8 h-8 text-primary" />;
                  })()}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Text content below card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="pt-6"
              >
                <h3 className="font-display font-bold text-2xl mb-2">{steps[active].title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {steps[active].description}
                </p>
                {/* Highlight pill */}
                <div className="rounded-xl bg-primary/10 border border-primary/20 px-5 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{steps[active].highlight}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prev}
                disabled={active === 0}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <div className="flex gap-1.5 items-center">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === active ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={active === steps.length - 1}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
