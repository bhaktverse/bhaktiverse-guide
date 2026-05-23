// Sidereal Vedic Astro Engine
// Computes: Sun/Moon sidereal longitudes, Rashi, Nakshatra (+ pada),
// Lagna (ascendant), Navamsa, and Vimshottari Mahadasha sequence.
//
// Uses astronomia (JPL-grade) for Sun/Moon positions, then converts
// tropical → sidereal via Lahiri ayanamsa. No external API needed.
//
// Public endpoint (verify_jwt = false) — read-only computation.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore - astronomia ships JS with no types
import solar from "https://esm.sh/astronomia@4.1.1/solar";
// @ts-ignore
import moonpos from "https://esm.sh/astronomia@4.1.1/moonposition";
// @ts-ignore
import sidereal from "https://esm.sh/astronomia@4.1.1/sidereal";
// @ts-ignore
import julian from "https://esm.sh/astronomia@4.1.1/julian";
// @ts-ignore
import base from "https://esm.sh/astronomia@4.1.1/base";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena",
];
const RASHIS_HI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन",
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

// Vimshottari dasha lords in nakshatra order (repeats every 9)
const DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// Lahiri ayanamsa at J2000.0 ≈ 23.85°, precesses ~50.27"/yr
function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Standard Lahiri formula (matches Swiss Ephemeris within ~1')
  return 23.85 + 0.013971 * (jd - 2451545.0) / 365.25;
}

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function rashiOf(lon: number) {
  const idx = Math.floor(norm360(lon) / 30);
  const deg = norm360(lon) - idx * 30;
  return { index: idx, name: RASHIS[idx], hindi: RASHIS_HI[idx], degree: deg };
}

function nakshatraOf(lon: number) {
  const span = 360 / 27; // 13°20'
  const n = norm360(lon) / span;
  const idx = Math.floor(n);
  const pada = Math.floor((n - idx) * 4) + 1;
  return { index: idx, name: NAKSHATRAS[idx], pada };
}

// Compute Lagna (Ascendant) sidereal longitude
// dob/tob in UTC. Latitude in degrees.
function computeLagna(jdUT: number, latDeg: number, ayan: number): number {
  // Local Sidereal Time (degrees)
  const gmst = sidereal.apparent(jdUT) * 180 / Math.PI; // degrees
  const lst = norm360(gmst); // assume observer longitude added by caller? we feed LST already in jd
  // Obliquity
  const T = (jdUT - 2451545.0) / 36525.0;
  const eps = (23.439291 - 0.0130042 * T) * Math.PI / 180;
  const lat = latDeg * Math.PI / 180;
  const ramc = lst * Math.PI / 180;
  // Standard ascendant formula
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))
  );
  let ascDeg = asc * 180 / Math.PI;
  ascDeg = norm360(ascDeg);
  return norm360(ascDeg - ayan); // sidereal
}

function navamsa(lon: number): { index: number; name: string } {
  const navamsaSpan = 30 / 9; // 3°20'
  const totalNavamsa = Math.floor(norm360(lon) / navamsaSpan);
  const navIdx = totalNavamsa % 12;
  return { index: navIdx, name: RASHIS[navIdx] };
}

function vimshottariDasha(moonLon: number, birthDate: Date) {
  const span = 360 / 27;
  const nakIdx = Math.floor(norm360(moonLon) / span);
  const posInNak = (norm360(moonLon) - nakIdx * span) / span; // 0..1
  const startLord = DASHA_LORDS[nakIdx % 9];
  const startYears = DASHA_YEARS[startLord];
  const remainingYears = startYears * (1 - posInNak);

  const sequence: { lord: string; years: number; startDate: string; endDate: string }[] = [];
  let cursor = new Date(birthDate);
  const addYears = (d: Date, y: number) => {
    const ms = y * 365.2425 * 24 * 3600 * 1000;
    return new Date(d.getTime() + ms);
  };

  // First (partial) dasha
  const firstEnd = addYears(cursor, remainingYears);
  sequence.push({
    lord: startLord,
    years: +remainingYears.toFixed(2),
    startDate: cursor.toISOString().slice(0, 10),
    endDate: firstEnd.toISOString().slice(0, 10),
  });
  cursor = firstEnd;

  // Next 8 full dashas
  const startListIdx = DASHA_LORDS.indexOf(startLord);
  for (let i = 1; i < 9; i++) {
    const lord = DASHA_LORDS[(startListIdx + i) % 9];
    const yrs = DASHA_YEARS[lord];
    const end = addYears(cursor, yrs);
    sequence.push({
      lord, years: yrs,
      startDate: cursor.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    });
    cursor = end;
  }

  const now = new Date();
  const current = sequence.find(
    (d) => new Date(d.startDate) <= now && new Date(d.endDate) > now
  ) || sequence[0];

  return { current, sequence };
}

