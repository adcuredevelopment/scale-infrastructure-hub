

# Plan: One-time checkout voor shop pagina's via Revolut

## Doel
Alle 4 shop pagina's (Facebook Accounts, Pages, Structures, Business Managers) krijgen een werkende checkout die:
- Klantgegevens verzamelt (naam, email, land) — zelfde flow als subscriptions
- 21% BTW toevoegt voor NL-klanten (prijzen zijn nu excl. BTW)
- Een **eenmalige betaling** afrekent via Revolut Merchant API (ipv recurring subscription)
- Affiliate code meestuurt voor referral attribution
- Doorstuurt naar `/payment-success` na betaling

## Architectuur

```text
ShopProductGrid "Order Now" 
   → CheckoutDialog (naam/email/land, BTW preview)
       → revolut-create-shop-order (NEW edge function)
           → Revolut Merchant API /orders
               → checkout_url → klant betaalt
                   → revolut-webhook (bestaand) → ORDER_COMPLETED
                       → payments + customers + notifications
```

## Wijzigingen

### 1. Nieuwe edge function `revolut-create-shop-order`
- Input: `productName`, `amount` (excl BTW), `email`, `firstName`, `lastName`, `country`, `affiliateCode`
- **Server-side allowlist**: alle 13 shop producten met hun prijzen worden hardcoded in de function (zelfde patroon als `revolut-create-order` voor plans). Dit voorkomt dat klanten zelf bedragen kunnen kiezen.
- Berekent BTW (21%) als `country === "NL"`, totaal = bedrag + BTW
- Maakt Revolut order aan met `capture_mode: 'automatic'` (eenmalig, geen subscription)
- Slaat op in `payments` tabel met `payload.type = 'shop_order'`, product, amount, email, country, vat, affiliateCode
- Redirect URL: `/payment-success?product=<name>&email=<email>`
- CORS headers + email validatie

### 2. Nieuwe component `src/components/shop/ShopCheckoutDialog.tsx`
Hergebruikt het patroon uit `PricingSection`:
- Velden: First Name, Last Name, Email, Country (zelfde EU lijst)
- Live BTW breakdown: subtotaal, BTW (21% indien NL), totaal
- "Continue to Payment" knop → roept `revolut-create-shop-order` aan → redirect naar `checkout_url`
- Loading state, error toasts

### 3. Update `ShopProductGrid.tsx`
- Vervang `<Link to="/contact">` door `onClick` die de dialog opent met geselecteerd product
- Voeg `amount: number` toe aan Product interface (excl BTW, in EUR)
- State management voor selected product binnen de grid

### 4. Update alle 4 shop pagina's
Voeg `amount` numeriek toe aan elk product object (parsed uit huidige `price` strings):
- **FacebookAccounts**: 30, 35, 40, 60
- **FacebookPages**: 7.50, 20, 30, 80
- **FacebookStructures**: 175, 225
- **BusinessManagers**: 95, 115, 250

### 5. Update `revolut-webhook/index.ts`
Bij `ORDER_COMPLETED` moet de webhook onderscheid maken tussen:
- `payload.type === 'shop_order'` → update `customers` (total_spent, last_payment_at), maak notification, **GEEN** subscription record. Affiliate commissie geldt niet voor shop orders (alleen voor recurring subscriptions blijft bestaan).
- Anders (bestaande logic) → subscription flow

### 6. Update `PaymentSuccess.tsx`
Detect `?product=` query param. Indien aanwezig, toon shop-variant van bedankpagina (zonder portal signup steps; gewoon "We sturen je de details binnen 1 uur per email").

## Technische details

**BTW**: Frontend toont breakdown, backend herberekent (never trust client). Revolut ontvangt het totaalbedrag inclusief BTW.

**Geen affiliate commissie op shop**: Shop orders zijn one-off. We slaan `affiliateCode` wel op in de payment payload voor tracking, maar de webhook maakt geen `affiliate_referrals` record voor `type === 'shop_order'`.

**Email/notificatie**: Webhook stuurt geen "subscription confirmed" email voor shop orders. Optioneel kan later een aparte `shop-order-confirmed` template komen — voor nu volstaat de admin notification.

