# BhaktVerse — 1M-User Scaling Plan

This document is the operational reference for keeping BhaktVerse healthy at 1M
MAU (~200k DAU, peak ~5k concurrent, ~3–5k RPS at the edge).

## 1. Load model

| Metric                  | Target            | Notes                                      |
| ----------------------- | ----------------- | ------------------------------------------ |
| MAU                     | 1,000,000         |                                            |
| DAU                     | 200,000 (20%)     | Industry avg for spiritual apps            |
| Avg session             | 180 s             | Reading + audio + horoscope                |
| Peak concurrent VUs     | 1,500             | k6 stage 4 — see `loadtest/k6-bhaktverse.js` |
| Peak RPS (edge + REST)  | ~5,000            | 60% REST, 30% page, 10% edge functions     |
| Hot reads               | saints, temples, audio_library, horoscope_cache |
| Hot writes              | mantra_sessions, post_likes, user_activities    |

## 2. Caching layers

| Layer                         | What                              | TTL              | Where                                      |
| ----------------------------- | --------------------------------- | ---------------- | ------------------------------------------ |
| Browser `Cache-Control`       | Hashed JS/CSS, images             | `immutable, 1y`  | Vite default + Lovable CDN                 |
| Service Worker (favorites)    | Favorited audio files             | until evicted    | `src/sw.ts` (audio scope)                  |
| `api_response_cache` table    | Horoscope, panchang, astro-engine | 6 h – 24 h       | Edge functions read-through                |
| Edge function in-memory LRU   | Per-instance hot keys             | until cold start | Use `Map` keyed by deterministic input     |
| CDN (Cloudflare in front)     | Static assets, public images      | 1 y immutable    | Recommend Cloudflare Free for `*.lovable`  |

Rule of thumb: any deterministic output → cache. Personalised output → cache by `user_id|inputs` for ≥1 h.

## 3. Database

### Indexes (already shipped)
- Composite indexes on `palm_reading_history(user_id, created_at desc)`
- `community_posts(visibility, created_at desc)`
- `notifications(user_id, read, created_at desc)`
- `qa_results(run_id)`, `ingestion_runs(source, started_at desc)`

### Recommended at 100k MAU
- Enable Supabase **PgBouncer** transaction-pooler endpoint for all edge functions.
- Move analytics queries (admin dashboard) to a read replica.
- Add `pg_stat_statements` review monthly; promote any query >50 ms p95 to a cached endpoint.

### Storage
- All public buckets must move from "list-all" SELECT policy to per-path public read with `list` disabled (see Security memo).
- Use signed URLs (1 h) for premium audio.

## 4. Queues

Heavy AI jobs must not run inline on user requests.

| Job                       | Provider                    | SLA  | Retry        |
| ------------------------- | --------------------------- | ---- | ------------ |
| Palm vision analysis      | Edge fn → DB job row        | 30 s | 3 × exp      |
| PDF render (Browserless)  | Edge fn → DB job row        | 60 s | 2 × exp      |
| Saint embeddings refresh  | `ingest-orchestrator` cron  | 1 d  | 1            |

A minimal in-DB queue (`jobs` table polled by edge fn) is enough until 500k MAU; switch to Inngest or Upstash QStash beyond that.

## 5. CDN settings

- Cloudflare orange-cloud on the apex domain.
- Page rules:
  - `/*.js`, `/*.css`, `/assets/*` → cache everything, edge TTL 1 y
  - `/api/*` → bypass
  - `/functions/v1/*` → bypass
- Tiered cache: ON. Argo: optional, +30% perf for distant regions.
- Brotli + Early Hints: ON.

## 6. Observability & alerts

| Signal                         | Tool             | Threshold              |
| ------------------------------ | ---------------- | ---------------------- |
| Edge function error rate       | Supabase logs    | >1% over 5 min → page  |
| DB connection saturation       | Supabase metrics | >80% pooler → warn     |
| Audio URL broken count         | `qa-runner`      | >5% → admin email      |
| QA pass rate                   | `qa_runs` table  | <95% → admin email     |
| `http_req_duration{p95}`       | k6 in CI         | >800 ms → block deploy |

## 7. Verifying with k6

```bash
k6 run \
  -e BASE_URL=https://bhaktverse.lovable.app \
  -e SUPABASE_URL=https://rbdbrbijgehakdsmnccm.supabase.co \
  -e ANON_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
  loadtest/k6-bhaktverse.js
```

Targets (all must pass before declaring 1M-ready):
- `http_req_failed` < 1%
- `http_req_duration{p95}` < 800 ms
- `edge_latency_ms{p95}` < 1500 ms
- No sustained 5xx during the 2-minute 1500-VU plateau

## 8. Cost guardrails

- LLM calls capped per-user per-day via `check_and_increment_api_usage` RPC (already in DB).
- Cache hits on horoscope/panchang push expected LLM spend < $0.002 / DAU.
- Audio served from Archive.org / CDN → no egress cost on our side.

## 9. Backup & DR

- Supabase PITR enabled (24 h retention min).
- Weekly logical dump to S3 of `saints`, `temples`, `scriptures`, `audio_library` (content tables).
- Edge function code lives in git → redeployable in <5 min.
