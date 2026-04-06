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
    popular: true,
  },
];

const stats = [
  { icon: CheckCircle2, label: "Success Rate", value: "98%" },
  { icon: Clock, label: "Delivery", value: "1 Hour" },
  { icon: Users, label: "Trusted By", value: "2,500+" },
  { icon: Shield, label: "Guarantee", value: "24 Hour" },
];

const guarantees = [
  { title: "Access Guarantee", description: "If the login credentials to the Facebook Account are invalid at delivery, we'll provide a replacement within 24 hours." },
  { title: "Security Guarantee", description: "Every Facebook Account is delivered secure, verified, and free of unauthorized activity at the time of purchase." },
  { title: "Replacement Guarantee", description: "If the Facebook Account becomes disabled within 48 hours of delivery—before any policy violations—we will replace it free of charge." },
  { title: "Working Condition Guarantee", description: "All Facebook Accounts are tested and confirmed operational at the time of delivery." },
];

const FacebookAccounts = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main>
        <ShopHero
          badge="Premium Accounts"
          title="Facebook"
          titleGradient="Accounts"
          description="Aged, verified and stable profiles ready for ad scalability. Get access to premium accounts that won't get banned."
          stats={stats}
        />

        <ShopProductGrid
          title="Choose Your"
          titleGradient="Account"
          products={products}
        />

        <section className="py-12 md:py-24 px-5 md:px-8">
          <div className="container mx-auto max-w-3xl">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">About Facebook Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our Facebook Accounts are carefully aged and verified profiles designed for advertisers who need reliable, stable accounts for scaling their campaigns.
              </p>
              <div className="rounded-xl p-4 sm:p-5 md:p-6 mb-6 bg-card/40 border border-border/30">
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

        <ShopGuarantees guarantees={guarantees} columns={2} />
        <ShopFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FacebookAccounts;
