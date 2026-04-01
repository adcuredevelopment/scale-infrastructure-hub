import { ScrollReveal } from "@/components/ScrollReveal";
import { Shield, CheckCircle2 } from "lucide-react";

interface Guarantee {
  title: string;
  description: string;
}

interface ShopGuaranteesProps {
  guarantees: Guarantee[];
}

export const ShopGuarantees = ({ guarantees }: ShopGuaranteesProps) => {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">100% Guarantee</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Our <span className="text-gradient">Guarantees</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guarantees.map((g, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="glass rounded-xl p-6 h-full">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1.5">{g.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-8 text-center glass rounded-xl p-6 border border-primary/20">
            <h3 className="font-display font-semibold text-foreground mb-2">Money-Back Guarantee</h3>
            <p className="text-sm text-muted-foreground">
              If Adcure doesn't live up to these expectations, just email us and we'll give you a full refund.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
