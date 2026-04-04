
## Revolut Merchant API Integration Plan

### What we need to set up:

**1. Enable Lovable Cloud (Backend)**
- Required for edge functions to securely handle Revolut API calls and webhooks

**2. Revolut API Keys**
- You'll need your **Revolut Merchant API secret key** from [Revolut Business → Developer → API Keys](https://business.revolut.com/settings/api)
- We'll store it securely as a secret

**3. Edge Functions (Backend Code)**
- **`revolut-create-order`** — Creates a Revolut order via the Merchant API when a user clicks "Get Started". This replaces the current direct checkout links with API-created orders that include a `redirect_url` back to your site
- **`revolut-webhook`** — Receives Revolut webhook notifications when payment is completed, so you can track successful payments

**4. Post-Payment Flow**
- User clicks "Get Started" → Edge function creates a Revolut order → User is redirected to Revolut checkout
- After successful payment → Revolut redirects to a "success" page on your site
- Success page redirects user to `portal.adcure.agency` sign-up with their email pre-filled (if available)

**5. Frontend Changes**
- Replace static checkout URLs with dynamic order creation
- Create a `/payment-success` page that handles the redirect to portal
- Update pricing buttons to call the edge function

### What you'll need to provide:
- Revolut Merchant API secret key (sandbox for testing, production for live)
- Confirm the 3 subscription product/plan IDs from your Revolut Business dashboard

### Important notes:
- The current pre-built checkout links (`checkout.revolut.com/subscription/...`) will be replaced with API-created orders
- Revolut's Merchant API uses order creation → payment widget/redirect → capture flow
- We'll use `automatic` capture mode so payments process immediately
