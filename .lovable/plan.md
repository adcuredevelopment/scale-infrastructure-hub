

## Plan: Affiliate TOS + Self-Billing Invoices & Late Cancellation Billing Notice

### Background Research

**Self-billing invoices (EU/NL):** Under EU VAT Directive (Art. 224), a buyer can issue invoices on behalf of the supplier ("self-billing") if:
1. There is a **prior written agreement** between both parties
2. Each invoice is **accepted** by the supplier (or a procedure exists for acceptance)
3. The invoice contains all standard VAT elements (sequential number, date, VAT ID if applicable, amounts)

For affiliate commissions, Adcure (the buyer of affiliate services) issues the invoice on behalf of the affiliate (supplier). This is standard practice for affiliate programs in the EU.

**Late cancellation policy:** The existing subscription policy states cancellation must occur ≥14 days before renewal. Revolut cancels immediately with no proration. So the system needs to check if the cancellation is within 14 days of the next billing date and inform the customer that one final charge will occur.

---

### Feature 1: Affiliate TOS with Self-Billing Agreement

**What changes:**

1. **New TOS page** (`/affiliate/terms`) — A dedicated Affiliate Terms of Service page containing:
   - Commission structure (signup bonus + 20% recurring)
   - Payment terms (monthly payouts, minimum threshold)
   - **Self-billing clause**: Explicit agreement that Adcure will issue self-billing invoices on behalf of the affiliate for all commission payouts. Includes: acceptance procedure, sequential numbering, VAT details requirement, record-keeping obligations
   - Termination and general terms

2. **Registration form update** (`AffiliateRegister.tsx`) — Add a required checkbox: "I agree to the Affiliate Terms of Service, including the self-billing arrangement" with a link to `/affiliate/terms`. Registration is blocked until accepted.

3. **Database migration** — Add `tos_accepted_at` (timestamptz, nullable) column to the `affiliates` table. The edge function stores the timestamp when TOS is accepted.

4. **Edge function update** (`affiliate-register`) — Accept and store `tosAcceptedAt` in the affiliates record.

5. **Self-billing invoice generation** — This will be handled through the existing admin payout flow. When an admin finalizes a payout:
   - An edge function generates a PDF self-billing invoice with sequential numbering
   - Invoice is stored in a Supabase Storage bucket (`affiliate-invoices`)
   - Invoice is emailed to the affiliate via transactional email with a download link
   - Invoice data is stored in a new `affiliate_invoices` table for record-keeping

6. **New DB table: `affiliate_invoices`** — Tracks issued self-billing invoices:
   - `id`, `affiliate_id`, `payout_id`, `invoice_number` (sequential), `amount`, `currency`, `issued_at`, `pdf_path`, `created_at`

7. **New edge function: `generate-self-billing-invoice`** — Called when admin marks a payout as completed. Generates PDF, stores it, enqueues email.

---

### Feature 2: Late Cancellation Billing Notification

**What changes:**

1. **Cancel subscription flow update** (`cancel-subscription` edge function) — Before cancelling, check the `expires_at` date on the subscription. If cancellation is within 14 days of next billing (`expires_at`), the system:
   - Still cancels via Revolut (immediate cancellation)
   - But sets a flag `late_cancellation: true` in the response
   - Creates a notification for the admin: "Late cancellation — customer may have been billed for final month"

2. **Enhanced cancellation email** — When late cancellation is detected, the cancellation confirmation email includes additional text explaining that the cancellation was processed but since it was within the 14-day notice period, the final billing cycle applies as per the subscription policy.

3. **Admin subscription drawer** — Show a "Late cancellation" badge in the detail drawer when `cancelled_at` was within 14 days of `expires_at`.

4. **Admin cancellation confirmation dialog** — When the admin clicks "Cancel Subscription" and it's within 14 days of next billing, show an additional warning: "This is a late cancellation (within 14 days of next billing on [date]). The customer's final month has already been or will be billed."

---

### Technical details

**Feature 1 — files to create/modify:**
- Create `src/pages/affiliate/AffiliateTerms.tsx` (TOS page)
- Modify `src/App.tsx` (add route)
- Modify `src/pages/affiliate/AffiliateRegister.tsx` (add checkbox)
- Modify `supabase/functions/affiliate-register/index.ts` (store TOS timestamp)
- DB migration: add `tos_accepted_at` to `affiliates`
- Create `supabase/functions/generate-self-billing-invoice/index.ts`
- DB migration: create `affiliate_invoices` table with RLS
- Create storage bucket `affiliate-invoices`
- Create transactional email template `payout-invoice`

**Feature 2 — files to modify:**
- Modify `supabase/functions/cancel-subscription/index.ts` (late cancellation check)
- Modify `src/pages/admin/AdminSubscriptions.tsx` (warning dialog + badge)
- Optionally create a variant cancellation email template or add conditional text to the existing one

