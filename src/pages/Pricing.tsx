import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/home/PricingSection";
import { ScrollReveal } from "@/components/ScrollReveal";

const Pricing = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main className="pt-32">
        <section className="pb-0 pt-0 px-4">
          <div className="container mx-auto text-center">
            <ScrollReveal>
              <span className="text-xs font-medium text-primary uppercase tracking-widest">Pricing</span>
              <h1 className="text-4xl md:text-6xl font-display font-bold mt-4 mb-4">
                Simple, Transparent <span className="text-gradient">Pricing</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                No hidden fees. No surprises. Pick a plan and start scaling.
              </p>
            </ScrollReveal>
          </div>
        </section>
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
