

# Dashboard Mobile Responsiveness Fix Plan

## Issues Identified

1. **3-column grid (`lg:grid-cols-3`) on line 519** -- On mobile, the sidebar cards (Progress, Upcoming Events, Premium CTA) stack below the main content but use full width, which is fine. However, some inner card content can overflow or look cramped on 320px.

2. **Featured Services cards (`md:grid-cols-2` on line 524)** -- On mobile these stack to single column, which is correct. But the inner layout with icon + text + badge can overflow on very small screens.

3. **Quick Actions grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-5` on line 568)** -- 9 items in a 2-col grid creates an uneven layout. Should use `grid-cols-3` as base for mobile to fit more items and look balanced.

4. **Daily Sadhana buttons (line 441-481)** -- `flex-wrap` with `flex-1 min-w-[80px]` can cause buttons to overflow on 320px screens. Need smaller min-width.

5. **Today's Spiritual Goals card** -- Goal labels with icons and text can be tight on mobile. The "Mantras Chanted" / "Scripture Reading" text with counter needs `min-w-0` and possible truncation.

6. **Wisdom Quote card** -- `text-6xl sm:text-8xl` decorative element and quote text sizing is fine but the quote can be very long causing excessive card height.

7. **Welcome header Quick Stats** -- Already has `w-full md:w-auto` but the two stats sections could use better mobile sizing.

8. **Bhakti Shorts horizontal scroll** -- `w-36` fixed width cards work but should be slightly smaller on very small screens.

9. **Continue Your Journey** -- Horizontal scroll buttons with fixed sizing can overflow.

## Implementation Plan

### File: `src/pages/Dashboard.tsx`

**Welcome Header (lines 356-408)**:
- Reduce container padding further on smallest screens: `p-3 sm:p-6 md:p-8`
- Ensure greeting text doesn't overflow with `overflow-hidden`

**Daily Sadhana (lines 441-481)**:
- Change button `min-w-[80px]` to `min-w-0` on mobile and use `text-[10px] sm:text-xs` for button labels
- Ensure the sadhana widget doesn't overflow with proper flex constraints

**Quick Actions Grid (line 568)**:
- Change to `grid-cols-3 md:grid-cols-5` so mobile always shows 3 columns (cleaner with 9 items = 3 rows of 3)
- Reduce padding: `p-2 sm:p-4`

**Featured Services (lines 524-555)**:
- Add `min-w-0` to the text container to prevent badge overflow
- Make the icon container smaller on mobile: `p-3 sm:p-4`

**Spiritual Goals (lines 643-704)**:
- Add `min-w-0` to goal label containers
- Reduce icon container padding on mobile

**Bhakti Shorts (line 612)**:
- Change `w-36` to `w-28 sm:w-36` for smaller screens

**Sidebar cards (lines 725-853)**:
- On mobile, show Progress and Events side-by-side in a 2-col grid: wrap sidebar div with `grid grid-cols-2 lg:grid-cols-1 gap-4` on small screens
- Keep Premium CTA full-width below

**Continue Your Journey (line 498)**:
- Add `snap-x snap-mandatory` for better mobile scroll UX
- Add `snap-start` to each button

**Overall container**:
- Reduce `gap-8` in the animated wrapper to `gap-5 sm:gap-8` for tighter mobile spacing

