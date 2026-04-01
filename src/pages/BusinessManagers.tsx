import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, CheckCircle2, Users } from "lucide-react";

const products = [
  {
    name: "Verified Old Business Manager BM350 Limit $25",
    description: "Aged verified BM with $25 daily spend limit, ready for scaling.",
    price: "€95",
  },
  {
    name: "Verified Old Business Manager BM350 Limit $50",
    description: "Aged verified BM with $50 daily spend limit for higher volume campaigns.",
    price: "€115",
  },
  {
    name: "Reinstated Business Manager BM350 Limit $250",
    description: "Reinstated BM with $250 limit, battle-tested for maximum ad durability.",
    price: "€250",
  },
];

const stats = [
  { icon: CheckCircle2, label: "Success Rate", value: "98%" },
  { icon: Clock, label: "Delivery", value: "1 Hour" },
  { icon: Users, label: "Trusted By", value: "1,800+" },
  { icon: Shield, label: "Guarantee", value: "24 Hour" },
];

const BusinessManagers = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main>
        <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                  <span className="text-xs font-medium text-primary">Enterprise Grade</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
                  Business <span className="text-gradient">Managers</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                  Verified BMs with correct permissions and billing. Scale your advertising operations with confidence.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="glow-primary text-base px-8 py-6 group">
                    Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 text-center">
                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-xl font-display font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="section-padding bg-card/30">
          <div className="container mx-auto px-4 md:px-8">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
                Choose Your <span className="text-gradient">Business Manager</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {products.map((product, i) => (
                <ScrollReveal key={product.name} delay={i * 0.1}>
                  <div className="glass rounded-xl p-6 hover-lift h-full flex flex-col">
                    <h3 className="font-display font-semibold text-base text-foreground mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{product.description}</p>
                    <div className="text-3xl font-display font-bold text-primary mb-4">{product.price}</div>
                    <Link to="/contact">
                      <Button className="w-full" variant="outline">Order Now</Button>
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <ScrollReveal>
              <h2 className="text-3xl font-display font-bold mb-6">About Business Managers</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Business Managers are verified and come with the correct permissions and billing setup to help you scale your advertising operations.
              </p>
              <div className="glass rounded-xl p-6 mb-6">
                <h3 className="font-display font-semibold mb-4 text-foreground">Each Business Manager includes:</h3>
                <ul className="space-y-3">
                  {[
                    "Verified with original documentation",
                    "Pre-set daily spending limits ($25, $50, or $250)",
                    "Clean history with no restrictions",
                    "Proper permissions and billing configuration",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Business Managers are essential for running ads at scale, managing multiple ad accounts, and maintaining separation between your advertising assets. Our BMs are battle-tested and come with a 24-hour replacement guarantee.
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessManagers;
