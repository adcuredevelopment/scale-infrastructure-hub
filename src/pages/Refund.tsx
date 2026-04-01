import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const Refund = () => (
  <div className="noise-overlay">
    <Navbar />
    <main className="pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Refund & Warranty Policy</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: December 2024</p>

            <h2 className="text-foreground font-display text-xl font-semibold">1. General Principle</h2>
            <p>Refunds are only granted at Adcure's discretion unless legal obligation applies.</p>
            <p>Policy is B2B-oriented; consumer law only applies when legally defined as consumer.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">2. Subscription Payments</h2>
            <p>Processed subscription fees remain payable and are not returned based on usage or late cancellation.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">3. 24h Warranty on Structures</h2>
            <p>Within first 24h after delivery, Client may request replacement if Structure is unusable.</p>
            <p>Replacement is free only if:</p>
            <ul>
              <li>Issue reported within 24h</li>
              <li>Client followed recommended safe usage procedures</li>
              <li>No risky/ad policy breaking activity took place</li>
            </ul>

            <h2 className="text-foreground font-display text-xl font-semibold">4. Post-Warranty Replacement</h2>
            <p>After 24h, responsibility lies with Client. Replacement may be purchased.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">5. Evidence Requirement</h2>
            <p>For free replacement post-period, Client must provide clear evidence of platform/system fault.</p>
            <p>Decision based on technical assessment by Adcure Agency.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">6. Chargebacks & Disputes</h2>
            <p>Unjustified disputes allow legal recovery including admin, legal and banking costs.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">7. Contact Us</h2>
            <p>For refund requests or questions about this policy, please contact us at:</p>
            <p>Email: service@adcure.agency</p>
            <p>Phone: +31 97010209535</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
    <Footer />
  </div>
);

export default Refund;