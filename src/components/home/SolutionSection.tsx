import { ScrollReveal } from "@/components/ScrollReveal";
import { Shield, Server, Zap, Headphones, Check } from "lucide-react";

const solutions = [
  {
    icon: Shield,
    title: "Bulletproof Ad Accounts",
    description: "High-trust, verified accounts with unlimited spend potential.",
    benefits: ["No random bans", "Unlimited capacity", "Instant replacements"],
  },
  {
    icon: Server,
    title: "Stable Facebook Structures",
    description: "Complete infrastructure — profiles, BMs, pages — built for longevity.",
    benefits: ["Verified BMs", "Clean history", "Professional setup"],
  },
  {
    icon: Zap,
    title: "Instant Activation",
    description: "From signup to live ads in under 2 hours. No delays.",
    benefits: ["1-2 hour setup", "Automated top-ups", "Zero downtime"],
  },
  {
    icon: Headphones,
    title: "24/7 Priority Support",
    description: "Dedicated team. Fast issue resolution. Always available.",
    benefits: ["Mon–Sun support", "1-hour response", "Personal account manager"],
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-16 md:py-32 px-5 md:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-primary/3 blur-[100px] md:blur-[150px] gpu-blur" />

      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">The Solution</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mt-3 md:mt-4 mb-3 md:mb-4">
              Your Scaling <span className="text-gradient">Backend</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              We provide the infrastructure. You focus on growth.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          {solutions.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.08}>
              <div className="group relative rounded-xl p-5 sm:p-6 md:p-7 hover-lift h-full bg-card/40 border border-border/40 hover:border-primary/20 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-all duration-300">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-base md:text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 pl-[52px] md:pl-[60px]">
                    {item.benefits.map((b) => (
                      <span key={b} className="inline-flex items-center gap-1 md:gap-1.5 text-[11px] md:text-xs text-muted-foreground bg-muted/50 rounded-full px-2.5 md:px-3 py-1">
                        <Check className="w-3 h-3 text-primary" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
