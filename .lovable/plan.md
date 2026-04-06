

## Remove Notifications KPI Card & Menu Item

### Changes

1. **`src/pages/admin/AdminOverview.tsx`** — Remove the Notifications card and its data fetching (the `notifications` state, the query to `notifications` table, and the entire Notifications card section in the JSX).

2. **`src/components/admin/AdminSidebar.tsx`** — Remove the `{ title: "Notifications", url: "/admin/notifications", icon: Bell }` entry from `navItems` and the unused `Bell` import.

3. **`src/App.tsx`** — Remove the `<Route path="notifications" element={<AdminNotifications />} />` route and the `AdminNotifications` import.

No other files need changes. The `AdminNotifications.tsx` page file can remain (unused) or be deleted — it won't affect the build either way.

