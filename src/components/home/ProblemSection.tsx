import { ScrollReveal } from "@/components/ScrollReveal";
import { AlertTriangle, Ban, TrendingDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const problems = [
  {
    icon: Ban,
    title: "Ad accounts getting banned",
    description: "Random bans destroy your momentum. Days wasted. Revenue lost. Campaigns killed overnight.",
    stat: "73%",
    statLabel: "of advertisers experience bans",
  },
  {
    icon: TrendingDown,
    title: "Scaling limitations",
    description: "Spending caps, trust issues, restricted accounts. You can't scale what's already broken.",
    stat: "$50K",
    statLabel: "average revenue lost per ban",
  },
  {
    icon: AlertTriangle,
    title: "Unstable infrastructure",
    description: "Unreliable BMs, flagged pages, shaky infrastructure. One wrong move and everything collapses.",
    stat: "48hrs",
    statLabel: "average recovery time",
  },
];

export const ProblemSection = () => {
  return (
    <section className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/[0.02] to-background" />
      <div className="container mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-destructive uppercase tracking-widest">The Problem</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Sound <span className="bg-clip-text text-transparent bg-gradient-to-r from-destructive to-orange-400">Familiar?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Most advertisers are one ban away from losing everything. The system isn't built for you.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <ScrollReveal key={problem.title} delay={i * 0.1}>
              <div className="group relative rounded-xl p-8 hover-lift h-full bg-card/40 border border-destructive/10 hover:border-destructive/25 transition-all duration-500 overflow-hidden">
                {/* Subtle red glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-colors duration-300">
                      <problem.icon className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-display font-bold text-destructive/80">{problem.stat}</div>
                      <div className="text-[10px] text-muted-foreground/60">{problem.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-3">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="flex items-center justify-center mt-12">
            <a href="#services" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
            >
              See how we solve this
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
