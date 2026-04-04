

## Affiliate Dashboard — Plan

### Overview
Build a full affiliate tracking system: affiliates register/login, get a unique referral link, and earn commissions on payments made through that link. They see earnings, graphs, and payout history on a dedicated dashboard.

### Phase 1: Database Tables (Migration)

**New tables:**

1. **`affiliates`** — stores affiliate accounts
   - `id` (uuid, PK), `user_id` (uuid, references auth.users), `affiliate_code` (text, unique — used in referral URLs), `display_name`, `email`, `payout_method` (text), `payout_details` (text), `status` (active/suspended), `created_at`, `updated_at`

2. **`affiliate_referrals`** — tracks each referred payment
   - `id` (uuid, PK), `affiliate_id` (uuid, FK → affiliates), `payment_id` (uuid, FK → payments), `customer_email`, `plan_name`, `payment_amount` (numeric), `commission_rate` (numeric, default 0.20), `commission_amount` (numeric), `status` (pending/approved/paid), `created_at`

3. **`affiliate_payouts`** — payout records
   - `id` (uuid, PK), `affiliate_id` (uuid, FK → affiliates), `amount` (numeric), `currency` (text, default EUR), `status` (pending/processing/paid/failed), `payout_date`, `notes`, `created_at`

**RLS policies:**
- Affiliates can only read their own data (affiliate record, referrals, payouts) via `auth.uid() = user_id`
- Admins get full access via `has_role()`
- Service role gets full access for edge functions

### Phase 2: Referral Link Tracking

**How it works:**
- Each affiliate gets a unique code (e.g. `adcure.agency/?ref=ABC123`)
- When a visitor lands with `?ref=`, the code is stored in `localStorage` (persists 30 days)
- At checkout (PricingSection), the `ref` code is sent along with `planName` and `email` to `revolut-create-order`

**Edge function changes:**
- **`revolut-create-order`**: Accept optional `affiliateCode` param, store it in the payment `payload`
- **`revolut-webhook`**: On `ORDER_COMPLETED`, check if payment has an `affiliateCode` in payload → look up affiliate → create `affiliate_referrals` record with calculated commission

### Phase 3: Affiliate Auth

- Affiliates register and login via standard email/password auth (same Supabase auth)
- On signup, create an `affiliates` record with a generated unique code
- Route: `/affiliate/dashboard` (protected, requires authenticated affiliate)
- Route: `/affiliate/login` and `/affiliate/register`

### Phase 4: Affiliate Dashboard Page

Single page at `/affiliate/dashboard` containing:

1. **KPI Cards** — Total earnings, pending payouts, total referrals, conversion rate
2. **Earnings Chart** — Line graph (Recharts) showing commissions over time (monthly)
3. **Referral Link** — Copyable affiliate link with share button
4. **Recent Referrals Table** — Customer email (masked), plan, commission, status, date
5. **Payouts Section** — Table of payouts with status badges (pending/processing/paid)

### Phase 5: Admin Integration

- Add affiliate management to the existing admin dashboard (view affiliates, approve payouts, see referral stats)
- Admin can create payouts for affiliates and update payout status

### Technical Details

- Referral code capture: `useEffect` in App.tsx reads `?ref=` from URL and stores in localStorage with a 30-day expiry
- Commission calculation: 20% recurring, done server-side in the webhook
- The affiliate dashboard uses the same dark theme and design system as the admin dashboard
- Charts use Recharts (already installed)
- No new edge functions needed beyond modifying existing ones

### Files to Create/Modify

**New files:**
- `src/pages/affiliate/AffiliateDashboard.tsx`
- `src/pages/affiliate/AffiliateLogin.tsx`
- `src/pages/affiliate/AffiliateRegister.tsx`
- `src/components/affiliate/AffiliateLayout.tsx`
- `src/components/affiliate/EarningsChart.tsx`
- `src/components/affiliate/ReferralLink.tsx`
- `src/components/affiliate/ReferralsTable.tsx`
- `src/components/affiliate/PayoutsTable.tsx`
- `src/hooks/useAffiliate.ts`

**Modified files:**
- `src/App.tsx` — add affiliate routes
- `src/components/home/PricingSection.tsx` — pass affiliate code to checkout
- `supabase/functions/revolut-create-order/index.ts` — accept & store affiliate code
- `supabase/functions/revolut-webhook/index.ts` — create referral on completed payment
- `src/pages/Affiliate.tsx` — update CTA buttons to link to register/login
- Database migration for new tables + RLS

