import { ScrollReveal } from "@/components/ScrollReveal";
import { ReactNode } from "react";
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
    <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-blue-500/3 blur-[80px]" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
              <span className="text-xs font-medium text-primary">{badge}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
              {title} <span className="text-gradient">{titleGradient}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              {description}
            </p>
            <a href="/#pricing" onClick={(e) => { e.preventDefault(); if (window.location.pathname === '/') { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); } else { window.location.href = '/#pricing'; } }}>
              <Button size="lg" className="glow-primary text-base px-8 py-6 group">
                Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-16">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 text-center bg-card/40 border border-border/30 hover:border-primary/15 transition-all duration-300">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-xl font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
