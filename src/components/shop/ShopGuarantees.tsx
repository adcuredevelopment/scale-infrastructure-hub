import { ScrollReveal } from "@/components/ScrollReveal";
import { Shield, CheckCircle2 } from "lucide-react";

interface Guarantee {
  title: string;
  description: string;
}

interface ShopGuaranteesProps {
  guarantees: Guarantee[];
  columns?: 2 | 3;
}

export const ShopGuarantees = ({ guarantees, columns = 3 }: ShopGuaranteesProps) => {
  return (
    <section className="py-16 md:py-32 px-5 md:px-8">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-3 md:mb-4">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] sm:text-xs font-medium text-primary">100% Guarantee</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              Our <span className="text-gradient">Guarantees</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className={`grid grid-cols-1 ${columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3"} gap-3 md:gap-4`}>
          {guarantees.map((g, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="group rounded-xl p-4 sm:p-5 md:p-6 h-full bg-card/40 border border-border/30 hover:border-primary/15 transition-all duration-500">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm md:text-base mb-1 md:mb-1.5">{g.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-6 md:mt-8 text-center rounded-xl p-5 md:p-6 border border-primary/20 bg-primary/5">
            <h3 className="font-display font-semibold text-foreground text-sm md:text-base mb-1.5 md:mb-2">Money-Back Guarantee</h3>
            <p className="text-sm text-muted-foreground">
              If Adcure doesn't live up to these expectations, just email us and we'll give you a full refund.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
