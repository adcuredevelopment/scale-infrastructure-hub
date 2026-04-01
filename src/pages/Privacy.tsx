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
            <p>Last updated: December 2025</p>

            <h2 className="text-foreground font-display text-xl font-semibold">1. Controller</h2>
            <p><strong className="text-foreground">Adcure</strong></p>
            <p>Email: service@adcure.agency</p>

            <h2 className="text-foreground font-display text-xl font-semibold">2. Data We Collect</h2>
            <ul>
              <li>Account information (name, email, company details)</li>
              <li>Billing and payment data</li>
              <li>Usage logs and technical identifiers</li>
              <li>Communication records</li>
            </ul>

            <h2 className="text-foreground font-display text-xl font-semibold">3. Purpose of Processing</h2>
            <p>Data is processed for:</p>
            <ul>
              <li>service delivery;</li>
              <li>billing and payment processing;</li>
              <li>fraud prevention;</li>
              <li>analytics and system optimisation;</li>
              <li>legal compliance.</li>
            </ul>

            <h2 className="text-foreground font-display text-xl font-semibold">4. Legal Basis</h2>
            <p>Processing is based on:</p>
            <ul>
              <li>Article 6(1)(b) GDPR (contract performance);</li>
              <li>Article 6(1)(f) GDPR (legitimate interest);</li>
              <li>legal obligations where applicable.</li>
            </ul>

            <h2 className="text-foreground font-display text-xl font-semibold">5. Processing Partners</h2>
            <p>Data may be shared with trusted processors such as payment providers, hosting providers, and analytics tools, all operating under data processing agreements.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">6. Data Retention</h2>
            <p>Data is retained as long as necessary for contractual, legal, or accounting purposes. Backups may persist temporarily.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">7. Your Rights</h2>
            <p>You may request access, correction, erasure, or portability of your data by contacting service@adcure.agency.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">8. International Transfers</h2>
            <p>Data may be processed outside the EU using appropriate safeguards such as Standard Contractual Clauses (SCCs).</p>

            <h2 className="text-foreground font-display text-xl font-semibold">9. Cookies</h2>
            <p>Cookies are used for platform functionality and analytics. Browser settings may be used to disable cookies.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">10. Security</h2>
            <p>Appropriate technical and organisational security measures are applied to protect personal data.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">11. Data Breaches</h2>
            <p>If a data breach poses a risk, affected parties will be notified in accordance with GDPR requirements.</p>

            <h2 className="text-foreground font-display text-xl font-semibold">12. Data Processing Agreement</h2>
            <p>A Data Processing Agreement (DPA) is available upon request.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;