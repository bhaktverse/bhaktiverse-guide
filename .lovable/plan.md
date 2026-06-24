# BhaktVerse — End-to-End Platform Audit & Pro-Grade Upgrade Plan

## Goal
Audit every surface, fix what's broken, and bring quality on par with top market competitors (AstroSage, AstroTalk, Co-Star, Palmistry HD, Insight Timer). Optimize for 1M+ users.

---

## Phase 1 — Audit & Stabilize (foundation)

**1.1 Automated health sweep**
- Run `supabase--linter` → fix every RLS/grant/search_path warning.
- TypeScript check (`tsgo`) + `vitest run` → fix all errors.
- Edge function smoke tests via `supabase--curl_edge_functions` for: astro-engine, palm-reading-analysis, hindu-panchang, daily-horoscope, kundali-match, sync-archive-audio, jamendo-tracks, check-audio-health, sync-wikipedia-saints, sync-wikidata-temples, sync-scriptures.
- Playwright run on /, /dashboard, /palm-reading, /horoscope, /audio-library, /saints, /scriptures, /temples, /numerology, /kundali-match, /community → capture console errors + screenshots per breakpoint (375 / 768 / 1280).

**1.2 Fix audio library (user reports broken)**
- Diagnose EnhancedAudioPlayer (state, persistence, Archive.org CORS, mobile autoplay).
- Verify `audio_library` data quality via `check-audio-health`; auto-purge dead URLs; re-seed via `sync-archive-audio` + Jamendo.
- Ensure persistent mini-player across route changes (portal at App root).
- Add: queue, shuffle, repeat, sleep timer, background-safe playback, MediaSession API (lock-screen controls).

**1.3 Mobile responsive sweep**
- Audit every page at 375px; enforce 44px tap targets; fix overflow-x; verify bottom-nav doesn't cover content; safe-area insets for iOS.

---

## Phase 2 — Astro Accuracy (competitor parity)

- Replace astronomia-based `astro-engine` with **Swiss Ephemeris WASM** (`swisseph-wasm` via esm.sh) for sub-arcminute accuracy on all 9 grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu).
- Add: full **D1 + D9 (Navamsa) + D10** charts, **house cusps (Placidus + Whole Sign)**, **Vimshottari Mahadasha / Antardasha / Pratyantar**, **Ashtakavarga**, **Yogas detection** (Raj, Dhan, Gajakesari, etc.), **Sade Sati**, **Mangal Dosh**, **Kaal Sarp**.
- Persist computed charts in new `astro_charts` table (cache by birth-tuple hash).
- Add transit engine: today's planetary positions vs natal chart → daily personalized prediction.
- Integrate with Horoscope, Kundali Match, Numerology pages.

---

## Phase 3 — Palm Reading: Competitor-Grade

- **OpenCV pipeline upgrade**: add minor lines (Marriage, Children, Mercury, Sun, Health), mounts detection (Venus, Jupiter, Saturn, Apollo, Mercury, Mars, Luna), finger length ratios, thumb flexibility heuristic.
- **MediaPipe**: switch to `HandLandmarker` Tasks API (latest) with GPU delegate where available.
- **Quality gate**: pre-scan blur/lighting/hand-coverage check; reject + guide user with overlay arrows (mirrors Palmistry HD).
- **Result page rewrite**: hero score card, animated SVG palm overlay, 12 destiny sections (Career, Marriage, Wealth, Health, Travel, Education, Children, Fame, Spirituality, Longevity, Personality, Lucky Y/N/D), comparison-to-average chart.

---

## Phase 4 — Print/Export Perfection

Top competitors use **server-rendered HTML → headless Chromium PDF** (pixel-perfect, Devanagari-safe). Implement:
- New edge function `render-pdf` using `@sparticuz/chromium` + `puppeteer-core` on Deno Deploy OR call **Browserless.io** (free tier 1k/mo) / **PDFShift** API.
- Server route returns A4 PDF for: Palm Reading, Numerology, Kundali Match, Horoscope, Astro Chart.
- Client also keeps current `html2canvas+jsPDF` as offline fallback.
- Self-contained HTML export already works in `PalmReadingPrint.tsx` — extend pattern to all reports.
- Add print-only CSS (`@page A4 12mm`, page-break-inside, Noto Sans Devanagari embedded).

