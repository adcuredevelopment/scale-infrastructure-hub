

## Fix: Revolut Sync Pagination + Auto-Refresh Admin Pages

### Problem 1: Revolut sync misses orders
The sync function fetches with `limit=500` but the Revolut Merchant API uses cursor-based pagination. If there are more than 500 orders, the rest are never fetched. The function needs to loop through all pages using the `created_at` cursor.

### Problem 2: Admin pages don't auto-refresh
All admin pages (Overview, Payments, Customers, Subscriptions, Affiliates) only fetch data once on mount. There's no polling or auto-refresh mechanism.

---

### Fix 1: Add pagination to `revolut-sync-orders`

**File:** `supabase/functions/revolut-sync-orders/index.ts`

Replace the single API call with a loop:
- Fetch orders with `limit=500` and `from_created_date`
- After each batch, use the last order's `created_at` as the new `from_created_date`
- Continue until a batch returns fewer than 500 orders (indicating the last page)
- This ensures all orders across all pages are synced

### Fix 2: Add 30-second auto-refresh to all admin pages

Create a shared hook `src/hooks/useAutoRefresh.ts` that:
- Accepts a fetch function and interval (default 30s)
- Sets up `setInterval` to call the fetch function silently in the background
- Cleans up on unmount
- Does NOT trigger loading states or page re-renders beyond data updates

**Pages to update (add auto-refresh):**
- `src/pages/admin/AdminOverview.tsx` — call `fetchDashboardData` every 30s
- `src/pages/admin/AdminPayments.tsx` — extract fetch function, poll every 30s
- `src/pages/admin/AdminCustomers.tsx` — extract fetch function, poll every 30s
- `src/pages/admin/AdminSubscriptions.tsx` — poll `fetchSubscriptions` every 30s
- `src/pages/admin/AdminAffiliates.tsx` — extract fetch function, poll every 30s

### Technical approach

```typescript
// src/hooks/useAutoRefresh.ts
export function useAutoRefresh(fetchFn: () => Promise<void>, intervalMs = 30000) {
  useEffect(() => {
    const id = setInterval(fetchFn, intervalMs);
    return () => clearInterval(id);
  }, [fetchFn, intervalMs]);
}
```

Each admin page will wrap its fetch function in `useCallback` and pass it to this hook. The initial `loading` state only applies on first load — subsequent refreshes update data silently.

### Files to create/modify
- **Create:** `src/hooks/useAutoRefresh.ts`
- **Modify:** `supabase/functions/revolut-sync-orders/index.ts` (pagination loop)
- **Modify:** `src/pages/admin/AdminOverview.tsx` (add auto-refresh)
- **Modify:** `src/pages/admin/AdminPayments.tsx` (extract fetch, add auto-refresh)
- **Modify:** `src/pages/admin/AdminCustomers.tsx` (extract fetch, add auto-refresh)
- **Modify:** `src/pages/admin/AdminSubscriptions.tsx` (add auto-refresh)
- **Modify:** `src/pages/admin/AdminAffiliates.tsx` (extract fetch, add auto-refresh)

