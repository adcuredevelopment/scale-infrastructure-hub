

## Home Page Mobile Optimization — Refinements

### Assessment
After reviewing all 10 home page sections + Navbar at 390px viewport, the responsive foundations are strong. Every section uses `py-16 md:py-32 px-5 md:px-8`, text scales with `sm:`/`md:` breakpoints, and grids collapse to single columns. Only minor polish items remain:

### Changes

#### 1. HeroSection — Stats row tight on 320px screens
**Issue:** The 3-column stats grid (`grid-cols-3 gap-4`) with `text-xl` counters can feel cramped on very small screens (320-360px). The `4.4★` text doesn't animate like the others.
**Fix:** Reduce gap to `gap-2 sm:gap-4 md:gap-8` for extra-small screens.

**File:** `src/components/home/HeroSection.tsx`

#### 2. ServicesSection — 4-card grid on small tablets
**Issue:** Uses `sm:grid-cols-2 lg:grid-cols-4`. On 390px it's 1 column (fine), but the CTA button text "Get Your TikTok Account" is fine. However the long CTA "Browse Facebook Assets" could benefit from slightly smaller text on mobile.
**Fix:** Add `text-sm` to CTA buttons to ensure they never wrap.

**File:** `src/components/home/ServicesSection.tsx`

#### 3. WhyAdcureSection — 2x2 grid value text
**Issue:** On 390px the `grid-cols-2` creates 2x2 which is good, but the large value text (`text-2xl sm:text-3xl md:text-4xl`) combined with padding makes some cards feel tight. The icon + value + title + description stack is dense.
**Fix:** Reduce card padding slightly on mobile: `p-3 sm:p-4 md:p-6`. Reduce icon container size on smallest screens.

**File:** `src/components/home/WhyAdcureSection.tsx`

#### 4. PricingSection — Email dialog mobile
**Issue:** The checkout email dialog uses `sm:max-w-md` which is fine, but on 390px the dialog content padding could be tighter for better visual balance.
**Fix:** Add `p-4 sm:p-6` to dialog content area.

**File:** `src/components/home/PricingSection.tsx`

#### 5. SocialProofSection — Trustpilot rating line wraps
**Issue:** The rating info line (stars + "4.4" + "on Trustpilot" + "• 13 reviews") uses `flex-wrap` which is correct, but on 390px the "• 13 reviews" wraps to a new line awkwardly.
**Fix:** Combine "on Trustpilot • 13 reviews" into a single span to prevent mid-phrase wrapping.

**File:** `src/components/home/SocialProofSection.tsx`

### Summary

| File | Change |
|------|--------|
| `HeroSection.tsx` | Tighter stats gap on small screens |
| `ServicesSection.tsx` | Ensure CTA text doesn't wrap |
| `WhyAdcureSection.tsx` | Tighter card padding on mobile |
| `PricingSection.tsx` | Dialog padding refinement |
| `SocialProofSection.tsx` | Prevent Trustpilot line awkward wrap |

These are all minor polish — no design or text changes, just spacing and sizing refinements for 390px and below.

