# BhaktVerse — Platform-Wide Audit & Pro Upgrade

## What the audit found (verified against the live database and live URLs)

**Audio library is genuinely broken at the data layer, not the player.**
- All 59 rows in `audio_library` have `url_status = 'unknown'` — the health checker has never recorded a result (`audio_heal_runs` is empty).
- 8 tracks point at hand-made Archive.org identifiers that do not exist. Live check:
  - `vishnu-sahasranama.ogg` → **404**
  - `hanuman-aarti.ogg` → **403**
- The 51 tracks from the `mantrachantingmeditation` collection are real (Gayatri Mantra returned **206 application/ogg**).
- So roughly one in seven tracks fails instantly, and the UI has no way to know in advance because status is never populated.

**Content depth is thin for a "pro" catalogue.**
Current counts: 37 saints, 61 temples, 18 scriptures / 92 chapters, 59 audio, 90 calendar events, 47 mantras, 84 FAQs, 24 shorts.

**Other gaps confirmed by reading the code**
- Saint/temple avatars render remote URLs with no `onError` fallback, so hotlink failures show blank circles.
- Shorts embed YouTube directly in an iframe with no privacy-enhanced domain and no lazy loading.

Everything else (routes, mobile overflow, auth gates, astro engine v2, palm CV, PDF pipeline) was checked in the previous audit pass and is passing; this plan builds on that rather than redoing it.

---

## Phase 1 — Fix the audio library for real

1. **Verified ingestion.** Rewrite `sync-archive-audio` to discover tracks through the Archive.org `advancedsearch` + `metadata` APIs instead of guessing identifiers. Every candidate file is range-requested (`Range: 0-100`) before insert; only `2xx` responses with an audio content type are stored, together with `content_type`, `content_length` and a set of `mirror_urls` (`archive.org/download`, `ia*.us.archive.org` direct node, and the `.mp3` derivative).
2. **Purge and replace the dead 8.** Rows whose URLs fail verification are marked `url_status = 'broken'` and re-sourced; if no replacement is found they are hidden from the catalogue instead of being served to users.
3. **Backfill health.** Run `check-audio-health` once over the whole table so `url_status` / `last_checked_at` become meaningful, and confirm the daily `pg_cron` job actually writes an `audio_heal_runs` row.
4. **UI honesty.** Audio Library filters out broken tracks by default and shows a small "verified" indicator; a broken track never reaches the player.
5. **Grow the catalogue** to ~200+ verified tracks across aarti, bhajan, mantra, chalisa and meditation, each tagged with deity, language and occasion.

## Phase 2 — Deeper, cleaner datasets

- **Saints → ~120**, temples → **~150**, via the existing Wikipedia/Wikidata sync functions with stronger cleaning (strip reference markers, drop list/disambiguation pages, enforce length caps, dedupe on normalised name).
- **Scriptures**: complete Bhagavad Gita (18 chapters, verse-level), Hanuman Chalisa, Ramcharitmanas cantos, Upanishad selections — sourced from public-domain text APIs and chunked into `scripture_chapters`.
- **Images**: mirror saint and temple images into the existing `saints-images` / `temple-images` buckets during ingestion, so the app stops hotlinking Wikimedia. Add graceful initial-letter fallbacks in the UI for anything still missing.
- Every ingestion run keeps logging to `ingestion_runs` so the admin Job Logs view stays authoritative.

## Phase 3 — Palm reading, astrology and print

- **Vision**: keep MediaPipe Hands + OpenCV.js, and add a confidence-gated capture — the shutter only enables when landmark confidence and stability clear a threshold, which removes most "bad scan → vague reading" complaints.
- **Astro**: engine v2 already validates to ~1 arcmin against the published fixtures. Extend the regression suite with additional epochs (1980, 2010, 2030) so drift is caught, and surface divisional charts (D9 Navamsa) plus Ashtakavarga-lite scoring in the results UI.
- **Print**: consolidate on the dedicated print route (`/palm-reading/print/:id`) as the single source of truth — a clean semantic HTML report with `@media print` rules, page-break control per section, and embedded Devanagari fonts. PDF export renders that same route server-side, so screen, print and PDF can never diverge. Adds A4 and US-Letter presets.

## Phase 4 — Interface and mobile polish

- Unify page shells: consistent hero, breadcrumb, section spacing and empty/loading/error states across Saints, Temples, Scriptures, Audio, Horoscope, Numerology, Kundali and Palm Reading.
- Skeleton loaders everywhere a network fetch gates content; no more layout jumps.
- Re-verify every route at 390px with tap targets ≥ 44px and zero horizontal overflow.
- YouTube embeds move to `youtube-nocookie.com`, lazy-loaded with a poster-image facade so the shorts feed stops pulling player JS on page load.

## Phase 5 — Scale readiness for 1M users

- Add the missing composite indexes surfaced by slow-query inspection (`audio_library(category, url_status)`, `community_posts(visibility, created_at desc)`, `scripture_chapters(scripture_id, chapter_number)`).
- Paginate every list view (keyset, not offset) so no query can trip the 1000-row ceiling.
- Cache read-heavy edge functions (`daily-horoscope`, `hindu-panchang`, `youtube-shorts`) in `api_response_cache` with explicit TTLs.
- Re-run the k6 load test and refresh `SCALING_PLAN.md` with the new numbers.

## Phase 6 — Prove it

- Extend the QA runner with checks for audio URL health, dataset row-count floors, and print-route rendering, then run a fresh 21-route Playwright sweep and update the audit report on the Admin → Reports page with pass/fail per route.

---

## Technical notes

- Edge functions touched: `sync-archive-audio`, `check-audio-health`, `audio-self-heal`, `sync-wikipedia-saints`, `sync-wikidata-temples`, `sync-scriptures`, `astro-engine`, `render-pdf`, `qa-runner`.
- No schema changes are needed for audio — `url_status`, `mirror_urls`, `content_type`, `content_length` and `last_error` already exist and are simply unused. New indexes ship as a migration.
- All data comes from Archive.org, Wikipedia/Wikidata and public-domain scripture sources, cleaned and deduped before insert — no placeholder or invented content.

## Sequencing

Phase 1 first, because a broken audio library is the most visible failure. Phases 2 and 3 next, then 4–6. This is several turns of work; I will report verified results (row counts, HTTP checks, test output) at each phase rather than claiming completion up front.
