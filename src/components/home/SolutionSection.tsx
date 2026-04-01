import { ScrollReveal } from "@/components/ScrollReveal";
import { Shield, Server, Zap, Headphones } from "lucide-react";

const solutions = [
  { icon: Shield, title: "Bulletproof Ad Accounts", description: "High-trust, verified accounts with unlimited spend potential." },
  { icon: Server, title: "Stable Facebook Structures", description: "Complete infrastructure — profiles, BMs, pages — built for longevity." },
  { icon: Zap, title: "Instant Activation", description: "From signup to live ads in under 24 hours. No delays." },
  { icon: Headphones, title: "24/7 Priority Support", description: "Dedicated team. Fast issue resolution. Always available." },
];

export const SolutionSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />

      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">The Solution</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Your Scaling <span className="text-gradient">Backend</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We provide the infrastructure. You focus on growth.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {solutions.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <div className="glass rounded-xl p-8 hover-lift group h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
