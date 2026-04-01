import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { SolutionSection } from "@/components/home/SolutionSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { PricingSection } from "@/components/home/PricingSection";
import { WhyAdcureSection } from "@/components/home/WhyAdcureSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";

const Index = () => {
  return (
    <div className="noise-overlay">
      <Navbar />
      <main>
        <div id="hero"><HeroSection /></div>
        <ProblemSection />
        <SolutionSection />
        <div id="services"><ServicesSection /></div>
        <SocialProofSection />
        <div id="pricing"><PricingSection /></div>
        <WhyAdcureSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
