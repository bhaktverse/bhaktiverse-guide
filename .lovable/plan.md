# BhaktVerse — Platform Overhaul Roadmap

> Updated: 2026-05-01 — phased plan for end-to-end audit, perfection, and 1M-user scale.

## Phase 1 — Critical fixes & data freshness (THIS ITERATION)

- [x] **PDF generation rewrite** — replace `@react-pdf/renderer` with `html2canvas + jsPDF`. Renders the existing `PalmReadingReport` DOM directly to a multi-page A4 PDF. Devanagari, gradients, and shadows render perfectly because they come from the live browser. No font-loading errors.
- [x] **Audio Library data hygiene** — add `sync-archive-audio` edge function that pulls verified working tracks from Archive.org metadata API (`/advancedsearch.php` + `/metadata/{id}` for actual file names) and upserts into `audio_library`. Admin can trigger from `AdminContent`.
- [x] **Saints/Temples data import** — add `sync-wikipedia-content` edge function pulling structured data (biography, image, dates) from Wikipedia REST + Wikidata SPARQL. Admin-triggered, deduped on `name`.

## Phase 2 — Astrology & Palm Reading accuracy (next)

- Astro improvements: add proper sidereal calculation via Swiss Ephemeris-style edge function (use `astronomia` npm or open-meteo astronomical endpoints); replace approximations in numerology/horoscope.
- MediaPipe Hands → real line-detection scoring: project landmarks onto palm image, measure principal-line lengths with OpenCV.js (in browser) for confidence score.
- Compare-mode UI for two palm readings (compatibility, evolution).

## Phase 3 — Audio & Player polish

- Verify every `audio_url` periodically (cron edge function pings HEAD, marks broken).
- Persistent global audio player (already started, ensure it survives route changes everywhere).
- YouTube embed player with curated playlist per deity (already partially built — extend to Saints, Scriptures).
- Equalizer visualisation, playback speed, sleep timer.

## Phase 4 — Mobile QA + 1M-user scale

- Page-by-page mobile audit at 375px (iPhone SE) and 360px (Android) with browser tool.
- Add DB indexes on hot columns: `palm_reading_history(user_id, created_at)`, `community_posts(visibility, created_at)`, `audio_library(category, language)`, `notifications(user_id, read)`.
- Materialised view for leaderboard.
- React Query cache hydration + `staleTime` tuning per route.
- Lazy-load MediaPipe only when user opens camera.
- Image CDN: convert palm images to WebP via Supabase image transformation.

## Phase 5 — Competitive parity polish

- Print stylesheet route `/palm-reading/print/:id` (single-click → browser native print → save as PDF, ALSO available alongside html2canvas).
- Multi-format export: PDF, PNG share-card, HTML email.
- Donation flow with Razorpay/Stripe.
- PWA install prompts + offline shell.

---

### Conventions

- Real data only (Archive.org verified, Wikipedia, Wikidata).
- Mobile-first; touch targets ≥ 44px.
- All notifications via `sonner`.
- Lovable AI Gateway (Gemini Flash) for text, Gemini Pro Vision for palm.
- No `service_role_key` in browser. All sync jobs are admin-gated edge functions.
