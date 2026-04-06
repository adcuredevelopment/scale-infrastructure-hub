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

const guarantees = [
  { title: "Access Guarantee", description: "If Page access details are invalid at delivery, we'll provide a replacement within 24 hours." },
  { title: "Condition Guarantee", description: "Each Page is delivered in good condition and fully functional at the time of purchase." },
];

const FacebookPages = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main>
        <ShopHero
          badge="Boost Credibility"
          title="Facebook"
          titleGradient="Pages"
          description="Niche-aligned pages to boost credibility and ad delivery. Build trust with established page histories."
          stats={stats}
        />

        <ShopProductGrid
          title="Choose Your"
          titleGradient="Page"
          products={products}
        />

        <section className="py-12 md:py-24 px-5 md:px-8">
          <div className="container mx-auto max-w-3xl">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">About Facebook Pages</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Facebook Pages come with established histories and follower bases to give your advertising campaigns instant credibility.
              </p>
              <div className="rounded-xl p-4 sm:p-5 md:p-6 mb-6 bg-card/40 border border-border/30">
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

        <ShopGuarantees guarantees={guarantees} columns={2} />
        <ShopFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FacebookPages;
