import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const Refund = () => (
  <div className="noise-overlay">
    <Navbar />
    <main className="pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Refund Policy</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-foreground font-display text-xl font-semibold">7-Day Money-Back Guarantee</h2>
            <p>All plans include a 7-day money-back guarantee. If you're not satisfied within 7 days of your purchase, contact us for a full refund of your subscription fee.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">Top-Up Fees</h2>
            <p>Top-up fees and wallet balances are non-refundable once processed. Unused wallet balances may be refunded on a case-by-case basis.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">How to Request a Refund</h2>
            <p>Email support@adcure.agency with your account details and reason for the refund request. We process refunds within 5-7 business days.</p>
            <h2 className="text-foreground font-display text-xl font-semibold">Cancellation</h2>
            <p>You can cancel your subscription at any time. Your access continues until the end of the current billing period. No partial refunds for unused days.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
    <Footer />
  </div>
);

export default Refund;
