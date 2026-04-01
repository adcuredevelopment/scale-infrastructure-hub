import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, CheckCircle2, Users } from "lucide-react";

const products = [
  {
    name: "Facebook Vietnamese 3Line Account",
    description: "Vietnamese profile with 3-line verification, high trust score and stable ad performance.",
    price: "€30",
  },
  {
    name: "Facebook Vietnamese Super Aged (2007–2015) 3Line Account",
    description: "Ultra-aged Vietnamese profile from 2007–2015 with 3-line verification, exceptional trust score and proven long-term ad stability.",
    price: "€35",
  },
  {
    name: "Facebook US 3Line Reinstated Account",
    description: "US-based reinstated profile with 3-line verification, restored ad privileges and clean standing.",
    price: "€40",
  },
  {
    name: "Facebook US 3Line 2x Reinstated Account",
    description: "Double-reinstated US profile with 3-line verification and maximum ad durability.",
    price: "€60",
  },
];

const stats = [
  { icon: CheckCircle2, label: "Success Rate", value: "98%" },
  { icon: Clock, label: "Delivery", value: "1 Hour" },
  { icon: Users, label: "Trusted By", value: "2,500+" },
  { icon: Shield, label: "Guarantee", value: "24 Hour" },
];

const FacebookAccounts = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                  <span className="text-xs font-medium text-primary">Premium Accounts</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
                  Facebook <span className="text-gradient">Accounts</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                  Aged, verified and stable profiles ready for ad scalability. Get access to premium accounts that won't get banned.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="glow-primary text-base px-8 py-6 group">
                    Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Stats */}
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

        {/* Products */}
        <section className="section-padding bg-card/30">
          <div className="container mx-auto px-4 md:px-8">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
                Choose Your <span className="text-gradient">Account</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {products.map((product, i) => (
                <ScrollReveal key={product.name} delay={i * 0.1}>
                  <div className="glass rounded-xl p-6 hover-lift h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-semibold text-base text-foreground pr-4">{product.name}</h3>
                      <span className="text-2xl font-display font-bold text-primary shrink-0">{product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{product.description}</p>
                    <Link to="/contact">
                      <Button className="w-full" variant="outline">Order Now</Button>
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section className="section-padding">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <ScrollReveal>
              <h2 className="text-3xl font-display font-bold mb-6">About Facebook Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Facebook Accounts are carefully aged and verified profiles designed for advertisers who need reliable, stable accounts for scaling their campaigns.
              </p>
              <div className="glass rounded-xl p-6 mb-6">
                <h3 className="font-display font-semibold mb-4 text-foreground">Each account comes with:</h3>
                <ul className="space-y-3">
                  {[
                    "Verified identity and profile information",
                    "Clean history with no prior violations",
                    "Aged profile for better trust score",
                    "Ready-to-use for advertising purposes",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                These accounts are ideal for media buyers, agencies, dropshippers, and businesses looking to expand their advertising operations without the risk of immediate bans or restrictions. All accounts are delivered within 1 hour and come with our 24-hour replacement guarantee.
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FacebookAccounts;
