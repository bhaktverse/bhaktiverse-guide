## Scope

Five independent tracks. I'll build them sequentially in one continuous run unless you want to trim. Estimated 6–8 turns.

---

### Track 1 — Automated E2E QA + Admin Pass/Fail Report

**What gets built**
- `qa_runs` + `qa_results` tables (run_id, suite, test_name, status, duration_ms, error, created_at) with RLS (admin-only read, service_role write).
- Edge function `qa-runner` that executes a declarative checklist:
  - HTTP probes on every public route (`/`, `/dashboard`, `/palm-reading`, `/saints`, `/temples`, `/scriptures`, `/audio-library`, `/horoscope`, `/numerology`, `/kundali-match`, `/community`, `/premium`, `/auth`, etc.).
  - Edge-function smoke tests (invoke each function with a safe payload, assert 2xx/expected-4xx).
  - DB invariants (RLS enabled on every public table, no table missing GRANTs, key tables non-empty).
  - Storage bucket reachability.
- Scheduled via `pg_cron` every 6h + on-demand "Run QA" button.
- New admin page `/admin/qa` with: latest run summary card, pass-rate trend chart, failing-test table with stack/error, "Run now" button.

---

### Track 2 — Scheduled Dataset Ingestion Pipeline

**What gets built**
- Orchestrator edge function `ingest-orchestrator` that fans out to existing syncs (`sync-wikipedia-saints`, `sync-wikidata-temples`, `sync-scriptures`, `sync-archive-audio`, `sync-genius-lyrics`) + new RapidAPI temple enrichment.
- Dedup/cleanup pass: trigram similarity (`pg_trgm`) merges near-duplicate saints/temples by name+tradition; normalizes language codes; strips HTML; validates URLs.
- `ingestion_runs` table logging each source: inserted/updated/skipped/errors + duration.
- `pg_cron` schedule: saints weekly, temples weekly, scriptures monthly, audio daily, lyrics daily.
- Admin Sync Center gains "Run full ingestion" + per-source history.

---

### Track 3 — Audio Library Reliability + Self-Healing

**What gets built**
- Upgrade `check-audio-health`: HEAD→GET fallback, follow redirects, store `content_type`, `content_length`, `last_error`; classify `ok | broken | redirected | format_unsupported`.
- Auto-rehost: when an `archive.org` track 404s, re-query Archive.org search API for a replacement file in the same item and update `audio_url`.
- Streaming hardening in `EnhancedAudioPlayer`: add `preload="metadata"`, `Range` request support detection, retry-with-backoff on `error` event, fallback to alternate mirror.
- Offline cache: register a Service Worker that caches "favorited" tracks via Cache Storage API; surface offline indicator on player.
- Admin Sync Center: "Reindex & Self-Heal Audio" button → runs health check + auto-rehost + reports counts.

---

### Track 4 — MediaPipe + OpenCV Palm Pipeline Upgrade

**What gets built**
- Add `@mediapipe/tasks-vision` HandLandmarker (21 landmarks, sub-pixel accuracy) to `PalmCVProcessor`.
- Pipeline: MediaPipe → ROI mask (palm hull) → OpenCV preprocessing (CLAHE + bilateral filter) → line extraction (existing) → confidence fusion (CV + landmark geometry).
- Temporal stabilization: rolling 5-frame median on landmark positions to kill jitter.
- New "Processing Quality" toggle (Fast / Balanced / High) wired through `usePalmAnalysisMode`:
  - Fast: 320px, MediaPipe lite, skip CLAHE.
  - Balanced (default): 640px, full model, 3-frame stabilize.
  - High: 960px, full model, 5-frame stabilize, ROI subpixel refinement.
- Debug overlay shows landmark dots + CV lines + per-line confidence + active quality tier.

---

### Track 5 — Load Test + Scaling Plan

**What gets built**
- `k6` load-test script in `loadtest/` simulating 1M MAU traffic shape (peak 5k RPS): browse dashboard, fetch horoscope (cached), invoke palm-analysis (rate-limited), audio streaming HEAD.
- Run against preview, capture p50/p95/p99, error rate, edge-function cold-starts.
- Publish `SCALING_PLAN.md` covering:
  - **Caching**: `api_response_cache` TTLs per endpoint, browser `Cache-Control`, edge function in-memory LRU.
  - **Indexes**: audit slow queries via `supabase--slow_queries`, add any missing composite indexes.
  - **Queues**: move heavy AI calls (palm analysis, narrative gen) behind an Inngest-style queue with retries.
  - **CDN**: Cloudflare in front of audio + images, signed URLs for premium, `immutable` cache for hashed assets.
  - **DB**: connection pooling settings, read-replica recommendation at 100k MAU.
  - **Observability**: Sentry + Supabase logs dashboards, alert thresholds.

---

## Technical Notes

- New tables (`qa_runs`, `qa_results`, `ingestion_runs`) ship with GRANTs + RLS in one migration.
- New edge functions added to `supabase/config.toml` with `verify_jwt = false` and in-code admin checks via `has_role`.
- MediaPipe WASM loaded from CDN; ~2MB cold cost, cached by browser.
- Service Worker scoped to `/audio-library` to avoid interfering with Vite HMR in dev.
- k6 runs locally / in CI — not inside the sandbox app.

---

## What I need from you

1. **Confirm scope** — build all 5 tracks, or trim to a subset?
2. **Service Worker offline cache** — OK to register globally (improves perf, adds cache-bust complexity), or keep scoped to audio favorites only?
3. **k6 load test** — run a real test against the preview URL (will consume bandwidth + may trigger rate limits), or just ship the script + scaling plan?