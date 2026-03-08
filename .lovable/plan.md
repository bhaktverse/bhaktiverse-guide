

# Audio Library -- Full Expert Audit & Improvement Plan

## Current State Summary

The audio system consists of 4 files:
- **AudioLibrary.tsx** (page) -- track list, search/filters, grid layout
- **EnhancedAudioPlayer.tsx** -- full player with lyrics/meaning, TTS, progress, volume
- **AudioPlayer.tsx** -- older/duplicate player component (unused in AudioLibrary)
- **PlaylistManager.tsx** -- CRUD playlists with Supabase
- **useDownload.tsx** -- streaming file download hook

---

## Issues Found

### A. Mobile Responsiveness (Critical)

1. **Player + Playlist sidebar disappears below fold on mobile.** The `lg:grid-cols-3` layout means on mobile, the player card renders far below the track list (which uses `max-h-[calc(100vh-300px)]`). Users must scroll past the entire track list to find the player.

2. **Track action buttons (favorite, download) are `hidden sm:flex`** -- completely invisible on mobile. No way to favorite or download on phones.

3. **EnhancedAudioPlayer track info row overflows on 320px.** The avatar (64px) + text + 3 icon buttons (heart/share/more) all sit in a single flex row with no wrapping.

4. **Volume slider is useless on mobile** -- mobile devices control volume via hardware buttons. This wastes vertical space.

5. **PlaylistManager dialog `max-w-2xl`** -- too wide for mobile, and the `ScrollArea h-[250px]` leaves little room for the form fields on short screens.

6. **Playlist action buttons use `opacity-0 group-hover:opacity-100`** -- unusable on touch devices since there is no hover state.

### B. Functional / Logic Issues

7. **Duplicate component: `AudioPlayer.tsx`** is never imported by AudioLibrary (it uses EnhancedAudioPlayer). Dead code.

8. **EnhancedAudioPlayer `isLiked` state is local** -- not persisted. The heart button in the player does nothing meaningful vs. the `useFavorites` hook used in the track list.

9. **Share button is a no-op** -- no onClick handler.

10. **MoreHorizontal button is a no-op** -- no menu or action attached.

11. **Shuffle only reorders the playlist array once** -- doesn't implement true shuffle-play (next track should be random from unplayed).

12. **No "Now Playing" indicator on the track list** -- only background color change, no animated equalizer or visual cue that audio is actively playing.

13. **TTS `generateTTS` creates a detached `new Audio()` element** -- doesn't pause the main player, and there's no way to stop/control TTS playback once started.

### C. UX Gaps

14. **No sticky/fixed mini-player on mobile** -- when scrolling through tracks, users lose access to play controls. The `sticky bottom-4` class only works within the sidebar column, not as a global fixed bar.

15. **No category chip filters** -- only dropdown selects. Horizontal scrollable chips would be faster for browsing.

16. **No "Recently Played" or "Continue Listening"** section.

17. **Empty state when no tracks match** is adequate but could include filter-reset action.

18. **No loading skeleton for individual track rows** during initial load.

---

## Implementation Plan

### 1. Mobile-First Player Redesign
**File: `src/components/EnhancedAudioPlayer.tsx`**

- On mobile (`lg:` breakpoint), render a **fixed bottom mini-player bar** (above MobileBottomNav at ~`bottom-16`) showing: track title (truncated), play/pause, next, progress bar. Tapping it expands to full player via a `Drawer` (vaul).
- Hide volume slider on mobile (use `hidden md:flex`).
- Wrap track info + action buttons in `flex-wrap` for 320px safety.
- Remove the non-functional Share and MoreHorizontal buttons, or wire them up.

### 2. Track List Mobile Fixes
**File: `src/pages/AudioLibrary.tsx`**

- Remove `hidden sm:flex` from action buttons row. Instead, always show favorite and download as small icon buttons on the right side of each track row.
- Add a visible "Now Playing" equalizer animation (3 bars CSS animation) next to the currently playing track.
- Add horizontal scrollable category **chip filters** above the track list for quick one-tap filtering.
- On mobile, move the player rendering **above** the track list (or use the fixed mini-player approach from point 1).
- Change grid from `lg:grid-cols-3` to show player first on mobile via `order-first lg:order-last`.

### 3. PlaylistManager Mobile Fixes
**File: `src/components/PlaylistManager.tsx`**

- Change dialog to `max-w-lg` and use `Drawer` on mobile for better UX.
- Make playlist action buttons always visible on mobile (remove `opacity-0 group-hover:opacity-100`, use `sm:opacity-0 sm:group-hover:opacity-100` instead so they are visible on touch).
- Reduce ScrollArea height to `h-[200px]` on mobile.

### 4. Fix Functional Issues
**Files: `EnhancedAudioPlayer.tsx`, `AudioLibrary.tsx`**

- Connect the player's heart button to `useFavorites` hook (pass `toggleFavorite` and `isFavorited` as props).
- Pause main audio before playing TTS; add a stop-TTS button.
- Wire Share button to `navigator.share()` API or `SocialShare` component.
- Delete `src/components/AudioPlayer.tsx` (dead code).

### 5. UX Enhancements
**File: `src/pages/AudioLibrary.tsx`**

- Add **category chip bar** (horizontal scroll): `flex overflow-x-auto gap-2 pb-2 snap-x` with chips for each category + "All".
- Add a **filter reset** button in the empty state.
- Add CSS equalizer animation for the playing track indicator.

### 6. Estimated Changes

| File | Changes |
|------|---------|
| `EnhancedAudioPlayer.tsx` | Mini-player bar, drawer expand, hide volume on mobile, fix heart/share |
| `AudioLibrary.tsx` | Reorder grid, show action buttons on mobile, add chip filters, equalizer CSS |
| `PlaylistManager.tsx` | Touch-friendly actions, responsive dialog |
| `AudioPlayer.tsx` | Delete (dead code) |
| `src/index.css` | Add equalizer bar keyframes |

