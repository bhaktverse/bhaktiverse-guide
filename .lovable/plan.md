

# Mobile Responsiveness Audit & Fix Plan

## Issues Found

### 1. `App.css` conflicts with layout (`#root` styles)
The `App.css` file applies `max-width: 1280px`, `padding: 2rem`, and `text-align: center` to `#root`, which can interfere with full-width layouts on all viewports, especially mobile.

**Fix**: Remove the legacy Vite boilerplate styles from `App.css` entirely (or clear the file). These are leftover from the Vite scaffold and conflict with Tailwind-based layouts.

---

### 2. HeroSection: oversized text on small screens (320-375px)
- `text-5xl` on the title at mobile is too large for 320px screens
- `text-7xl` Om symbol is oversized on small devices
- Gradient orbs (`w-96 h-96`, `w-80 h-80`) cause horizontal overflow on small screens

**Fix**: Reduce base heading to `text-3xl sm:text-5xl`, Om to `text-5xl md:text-7xl md:text-8xl`, and constrain orbs with `max-w-full` or reduce their size on mobile.

---

### 3. Footer: 2-column grid cramped on 320px
The footer uses `grid-cols-2 md:grid-cols-5` which squeezes link columns on very small screens.

**Fix**: Change to `grid-cols-1 sm:grid-cols-2 md:grid-cols-5` so links stack on the smallest screens.

---

### 4. Dashboard welcome header: badges overflow on small screens
Three badges (Level, XP, AI credits) sit inline and can wrap awkwardly or overflow on 320px viewports.

**Fix**: Wrap badges with `flex-wrap` to allow natural wrapping on tight screens.

---

### 5. Dashboard Quick Actions grid: `md:grid-cols-5` leaves poor mobile layout
Uses `grid-cols-2 sm:grid-cols-3 md:grid-cols-5` but on 320px, 2 columns with padding can be tight.

**Fix**: This is acceptable at `grid-cols-2` but ensure the buttons have proper `min-w-0` to prevent overflow.

---

### 6. PalmReading sticky action bar overlaps MobileBottomNav
The palm reading report view has a `fixed bottom-0` action bar AND the MobileBottomNav renders below it. Both occupy `bottom-0`, causing overlap.

**Fix**: Add `mb-14 md:mb-0` or similar bottom padding to the sticky action bar on mobile, or conditionally hide MobileBottomNav on the report view. Better: raise the action bar above the bottom nav with `bottom-16 md:bottom-0`.

---

### 7. SaintChat: input area `pb-20` is hardcoded, not synced with bottom nav height
The `pb-20 md:pb-4` on the chat input works but is fragile.

**Fix**: Keep as-is — this is a reasonable workaround. No change needed.

---

### 8. Numerology: hero title `text-4xl md:text-6xl` too large on 320px
**Fix**: Reduce to `text-2xl sm:text-4xl md:text-6xl`.

---

### 9. AudioLibrary: player sidebar hidden on mobile with no alternative
The `lg:col-span-1` player/playlist column disappears on mobile — the player works via the `EnhancedAudioPlayer` but playlist manager is only visible on `lg` screens.

**Fix**: This is already handled since the audio player renders regardless. The playlist manager could benefit from being shown below the track list on mobile. Change the grid to stack naturally: already does with `lg:grid-cols-3`.

---

### 10. Navigation: mobile header only shows profile icon, no theme toggle or notification center
On mobile (`md:hidden`), only the profile icon appears. Theme toggle and notifications are desktop-only.

**Fix**: Add ThemeToggle and NotificationCenter to the mobile top bar area.

---

## Implementation Plan

### File: `src/App.css`
- Clear the file or remove the `#root` styles that conflict with the layout

### File: `src/components/HeroSection.tsx`
- Reduce hero heading sizes for mobile: `text-3xl sm:text-5xl md:text-7xl lg:text-8xl`
- Reduce Om symbol: `text-5xl md:text-7xl md:text-8xl`
- Constrain floating orb sizes on mobile

### File: `src/pages/Index.tsx`
- Footer grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-5`

### File: `src/pages/Dashboard.tsx`
- Add `flex-wrap` to the badges row in welcome header
- Ensure quick stats card doesn't overflow

### File: `src/pages/PalmReading.tsx`
- Fix sticky action bar: `bottom-16 md:bottom-0` to clear MobileBottomNav on mobile

### File: `src/pages/Numerology.tsx`
- Reduce hero heading: `text-2xl sm:text-4xl md:text-6xl`

### File: `src/components/Navigation.tsx`
- Add ThemeToggle and NotificationCenter to mobile header section

### File: `src/components/FeaturesSection.tsx`
- CTA section: reduce padding on mobile `p-6 sm:p-12 md:p-16`
- Section header: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`

