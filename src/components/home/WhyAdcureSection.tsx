import { ScrollReveal } from "@/components/ScrollReveal";
import { Zap, Shield, Headphones, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Why Adcure</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Built <span className="text-gradient">Different.</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Numbers don't lie. Here's why top advertisers choose us.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {reasons.map((r, i) => (
            <ScrollReveal key={r.title} delay={i * 0.1}>
              <div className="group relative rounded-xl p-6 text-center bg-card/40 border border-border/30 hover:border-primary/20 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <r.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">{r.value}</div>
                  <h3 className="font-display font-semibold text-sm mb-2">{r.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
