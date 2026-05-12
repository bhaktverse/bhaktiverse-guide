# BhaktVerse — Full Platform Audit & Pro Upgrade Plan

Goal: bring every module to competitor-grade quality (AstroSage, AstroTalk, Sri Mandir, Palmistry HD), fix broken pieces (audio library, PDF/print), add MediaPipe/OpenCV depth, enrich datasets from real APIs, and harden for 1M users.

---

## Phase A — Audit & Triage (read-only, ~1 iteration)

1. **Automated sweep**
   - Run `supabase--linter` + `security--get_scan_results` for backend issues.
   - Browser tool: walk every route at 375px and 1280px, capture console + network errors, log broken images / 404 audio / dead buttons.
   - Read every page in `src/pages/*` + admin pages, score each on: works / partial / broken, mobile-OK, empty-state, loading-state, error-state.
2. **Output**: a single `AUDIT_REPORT.md` with a per-page status table + prioritized defect list. This drives every later phase.

---

## Phase B — Palm Reading & Print perfection

1. **Dedicated print route** `/palm-reading/print/:id`
   - Server-rendered-style React page that loads the saved reading from `palm_reading_history` and renders the full `PalmReadingReport` in print-optimized CSS (A4, no nav, no animations, page-break rules per section).
   - Two export buttons:
     a. **Native Print → Save as PDF** (via `window.print()` — pixel perfect, Devanagari perfect, zero deps).
     b. **Download PDF** via existing `html2canvas + jsPDF` (already in place, kept as fallback).
     c. **Download HTML** (single self-contained `.html` with inlined CSS + base64 images — competitor parity for "share/email report").
2. **Layout hardening**
   - Audit `PalmReadingReport.tsx`: add explicit `break-inside: avoid` on each card, force `print-color-adjust: exact`, embed Noto Sans Devanagari via `@font-face` so print captures it.
   - Add a cover page (user name, age, DOB, date, palm thumbnail) and a back page (disclaimer + share QR).
3. **Re-view flow**: from `PalmReadingHistory`, "View Report" opens the print route inline (no re-scan, no AI credit burn). Already saving to DB — just wire the link.

---

## Phase C — MediaPipe + OpenCV depth

1. Upgrade `HandLandmarkDetector.tsx`:
   - Real-time **palm-quality score** (lighting, distance, openness, blur via OpenCV.js Laplacian) — block capture until ≥80%.
   - Auto-capture when quality holds ≥80% for 1.5s.
2. **Line projection**: after capture, run OpenCV.js Canny + Hough on the cropped palm to extract heart/head/life line pixels, overlay them on the result page (already partially in `AILineDetectionOverlay.tsx` — finish wiring).
3. Lazy-load both libs only when camera opens (keep initial bundle lean).

---

## Phase D — Astrology accuracy (vs AstroSage)

1. New edge function `astro-engine` using `astronomia` (npm) to compute:
   - Sidereal planetary positions (Lahiri ayanamsa)
   - Lagna, navamsa, nakshatra + pada, current Vimshottari dasha/bhukti
   - Moon rashi (replaces current approximation)
2. Replace approximations in `numerology-analysis`, `daily-horoscope`, `kundali-match`, `hindu-panchang` to read from `astro-engine` for any planetary data.
3. Cache per (dob, tob, place) hash in `astro_profiles.planets_data`.

---

## Phase E — Audio Library fix & upgrade

1. Run `check-audio-health` → mark all broken rows `url_status='broken'`.
2. Run `sync-archive-audio` on each category (mantra, bhajan, aarti, meditation) to repopulate with verified Archive.org tracks.
3. Add **YouTube fallback player**: if `audio_url` broken, look up associated `youtube_video_id` (new column) and embed via existing `youtube-shorts` infra.
4. Fix `EnhancedAudioPlayer`:
   - Persistent across route changes (portal at App root).
   - Sleep timer, playback speed, A-B loop, sleep-fade.
   - Lyrics scroll synced via simple LRC parser when present.
5. **Playlists**: enable add/remove from any audio card; surface "My Playlists" tab.

---

## Phase F — Dataset enrichment (real, clean, multilingual)

| Module | Source | Method |
|---|---|---|
| Saints | Wikipedia REST + Wikidata SPARQL | Extend `sync-wikipedia-saints` to pull 200+ saints with bio, image, dates, tradition |
| Temples | Wikidata (`P31=temple`, India filter) + Google Places (lat/lng, photos) | New `sync-wikidata-temples` edge fn |
| Festivals / Calendar | Drik Panchang scrape (cached) + manual seed for 2026/2027 | Edge fn `sync-festivals` |
| Mantras | Manual curated SQL seed (~150 verified, multilingual) | Migration |
| Scriptures | Sacred-Texts Archive + GRETIL (CC source) | Edge fn `sync-scriptures` for Gita/Ramayana/Upanishads chapters |
| Bhakti Shorts | YouTube Data API curated channels | Existing `youtube-shorts` cron daily |

All sync fns: admin-only, idempotent (upsert on natural key), report inserted/updated counts via toast.

---

## Phase G — Mobile + UX pass

- 375px audit on every route; fix horizontal scroll, tap targets <44px, sticky-header overlaps.
- Standardize: skeleton loaders, empty states with CTA, toast errors via `sonner`, Breadcrumbs on every non-home page.
- Add global `<CommandPalette>` (⌘K) for power users.
- Onboarding wizard polish: ask DOB/TOB/place once → drives astro everywhere.

---

## Phase H — Scale to 1M users

- Verify Phase 4 indexes already shipped; add missing ones uncovered in audit.
- Add `pg_trgm` GIN indexes on `saints.name`, `temples.name`, `audio_library.title` for fast search.
- Materialised view `mv_leaderboard` refreshed hourly via `pg_cron`.
- React Query: set `staleTime` per query class (static content 1h, user data 60s, realtime 0).
- Image pipeline: rewrite all storage URLs through Supabase image transformation (`?width=…&format=webp`).
- Edge function rate limiting via `check_and_increment_api_usage` already exists — apply to every public fn.
- Sentry + simple `/admin/health` page.

---

## Phase I — Final QA & competitive comparison

- Re-walk every route (browser tool, mobile + desktop), zero console errors.
- Side-by-side checklist vs AstroSage / Sri Mandir / Palmistry HD; document gaps closed.
- Update `mem://index.md` with new modules.
- Publish.

---

## Technical notes

- **No new heavy deps** beyond `astronomia` (~80kb) and `opencv.js` (lazy CDN, only on /palm-reading).
- All edge fns: `verify_jwt = true` for admin-only sync; `false` for public read.
- All new tables get RLS + admin policy via `has_role()`.
- Print CSS lives in `src/index.css` `@media print` — already started, will extend.
- HTML export = single file, inline `<style>` + base64 images, generated from same `PalmReadingReport` via `outerHTML` + asset inlining.

---

## Execution order (each phase = 1 message/iteration)

1. Phase A audit report
2. Phase B palm print perfection
3. Phase C MediaPipe/OpenCV
4. Phase D astro-engine
5. Phase E audio library fix
6. Phase F dataset sync fns + run them
7. Phase G mobile/UX polish
8. Phase H scale hardening
9. Phase I final QA + publish

Approve and I'll start with Phase A (audit report) so every later fix is grounded in real findings.