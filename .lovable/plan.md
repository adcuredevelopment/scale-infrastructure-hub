

## Plan: Admin Payouts & Invoices Management

### What we're building

A dedicated section in the admin affiliate detail drawer (and optionally a global overview) to view all self-billing invoices linked to payouts, see payout statuses clearly, and download/view generated invoices.

### Changes

**1. Fetch invoices alongside existing data (`AdminAffiliates.tsx`)**
- Add `affiliate_invoices` to the `fetchAll` query
- Store invoices in state, keyed by `payout_id` for easy lookup

**2. Enhance payout cards in the affiliate detail drawer**
- Show invoice info (invoice number, issued date) on each payout card when an invoice exists
- Add a "View Invoice" button that opens the stored HTML invoice in a new tab (via Supabase Storage signed URL)
- Add a "Regenerate Invoice" button for paid payouts that failed invoice generation
- Show a visual indicator (checkmark or warning icon) for whether the invoice was successfully generated

**3. Add an "Invoices" section in the affiliate detail drawer**
- Below the Payouts section, add a dedicated Invoices list showing all invoices for that affiliate
- Each row: invoice number, amount, issued date, and a download/view button
- Uses the existing `affiliate_invoices` table data

**4. Add a "Failed" button on payouts**
- Allow marking payouts as "failed" from pending/processing states for tracking purposes

### Technical details

- Invoice viewing uses `supabase.storage.from('affiliate-invoices').createSignedUrl(path, 3600)` to generate a temporary URL
- No new database tables or migrations needed — `affiliate_invoices` table already exists with proper RLS
- No new routes — everything stays within the existing affiliate detail drawer
- Interface type extended to include invoice fields

