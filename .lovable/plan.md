

## Mobile Optimization — Home Page & All Remaining Pages

### Assessment
After reviewing every component and page, the site already has solid responsive foundations. The browser testing showed what appeared to be missing sections, but this is due to ScrollReveal's `whileInView` not triggering in the headless browser — real users will see all content correctly.

That said, there are specific mobile refinements still needed:

### Changes

#### 1. Home Page — HowItWorksSection (mobile layout)
**Issue:** On mobile, the detail card (mockup) shows first (`order-1`) then steps below (`order-2`). The mockup animation area uses `aspect-[16/10]` on mobile which takes too much vertical space. The step list buttons have generous padding that could be tighter on mobile.
**Fix:** Reduce mockup aspect ratio on mobile to `aspect-[16/9]`. Tighten step button padding on mobile.

**File:** `src/components/home/HowItWorksSection.tsx`

#### 2. Home Page — PricingSection (mobile card spacing)
**Issue:** The 3-column grid goes to `grid-cols-1` on mobile, which is fine, but the card padding `p-5 sm:p-6 md:p-8` and internal spacing could be slightly tighter on very small screens. The "Most Popular" badge could clip.
**Fix:** Add `mt-2` on the popular card on mobile to prevent badge clipping on the top. Minor padding refinement.

**File:** `src/components/home/PricingSection.tsx`

#### 3. Home Page — SocialProofSection (touch scroll hint)
**Issue:** No visual hint that the testimonial carousel is scrollable on mobile. Users may not realize they can swipe.
**Fix:** Add a subtle gradient fade on the right edge to hint at more content.

**File:** `src/components/home/SocialProofSection.tsx`

#### 4. Shop Pages — ShopProductGrid (mobile card layout)
**Issue:** Product cards go to `grid-cols-1` which is correct, but the "Most Popular" badge uses `absolute -top-px` which can clip at the container edge. The price and name share a single row which can be cramped with long names on 390px.
**Fix:** Stack name and price vertically on very small screens. Add `mt-2` on popular cards.

**File:** `src/components/shop/ShopProductGrid.tsx`

#### 5. Footer — Legal column wrapping
**Issue:** On mobile (`grid-cols-2`), the 3 link columns (Product, Shop, Legal) means Legal wraps to a new row and sits alone on the left, creating visual imbalance.
**Fix:** Use `grid-cols-3` for just the link columns on small screens so all 3 fit side by side, or stack all to single column on very small screens.

**File:** `src/components/Footer.tsx`

#### 6. Navbar — Mobile menu shop items
**Issue:** Mobile shop dropdown items only show labels without icons or descriptions, which is fine functionally. But the mobile CTA buttons `mt-3` and `mt-2` create inconsistent spacing.
**Fix:** Unify mobile CTA button spacing with `mt-2` on both.

**File:** `src/components/Navbar.tsx`

### Files to Modify
| File | Change |
|------|--------|
| `src/components/home/HowItWorksSection.tsx` | Tighter mobile mockup aspect ratio and step padding |
| `src/components/home/PricingSection.tsx` | Popular badge spacing fix on mobile |
| `src/components/home/SocialProofSection.tsx` | Scroll hint gradient on edges |
| `src/components/shop/ShopProductGrid.tsx` | Stack price/name on small screens, popular card margin |
| `src/components/Footer.tsx` | Better 3-column link distribution on mobile |
| `src/components/Navbar.tsx` | Consistent mobile CTA spacing |

