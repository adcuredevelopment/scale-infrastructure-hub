import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const FinalCTASection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="relative rounded-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-blue-500/10 p-px">
              <div className="w-full h-full rounded-2xl bg-card/90 backdrop-blur-xl" />
            </div>

            <div className="relative p-12 md:p-20 text-center">
              <div className="inline-flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">Rated 4.4 on Trustpilot</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Ready to Scale <span className="text-gradient">Without Limits?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                Join 500+ advertisers who trust Adcure for stable, high-performance ad infrastructure.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <Button
                    size="lg"
                    className="glow-primary text-base px-10 py-6 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 group"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  or contact our team →
                </a>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-border/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  7-day money back
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  No contracts
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
