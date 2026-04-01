import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Shield, Server, Zap, Mail, Headphones, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const services = [
  {
    icon: Shield,
    title: "Verified Agency Ad Accounts",
    description: "High-trust accounts assigned and connected within 24 hours. No spending caps, no random bans. Built for aggressive scaling.",
  },
  {
    icon: Server,
    title: "Facebook Structure Setup",
    description: "Complete infrastructure with profiles, Business Managers, and pages — all optimized for long-term stability and performance.",
  },
  {
    icon: Zap,
    title: "Automated Top-Up System",
    description: "24/7 wallet top-ups with real-time balance tracking. Never pause a campaign because of funding delays.",
  },
  {
    icon: Mail,
    title: "Email Marketing Flows",
    description: "Proven flows for abandoned cart, upsell, win-back, and more. Maximize LTV from every customer.",
  },
  {
    icon: Package,
    title: "Supplier Fulfillment Access",
    description: "In-house fulfillment team for fast, reliable shipping. Quality products, consistent delivery.",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Dedicated support team available Mon–Sun. Fast issue resolution, account replacements, and strategic guidance.",
  },
];

const Services = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main className="pt-32">
        <section className="section-padding pt-0">
          <div className="container mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="text-xs font-medium text-primary uppercase tracking-widest">Our Services</span>
                <h1 className="text-4xl md:text-6xl font-display font-bold mt-4 mb-4">
                  Complete Advertising <span className="text-gradient">Infrastructure</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to launch, scale, and dominate — in one platform.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <ScrollReveal key={service.title} delay={i * 0.08}>
                  <div className="glass rounded-xl p-8 hover-lift group h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-3">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.3}>
              <div className="text-center mt-16">
                <Link to="/contact">
                  <Button size="lg" className="glow-primary hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 group">
                    Start Scaling Today
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
