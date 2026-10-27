# Current work
- [ ] Enterprise-level module-wise gap audit and fixes (in progress: 5 audit agents running across frontend, edge functions, astrology, gamification/community/admin, palm/offline/print).

- [ ] Run authenticated report/PDF checks in demanded languages (CI workflow is ready; requires GitHub `QA_STORAGE_STATE`, and current Kundali page has no PDF/language controls).
- [ ] Verify/address Auth leaked-password protection and Postgres version findings (platform settings unavailable to this project session).
- [ ] Benchmark gamification/audio query paths at 1M rows (live data has 408 tracks and tiny gamification tables; need isolated seeded benchmark environment).
- [x] Rebuild audio health checks around bounded audio-byte verification, safe Archive.org-only redirects, and title-matched mirror recovery.
- [x] Replace confirmed dead audio sources and show tracks only after successful media verification across library, search, favorites, deity pages, and counts.
- [x] Add affected-user audio reliability event drill-down to the admin telemetry dashboard.
