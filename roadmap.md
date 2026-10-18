# Current work
- [ ] Run authenticated report/PDF checks in demanded languages (CI workflow is ready; requires GitHub `QA_STORAGE_STATE`, and current Kundali page has no PDF/language controls).
- [ ] Verify/address Auth leaked-password protection and Postgres version findings (platform settings unavailable to this project session).
- [ ] Benchmark gamification/audio query paths at 1M rows (live data has 408 tracks and tiny gamification tables; need isolated seeded benchmark environment).
- [x] Run audio health sweep and bounded self-heal; 16 tracks remain unplayable and need alternate verified media sources.
- [ ] Replace dead audio sources with verified Archive.org files and make catalogue visibility depend on a successful playback check.
- [x] Add affected-user audio reliability event drill-down to the admin telemetry dashboard.
