

## Fix Admin Dashboard: Emails, Customer Profiles, Analytics & Last-Refresh Indicator

### Problems Identified

1. **Payments page shows no email** — The sync function reads `order.email` from Revolut's API response, which is often `null`. It then overwrites the `payload.email` that was originally stored by `revolut-create-order`. The fix: preserve the existing `payload.email` when the Revolut API returns no email.

2. **Customers not syncing properly** — When the sync creates/updates customers, it works, but the customer `total_spent` only increments if the subscription doesn't already exist. The customer record may also not reflect the latest plan. Additionally, if a customer has multiple orders, each becomes a separate subscription but the customer record doesn't aggregate well.

3. **No customer detail drawer** — Currently clicking a customer row does nothing. Need a Sheet/Drawer that shows all payments, subscriptions, and transactions for that customer.

4. **Analytics page has no auto-refresh** — It uses `useEffect` without `useAutoRefresh` and `useCallback`.

5. **No "last refreshed" indicator** — No visual feedback showing when data was last fetched.

### Plan

#### 1. Fix email preservation in `revolut-sync-orders`
**File:** `supabase/functions/revolut-sync-orders/index.ts`

When building the new payload during sync, prefer the existing `payload.email` over `order.email` when Revolut returns null:
```
const existingEmail = (existingPayment?.payload as any)?.email || null
const finalEmail = email || existingEmail
```
Use `finalEmail` in the payload and for customer/subscription creation.

#### 2. Add "Last Refreshed" indicator component
**New file:** `src/components/admin/LastRefreshed.tsx`

A small component that displays "Last updated: X seconds ago" with a subtle pulsing dot. Updated via a timestamp state returned from a modified `useAutoRefresh` hook.

**Modified file:** `src/hooks/useAutoRefresh.ts`

Return a `lastRefreshed` timestamp from the hook so pages can display it.

#### 3. Add customer detail drawer to AdminCustomers
**File:** `src/pages/admin/AdminCustomers.tsx`

- Make customer rows clickable
- On click, open a `Sheet` (right-side drawer) showing:
  - Customer info (email, name, status, joined date)
  - All subscriptions for that email (fetched from `subscriptions` table where `customer_email = email`)
  - All payments for that email (fetched from `payments` table where `payload->>'email' = email`)
  - Each with status badges, dates, and amounts

#### 4. Fix Analytics auto-refresh
**File:** `src/pages/admin/AdminAnalytics.tsx`

- Wrap `fetchAnalytics` in `useCallback`
- Add `useAutoRefresh(fetchAnalytics)`

#### 5. Add LastRefreshed indicator to all admin pages
**Files:** `AdminOverview.tsx`, `AdminPayments.tsx`, `AdminCustomers.tsx`, `AdminSubscriptions.tsx`, `AdminAnalytics.tsx`, `AdminAffiliates.tsx`

Add the `<LastRefreshed />` component to each page header area, showing the timestamp from `useAutoRefresh`.

### Files to create/modify
- **Create:** `src/components/admin/LastRefreshed.tsx`
- **Modify:** `src/hooks/useAutoRefresh.ts` — return `lastRefreshed` Date
- **Modify:** `supabase/functions/revolut-sync-orders/index.ts` — preserve email from existing payload
- **Modify:** `src/pages/admin/AdminCustomers.tsx` — clickable rows + Sheet drawer with payments/subscriptions
- **Modify:** `src/pages/admin/AdminPayments.tsx` — add LastRefreshed indicator
- **Modify:** `src/pages/admin/AdminOverview.tsx` — add LastRefreshed indicator
- **Modify:** `src/pages/admin/AdminSubscriptions.tsx` — add LastRefreshed indicator
- **Modify:** `src/pages/admin/AdminAnalytics.tsx` — add auto-refresh + LastRefreshed indicator
- **Modify:** `src/pages/admin/AdminAffiliates.tsx` — add LastRefreshed indicator

