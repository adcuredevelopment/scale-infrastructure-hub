

## Automatic Affiliate Commission & Bonus System

### What changes

Currently, affiliate referrals are created as "pending" and require manual admin approval. The user wants:
1. **One-time signup bonus** automatically created when a referred customer's first payment completes
2. **20% recurring commission** automatically created on every subsequent payment from a referred customer
3. **Automatic stop** when the customer's subscription is cancelled/expires

### Database changes

**Add columns to `affiliate_referrals`:**
- `referral_type` (text, default `'recurring'`) — values: `'signup_bonus'` or `'recurring'`

**Add column to `subscriptions`:**
- `affiliate_code` (text, nullable) — tracks which affiliate referred this subscription, so recurring payments can be attributed

### Bonus amounts (server-side constant)
```
Starter Advertiser (€79)  → €20 bonus
Growth Advertiser (€119)  → €30 bonus  
Advanced Advertiser (€149) → €50 bonus
```

### Webhook logic changes (`revolut-webhook/index.ts`)

On `ORDER_COMPLETED`:
1. Check if payment has `affiliateCode` in payload (first purchase via ref link)
2. **Also** check if customer email has an active subscription with an `affiliate_code` stored (recurring purchase)
3. For first-time referral:
   - Create signup bonus referral (`referral_type: 'signup_bonus'`, status `'approved'`)
   - Create recurring commission referral (`referral_type: 'recurring'`, status `'approved'`)
   - Store `affiliate_code` on the subscription record
4. For recurring payment (customer already has subscription with `affiliate_code`):
   - Look up the affiliate by code
   - Check subscription is still `active`
   - Auto-create approved commission referral
5. Set referral status to `'approved'` automatically (no manual approval needed)

On subscription cancellation (when customer cancels or payment fails repeatedly):
- The subscription status becomes `cancelled`/`failed`
- Future payments won't trigger new referrals because the subscription check fails

### Frontend changes

**`useAffiliate.ts`**: Update `totalEarnings` to include `approved` status (already does).

**`EarningsChart.tsx`**: No changes needed.

**`ReferralsTable.tsx`**: Show `referral_type` column (bonus vs recurring).

**`AffiliateDashboard.tsx`**: Add a "Signup Bonuses" KPI card.

**`AdminAffiliates.tsx`**: Show referral type in the referrals tab.

### Files to modify
- `supabase/migrations/` — new migration for `referral_type` column and `affiliate_code` on subscriptions
- `supabase/functions/revolut-webhook/index.ts` — auto-approve logic, bonus creation, recurring attribution
- `src/components/affiliate/ReferralsTable.tsx` — show referral type
- `src/pages/affiliate/AffiliateDashboard.tsx` — bonus KPI
- `src/pages/admin/AdminAffiliates.tsx` — show referral type
- `src/hooks/useAffiliate.ts` — minor: add bonus earnings calc

