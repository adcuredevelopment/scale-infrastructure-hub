import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const SubscriptionPolicy = () => (
  <div className="noise-overlay">
    <Navbar />
    <main className="pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Subscription Policy</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: December 2025</p>

            <p>Subscriptions renew automatically unless cancelled in accordance with the Terms of Service.</p>

            <p>Cancellation must occur ≥14 days before renewal.</p>

            <p>Non-payment may result in immediate service suspension and legal recovery.</p>

            <p>Subscriptions may be paused with ≥10 days notice at 50% of the subscription fee, maximum 3 months.</p>

            <p>Lack of usage does not affect payment obligations.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
    <Footer />
  </div>
);

export default SubscriptionPolicy;