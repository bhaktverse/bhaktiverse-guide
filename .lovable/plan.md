

# Phase 2: Deity Pages + Bhajan & Mantra Upgrade Plan

## Overview

This plan covers two workstreams: (A) Phase 2 from the scaling audit (deity pages, sampradaya filters) and (B) the Bhajan & Mantra system upgrade (YouTube Shorts API, Jamendo MP3 integration, enhanced audio player).

---

## Workstream A: Vaishnav Identity (Phase 2)

### A1. Deity-Specific Pages

**New file: `src/pages/DeityPage.tsx`**
- Route: `/deity/:deitySlug` (e.g., `/deity/krishna`, `/deity/vishnu`, `/deity/hanuman`)
- Hardcoded deity metadata (name, Sanskrit name, description, iconography, associated mantras, temples, scriptures)
- Sections: Hero with deity info, Related Saints (filtered from `saints` table by tradition), Related Temples (filtered from `temples` table by `primary_deity`), Related Audio (filtered from `audio_library` by `associated_deity`), Related Scriptures
- Sacred design with deity-specific gradient colors

**Route addition in `App.tsx`:**
- Add `<Route path="/deity/:deitySlug" element={<DeityPage />} />` as a public route

### A2. Sampradaya Categorization

**Modify `src/pages/Saints.tsx`:**
- Add explicit sampradaya filter chips: Sri (Ramanuja), Madhva, Nimbarka, Vallabha, Gaudiya, Shaiva, General
- Replace generic tradition filter with these specific categories

**Modify `src/pages/Temples.tsx`:**
- Add sampradaya/tradition filter chips matching the same pattern

### A3. Navigation Updates

**Modify `src/components/Navigation.tsx`:**
- Add "Deities" link under Explore dropdown pointing to a deity index or direct links (Krishna, Vishnu, Hanuman)

---

## Workstream B: Bhajan & Mantra Upgrade

### B1. API Secrets Setup

Two secrets need to be added:
- `YOUTUBE_API_KEY` — YouTube Data API v3 key
- `JAMENDO_CLIENT_ID` — Jamendo API client ID

### B2. YouTube Shorts Edge Function

**New file: `supabase/functions/youtube-shorts/index.ts`**
- Accepts `{ query, pageToken? }` body
- Calls YouTube Data API v3 `search` endpoint with `type=video&videoDuration=short&maxResults=12`
- Caches results in a new `youtube_shorts_cache` table (query, results JSON, fetched_at) to avoid API overuse
- Returns cached results if fetched within last 6 hours
- Default queries: "krishna bhajan shorts", "hanuman mantra shorts", "shiv bhajan shorts", "ram bhajan shorts"

**New migration: `youtube_shorts_cache` table**
```sql
CREATE TABLE youtube_shorts_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]',
  fetched_at timestamptz DEFAULT now(),
  UNIQUE(query)
);
ALTER TABLE youtube_shorts_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cache" ON youtube_shorts_cache FOR SELECT TO public USING (true);
CREATE POLICY "Service role manages cache" ON youtube_shorts_cache FOR ALL TO service_role USING (true);
```

**Config update: `supabase/config.toml`**
- Add `[functions.youtube-shorts]` with `verify_jwt = false`

### B3. Jamendo Tracks Edge Function

**New file: `supabase/functions/jamendo-tracks/index.ts`**
- Accepts `{ query?, tags?, limit? }` body
- Calls Jamendo API `/tracks` endpoint with `client_id`, filters for spiritual/meditation tags
- Returns track name, artist, audio URL (streamable), cover image, duration
- No caching needed (Jamendo is generous with rate limits)

**Config update:** Add `[functions.jamendo-tracks]` with `verify_jwt = false`

### B4. YouTube Shorts Service Layer

**New file: `src/services/youtubeShorts.ts`**
- `fetchShorts(query: string)` — calls the edge function, returns `{ videoId, title, thumbnail }[]`
- `searchShorts(userInput: string)` — debounced search via edge function
- Category mapping: Krishna, Ram, Shiv, Devi, Hanuman

### B5. Jamendo Audio Service Layer

