
Problem found:
- The Sync Revolut function is rebuilding subscriptions from Revolut orders, not from Revolut subscription states.
- In that sync logic, completed orders are treated as active subscriptions.
- It checks for an existing subscription using `revolut_subscription_id = order.id`, but for recurring checkout flows the real subscription ID is stored in `payments.payload.subscriptionId`, not the order ID.
- So when you cancel a subscription correctly, the next sync does not match the cancelled row and creates a brand-new active subscription from the old completed order.

Why this happens in your code:
- `cancel-subscription` correctly cancels in Revolut first, then marks the DB row cancelled.
- But `revolut-sync-orders`:
  1. fetches only `/api/orders`
  2. maps `ORDER_COMPLETED` to a completed payment
  3. then inserts a subscription with `status: 'active'`
  4. uses `revolut_subscription_id: orderId`
- That means historical completed orders can keep recreating active subscriptions even after cancellation.

Implementation plan:
1. Fix subscription identity in `revolut-sync-orders`
- Resolve the true subscription ID using:
  - `existingPayment.payload.subscriptionId` first
  - fallback to any subscription-specific value returned by Revolut if present
  - only last-resort fallback to order ID for legacy one-time data
- Use that resolved subscription ID for lookup and insert, not `order.id`.

2. Stop sync from reactivating cancelled subscriptions
- Before inserting/updating, check whether a matching subscription already exists and is `cancelled`.
- If it is cancelled, do not recreate it as active from a completed order.
- Preserve `cancelled_at` and keep the row cancelled unless there is an explicit external active subscription status proving otherwise.

3. Make sync status-aware instead of order-only
- Extend the sync logic so it can determine whether the subscription itself is active or cancelled.
- Best approach: fetch subscription details from Revolut for known subscription IDs during sync and map state to DB status.
- If Revolut says cancelled, update the existing DB row to `cancelled` instead of inserting a new active one.

4. Prevent duplicate subscriptions at the data layer
- Add a database uniqueness guard for `subscriptions.revolut_subscription_id` (likely partial unique index for non-null values).
- This prevents future duplicate rows for the same real subscription and makes sync safer.

5. Backfill existing bad data
- Add a migration to clean up duplicates already created by the broken sync:
  - identify duplicate rows sharing customer/order lineage
  - keep the correct cancelled/real-subscription record
  - mark/remove wrongly recreated active duplicates in a safe, deterministic way
- Special care is needed because your current data already contains both cancelled and re-created active rows for the same customers.

6. Keep related records consistent
- Recompute customer `subscription_count`/`status` based on true active subscriptions after the sync fix.
- Ensure affiliate referral display logic continues to reflect cancelled subscriptions correctly once duplicate active rows are gone.

Files to update:
- `supabase/functions/revolut-sync-orders/index.ts`
- `supabase/migrations/...sql`

Technical details:
- Current bug location:
  - existing lookup: `.eq('revolut_subscription_id', orderId)`
  - insert: `revolut_subscription_id: orderId`
- For subscription checkouts, the real subscription identifier is already stored in:
  - `payments.payload.subscriptionId`
- Because sync currently processes orders only, an old `ORDER_COMPLETED` event is being misinterpreted as “subscription is active now”.
- A unique index on `subscriptions.revolut_subscription_id` will also protect against future accidental duplication.

Expected outcome after the fix:
- Clicking “Sync Revolut” will no longer turn cancelled subscriptions back to active.
- Cancelled subscriptions that are also cancelled in Revolut stay cancelled locally.
- Existing duplicate active rows created by previous syncs are cleaned up.
