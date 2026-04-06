
## Upgrade Checkout: Customer Details, Tax & Revolut Recurring Subscriptions

### What Changes

**Current flow**: Email-only dialog → Revolut one-time order → redirect to checkout
**New flow**: Full details dialog (first name, last name, email, country) → Create Revolut customer → Create Revolut subscription → redirect to Hosted Payment Page

### 1. Expand Checkout Dialog (`PricingSection.tsx`)
- Add fields: **First Name**, **Last Name**, **Email**, **Country** (dropdown with NL pre-selected)
- When country = Netherlands, show 21% BTW breakdown below the price
- Display: "€79.00 + €16.59 BTW = **€95.59** /mo" for Dutch customers
- Non-NL customers pay the base price without tax

### 2. New Edge Function: `revolut-create-subscription`
Replaces `revolut-create-order` for plan purchases. Steps:
1. Validate input (firstName, lastName, email, country, planName)
2. **Create Revolut Customer** via `POST /customers` with name + email
3. **Create Revolut Subscription** via `POST /subscriptions` with:
   - `customer_id` from step 2
   - `plan_variation_id` (pre-configured plan variation)
   - `setup_order_redirect_url` pointing to `/payment-success`
4. Store payment record in DB with full customer details in payload
5. Return the `setup_order.checkout_url` for redirect

### 3. One-Time Setup: Create Subscription Plans in Revolut
Before the edge function works, we need to create 3 subscription plans via the Revolut API:
- **Starter Advertiser**: €79/mo (€95.59 incl. BTW for NL)
- **Growth Advertiser**: €119/mo (€143.99 incl. BTW for NL)
- **Advanced Advertiser**: €149/mo (€180.29 incl. BTW for NL)

Each plan needs 2 variations: one with tax (NL) and one without.

**Question**: Do you want me to create these plans automatically via a script, or do you prefer to set them up manually in your Revolut Business dashboard?

### 4. Update `revolut-webhook` and `revolut-sync-orders`
- Handle new subscription webhook events (`SUBSCRIPTION_ACTIVATED`, `SUBSCRIPTION_CANCELLED`, `ORDER_COMPLETED` for recurring charges)
- Store `customer_name` from the new data in subscriptions table

### 5. Store Customer Details
- Update the `payments.payload` to include `firstName`, `lastName`, `country`
- Update `customers` table with `name` field from checkout data
- Update `subscriptions` table with `customer_name`

### Files to Create/Modify
| File | Action |
|------|--------|
| `supabase/functions/revolut-create-subscription/index.ts` | Create — new subscription flow |
| `src/components/home/PricingSection.tsx` | Modify — expanded checkout dialog |
| `supabase/functions/revolut-webhook/index.ts` | Modify — handle subscription events |
| `supabase/functions/revolut-sync-orders/index.ts` | Modify — sync subscription data |

### Important Notes
- The existing `revolut-create-order` stays for any future one-time product purchases (shop page)
- Revolut subscription plans need to be created once via API before this works
- Tax is calculated server-side to prevent manipulation
