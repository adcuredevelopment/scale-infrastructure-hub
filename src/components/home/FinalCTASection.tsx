import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FinalCTASection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="glass rounded-2xl p-12 md:p-20 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Ready to Scale <span className="text-gradient">Without Limits?</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join 500+ advertisers who trust Adcure for stable, high-performance ad infrastructure.
            </p>
            <Link to="/contact">
              <Button
                size="lg"
                className="glow-primary text-base px-10 py-6 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 group"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
