

## Plan: Fix Active Referrals KPI Logic

### Problem
The "Active Referrals" KPI filters out `signup_bonus` referral types, so a new affiliate who just got their first referral (which is always a signup bonus) sees "0 Active Referrals" even though they have an active referred customer. This is confusing.

The MRR showing €0.00 is **correct** — recurring commissions only start from month 2. No change needed there.

### Changes

**1. Fix `activeReferrals` calculation (`src/hooks/useAffiliate.ts`)**
- Change from counting non-signup-bonus commission records to counting **unique referred customers with active subscriptions**
- Count distinct `customer_email` values from all referrals, excluding those in the `cancelledEmails` set
- This gives a true count of active referred customers

```typescript
// Before (broken):
const activeReferrals = referrals.filter(
  (r) => r.referral_type !== "signup_bonus" && r.status !== "paid"
).length;

// After (correct):
const uniqueEmails = new Set(
  referrals
    .filter((r) => r.customer_email)
    .map((r) => r.customer_email!.toLowerCase())
);
const activeReferrals = [...uniqueEmails].filter(
  (email) => !cancelledEmails.has(email)
).length;
```

### Technical details
- Only `src/hooks/useAffiliate.ts` needs to change (lines 102-105)
- No database or edge function changes needed
- The `cancelledEmails` set already handles cancelled subscription detection correctly
- This will show "1" for David's dashboard since `joeydekker01@gmail.com` is not cancelled

