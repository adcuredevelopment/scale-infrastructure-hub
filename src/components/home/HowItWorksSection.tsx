import { ScrollReveal } from "@/components/ScrollReveal";
import { CreditCard, UserCheck, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Subscribe",
    description: "Pick a plan that fits your scale. Checkout takes less than 2 minutes — no contracts, cancel anytime.",
    detail: "Simple, transparent pricing with instant activation.",
    icon: CreditCard,
  },
  {
    number: "02",
    title: "Onboard",
    description: "Create your account on our platform and complete a quick onboarding. We'll set up your infrastructure.",
    detail: "Full portal access with dedicated support.",
    icon: UserCheck,
  },
  {
    number: "03",
    title: "Launch",
    description: "Your ad accounts are live within 1–2 hours. Start scaling immediately with unlimited spend capacity.",
    detail: "No waiting. No limits. Just growth.",
    icon: Rocket,
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Live in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From signup to scaling — we get you running faster than anyone else.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[88px] left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center group">
                  {/* Number circle */}
                  <div className="relative mb-6">
                    <div className="w-[72px] h-[72px] rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[11px] font-bold text-primary-foreground">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-[280px]">
                    {step.description}
                  </p>
                  <p className="text-xs text-primary/70 font-medium">{step.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
