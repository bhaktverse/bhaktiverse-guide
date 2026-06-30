# BhaktVerse — Platform Overhaul Plan (3–4 weeks, phased)

Goal: production-grade, 1M-user-ready spiritual platform with pro UX, accurate astrology, healthy audio, and competitor-grade PDF reports.

---

## Phase 1 — Foundation Fixes (Week 1)
Focus: things users see breaking *today*.

### 1.1 Palm Reading v4 (MediaPipe + OpenCV hardening)
- Tighten `HandLandmarkDetector` thresholds; expose Fast/Balanced/High quality presets in scanner UI.
- Add 5-frame temporal stabilization + confidence gate before allowing capture (block submit when score < 0.6).
- Use OpenCV (`palmCV.ts`) to detect heart/head/life/fate creases, compute lengths and intersection points, and pass them as structured features into the AI prompt — replaces vibes-based output with measurable claims.
- Crop palm ROI server-side before storing; store ROI + landmarks JSON in `palm_reading_history`.

### 1.2 Print-Perfect PDF (Browserless-first, HTML result page)
- Create `/reading/:id` route that renders the full report as styled HTML (A4 print stylesheet, Devanagari via `@fontsource/noto-sans-devanagari`, page-break rules, print:hidden chrome).
- "Print" button → `window.print()` (zero-cost path).
- "Download PDF" button → POST sanitized inline HTML to existing `render-pdf` edge function (Browserless, JWT-auth, no URL param — already hardened).
- Delete legacy `jsPDF`/`html2canvas` path; keep one source of truth.
- Add cover page, TOC, per-line analysis, palm image, QR to live page, footer with branding + disclaimer.

### 1.3 Audio Library Reliability
- Audit `audio_library` rows: HEAD-check every `audio_url` in a one-shot edge job; mark `is_healthy`, `last_checked_at`, `failure_reason`.
- Upgrade `EnhancedAudioPlayer`: retry with exponential backoff, automatic fallback to mirror URL, surface `AudioSyncIndicator` health state.
- Replace dead Archive.org links via `audio-self-heal` (search Archive.org + Jamendo for same title/artist, swap URL, log to `audio_heal_runs`).
- Add Service Worker cache for last 20 played tracks (offline-first).

### 1.4 Mobile/UX pass on the above
- 375px audit of palm scanner, result page, audio player, history.
- Replace any remaining hardcoded colors with design tokens; ensure 44px touch targets.

---

## Phase 2 — Accuracy & Content (Week 2)
Focus: be measurably better than AstroSage/Prokerala on the things that matter.

### 2.1 Astro Engine v2
- Extend `astro-engine` edge function: sidereal Lahiri ayanamsa, Nakshatra + Pada, Vimshottari Mahadasha + Antardasha + Pratyantardasha, Yogas (Raj/Dhana/Gaja Kesari), Panchang (tithi/karana/yoga/vara), Shadbala summary.
- Use Swiss Ephemeris WASM (or `swisseph-wasm` port) inside the edge function; cache results per `(dob, tob, lat, lng)` in `astro_charts`.
- Surface in Kundali page with PDF export reuse (same Browserless pipeline).

### 2.2 Daily Horoscope Accuracy
- Replace generic copy with per-rashi transit reads computed from today's planetary positions + user's natal chart (when available).
- 24h cache in `horoscope_cache`.

### 2.3 Ingestion Orchestrator v2 (cron-driven)
- Extend existing `ingest-orchestrator` to fan out:
  - **Saints**: Wikidata SPARQL (`P140` Hindu saints) + Wikipedia summaries; dedupe by Wikidata QID.
  - **Scriptures**: Bhagavad Gita API (bhagavadgita.io), Sefaria-style verse APIs for Upanishads, Vedabase scrape via Firecrawl (legal pages only).
  - **Temples**: Wikidata + OpenStreetMap Overpass for coords; image from Wikimedia Commons.
  - **Audio**: Archive.org `audio` collection + Jamendo (CC-licensed bhajans) + curated YouTube allowlist (channel IDs only, not full scrapes).
- Schedule via `pg_cron` every 6h; write to `ingestion_runs` with row counts + errors.
- Add `notify.ts` webhook on any failure.
- Add `AdminIngestion` panel: per-source last-run, row counts, retry button.

