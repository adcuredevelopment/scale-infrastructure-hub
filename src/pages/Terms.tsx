import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const Terms = () => (
  <div className="noise-overlay">
    <Navbar />
    <main className="pt-24 sm:pt-28 md:pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: December 2025</p>

            <h2 className="text-foreground font-display text-xl font-semibold">1. Definitions</h2>
            <p>"Adcure", "we", "our" or "us" refers to Adcure, operating from the Netherlands.</p>
            <p>"Client" refers to any business (B2B) or consumer (B2C) that purchases services, subscriptions, digital assets, or software access from Adcure.</p>
            <p>"Platform" refers to all software, systems, dashboards, tools, and automations provided by Adcure.</p>
            <p>"Structures" refers to digital advertising assets delivered by Adcure, including but not limited to Facebook profiles, Business Managers, Pages, ad accounts, and related components.</p>
            <p>"Subscription" refers to any recurring paid service plan activated through the Adcure Platform or its connected payment providers.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">2. Applicability</h2>
            <p>These Terms of Service apply to all offers, agreements, subscriptions, services, software usage, and digital assets delivered by Adcure.</p>
            <p>By purchasing a subscription, placing an order, or using any part of the Platform, the Client agrees to be bound by these Terms.</p>
            <p>If the Client qualifies as a consumer under applicable law, mandatory consumer protections apply only where legally required.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">3. Account Responsibilities</h2>
            <p>The Client is responsible for maintaining the confidentiality of all login credentials and access data.</p>
            <p>Unauthorised use, misuse, or suspected security breaches must be reported immediately.</p>
            <p>Adcure reserves the right to suspend or terminate access in cases of misuse, non-payment, security concerns, or violation of these Terms.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">4. Subscriptions & Automatic Renewal</h2>
            <p>All subscriptions renew automatically unless cancelled in accordance with Article 11.</p>
            <p>A subscription becomes active and fully payable immediately after the first successful payment.</p>
            <p>The Client remains payment-obligated for each billing period regardless of usage, results, or business circumstances.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">5. Payment Terms</h2>
            <p>Subscription fees are payable immediately upon activation unless explicitly agreed otherwise in writing.</p>
            <p>In case of failed or outstanding payments:</p>
            <ul>
              <li>statutory interest may be charged;</li>
              <li>collection and administrative costs may be recovered;</li>
              <li>services may be suspended without prior notice.</li>
            </ul>
            <p>Chargebacks, payment reversals, or blocking payment methods without valid legal grounds constitute a breach of contract.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">6. Voluntary 7-Day Money-Back Guarantee</h2>
            <p>Adcure offers a voluntary 7-day money-back guarantee, starting from the activation date of the subscription.</p>
            <p>If the Client is not satisfied within this period, a full refund may be requested.</p>
            <p>After the 7-day period, all payments are final and non-refundable.</p>
            <p>This guarantee is a commercial service and does not constitute a statutory right of withdrawal unless required by consumer law.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">7. Withdrawals From Advertising Accounts</h2>
            <p>When the Client requests withdrawal or transfer of funds from advertising accounts managed or provided by Adcure, a 7% processing fee applies.</p>
            <p>This fee is deducted automatically from the withdrawal amount.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">8. Delivery of Structures (24-Hour Warranty)</h2>
            <p>All delivered Structures include a 24-hour warranty from the moment of delivery.</p>
            <p>Free replacement applies only if:</p>
            <ul>
              <li>the issue is reported within 24 hours;</li>
              <li>the issue was not caused by Client actions;</li>
              <li>provided usage instructions were followed.</li>
            </ul>

            <h2 className="text-foreground font-display text-xl font-semibold">9. Liability After Warranty Period</h2>
            <p>After the warranty period, responsibility for compliance and safe usage lies entirely with the Client.</p>
            <p>Free replacement is only provided if clear, verifiable evidence of a platform-side fault is supplied.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">10. Software Access & Payment Obligation</h2>
            <p>Activating a subscription creates a legally binding payment obligation.</p>
            <p>Subscription fees remain payable regardless of:</p>
            <ul>
              <li>actual usage;</li>
              <li>technical limitations;</li>
              <li>strategic business changes;</li>
              <li>access restrictions caused by Client actions.</li>
            </ul>
            <p>Removing or blocking payment methods does not cancel a subscription.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">11. Cancellation of Subscriptions</h2>
            <p>Cancellations must be requested at least 14 days before the next billing cycle.</p>
            <p>Late cancellations do not entitle the Client to refunds.</p>
            <p>Once a billing cycle has started, the full amount for that period remains payable.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">12. Pause Policy</h2>
            <p>Subscriptions may be paused under the following conditions:</p>
            <ul>
              <li>request ≥10 days before renewal;</li>
              <li>pause fee: 50% of the subscription price;</li>
              <li>maximum pause duration: 3 months.</li>
            </ul>

            <h2 className="text-foreground font-display text-xl font-semibold">13. Advertising Accounts, Funding & Offsetting</h2>
            <p>The Client is responsible for ensuring sufficient balances on advertising accounts.</p>
            <p>If any subscription fees or other costs remain unpaid, Adcure is authorised to offset outstanding amounts against available balances, top-ups, or funds present in advertising accounts.</p>
            <p>Adcure may withhold or deduct such funds to settle unpaid invoices or fees.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">14. Responsibility for Remaining Advertising Funds After Cancellation</h2>
            <p>Upon cancellation or termination, the Client is responsible for requesting withdrawal of remaining advertising balances.</p>
            <p>If no request is made within 30 days, Adcure may automatically withdraw remaining funds and the Client waives any claim to such balances.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">15. Confidentiality</h2>
            <p>All Client data is handled confidentially and used solely for service delivery.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">16. Intellectual Property</h2>
            <p>All software, systems, methodologies, dashboards, and digital assets remain the intellectual property of Adcure.</p>
            <p>The Client receives a limited, non-exclusive licence during active payment periods only.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">17. No Guarantees</h2>
            <p>Adcure does not guarantee advertising results, performance metrics, or profitability.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">18. Third-Party Services</h2>
            <p>Services may rely on third-party platforms (e.g. Meta, payment providers). Their terms apply in addition.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">19. Governing Law</h2>
            <p>These Terms are governed by Dutch law.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;