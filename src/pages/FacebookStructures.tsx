import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ShopFAQ } from "@/components/shop/ShopFAQ";
import { ShopGuarantees } from "@/components/shop/ShopGuarantees";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid";
import { Shield, Clock, CheckCircle2, Users } from "lucide-react";

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
        <ShopHero
          badge="Complete Setup"
          title="Facebook"
          titleGradient="Structures"
          description="Complete ad account structures optimized for long-term scaling. Everything you need in one package."
          stats={stats}
        />

        <ShopProductGrid
          title="Choose Your"
          titleGradient="Structure"
          products={products}
        />

        <section className="section-padding">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <ScrollReveal>
              <h2 className="text-3xl font-display font-bold mb-6">About Facebook Structures</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Facebook Structures are complete advertising setups that include everything you need to start scaling immediately.
              </p>
              <div className="rounded-xl p-6 mb-6 bg-card/40 border border-border/30">
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

        <ShopGuarantees guarantees={guarantees} columns={2} />
        <ShopFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FacebookStructures;
