import { ScrollReveal } from "@/components/ScrollReveal";
import { Zap, Shield, Headphones, TrendingUp } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Speed",
    value: "1-2h",
    description: "From signup to live ads — the fastest in the industry.",
  },
  {
    icon: Shield,
    title: "Reliability",
    value: "99.9%",
    description: "Uptime across all managed ad accounts.",
  },
  {
    icon: Headphones,
    title: "Support",
    value: "24/7",
    description: "Dedicated team always available when you need us.",
  },
  {
    icon: TrendingUp,
    title: "Scale",
    value: "500+",
    description: "Advertisers trusting our infrastructure daily.",
  },
];

export const WhyAdcureSection = () => {
  return (
    <section className="py-16 md:py-32 px-5 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">Why Adcure</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mt-3 md:mt-4 mb-3 md:mb-4">
              Built <span className="text-gradient">Different.</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Numbers don't lie. Here's why top advertisers choose us.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto">
          {reasons.map((r, i) => (
            <ScrollReveal key={r.title} delay={i * 0.08}>
              <div className="group relative rounded-xl p-4 sm:p-5 md:p-6 text-center bg-card/40 border border-border/30 hover:border-primary/20 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-primary/15 transition-all duration-300">
                    <r.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary mb-1">{r.value}</div>
                  <h3 className="font-display font-semibold text-xs sm:text-sm mb-1.5 md:mb-2">{r.title}</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
