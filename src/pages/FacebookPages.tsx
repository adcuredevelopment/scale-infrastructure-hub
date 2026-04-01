import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, CheckCircle2, Users } from "lucide-react";

const products = [
  {
    name: "Facebook Page — No Followers",
    description: "Clean page ready for your brand, perfect for fresh campaign setups.",
    price: "€7.50",
  },
  {
    name: "Facebook Page — 800–1,500 Followers",
    description: "Established page with organic follower base for instant credibility.",
    price: "€20",
  },
  {
    name: "Facebook Page — 2,000–4,000 Followers",
    description: "High-engagement page with strong follower count for better ad delivery.",
    price: "€30",
  },
  {
    name: "Facebook Page — 10K+ Followers",
    description: "Premium page with 10K+ followers for maximum trust and reach.",
    price: "€80",
    popular: true,
  },
];

const stats = [
  { icon: CheckCircle2, label: "Success Rate", value: "98%" },
  { icon: Clock, label: "Delivery", value: "1 Hour" },
  { icon: Users, label: "Trusted By", value: "3,200+" },
  { icon: Shield, label: "Guarantee", value: "24 Hour" },
];

const FacebookPages = () => {
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
                  <span className="text-xs font-medium text-primary">Boost Credibility</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
                  Facebook <span className="text-gradient">Pages</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                  Niche-aligned pages to boost credibility and ad delivery. Build trust with established page histories.
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
                Choose Your <span className="text-gradient">Page</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {products.map((product, i) => (
                <ScrollReveal key={product.name} delay={i * 0.1}>
                  <div className={`rounded-xl p-6 hover-lift h-full flex flex-col relative ${
                    product.popular ? "border-2 border-primary/50 bg-card/80 backdrop-blur-xl glow-primary" : "glass"
                  }`}>
                    {product.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                        Most Popular
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-semibold text-base text-foreground pr-4">{product.name}</h3>
                      <span className="text-2xl font-display font-bold text-primary shrink-0">{product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{product.description}</p>
                    <Link to="/contact">
                      <Button className="w-full" variant={product.popular ? "default" : "outline"}>Order Now</Button>
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
              <h2 className="text-3xl font-display font-bold mb-6">About Facebook Pages</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Facebook Pages come with established histories and follower bases to give your advertising campaigns instant credibility.
              </p>
              <div className="glass rounded-xl p-6 mb-6">
                <h3 className="font-display font-semibold mb-4 text-foreground">Available options include:</h3>
                <ul className="space-y-3">
                  {[
                    "Clean pages with no followers — perfect for fresh branding",
                    "Pages with 800–1,500 followers — established presence",
                    "Pages with 2,000–4,000 followers — strong engagement base",
                    "Premium pages with 10K+ followers — maximum trust and reach",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Facebook Pages are crucial for running ads, as they serve as the public face of your advertising. An established page with followers helps improve ad delivery and reduces the chance of restrictions. All pages are delivered with a 24-hour access guarantee.
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FacebookPages;
