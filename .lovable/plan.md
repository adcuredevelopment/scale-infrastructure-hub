

## Fix: Inaccurate Affiliate Referral Count & Data Integrity

### Root Cause

There are **4 referral records** in the database for affiliate `50C8FA41` (David), but only **1 actual customer** (`dobzakelijk@gmail.com`) was referred. Here's what happened:

1. The customer made 3 payments: €79 (Starter Advertiser), €12.10 (test), and €1 (test)
2. When the sync ran for the €79 order, it correctly created a recurring commission (€15.80) and signup bonus (€20)
3. But the sync also processed the old €12.10 and €1 test payments. Because the customer's subscription now had `affiliate_code = 50C8FA41`, the recurring attribution logic created commissions for those too (€2.42 and €0.20)
4. Those 2 extra commissions are incorrect — the test payments happened before the affiliate link was used

Additionally, there's a **critical bug** in the sync function: `existingPayment` is referenced on line 259 before it's declared on line 284, which would cause a runtime error.

### Fix Plan

#### 1. Fix the sync function bug + prevent false attribution
**File:** `supabase/functions/revolut-sync-orders/index.ts`

- Move `existingPayment` query before its first usage
- Add a guard to recurring commission attribution: only create commissions for orders placed **after** the subscription's `affiliate_code` was set. Compare the order's `created_at` with the subscription's `started_at` that has the affiliate code
- This prevents old/test payments from getting retroactive commissions

#### 2. Clean up bogus referral data
**Migration:** Delete the 2 incorrect referral records (€2.42 and €0.20 for "Unknown" plan) and the corresponding test subscriptions

#### 3. Fix referral count to show unique customers
**File:** `src/pages/admin/AdminAffiliates.tsx`

- Change `getAffiliateReferralCount` to count **unique customer emails** instead of total referral records
- Change the KPI "Total Referrals" to also show unique customers
- This gives an accurate picture: 1 customer referred = 1 referral, regardless of how many commission records exist (recurring + bonus)

#### 4. Fix webhook recurring attribution with same guard
**File:** `supabase/functions/revolut-webhook/index.ts`

Add the same date-based guard to prevent retroactive commissions on old payments.

### Data Cleanup (Migration)

```sql
-- Delete bogus referral records for test payments
DELETE FROM affiliate_referrals 
WHERE customer_email = 'dobzakelijk@gmail.com' 
  AND plan_name = 'Unknown';

-- Delete test subscriptions
DELETE FROM subscriptions 
WHERE customer_email = 'dobzakelijk@gmail.com' 
  AND plan_name = 'Unknown';
```

### Files to modify
- **Modify:** `supabase/functions/revolut-sync-orders/index.ts` — fix variable ordering bug, add date guard for recurring attribution
- **Modify:** `supabase/functions/revolut-webhook/index.ts` — add date guard for recurring attribution
- **Modify:** `src/pages/admin/AdminAffiliates.tsx` — count unique customers for referral metrics
- **Migration:** Clean up bogus referral and subscription records

