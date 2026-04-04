import { ScrollReveal } from "@/components/ScrollReveal";
import { CreditCard, UserCheck, Rocket, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stepMockups } from "./StepMockups";

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
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDirection(1);
      setActive((a) => (a + 1) % steps.length);
    }, 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timerRef.current);
  }, [active, resetTimer]);

  const goTo = (i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };

  const prev = () => {
    setDirection(-1);
    setActive((a) => Math.max(0, a - 1));
  };

  const next = () => {
    setDirection(1);
    setActive((a) => Math.min(steps.length - 1, a + 1));
  };

  return (
    <section className="py-16 md:py-32 px-5 md:px-8">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">How It Works</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mt-3 md:mt-4 mb-3 md:mb-4">
              From subscription to <span className="text-gradient">scaling</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Step list */}
          <div className="flex flex-col gap-1.5 md:gap-2 order-2 md:order-1">
            {steps.map((step, i) => {
              const isActive = active === i;
              const Icon = step.icon;
              return (
                <button
                  key={step.number}
                  onClick={() => goTo(i)}
                  className={`relative text-left rounded-xl px-4 py-4 md:px-5 md:py-5 transition-all duration-300 border min-h-[60px] ${
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-transparent hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-display font-bold text-sm md:text-base transition-colors duration-300 ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {step.title}
                        </h3>
                        <span className={`text-xs font-mono transition-colors duration-300 ${
                          isActive ? "text-primary" : "text-muted-foreground/50"
                        }`}>
                          {step.number}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 leading-relaxed transition-colors duration-300 ${
                        isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail card */}
          <div className="flex flex-col gap-0 order-1 md:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="relative rounded-xl md:rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent aspect-[16/10] md:aspect-[4/3] flex items-center justify-center overflow-hidden"
              >
                <span className="absolute right-4 md:right-5 top-2 md:top-3 text-5xl md:text-6xl font-display font-bold text-primary/15 select-none leading-none">
                  {steps[active].number}
                </span>
                <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  {(() => {
                    const Icon = steps[active].icon;
                    return <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />;
                  })()}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
                className="pt-4 md:pt-6"
              >
                <h3 className="font-display font-bold text-xl md:text-2xl mb-2">{steps[active].title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3 md:mb-4">
                  {steps[active].description}
                </p>
                <div className="rounded-lg md:rounded-xl bg-primary/10 border border-primary/20 px-4 md:px-5 py-2.5 md:py-3 flex items-center gap-2.5 md:gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{steps[active].highlight}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5 md:mt-6">
              <button
                onClick={prev}
                disabled={active === 0}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <div className="flex gap-1.5 items-center">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer min-w-[8px] ${
                      i === active ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={active === steps.length - 1}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px]"
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
