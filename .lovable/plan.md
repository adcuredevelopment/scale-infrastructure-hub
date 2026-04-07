

## Analytics Page Redesign

### Overview
Replace the current basic analytics page with a comprehensive dashboard featuring 6 KPI cards, multiple charts, and detailed breakdowns.

### KPI Cards (top row, 3x2 grid)

1. **MRR** — Sum of `amount` from active subscriptions (same logic as Overview page)
2. **Shop Revenue** — Total from one-time/completed payments that are NOT subscription-related (product purchases)
3. **New Clients** — Count of new customers this month vs last month with % change
4. **MRR Affiliate Payouts** — Monthly recurring affiliate commission costs (from `affiliate_referrals` where `referral_type = 'recurring'`, status not paid, customer not cancelled)
5. **VAT (21% BTW)** — 21% of all completed revenue (subscriptions + shop), shown as the tax obligation
6. **Conversion Rate** — Ratio of completed payments vs total payment attempts (completed / total * 100%)

### Charts Section (tabs: Overview, Revenue, Clients)

**Overview tab:**
- Combined area chart showing Revenue vs Affiliate Payouts vs Net Revenue (after tax + affiliate costs) over last 6 months

**Revenue tab:**
- Monthly revenue bar chart (subscriptions vs shop products stacked)
- Plan distribution pie chart (existing, moved here)

**Clients tab:**
- New clients per month line chart (last 6 months)
- Conversion funnel: total visits → payment initiated → completed (using payment statuses)

### Data Sources
- `subscriptions` table — MRR, plan distribution
- `payments` table — revenue, conversion rate (completed vs pending/failed)
- `customers` table — new client count
- `affiliate_referrals` table — affiliate MRR costs
- `cancelledEmails` derived from cancelled subscriptions — to filter affiliate data

### Technical Details

**Single file change:** `src/pages/admin/AdminAnalytics.tsx`

- Fetch all data in one `fetchAnalytics` callback: subscriptions, payments, customers, affiliate_referrals
- Reuse existing `KPICard` component for the 6 metrics
- Reuse existing recharts setup (AreaChart, BarChart, PieChart)
- Keep `useAutoRefresh` and `LastRefreshed` pattern
- Conversion rate = `(payments with status completed or authorised) / (all payments) * 100`
- VAT calculation: `totalCompletedRevenue * 0.21`
- Month-over-month % changes on all KPI cards where applicable

### Additional Suggestions (included)
- **Net Revenue** card could be added showing: Revenue - VAT - Affiliate Payouts = Net
- **Churn Rate**: cancelled subscriptions this month / total active at start of month — useful metric to track

I'll add a **Net Revenue** as a 7th insight in the overview chart (not a separate KPI to keep it clean), and include **Churn Rate** as a small stat in the Clients tab.

