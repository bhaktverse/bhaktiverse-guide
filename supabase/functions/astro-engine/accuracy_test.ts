// Astro Engine v2 — automated accuracy regression suite.
// Validates the pure ephemeris math against the fixtures published in
// ASTRO_ACCURACY_REPORT.md and fails when accuracy drifts.
//
// Run: supabase--test_edge_functions { functions: ["astro-engine"] }

import { assert, assertAlmostEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  lahiriAyanamsa, meanPlanetTropical, isRetrograde, rahuTropical, norm360,
} from "./ephemeris.ts";

const J2000 = 2451545.0;

/** Drift budget: engine output must stay within this of the published value. */
const DRIFT_TOL = 0.02;   // degrees
/** Truth budget: engine output vs published external ephemeris. */
const TRUTH_TOL = 1.0;    // degrees

// From ASTRO_ACCURACY_REPORT.md → "Validation scenarios"
const FIXTURES: Record<string, { engine: number; reference: number }> = {
  Mercury: { engine: 271.906, reference: 271.0 },
  Venus:   { engine: 241.578, reference: 240.9 },
  Mars:    { engine: 327.976, reference: 327.9 },
  Jupiter: { engine: 25.353,  reference: 25.2 },
  Saturn:  { engine: 40.240,  reference: 40.4 },
};

const sep = (a: number, b: number) => { const d = Math.abs(norm360(a) - norm360(b)) % 360; return Math.min(d, 360 - d); };

for (const [body, fx] of Object.entries(FIXTURES)) {
  Deno.test(`${body}: no drift from published engine value (J2000)`, () => {
    const got = meanPlanetTropical(body, J2000);
    const drift = sep(got, fx.engine);
    assert(
      drift <= DRIFT_TOL,
      `${body} drifted ${drift.toFixed(4)}° from report value ${fx.engine}° (got ${got.toFixed(3)}°). ` +
      `Update ASTRO_ACCURACY_REPORT.md only if the change is intentional.`,
    );
  });

  Deno.test(`${body}: within ${TRUTH_TOL}° of reference ephemeris (J2000)`, () => {
    const got = meanPlanetTropical(body, J2000);
    assert(sep(got, fx.reference) <= TRUTH_TOL, `${body} off reference by ${sep(got, fx.reference).toFixed(3)}°`);
  });

  Deno.test(`${body}: stays inside correct rashi + nakshatra bucket`, () => {
    const got = meanPlanetTropical(body, J2000);
    const ref = fx.reference;
    assert(Math.floor(norm360(got) / 30) === Math.floor(norm360(ref) / 30), `${body} rashi mismatch`);
    assert(
      Math.floor(norm360(got) / (360 / 27)) === Math.floor(norm360(ref) / (360 / 27)),
      `${body} nakshatra mismatch`,
    );
  });
}

Deno.test("Lahiri ayanamsa matches quadratic fit at J2000 and 2026", () => {
  assertAlmostEquals(lahiriAyanamsa(J2000), 23.853, 1e-6);
  // 2026-01-01 ≈ JD 2461041.5 → ~24.21°, classical Lahiri range check
  const a2026 = lahiriAyanamsa(2461041.5);
  assert(a2026 > 24.0 && a2026 < 24.4, `ayanamsa 2026 out of band: ${a2026}`);
});

Deno.test("Ayanamsa increases monotonically (precession direction)", () => {
  let prev = -Infinity;
  for (let y = 1900; y <= 2100; y += 10) {
    const jd = J2000 + (y - 2000) * 365.25;
    const a = lahiriAyanamsa(jd);
    assert(a > prev, `ayanamsa non-monotonic at ${y}`);
    prev = a;
  }
});

Deno.test("Rahu is retrograde (mean node moves backwards)", () => {
  const a = rahuTropical(J2000);
  const b = rahuTropical(J2000 + 30);
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  assert(d < 0, "Rahu should regress");
});

Deno.test("Retrograde detection matches known 2000-01-01 states", () => {
  // Known states on 2000-01-01: Saturn was still retrograde (stationed direct
  // mid-Jan 2000); the other four were in direct motion.
  const expected: Record<string, boolean> = {
    Mercury: false, Venus: false, Mars: false, Jupiter: false, Saturn: true,
  };
  for (const [p, retro] of Object.entries(expected)) {
    assert(isRetrograde(p, J2000) === retro, `${p} retrograde state mismatch at J2000`);
  }
  // Mercury retrogrades ~3x/year — assert at least one retro window in 2000.
  let retroDays = 0;
  for (let d = 0; d < 365; d++) if (isRetrograde("Mercury", J2000 + d)) retroDays++;
  assert(retroDays > 40 && retroDays < 90, `Mercury retro days in 2000 = ${retroDays}, expected 40-90`);
});

Deno.test("Geocentric longitudes are continuous (no Kepler solver blowups)", () => {
  for (const p of Object.keys(FIXTURES)) {
    let prev = meanPlanetTropical(p, J2000);
    for (let d = 1; d <= 400; d++) {
      const cur = meanPlanetTropical(p, J2000 + d);
      assert(sep(cur, prev) < 3, `${p} jumped ${sep(cur, prev).toFixed(2)}° in one day at +${d}d`);
      prev = cur;
    }
  }
});
