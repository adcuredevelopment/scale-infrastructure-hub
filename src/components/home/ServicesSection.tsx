import { ScrollReveal } from "@/components/ScrollReveal";
import { Database, Layers, Rocket } from "lucide-react";

const services = [
  {
    icon: Database,
    category: "Infrastructure",
    items: ["Verified Agency Ad Accounts", "Facebook Structure Setup", "Business Manager Access"],
  },
  {
    icon: Layers,
    category: "Scaling Tools",
    items: ["Automated Top-Up System", "Real-time Dashboard", "Account Health Monitoring"],
  },
  {
    icon: Rocket,
    category: "Growth Support",
    items: ["Strategic Optimization", "Email Marketing Flows", "Supplier Fulfillment Access"],
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
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ScrollReveal key={service.category} delay={i * 0.1}>
              <div className="glass rounded-xl p-8 hover-lift group h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-6">{service.category}</h3>
                <ul className="space-y-3">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
