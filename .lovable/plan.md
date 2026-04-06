

## Subscription Detail Drawer with Cancellation & Email Notification

### What We're Building
1. Clickable subscription rows that open a sidebar drawer with full subscription details
2. A "Cancel Subscription" button inside the drawer
3. An edge function to handle cancellation (update DB + send cancellation email)
4. A branded cancellation email sent to the subscriber

### Prerequisites: Email Domain
This project has no email domain configured yet. To send branded cancellation emails, we need to set up an email domain first. Without it, we can still build the cancellation logic and queue the email — it will start sending once the domain is verified.

### Changes

#### 1. New Edge Function: `cancel-subscription`
**File:** `supabase/functions/cancel-subscription/index.ts`

- Accepts `{ subscriptionId }` in the request body
- Validates the admin is authenticated (checks `user_roles` for admin)
- Updates the subscription in the `subscriptions` table: sets `status = 'cancelled'`, `cancelled_at = now()`
- Updates the corresponding `customers` table record (decrement `subscription_count`, update status if no active subs remain)
- Sends a branded cancellation email to `customer_email` using `send-transactional-email` (once email infra is set up)
- Returns success/error response

#### 2. Modify `AdminSubscriptions.tsx`
- Add a Sheet drawer that opens when clicking a subscription row
- Show full subscription details: customer email, plan name, amount, status, dates, affiliate code
- Add a red "Cancel Subscription" button (only shown for active subscriptions)
- Add confirmation dialog before cancellation
- On cancel: call the edge function, show toast, refresh data, close drawer

#### 3. Email Setup (requires user action)
Since no email domain is configured, I'll first need you to set up a sender domain. After that, I'll scaffold the email templates and create a branded cancellation email matching your dark theme (blue primary `hsl(213, 94%, 52%)`, Plus Jakarta Sans font).

### Implementation Order
1. Set up email domain (user action required)
2. Set up email infrastructure + scaffold transactional email templates
3. Create cancellation email template
4. Create `cancel-subscription` edge function
5. Update `AdminSubscriptions.tsx` with drawer + cancel button

### Files to Create/Modify
| File | Action |
|------|--------|
| `supabase/functions/cancel-subscription/index.ts` | Create — handles DB update |
| `src/pages/admin/AdminSubscriptions.tsx` | Modify — add Sheet drawer + cancel flow |
| Transactional email template | Create — branded cancellation email |