### 2.4 Content Quality Gates
- Add `data_quality_score` to saints/temples/scriptures (computed: has_image + has_description ≥ 100 chars + has_source_url + dedupe_key).
- Hide rows with score < 2 from public lists; show in admin "needs review" queue.

---

## Phase 3 — Scale to 1M (Week 3)
Focus: DB + CDN + queues + proof via load test.

### 3.1 Database
- Composite indexes on: `palm_reading_history(user_id, created_at desc)`, `community_posts(visibility, created_at desc)`, `audio_library(category, is_healthy, rating desc)`, `notifications(user_id, read, created_at desc)`.
- Materialized views: `mv_trending_saints`, `mv_top_audio_today`, `mv_community_feed_public` — refreshed via `pg_cron` every 5–15 min.
- Move all count-aggregates to RPCs / cached columns (already partial — finish for community + audio plays).

### 3.2 Edge & CDN
- Add `Cache-Control: public, s-maxage=...` to all read-only edge functions (saints, temples, horoscope, audio list).
- Move public images to a Supabase Storage bucket fronted by Cloudflare; signed URLs only for private (palm scans).

### 3.3 Queues & Background Jobs
- `pg_cron` + `pg_net` for: ingestion, audio-self-heal, qa-runner, mv refreshes, notification fanout.
- Add a tiny `jobs` table with status + retries + DLQ; admin can replay failed jobs from `AdminJobLogs`.

### 3.4 Proof
- Run k6 load test (already authored) at 1k → 10k → 50k VUs against staging; record p50/p95/p99 for hot endpoints.
- Update `SCALING_PLAN.md` with measured numbers + SLOs (e.g. read p95 < 200ms, PDF p95 < 8s).

---

## Phase 4 — Polish & Launch (Week 4, partial)
- End-to-end Playwright regression run via existing `qa-runner`; export matrix to CSV.
- Premium design pass: consistent gradient/glassmorphism on Dashboard, Kundali, Palm Result, Audio Library, Admin.
- Lighthouse pass: LCP image preload, route-level code-splitting, font-display swap.
- SEO/JSON-LD for `/saints/:slug`, `/temples/:slug`, `/scriptures/:slug`.
- Final security re-scan; mark all addressed findings.

---

## Technical Notes
- **PDF**: Browserless inline HTML only (SSRF-hardened, JWT-auth already in place). Reuse `render-pdf` for Palm + Kundali + Numerology.
- **MediaPipe/OpenCV**: keep client-side; only ROI + landmark JSON crosses the wire — no raw frames to LLM.
- **Astrology**: Swiss Ephemeris WASM in edge function, sidereal Lahiri default; tropical optional.
- **Ingestion legal**: Wikidata/Wikipedia (CC-BY-SA, attribute), Archive.org (per-item license check), Jamendo (CC), Bhagavad Gita API (free tier with attribution), Sefaria (CC), Vedabase via Firecrawl only on pages with permissive ToS.
- **Caching**: `api_response_cache` for external APIs (24h), `horoscope_cache` (24h), MV refresh 5–15 min, CDN s-maxage 1h on public reads.
- **Observability**: `notify.ts` webhook on QA/ingestion/audio-heal failures; `AdminJobLogs` for triage.

---

## Out of Scope (call out now)
- iOS/Android native builds (Capacitor wiring already documented, not re-touched here).
- Payments/subscriptions overhaul (existing `usePremium` stays).
- Real-time chat saints v4 (current v3 stays).

---

## Acceptance Criteria (per phase)
- **P1**: Palm capture rejects blurry/non-palm frames; PDF downloads in <8s with perfect Devanagari; audio library shows 0 broken links in admin scan.
- **P2**: Kundali matches AstroSage within ±1° on planetary positions for 5 sample DOBs; ingestion adds ≥500 new verified rows across saints/temples/scriptures/audio.
- **P3**: k6 sustains 10k concurrent reads at p95 < 300ms; SCALING_PLAN.md has real numbers.
- **P4**: Lighthouse mobile ≥ 90 perf on Dashboard + Result page; security scan clean except platform-level items.

Confirm and I'll start P1 immediately.
