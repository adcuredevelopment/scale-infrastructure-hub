

## Problem

The affiliate dashboard shows all referrals as "Active" because the `cancelledEmails` set is always empty. The `useAffiliate` hook queries the `subscriptions` table for cancelled emails, but the **subscriptions table has no RLS policy for affiliate users** — only admins and service_role can read it. So the query returns `[]` even though cancelled subscriptions exist in the database.

## Solution

Add an RLS policy on the `subscriptions` table that allows authenticated affiliate users to read the `customer_email` and `status` of subscriptions that belong to customers they referred.

### Step 1: Add RLS policy on subscriptions table

Create a migration that adds a SELECT policy for authenticated users who are affiliates. The policy allows reading subscriptions where the `customer_email` matches a referral tied to their affiliate record:

```sql
CREATE POLICY "Affiliates can view referred customer subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  customer_email IN (
    SELECT ar.customer_email 
    FROM affiliate_referrals ar
    JOIN affiliates a ON ar.affiliate_id = a.id
    WHERE a.user_id = auth.uid()
  )
);
```

This is scoped: affiliates can only see subscriptions for customers they actually referred.

### Step 2: No code changes needed

The existing `useAffiliate` hook already queries `subscriptions` for cancelled emails and passes them to the `ReferralsTable`. Once the RLS policy allows the query to return data, the Active/Cancelled status will display correctly and stay in sync automatically.

### Technical details
- The subscriptions table currently only has policies for `admin` and `service_role`
- The affiliate user (`david@adcure.agency`) is authenticated but not admin, so all subscription queries return empty
- Database confirms `loonycompadre@gmail.com` and `dobzakelijk@gmail.com` both have cancelled subscriptions
- No frontend code changes required — only a database migration

