import { ScrollReveal } from "@/components/ScrollReveal";
import { AlertTriangle, Ban, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Ban,
    title: "Ad accounts getting banned",
    description: "Random bans destroy your momentum. Days wasted. Revenue lost. Campaigns killed overnight.",
  },
  {
    icon: TrendingDown,
    title: "Scaling limitations",
    description: "Spending caps, trust issues, restricted accounts. You can't scale what's already broken.",
  },
  {
    icon: AlertTriangle,
    title: "Unstable systems",
    description: "Unreliable BMs, flagged pages, shaky infrastructure. One wrong move and everything collapses.",
  },
];

export const ProblemSection = () => {
  return (
    <section className="section-padding relative">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">The Problem</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Sound <span className="text-gradient">Familiar?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Most advertisers are one ban away from losing everything. The system isn't built for you.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <ScrollReveal key={problem.title} delay={i * 0.1}>
              <div className="glass rounded-xl p-8 hover-lift group h-full">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-6 group-hover:bg-destructive/20 transition-colors">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3">{problem.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