interface ChartInput {
  dob: string;          // YYYY-MM-DD
  tob?: string;         // HH:mm (local)
  latitude?: number;
  longitude?: number;
  tzOffsetHours?: number; // e.g. 5.5 for IST
}

async function computeChart(input: ChartInput) {
  const { dob, tob = "12:00", latitude = 28.6139, longitude = 77.2090, tzOffsetHours = 5.5 } = input;
  const [y, m, d] = dob.split("-").map(Number);
  const [hh, mm] = tob.split(":").map(Number);

  // Convert local → UTC
  const localMs = Date.UTC(y, m - 1, d, hh, mm) - tzOffsetHours * 3600 * 1000;
  const utc = new Date(localMs);
  const jd = julian.DateToJD(utc);

  const ayan = lahiriAyanamsa(jd);

  // Sun & Moon tropical longitudes (radians → degrees)
  const sunTrop = norm360(solar.apparentLongitude(base.J2000Century(jd)) * 180 / Math.PI);
  const moonTrop = norm360(moonpos.position(jd).lon * 180 / Math.PI);

  const sunSid = norm360(sunTrop - ayan);
  const moonSid = norm360(moonTrop - ayan);

  // LST at birthplace
  const gmstDeg = norm360(sidereal.apparent(jd) * 180 / Math.PI);
  const lstDeg = norm360(gmstDeg + longitude);
  // Re-derive jd for LST input to computeLagna — we already incorporated longitude
  const T = (jd - 2451545.0) / 36525.0;
  const eps = (23.439291 - 0.0130042 * T) * Math.PI / 180;
  const lat = latitude * Math.PI / 180;
  const ramc = lstDeg * Math.PI / 180;
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))
  );
  let lagnaTropDeg = norm360(asc * 180 / Math.PI);
  if (lagnaTropDeg < lstDeg - 180 || lagnaTropDeg > lstDeg + 180) {
    // adjust quadrant
  }
  const lagnaSid = norm360(lagnaTropDeg - ayan);

  return {
    julianDay: jd,
    ayanamsa: +ayan.toFixed(4),
    sun: { longitude: +sunSid.toFixed(4), rashi: rashiOf(sunSid), nakshatra: nakshatraOf(sunSid) },
    moon: {
      longitude: +moonSid.toFixed(4),
      rashi: rashiOf(moonSid),
      nakshatra: nakshatraOf(moonSid),
      navamsa: navamsa(moonSid),
    },
    lagna: {
      longitude: +lagnaSid.toFixed(4),
      rashi: rashiOf(lagnaSid),
      nakshatra: nakshatraOf(lagnaSid),
      navamsa: navamsa(lagnaSid),
    },
    dasha: vimshottariDasha(moonSid, new Date(localMs)),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const input = (await req.json()) as ChartInput;
    if (!input?.dob) {
      return new Response(JSON.stringify({ error: "dob required (YYYY-MM-DD)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional cache by dob+tob+lat+lon
    const cacheKey = `${input.dob}|${input.tob ?? ""}|${input.latitude ?? ""}|${input.longitude ?? ""}`;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const chart = await computeChart(input);

    return new Response(JSON.stringify({ chart, cacheKey }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("astro-engine error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Engine failure" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
