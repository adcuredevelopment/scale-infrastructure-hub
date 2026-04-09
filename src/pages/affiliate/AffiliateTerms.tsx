import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AffiliateTerms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 md:pt-40 pb-16 px-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-8">Affiliate Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: April 9, 2026</p>

          <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Definitions</h2>
              <p>"Adcure" refers to Adcure Agency, the operator of the affiliate program.</p>
              <p>"Affiliate" or "Partner" refers to the individual or entity accepted into the affiliate program.</p>
              <p>"Referral" means a customer who purchases a subscription through the Affiliate's unique referral link.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Commission Structure</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Signup Bonus:</strong> A one-time commission is earned for the first payment of each new referred customer.</li>
                <li><strong>Recurring Commission:</strong> 20% of the recurring subscription amount is earned each month the referred customer remains an active subscriber.</li>
              </ul>
              <p className="mt-2">Commissions are calculated on the net subscription amount (excluding applicable taxes).</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. Payment Terms</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Payouts are processed monthly.</li>
                <li>The minimum payout threshold is €50.00.</li>
                <li>Payouts are made via bank transfer or an alternative method agreed upon between the parties.</li>
                <li>Commissions for cancelled subscriptions are forfeited from the month of cancellation onwards.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Self-Billing Agreement</h2>
              <p className="mb-3">
                By accepting these terms, you agree to a <strong>self-billing arrangement</strong> in accordance with 
                Article 224 of the EU VAT Directive (2006/112/EC) and applicable Dutch tax legislation (Wet op de Omzetbelasting 1968, Art. 35).
              </p>
              <p className="mb-3">Under this arrangement:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Adcure will issue invoices on your behalf</strong> for all commission payouts. 
                  These are known as "self-billing invoices" (zelffacturering).
                </li>
                <li>
                  Each self-billing invoice will contain a sequential invoice number, the date of issue, 
                  the commission amount, applicable VAT details (if any), and the identification of both parties.
                </li>
                <li>
                  You agree to <strong>accept each self-billing invoice</strong> issued by Adcure. 
                  An invoice is deemed accepted unless you raise a written objection within 14 days of receipt.
                </li>
                <li>
                  You agree <strong>not to issue your own invoices</strong> for the commissions covered by this self-billing arrangement, 
                  as doing so would result in duplicate invoicing.
                </li>
                <li>
                  You are responsible for notifying Adcure immediately of any changes to your VAT registration status, 
                  VAT number, or business details.
                </li>
                <li>
                  Both parties agree to retain copies of all self-billing invoices for a minimum period of 7 years 
                  in accordance with Dutch record-keeping requirements.
                </li>
                <li>
                  Either party may terminate this self-billing arrangement by giving 30 days' written notice. 
                  Upon termination, the Affiliate will be required to issue their own invoices for any future commissions.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Affiliate Obligations</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Affiliates must promote Adcure services honestly and must not engage in misleading advertising.</li>
                <li>Spam, unsolicited messaging, or any form of deceptive marketing is strictly prohibited.</li>
                <li>Affiliates may not bid on Adcure brand keywords in paid search campaigns.</li>
                <li>Self-referrals (referring your own purchases) are not eligible for commissions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Termination</h2>
              <p>
                Adcure reserves the right to terminate an affiliate's participation at any time for violation of these terms 
                or for any conduct deemed harmful to Adcure's reputation. Upon termination, any unpaid commissions above 
                the minimum threshold will be paid out within 30 days. Commissions below the minimum threshold are forfeited.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
              <p>
                Adcure shall not be liable for any indirect, incidental, or consequential damages arising from 
                participation in the affiliate program. Adcure's total liability is limited to the commissions earned 
                by the Affiliate in the 3 months preceding the event giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Modifications</h2>
              <p>
                Adcure may modify these terms at any time. Affiliates will be notified of material changes via email. 
                Continued participation after notification constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Governing Law</h2>
              <p>
                These terms are governed by the laws of the Netherlands. Any disputes shall be resolved by the competent 
                courts in the Netherlands.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
