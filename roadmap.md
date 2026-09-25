# Current work
- [ ] Run authenticated CI print/PDF checks for Kundali and palm-reading in requested languages (requires a GitHub `QA_STORAGE_STATE` secret from an authorized test account; external Supabase session is unavailable here).
- [ ] Verify and address Supabase Auth leaked-password protection and Postgres version findings.
- [ ] Benchmark gamification/audio query paths at 1M-row scale; add targeted indexes/cache support.
- [ ] Run audio health sweep and self-heal broken tracks; verify the library filters unusable tracks (direct function calls require the cron secret, which is not injected into the function-test tool).
- [x] Add affected-user audio reliability event drill-down to the admin telemetry dashboard.
