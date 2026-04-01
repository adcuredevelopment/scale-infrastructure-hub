import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const Terms = () => (
  <div className="noise-overlay">
    <Navbar />
    <main className="pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Terms & Conditions</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-foreground font-display text-xl font-semibold">1. Agreement to Terms</h2>
            <p>By accessing or using Adcure Agency's services, you agree to be bound by these Terms & Conditions. If you do not agree, do not use our services.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">2. Services</h2>
            <p>Adcure Agency provides advertising infrastructure including ad account provisioning, Facebook structure setup, top-up services, and related support. All services are subject to availability and our operational policies.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">3. Subscriptions & Payments</h2>
            <p>Subscriptions are billed monthly. Payments are non-refundable except as outlined in our Refund Policy. You are responsible for maintaining valid payment information.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">4. Acceptable Use</h2>
            <p>You agree not to use our services for any unlawful purpose. Adcure reserves the right to suspend or terminate accounts that violate our policies without notice.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">5. Limitation of Liability</h2>
            <p>Adcure Agency is not liable for any indirect, incidental, or consequential damages arising from the use of our services, including but not limited to ad account restrictions imposed by third-party platforms.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">6. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
