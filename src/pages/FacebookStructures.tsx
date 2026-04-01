import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ShopFAQ } from "@/components/shop/ShopFAQ";
import { ShopGuarantees } from "@/components/shop/ShopGuarantees";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, CheckCircle2, Users, Package } from "lucide-react";

const products = [
  {
    name: "Facebook Structure — Starter",
    description: "2 profiles, 1 business manager, 1 page. Perfect for getting started with a solid foundation.",
    price: "€175",
    includes: ["2 Facebook Profiles", "1 Business Manager", "1 Facebook Page"],
  },
  {
    name: "Facebook Structure — Pro",
    description: "5 profiles, 2 business managers, 3 pages. The complete ecosystem for serious advertisers.",
    price: "€225",
    includes: ["5 Facebook Profiles", "2 Business Managers", "3 Facebook Pages"],
    popular: true,
  },
];

const stats = [
  { icon: CheckCircle2, label: "Success Rate", value: "98%" },
  { icon: Clock, label: "Delivery", value: "24 Hours" },
  { icon: Users, label: "Trusted By", value: "1,500+" },
  { icon: Shield, label: "Guarantee", value: "7 Days" },
];

const guarantees = [
  { title: "Structure Setup Guarantee", description: "Every Facebook Structure setup is delivered fully optimized and ready for scaling on day one." },
  { title: "Replacement Guarantee", description: "If your Structure experiences technical issues caused by our setup within 7 days, we'll repair or replace it free of charge." },
  { title: "Compliance Guarantee", description: "All Structures are built following Meta's latest best practices to minimize restrictions and maximize stability." },
  { title: "Performance Tracking Guarantee", description: "Your Structure is delivered with clean data paths and tracking logic verified for accuracy at the time of delivery." },
];

const FacebookStructures = () => {
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
                  <span className="text-xs font-medium text-primary">Complete Setup</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
                  Facebook <span className="text-gradient">Structures</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                  Complete ad account structures optimized for long-term scaling. Everything you need in one package.
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
                Choose Your <span className="text-gradient">Structure</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {products.map((product, i) => (
                <ScrollReveal key={product.name} delay={i * 0.1}>
                  <div className={`rounded-xl p-8 hover-lift h-full flex flex-col relative ${
                    product.popular ? "border-2 border-primary/50 bg-card/80 backdrop-blur-xl glow-primary" : "glass"
                  }`}>
                    {product.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                        Best Value
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="w-6 h-6 text-primary" />
                      <h3 className="font-display font-semibold text-lg text-foreground">{product.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>
                    
                    <div className="glass rounded-lg p-4 mb-6">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Includes</span>
                      <ul className="mt-3 space-y-2">
                        {product.includes.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto">
                      <div className="text-3xl font-display font-bold text-primary mb-4">{product.price}</div>
                      <Link to="/contact">
                        <Button className="w-full" variant={product.popular ? "default" : "outline"}>Order Now</Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <ScrollReveal>
              <h2 className="text-3xl font-display font-bold mb-6">About Facebook Structures</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Facebook Structures are complete advertising setups that include everything you need to start scaling immediately.
              </p>
              <div className="glass rounded-xl p-6 mb-6">
                <h3 className="font-display font-semibold mb-4 text-foreground">Each Structure is:</h3>
                <ul className="space-y-3">
                  {[
                    "Built following Meta's best practices",
                    "Optimized for long-term stability",
                    "Delivered within 24 hours",
                    "Covered by our 7-day replacement guarantee",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Structures provide a complete ecosystem for running ads. Having multiple profiles and a proper BM setup ensures you can continue operations even if one component faces issues. Perfect for serious advertisers, dropshippers, and agencies looking for a turnkey solution.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <ShopGuarantees guarantees={guarantees} />
        <ShopFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FacebookStructures;
