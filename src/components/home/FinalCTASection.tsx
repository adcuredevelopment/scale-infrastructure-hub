import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FinalCTASection = () => {
  return (
    <section className="py-16 md:py-32 px-5 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-primary/8 blur-[80px] md:blur-[120px] gpu-blur" />
      </div>

      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-blue-500/10 p-px">
              <div className="w-full h-full rounded-xl md:rounded-2xl bg-card/90 backdrop-blur-xl" />
            </div>

            <div className="relative p-8 sm:p-10 md:p-20 text-center">
              <div className="inline-flex items-center gap-1 mb-4 md:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 md:w-4 h-3.5 md:h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-xs sm:text-sm text-muted-foreground ml-2">Rated 4.4 on Trustpilot</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-3 md:mb-4">
                Ready to Scale <span className="text-gradient">Without Limits?</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto leading-relaxed">
                Join 500+ advertisers who trust Adcure for stable, high-performance ad infrastructure.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <Button
                    size="lg"
                    className="glow-primary text-base px-8 md:px-10 py-6 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 group min-h-[52px] w-full sm:w-auto"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] flex items-center">
                  or contact our team →
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-border/20">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  7-day money back
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
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