Decision needed: managed API (Browserless/PDFShift — needs key) vs self-hosted Chromium edge fn. Recommend **Browserless** for reliability.

---

## Phase 5 — Dataset Enrichment

- **Saints**: extend `sync-wikipedia-saints` to pull Wikidata SPARQL (P106=saint/guru, traditions Bhakti/Sant/Vedanta) → ~500 saints with multilingual labels, birth/death, images via Commons.
- **Temples**: enhance `sync-wikidata-temples` (Q842402 Hindu temple) → 2000+ temples with coords, deity, images, UNESCO flag.
- **Scriptures**: enhance `sync-scriptures` to pull from sacred-texts.com (PD) + Wikisource → full Gita, Ramayana, Mahabharata, 108 Upanishads, 18 Puranas with chapter splits.
- **Audio**: nightly cron on `sync-archive-audio` + Jamendo; dedupe by `archive_id`; auto-fetch lyrics from RapidAPI / Genius (optional key).
- **Mantras**: seed `mantras_library` with 200+ classical mantras (Sanskrit + Hindi + English transliteration + audio).
- Add admin "Sync Center" page with one-click triggers, progress bars, last-run timestamps.

---

## Phase 6 — Performance & Scale (1M users)

- Add CDN-aware caching headers in all read-heavy edge functions (`Cache-Control: public, max-age=3600`).
- Materialized views for leaderboards, community feeds, daily devotions.
- Image: convert all bundled assets to AVIF/WebP via `vite-imagetools`; lazy-load with `loading="lazy"`; preload LCP.
- Bundle: route-level code splitting audit; analyze with `rollup-plugin-visualizer`; target <250KB initial JS.
- Add Redis-like cache via Supabase `horoscope_cache` pattern for all AI responses (key = sha256(input)).
- Rate limiting already in `check_and_increment_api_usage` — extend to all AI edge functions.
- Database indexes audit: add composite indexes on (user_id, created_at) for history tables.

---

## Phase 7 — UX/Design Polish

- Standardize: skeletons everywhere (no spinners), empty states with CTAs, toast via sonner only.
- Premium aesthetic pass: glass-morphism cards, subtle gradient borders on premium features, micro-animations (Framer Motion already used in places).
- Global search (`GlobalSearch.tsx`) → fuzzy search across saints/scriptures/temples/mantras with keyboard shortcuts.
- Onboarding wizard polish: 3-step (language, rashi/dob, interests) → personalizes dashboard.
- Dark mode contrast audit (WCAG AA).

---

## Phase 8 — QA & Delivery

- Vitest coverage for: palmCV (exists), astro-engine math, numerology calc, kundali gun-milan, rate limiter.
- Playwright e2e for critical flows: signup → onboarding → palm scan → PDF → community post.
- Generate final `PLATFORM_AUDIT_REPORT.md` with: feature matrix vs competitors, lighthouse scores, accessibility audit, RLS coverage, performance metrics.

---

## Open Decisions (need your input)

1. **PDF strategy** — Browserless.io managed API (needs API key, ~$0.005/render, reliable) **OR** self-hosted Chromium edge function (free but flakier)?
2. **Swiss Ephemeris** — WASM in edge function (~5MB cold start) **OR** keep astronomia and just add yogas/dashas math (faster, slightly less accurate)?
3. **Scope** — execute all 8 phases sequentially (large multi-turn build, ~8-12 turns) **OR** prioritize a subset (e.g. Phase 1+2+4 first)?
4. **External APIs** — OK to add optional secrets for: Genius lyrics, Browserless PDF, RapidAPI temple data?

I'll wait for answers on these 4 before executing, since each materially changes scope and cost.
