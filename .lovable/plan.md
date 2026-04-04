

## Problem Analysis

The payment workflow fails because:

1. **Starter plan** uses a direct Revolut checkout link that bypasses the edge function entirely — no DB record, no webhook, no redirect to `/payment-success`
2. **All plans** need to use the Merchant API, but `revolut-create-order` requires JWT authentication — new paying users aren't logged in (this site has no auth)
3. **Webhook** endpoint exists but Revolut may not be configured to call it

## Plan

### 1. Make `revolut-create-order` work without authentication

Since paying users are anonymous visitors (not logged into your site), the edge function must accept unauthenticated requests. We'll:
- Remove the JWT/auth requirement from the edge function
- Add rate-limiting protection via input validation (email required, amount must match known plans)
- Add a server-side allowlist of valid plan configurations so callers can't create arbitrary orders
- Store payments with `user_id = null` (already nullable)

### 2. Update all 3 plans to use the Merchant API

- Remove the `checkoutUrl` from Starter Advertiser
- Add `amount: 79` to Starter plan config
- All plans will call the edge function, which creates a Revolut order and returns a checkout URL

### 3. Add email collection before checkout

Since we need the user's email for the Revolut order and for post-payment portal signup:
- Add a simple email input dialog/modal that appears when clicking "Get Started"
- Email is passed to the edge function and included in the Revolut order
- Email is also passed as a query param to the success page for display

### 4. Verify webhook configuration

- Confirm the webhook edge function is deployed
- Provide the webhook URL you need to register in Revolut Business dashboard:
  `https://uwncaohygevjvtgkazvv.supabase.co/functions/v1/revolut-webhook`

### Technical details

**Edge function changes (`revolut-create-order`):**
- Remove `getClaims()` auth check
- Add server-side plan validation (only allow known plan/amount/currency combos)
- Require email field
- Keep service-role insert for DB tracking

**Frontend changes (`PricingSection.tsx`):**
- Remove `checkoutUrl` from Starter plan, add `amount: 79`
- Add email collection dialog before calling the edge function
- Pass email to success page via query param

**No database changes needed** — `user_id` is already nullable.

