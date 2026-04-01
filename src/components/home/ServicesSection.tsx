import { ScrollReveal } from "@/components/ScrollReveal";
import { Database, Layers, Rocket, Shield, Zap, BarChart3 } from "lucide-react";

const services = [
  {
    icon: Database,
    title: "Agency Ad Accounts",
    description: "Verified, high-trust ad accounts built for scale. No bans, no disruptions — just stable infrastructure.",
  },
  {
    icon: Layers,
    title: "Facebook Structure Setup",
    description: "Professionally configured Business Managers, pixels, and campaign architecture from day one.",
  },
  {
    icon: Shield,
    title: "Business Manager Access",
    description: "Full admin access to enterprise-grade Business Managers with clean history and high spending limits.",
  },
  {
    icon: Zap,
    title: "Automated Top-Up System",
    description: "24/7 instant balance top-ups so your campaigns never stop. Automated, fast, and reliable.",
  },
  {
    icon: BarChart3,
    title: "Real-time Dashboard",
    description: "Monitor all your ad accounts, balances, and performance from a single premium dashboard.",
  },
  {
    icon: Rocket,
    title: "Strategic Optimization",
    description: "Data-driven scaling strategies and monthly meetings to maximize your ROAS and ad performance.",
  },
];

export const ServicesSection = () => {
  return (
    <section className="section-padding bg-card/30">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">What We Provide</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Everything You Need. <span className="text-gradient">One Platform.</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From verified ad accounts to real-time monitoring — we handle the infrastructure so you can focus on scaling.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 0.08}>
              <div className="glass rounded-xl p-8 hover-lift group h-full relative overflow-hidden">
                {/* Subtle gradient accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-500" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-3 text-foreground">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
