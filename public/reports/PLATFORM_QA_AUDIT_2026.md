# BhaktVerse — End-to-End Quality Audit (2026-07-31)

Method: automated Playwright sweep of 21 routes at 390px (mobile) with console-error,
failed-request and horizontal-overflow capture, plus code and database inspection.

## Route results

| Route | Render | Mobile overflow | Console errors | Verdict |
|---|---|---|---|---|
| `/` | OK | none | none | PASS |
| `/dashboard` | Auth gate | none | none | PASS |
| `/saints` | OK | none | none | PASS (image CDN warnings) |
| `/scriptures` | OK | none | none | PASS |
| `/temples` | OK | none | none | PASS (image CDN warnings) |
| `/audio-library` | OK | none | none | PASS |
| `/palm-reading` | Auth gate | none | none | PASS |
| `/horoscope` | Auth gate | none | none | PASS |
| `/numerology` | Auth gate | none | none | PASS |
| `/kundali-match` | Auth gate | none | none | PASS |
| `/community` | OK | none | 401 on `profiles_public` | FAIL → **fixed** |
| `/spiritual-calendar` | Auth gate | none | none | PASS |
| `/leaderboard` | Auth gate | none | none | PASS |
| `/premium` | Auth gate | none | none | PASS |
| `/daily-devotion` | OK | none | none | PASS |
| `/favorites`, `/profile`, `/auth` | Auth gate | none | none | PASS |
| `/privacy`, `/terms` | OK | none | none | PASS |
| `404` | OK | none | intentional log | PASS |

No horizontal overflow on any route at 390px. No unhandled runtime exceptions.

## Prioritized fix list

### P0 — fixed in this pass
1. **`profiles_public` returned 401** on Home and Community (view had zero grants).
   Fixed by granting read access to anonymous and signed-in roles.
2. **Audio playback died on CDN failure.** Player now resolves the best source
   (origin → mirror → offline cache), retries with exponential backoff, and resumes
   from the last position instead of silently skipping.
3. **No offline audio.** Cache Storage layer (`src/lib/audioCache.ts`) with FIFO
   eviction at 60 tracks, background caching of tracks that stream successfully,
   automatic blob-URL playback when offline, and live switch-back on `online`.
4. **Astro planetary positions were mean-longitude only** (up to ±25° error → wrong
   rashi). Replaced with a full Keplerian geocentric solution — see
   `ASTRO_ACCURACY_REPORT.md`.
5. **Recharts v3 type breakage** blocked the build; chart tooltip/legend props retyped.

### P1 — recommended next
6. External images from Wikimedia/Unsplash intermittently fail (hotlink + rate limits).
   Mirror saint/temple images into the existing Supabase storage buckets during ingestion.
7. Leaked-password protection is disabled and Postgres has pending security patches —
   both are Supabase dashboard actions and cannot be scripted from the app.
8. Auth-gated pages render the login screen with no "why you are here" context; add a
   short intent line per feature to reduce bounce.

### P2 — nice to have
9. Add a visible "Download for offline" action per track (cache API is already in place).
10. Nakshatra-accurate festival dates: `sync-astro-datasets` currently stores stable
    anchor dates and defers exact tithi resolution to the panchang engine.

## New ingestion pipeline

`supabase/functions/sync-astro-datasets` — Wikidata SPARQL → clean (strip refs, drop
noise/list pages, length caps) → dedupe by normalized title against itself and against
existing `calendar_events` → chunked insert → run logged to `ingestion_runs`.
Auth: admin JWT or `CRON_SECRET`. Registered in `ingest-orchestrator`, so it runs on the
existing daily 03:30 IST cron.
