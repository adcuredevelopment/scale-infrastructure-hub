
## Admin Dashboard — Volledig Plan

### Phase 1: Database & Auth Setup

**New tables (migration):**
- `profiles` — admin user profiles (user_id, display_name, avatar_url, role)
- `user_roles` — role management (user_id, role enum: admin/moderator/user)
- `subscriptions` — subscription tracking (customer_email, plan_name, status, started_at, expires_at, revolut_subscription_id)
- `customers` — customer management (email, name, plan, status, created_at, total_spent)
- `notifications` — system notifications (type, title, message, read, created_at)
- `revenue_milestones` — gamification milestones (name, target_amount, achieved_at, badge_icon)

**Auth:**
- Admin login page with email/password
- RLS policies: only authenticated admins can access dashboard data
- Auto-confirm disabled, manual admin approval

### Phase 2: Edge Functions (Revolut API)

**New edge functions:**
- `revolut-fetch-orders` — fetch all orders/transactions from Revolut Merchant API
- `revolut-fetch-subscriptions` — fetch subscription data from Revolut
- `revolut-manage-subscription` — cancel/upgrade subscriptions via Revolut API

**Update existing:**
- `revolut-webhook` — sync incoming payment events to subscriptions & customers tables

### Phase 3: Dashboard Pages & Components

**Route: `/admin` (protected)**

1. **Overview Dashboard (`/admin`)**
   - KPI cards: MRR, active subscribers, churn rate, total revenue
   - Revenue chart (daily/weekly/monthly toggle)
   - Recent transactions table
   - Gamification section: milestone progress bars, achievement badges, streak counter

2. **Subscriptions (`/admin/subscriptions`)**
   - Table: all subscriptions with filters (status, plan, date range)
   - Actions: view details, cancel, upgrade
   - Subscription growth chart

3. **Payments (`/admin/payments`)**
   - Transaction history table with filters
   - Status badges (completed, pending, failed, refunded)
   - Export functionality

4. **Customers (`/admin/customers`)**
   - Customer list with search & filters
   - Customer detail view (payment history, subscription info)
   - Lifetime value tracking

5. **Notifications (`/admin/notifications`)**
   - Failed payment alerts
   - Renewal reminders
   - System notifications
   - Mark as read/unread

6. **Revenue Analytics (`/admin/analytics`)**
   - Revenue breakdown charts (recharts)
   - Cohort analysis
   - Plan distribution pie chart
   - Growth trends

7. **Gamification Panel**
   - Revenue milestones with progress bars
   - Achievement badges (first €1K, first €10K, etc.)
   - Monthly streak tracking
   - Goal setting & rewards

### Phase 4: UI/UX

- Sidebar navigation with collapsible menu
- Dark theme matching existing brand
- Smooth framer-motion animations
- Responsive mobile layout
- Real-time data refresh

### Tech Stack
- React + TypeScript + Tailwind CSS (existing)
- Recharts for charts/graphs
- Framer Motion for animations
- Lovable Cloud for backend
- Revolut Merchant API for live data
