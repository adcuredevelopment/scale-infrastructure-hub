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
    popular: true,
  },
];

const stats = [
  { icon: CheckCircle2, label: "Success Rate", value: "98%" },
  { icon: Clock, label: "Delivery", value: "1 Hour" },
  { icon: Users, label: "Trusted By", value: "1,800+" },
  { icon: Shield, label: "Guarantee", value: "24 Hour" },
];

const guarantees = [
  { title: "24-Hour Replacement Guarantee", description: "If your Business Manager is restricted, disabled, or its limits are reduced within 24 hours before you take any action, we'll replace it immediately." },
  { title: "Account Replacement Guarantee", description: "If the verification status of your Business Manager (verified with original documents) is revoked within 14 days, a replacement will be issued." },
  { title: "Ad Spend Guarantee", description: "Every Business Manager is delivered in perfect condition at the time of purchase." },
];

const BusinessManagers = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main>
        <ShopHero
          badge="Enterprise Grade"
          title="Business"
          titleGradient="Managers"
          description="Verified BMs with correct permissions and billing. Scale your advertising operations with confidence."
          stats={stats}
        />

        <ShopProductGrid
          title="Choose Your"
          titleGradient="Business Manager"
          products={products}
          columns={3}
        />

        <section className="py-12 md:py-24 px-5 md:px-8">
          <div className="container mx-auto max-w-3xl">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">About Business Managers</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Business Managers are verified and come with the correct permissions and billing setup to help you scale your advertising operations.
              </p>
              <div className="rounded-xl p-4 sm:p-5 md:p-6 mb-6 bg-card/40 border border-border/30">
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

        <ShopGuarantees guarantees={guarantees} />
        <ShopFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default BusinessManagers;
