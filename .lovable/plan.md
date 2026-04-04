

## Fix: Affiliate Dashboard Not Updating

### Root Cause Analysis

Two issues are preventing the affiliate dashboard from showing commission data:

**Issue 1: Payment still pending**
The payment `69d1872a` for `dobzakelijk@gmail.com` with affiliate code `50C8FA41` has status `pending`. The Revolut webhook has never been called for this order (no webhook logs exist at all). This means either:
- The customer hasn't completed payment yet on Revolut's side
- The Revolut webhook URL is not configured correctly in the Revolut merchant dashboard

**Issue 2: `revolut-sync-orders` drops affiliate data**
When the sync function processes completed orders, it **overwrites the payment payload** — losing the `affiliateCode` that was stored by `revolut-create-order`. It also never calls the affiliate commission logic (`handleAffiliateCommission`). So even if the order completes and gets synced, no referral record is created.

### Fix Plan

**1. Update `revolut-sync-orders` to preserve `affiliateCode` and attribute commissions**

When syncing an order that transitions to `completed`:
- Read the existing payment record's `affiliateCode` from the stored payload before overwriting
- After syncing customers/subscriptions, call the same affiliate commission logic used in `revolut-webhook`
- Store the `affiliate_code` on the subscription record

**2. Extract shared affiliate commission logic**

The `handleAffiliateCommission` function and `SIGNUP_BONUSES` constants from `revolut-webhook` need to be replicated in `revolut-sync-orders` (edge functions can't share code easily, so we duplicate the logic).

### Files to Modify

- `supabase/functions/revolut-sync-orders/index.ts` — add affiliate commission handling when syncing completed orders, preserve `affiliateCode` in payload merging

### What This Does NOT Fix

The webhook itself not firing is a Revolut configuration issue. You need to verify in Revolut's merchant dashboard that the webhook URL points to:
`https://uwncaohygevjvtgkazvv.supabase.co/functions/v1/revolut-webhook`

