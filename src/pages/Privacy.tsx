import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const Privacy = () => (
  <div className="noise-overlay">
    <Navbar />
    <main className="pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-foreground font-display text-xl font-semibold">1. Information We Collect</h2>
            <p>We collect personal information you provide directly, including name, email address, payment details, and business information necessary to provide our services.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve our services, process payments, communicate with you, and ensure account security.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">3. Data Protection</h2>
            <p>We implement industry-standard security measures to protect your personal data. However, no method of electronic storage is 100% secure.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">4. Third-Party Services</h2>
            <p>We may share data with trusted third-party service providers necessary for operating our platform, including payment processors and hosting providers.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us at support@adcure.agency to exercise these rights.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
