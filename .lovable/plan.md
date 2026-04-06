

## Responsive UI/UX Optimization — All Pages

### Overview
After reviewing every page and component, the site is already well-built with responsive classes. However, there are specific areas where mobile (390px), tablet (768-834px), and desktop layouts need refinement. No text or design changes — only layout, spacing, and sizing adjustments.

### Issues Found & Fixes

#### 1. Legal Pages (Privacy, Terms, Refund, SubscriptionPolicy)
**Issue:** `pt-32` is fixed regardless of device — on mobile the top padding is too large after the shorter navbar. The `h1` uses `text-4xl` on mobile which can be large for long titles like "Refund & Warranty Policy".
**Fix:** Change `pt-32` to `pt-24 sm:pt-28 md:pt-32`. Add responsive heading: `text-3xl sm:text-4xl md:text-5xl`.

**Files:** `Privacy.tsx`, `Terms.tsx`, `Refund.tsx`, `SubscriptionPolicy.tsx`

#### 2. Shop "About" Sections (FacebookAccounts, BusinessManagers, FacebookPages, FacebookStructures)
**Issue:** The "About" content section uses `section-padding` (which may have large vertical padding) and `text-3xl` heading without mobile breakpoints. The `p-6` on info cards can feel cramped on small screens.
**Fix:** Add responsive heading `text-2xl sm:text-3xl`. Add `py-12 md:py-24` instead of `section-padding`. Use `p-4 sm:p-5 md:p-6` on info cards.

**Files:** `FacebookAccounts.tsx`, `BusinessManagers.tsx`, `FacebookPages.tsx`, `FacebookStructures.tsx`

#### 3. NotFound Page
**Issue:** Uses `bg-muted` instead of `bg-background`, inconsistent with the rest of the site. No responsive text sizing.
**Fix:** Use `bg-background`, add responsive sizing, and match site styling with `font-display`.

**File:** `NotFound.tsx`

#### 4. Affiliate Dashboard — Referral Link
**Issue:** On mobile (390px), the referral link URL overflows or gets cut. The copy button and URL field flex layout can feel cramped.
**Fix:** Stack the URL and copy button vertically on mobile: `flex-col sm:flex-row`.

**File:** `src/components/affiliate/ReferralLink.tsx`

#### 5. Affiliate Dashboard — Earnings Chart
**Issue:** The YAxis labels (`€XX`) can clip on narrow screens. The chart height of 250px is fine but the X-axis font size (12px) is slightly large for mobile.
**Fix:** Reduce XAxis/YAxis font size on mobile by using a smaller default (10px). Hide YAxis on very small screens or reduce width.

**File:** `src/components/affiliate/EarningsChart.tsx`

#### 6. Footer — Mobile Grid
**Issue:** On mobile the 3 link columns (Product, Shop, Legal) use `grid-cols-2`, which means the 3rd column wraps awkwardly underneath. The brand column spans full width which is fine, but the link columns should be consistent.
**Fix:** Make link columns `grid-cols-2 sm:grid-cols-3` for the link section, or keep the existing layout but ensure even spacing. Currently the `md:col-span-2` creates uneven distribution on tablet.

**File:** `src/components/Footer.tsx`

#### 7. DashboardMockup — Mobile Polish
**Issue:** On small mobile screens the KPI card text sizes (`text-[6px]`, `text-[5px]`) are extremely small and may be illegible. The mockup is decorative, so this is acceptable, but the minimum height could be reduced on mobile.
**Fix:** Slightly increase minimum text sizes in KPI cards. Reduce `min-h` on mobile from `220px` to `200px`.

**File:** `src/components/home/DashboardMockup.tsx`

#### 8. Admin Pages — Mobile Sidebar
**Issue:** The admin sidebar is always visible and doesn't collapse on mobile. There's no mobile hamburger menu for admin.
**Fix:** Hide the sidebar on mobile (`hidden md:flex`) and add a mobile top bar with a hamburger that opens the sidebar as a sheet/drawer.

**Files:** `src/components/admin/AdminSidebar.tsx`, `src/components/admin/AdminLayout.tsx`

#### 9. Contact Page
**Issue:** The `pt-24 sm:pt-32 py-16` creates conflicting padding. On mobile the top padding should be consistent with other pages.
**Fix:** Change to `pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-32`.

**File:** `src/pages/Contact.tsx`

#### 10. Affiliate Dashboard — Header
**Issue:** On mobile, the "Welcome back, {name}" heading and Sign Out button can collide if the name is long.
**Fix:** Stack the header on mobile: `flex-col sm:flex-row items-start sm:items-center`. Move sign out button below on mobile.

**File:** `src/pages/affiliate/AffiliateDashboard.tsx`

### Summary of Files to Modify

| File | Change |
|------|--------|
| `Privacy.tsx`, `Terms.tsx`, `Refund.tsx`, `SubscriptionPolicy.tsx` | Responsive top padding + heading size |
| `FacebookAccounts.tsx`, `BusinessManagers.tsx`, `FacebookPages.tsx`, `FacebookStructures.tsx` | Responsive "About" section headings + padding |
| `NotFound.tsx` | Match site styling |
| `ReferralLink.tsx` | Stack layout on mobile |
| `EarningsChart.tsx` | Smaller axis fonts on mobile |
| `Footer.tsx` | Better mobile column distribution |
| `DashboardMockup.tsx` | Minor mobile text size tweaks |
| `AdminSidebar.tsx` + `AdminLayout.tsx` | Mobile sidebar as drawer |
| `Contact.tsx` | Fix padding conflict |
| `AffiliateDashboard.tsx` | Stack header on mobile |

