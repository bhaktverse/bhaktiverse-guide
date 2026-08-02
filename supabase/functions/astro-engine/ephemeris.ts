// Pure, deterministic ephemeris math shared by the astro engine and its
// regression test suite (accuracy_test.ts). Keep this file side-effect free —
// the test imports it directly without booting the function.

export const norm360 = (x: number) => ((x % 360) + 360) % 360;
export const sind = (d: number) => Math.sin((d * Math.PI) / 180);
export const cosd = (d: number) => Math.cos((d * Math.PI) / 180);

/** Lahiri (Chitrapaksha) ayanamsa — quadratic fit, ~2 arcsec 1900-2100. */
export function lahiriAyanamsa(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.853 + 1.3971 * T + 0.000308 * T * T;
}

export type Elem = {
  a: number; e: number; i: number; L: number; wbar: number; om: number;
  da: number; de: number; di: number; dL: number; dwbar: number; dom: number;
};

/** JPL approximate Keplerian elements at J2000 + per-century rates. */
export const ELEMENTS: Record<string, Elem> = {
  Mercury: { a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.25032350, wbar: 77.45779628, om: 48.33076593,
             da: 0.00000037, de: 0.00001906, di: -0.00594749, dL: 149472.67411175, dwbar: 0.16047689, dom: -0.12534081 },
  Venus:   { a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.97909950, wbar: 131.60246718, om: 76.67984255,
             da: 0.00000390, de: -0.00004107, di: -0.00078890, dL: 58517.81538729, dwbar: 0.00268329, dom: -0.27769418 },
  Earth:   { a: 1.00000261, e: 0.01671123, i: -0.00001531, L: 100.46457166, wbar: 102.93768193, om: 0.0,
             da: 0.00000562, de: -0.00004392, di: -0.01294668, dL: 35999.37244981, dwbar: 0.32327364, dom: 0.0 },
  Mars:    { a: 1.52371034, e: 0.09339410, i: 1.84969142, L: -4.55343205, wbar: -23.94362959, om: 49.55953891,
             da: 0.00001847, de: 0.00007882, di: -0.00813131, dL: 19140.30268499, dwbar: 0.44441088, dom: -0.29257343 },
  Jupiter: { a: 5.20288700, e: 0.04838624, i: 1.30439695, L: 34.39644051, wbar: 14.72847983, om: 100.47390909,
             da: -0.00011607, de: -0.00013253, di: -0.00183714, dL: 3034.74612775, dwbar: 0.21252668, dom: 0.20469106 },
  Saturn:  { a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423, wbar: 92.59887831, om: 113.66242448,
             da: -0.00125060, de: -0.00050991, di: 0.00193609, dL: 1222.49362201, dwbar: -0.41897216, dom: -0.28867794 },
};

export function helioEcliptic(name: string, jd: number): { x: number; y: number; z: number } {
  const e0 = ELEMENTS[name];
  const T = (jd - 2451545.0) / 36525.0;
  const a = e0.a + e0.da * T;
  const ec = e0.e + e0.de * T;
  const inc = e0.i + e0.di * T;
  const L = norm360(e0.L + e0.dL * T);
  const wbar = e0.wbar + e0.dwbar * T;
  const om = e0.om + e0.dom * T;
  const w = wbar - om;
  const M = norm360(L - wbar);
  const Mr = ((M > 180 ? M - 360 : M) * Math.PI) / 180;
  let E = Mr + ec * Math.sin(Mr);
  for (let k = 0; k < 8; k++) {
    const dE = (E - ec * Math.sin(E) - Mr) / (1 - ec * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  const xp = a * (Math.cos(E) - ec);
  const yp = a * Math.sqrt(1 - ec * ec) * Math.sin(E);
  const cw = cosd(w), sw = sind(w), co = cosd(om), so = sind(om), ci = cosd(inc), si = sind(inc);
  return {
    x: (cw * co - sw * so * ci) * xp + (-sw * co - cw * so * ci) * yp,
    y: (cw * so + sw * co * ci) * xp + (-sw * so + cw * co * ci) * yp,
    z: (sw * si) * xp + (cw * si) * yp,
  };
}

/** Geocentric tropical ecliptic longitude (deg). */
export function meanPlanetTropical(name: string, jd: number): number {
  const p = helioEcliptic(name, jd);
  const e = helioEcliptic("Earth", jd);
  return norm360((Math.atan2(p.y - e.y, p.x - e.x) * 180) / Math.PI);
}

/** Apparent retrograde: geocentric longitude decreasing across ±0.5 day. */
export function isRetrograde(name: string, jd: number) {
  if (!ELEMENTS[name] || name === "Earth") return false;
  const a = meanPlanetTropical(name, jd - 0.5);
  const b = meanPlanetTropical(name, jd + 0.5);
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d < 0;
}

/** Mean lunar ascending node (Rahu), tropical. */
export function rahuTropical(jd: number) {
  const d = jd - 2451545.0;
  return norm360(
    125.0445479 - 0.0529537648 * d + 0.0020762 * Math.pow((jd - 2451545.0) / 36525, 2),
  );
}