**New file: `src/services/jamendoAudio.ts`**
- `fetchTracks(query?: string, tags?: string)` — calls the edge function
- `searchTracks(query: string)` — debounced search
- Returns `{ id, title, artist, audioUrl, coverImage, duration }[]`

### B6. Enhanced Dashboard Shorts Section

**Modify `src/pages/Dashboard.tsx`** (lines 586-642):
- Replace static `bhaktiShorts` DB-only section with a hybrid section:
  - Tab row: "Featured" (from DB bhakti_shorts) | "Krishna" | "Ram" | "Shiv" | "Devi"
  - Clicking a deity tab fetches YouTube Shorts via the service layer
  - Search bar (debounced) for custom queries
  - Vertical card feed with snap scrolling (horizontal on dashboard, like current)
  - Each card: thumbnail, title, play overlay → opens embedded YouTube player in a dialog
  - Skeleton loaders while fetching
  - Error/empty states

### B7. New Shorts Feed Component

**New file: `src/components/ShortsFeed.tsx`**
- Reusable component for displaying YouTube Shorts in a vertical scrollable feed
- Props: `shorts[]`, `loading`, `onSearch`
- Each short renders as a 9:16 card with embedded YouTube iframe on click
- Category tabs built-in
- Used on Dashboard and potentially a future `/shorts` page

### B8. Jamendo Integration into Audio Library

**Modify `src/pages/AudioLibrary.tsx`:**
- Add a "Discover" tab/section alongside existing DB tracks
- "Discover" section calls Jamendo edge function for spiritual/meditation tracks
- Jamendo results displayed in same card format as DB tracks
- Clicking a Jamendo track plays it in the existing `EnhancedAudioPlayer`
- Jamendo tracks marked with a "Jamendo" badge

### B9. Audio Player Enhancements (Minor)

**Modify `src/components/EnhancedAudioPlayer.tsx`:**
- Add cover image support (for Jamendo tracks that include album art)
- The player already has play/pause, next/prev, seek, volume, shuffle, repeat, mini-player — no major changes needed

### B10. Admin Shorts Management Enhancement

**Modify `src/pages/admin/AdminShorts.tsx`:**
- Add "Import from YouTube" button that lets admin paste a YouTube URL or search query
- Auto-extracts videoId, title, thumbnail
- Saves to `bhakti_shorts` table as a manually curated short
- Toggle featured/approved status (already exists)

---

## File Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/pages/DeityPage.tsx` | Deity-specific landing pages |
| Create | `src/services/youtubeShorts.ts` | YouTube Shorts API service |
| Create | `src/services/jamendoAudio.ts` | Jamendo audio API service |
| Create | `src/components/ShortsFeed.tsx` | Reusable Shorts feed component |
| Create | `supabase/functions/youtube-shorts/index.ts` | YouTube API proxy + cache |
| Create | `supabase/functions/jamendo-tracks/index.ts` | Jamendo API proxy |
| Create | Migration for `youtube_shorts_cache` table | Cache table |
| Modify | `src/App.tsx` | Add `/deity/:deitySlug` route |
| Modify | `src/pages/Dashboard.tsx` | Upgrade Bhakti Shorts section |
| Modify | `src/pages/AudioLibrary.tsx` | Add Jamendo discovery tab |
| Modify | `src/pages/Saints.tsx` | Add sampradaya filter chips |
| Modify | `src/components/Navigation.tsx` | Add Deities link |
| Modify | `src/pages/admin/AdminShorts.tsx` | Add YouTube import |
| Modify | `supabase/config.toml` | Add new function configs |
| Add | Secrets: `YOUTUBE_API_KEY`, `JAMENDO_CLIENT_ID` | API credentials |

---

## Implementation Order

1. Add secrets (YOUTUBE_API_KEY, JAMENDO_CLIENT_ID)
2. Create `youtube_shorts_cache` migration
3. Deploy `youtube-shorts` and `jamendo-tracks` edge functions
4. Create service layers (`youtubeShorts.ts`, `jamendoAudio.ts`)
5. Create `ShortsFeed.tsx` component
6. Upgrade Dashboard shorts section
7. Add Jamendo discovery to Audio Library
8. Create `DeityPage.tsx` + route
9. Update Saints.tsx sampradaya filters
10. Update Navigation with Deities
11. Enhance AdminShorts with YouTube import

