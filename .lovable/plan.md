

## Problem

The referral count in the drawer header says "0" but the referral list still shows entries. This happens because:

- `getAffiliateReferralCount()` filters out cancelled subscription emails -- returns 0
- `affReferrals` only filters out `status !== "paid"` but does NOT filter out cancelled subscription emails -- still shows loonycompadre's referral

## Fix

**File: `src/pages/admin/AdminAffiliates.tsx`**

Update the `affReferrals` computation (around line 156) to also exclude referrals for cancelled subscriptions:

```typescript
const affReferrals = selectedAffiliate
  ? getAffiliateReferrals(selectedAffiliate.id).filter(
      (r) => r.status !== "paid" && 
             !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase()))
    )
  : [];
```

This ensures the referral list and the referral count use the same filtering logic: cancelled subscription referrals are hidden everywhere.

