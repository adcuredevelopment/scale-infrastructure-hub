import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ShopHeroProps {
  badge: string;
  title: string;
  titleGradient: string;
  description: string;
  stats: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[];
}

export const ShopHero = ({ badge, title, titleGradient, description, stats }: ShopHeroProps) => {
  return (
    <section className="relative pt-24 sm:pt-32 md:pt-40 pb-12 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-primary/5 blur-[80px] md:blur-[120px] gpu-blur" />
      <div className="hidden md:block absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-blue-500/3 blur-[80px]" />
      
      <div className="container mx-auto px-5 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5 md:mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
              <span className="text-[11px] sm:text-xs font-medium text-primary">{badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 md:mb-6">
              {title} <span className="text-gradient">{titleGradient}</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">
              {description}
            </p>
            <a href="/#pricing" onClick={(e) => { e.preventDefault(); if (window.location.pathname === '/') { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); } else { window.location.href = '/#pricing'; } }}>
              <Button size="lg" className="glow-primary text-base px-8 py-6 group min-h-[52px]">
                Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 max-w-3xl mx-auto mt-10 md:mt-16">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg md:rounded-xl p-3 md:p-4 text-center bg-card/40 border border-border/30 hover:border-primary/15 transition-all duration-300">
                <stat.icon className="w-4 md:w-5 h-4 md:h-5 text-primary mx-auto mb-1.5 md:mb-2" />
                <div className="text-lg md:text-xl font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
