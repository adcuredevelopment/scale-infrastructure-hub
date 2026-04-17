

# Plan: Automatische Customer Invoices (PDF met logo, per email)

## Doel
Bij elke succesvolle betaling stuur je de klant automatisch een professionele PDF-factuur met Adcure-logo:
- **Shop orders** (eenmalige aankoop)
- **Eerste subscription signup**
- **Elke maandelijkse recharge** (subscription renewal)

## Wat wordt opgebouwd

### 1. Nieuwe storage bucket `customer-invoices` (private)
PDF's worden hier opgeslagen onder pad `<email>/<invoice_number>.pdf`. Admin-only RLS, signed URLs voor download in admin panel.

### 2. Nieuwe tabel `customer_invoices`
Houdt elke uitgegeven factuur bij voor admin-overzicht & boekhouding:
- `invoice_number` (formaat `INV-2026-000123`, sequentieel via Postgres sequence)
- `customer_email`, `customer_name`
- `type` (`shop_order` | `subscription_initial` | `subscription_renewal`)
- `product_name`, `subtotal`, `vat_amount`, `vat_rate`, `total`, `currency`
- `payment_id`, `subscription_id` (refs)
- `pdf_path`, `issued_at`, `country`
- RLS: admins read/write, service role full access

### 3. Nieuwe edge function `generate-customer-invoice`
Wordt server-side aangeroepen vanuit `revolut-webhook`. Doet:
1. Haalt betaling/klantgegevens op
2. Genereert sequentieel factuurnummer (`nextval_customer_invoice` RPC)
3. Bouwt **echte PDF** met `pdf-lib` (npm) — Adcure logo bovenaan, factuurdetails, BTW-breakdown, juridische voettekst
4. Upload naar `customer-invoices` bucket
5. Insert record in `customer_invoices`
6. Triggert email via `send-transactional-email` met nieuwe template `customer-invoice` en signed URL als download-link

### 4. Nieuwe email template `customer-invoice.tsx`
Korte branded mail met:
- Adcure logo
- "Your invoice is ready"
- Bedrag + factuurnummer
- Grote download-knop → signed URL (7 dagen geldig) naar PDF in storage
- Reply-to support@adcure.agency

### 5. Webhook integratie (`revolut-webhook`)
Op `ORDER_COMPLETED` voegt webhook toe:
- **Shop order branch**: na bestaande shop-order-confirmed email → ook `generate-customer-invoice` aanroepen met type `shop_order`
- **Subscription branch**: bij elke completed payment → `generate-customer-invoice` aanroepen
  - Eerste payment voor subscription → type `subscription_initial`
  - Volgende payments (recharge) → type `subscription_renewal`
  - Detectie via check op bestaande subscription + count van eerdere completed payments voor die customer/subscription

### 6. Admin UI: nieuwe tab in `AdminPayments`
Knop "Download Invoice" per row die al een invoice heeft. Als invoice ontbreekt: "Generate Invoice" knop (admin failsafe).

## PDF design (één pagina, A4)

```text
┌─────────────────────────────────────────┐
│  [ADCURE LOGO]                          │
│                                         │
│  INVOICE                                │
│  Invoice No: INV-2026-000123            │
│  Date: 17 April 2026                    │
│                                         │
│  From:                  To:             │
│  Adcure Agency          John Doe        │
│  The Netherlands        john@email.com  │
│  KVK: xxxxxxxx          NL              │
│  VAT: NLxxxxxxxxxB01                    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Description           Amount      │  │
│  │ FB Vietnamese Account €30.00      │  │
│  │ Subtotal              €30.00      │  │
│  │ VAT (21%)             €6.30       │  │
│  │ TOTAL                 €36.30      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Payment status: PAID                   │
│  Payment method: Revolut                │
│                                         │
│  Thank you for your business.           │
│  support@adcure.agency                  │
└─────────────────────────────────────────┘
```

## Technische details

- **PDF library**: `pdf-lib` via `npm:pdf-lib@1.17.1` (werkt in Deno edge functions, geen native deps)
- **Logo**: ophalen vanuit bestaande `email-assets/adcure-logo.png` bucket en embedden in PDF
- **Subscription renewal detectie**: tellen van `payments` rows met `payload.email = X AND payload.plan = Y AND status = 'completed'` — als > 1 dan `subscription_renewal`
- **Idempotency**: `customer_invoices` heeft unique constraint op `payment_id` zodat dubbele webhooks geen dubbele facturen maken
- **VAT logic**: hergebruikt bestaande logica (21% voor NL, 0% voor andere EU landen — voor consistency met huidige checkout)
- **Email subject**: `"Invoice INV-2026-000123 from Adcure"`
- **Rust van bestaande code**: `affiliate-invoices` bucket en `affiliate_invoices` tabel blijven ongemoeid (zijn voor self-billing payouts, totaal andere flow)

## Bestanden die aangemaakt/aangepast worden

**Nieuw:**
- migration: bucket `customer-invoices` + tabel `customer_invoices` + sequence + RPC + RLS
- `supabase/functions/generate-customer-invoice/index.ts`
- `supabase/functions/generate-customer-invoice/deno.json`
- `supabase/functions/_shared/transactional-email-templates/customer-invoice.tsx`

**Aangepast:**
- `supabase/functions/_shared/transactional-email-templates/registry.ts` (registreer nieuwe template)
- `supabase/functions/revolut-webhook/index.ts` (invoke generate-customer-invoice in beide branches)
- `src/pages/admin/AdminPayments.tsx` (Download Invoice knop per row)

