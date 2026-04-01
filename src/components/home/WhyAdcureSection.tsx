import { ScrollReveal } from "@/components/ScrollReveal";
import { Zap, Shield, Headphones, BarChart3 } from "lucide-react";

const reasons = [
  { icon: Zap, title: "Speed", description: "From signup to live ads in under 24 hours." },
  { icon: Shield, title: "Reliability", description: "High-trust accounts. No random bans." },
  { icon: Headphones, title: "Support", description: "24/7 dedicated team. Always available." },
  { icon: BarChart3, title: "Proven Systems", description: "Infrastructure trusted by 500+ advertisers." },
];

export const WhyAdcureSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Why Adcure</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4">
              Built Different.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {reasons.map((r, i) => (
            <ScrollReveal key={r.title} delay={i * 0.1}>
              <div className="text-center group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <r.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
