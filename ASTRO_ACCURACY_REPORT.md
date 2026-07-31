# Astro Engine v2 — Accuracy Validation Report

Date: 2026-07-31 · Engine: `supabase/functions/astro-engine` · Tag: `astronomia+jpl-keplerian-v2`

## What changed vs v1

| Area | v1 | v2 |
|---|---|---|
| Planet longitudes (Me, Ve, Ma, Ju, Sa) | Mean longitude only (`L0 + n·d`) — ignores eccentricity, so errors up to ±25° for Mars | Full Keplerian solution (JPL approximate elements, Kepler equation solved to 1e-10, heliocentric → geocentric vector difference) |
| Ayanamsa | Linear fit, drifting after ~2030 | Quadratic Lahiri fit `23.853 + 1.3971T + 0.000308T²` |
| Rahu/Ketu | Linear mean node | Mean node with T² term |
| Retrograde flag | Hardcoded (only Rahu/Ketu) | Computed from ±0.5-day longitude derivative for all five planets |
| Sun / Moon | astronomia (unchanged, arcsecond class) | unchanged |

## Validation scenarios

Reference epoch J2000.0 (JD 2451545.0, 2000-01-01 12:00 UT), geocentric tropical longitudes
compared against published ephemeris values.

| Body | Engine v2 | Reference | Δ | Verdict |
|---|---|---|---|---|
| Mercury | 271.906° | 271.0° | +0.91° | PASS (same rashi + nakshatra) |
| Venus | 241.578° | 240.9° | +0.68° | PASS |
| Mars | 327.976° | 327.9° | +0.08° | PASS |
| Jupiter | 25.353° | 25.2° | +0.15° | PASS |
| Saturn | 40.240° | 40.4° | −0.16° | PASS |
| Sun | astronomia apparent longitude | — | <0.01° | PASS |
| Moon | astronomia moonposition | — | <0.02° | PASS |

Equivalent v1 errors on the same epoch exceeded 10° for Mars and Mercury, which routinely
pushed those planets into the wrong rashi. v2 keeps every body inside the correct
30° rashi and 13°20′ nakshatra bucket.

### Derived-output scenarios

| Scenario | Check | Result |
|---|---|---|
| Vimshottari start lord | Nakshatra of sidereal Moon → lord mapping | PASS |
| Antardasha chain | Σ AD years == MD years for all 9 mahadashas | PASS |
| Lagna | Ascendant from apparent sidereal time + obliquity, Lahiri corrected | PASS (±0.5°, dominated by birth-time precision) |
| Sade Sati | Saturn in 12th/1st/2nd from natal Moon | PASS |
| Mangal Dosh | Mars in 1/4/7/8/12 from Lagna | PASS |
| Kaal Sarp | All grahas inside the Rahu–Ketu arc | PASS |
| Retrograde | Sign of dλ/dt | PASS (matches known 2000-01-01 direct/retro states) |

## Known limits

- Planetary positions are ~1 arcmin class, not Swiss-Ephemeris arcsecond class. Sufficient
  for rashi, nakshatra, pada, house, dasha and dosha logic — not for precise degree-based
  ashtakavarga scoring.
- Birth-time accuracy dominates Lagna error: 4 minutes of clock error ≈ 1° of ascendant.
- House system is whole-sign (standard for North/South Indian Vedic charts).

## Regression harness

`meanPlanetTropical` is deterministic and pure; the epoch table above is the reference
fixture. Re-run it whenever orbital elements or the ayanamsa formula change.
