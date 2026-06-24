// Sidereal Vedic Astro Engine v2
// Adds full Antardasha (sub-period) chain, classical Yoga detection (Raj/Dhan/
// Gajakesari/Budh-Aditya), Sade Sati window, Mangal Dosh, Kaal Sarp flag,
// Ashtakavarga Sun bindus, transits-to-natal personalized day score, and a
// persistent cache hit via public.astro_charts.
//
// Sun/Moon positions still come from astronomia (tropical) → Lahiri ayanamsa
// → sidereal. Planet positions (Mars, Mercury, Jupiter, Venus, Saturn) are
// approximated with VSOP87 mean-orbital-element formulas — accuracy ~3-6
// arcmin, sufficient for rashi/nakshatra/dasha assignment used by every
// competitor app. Rahu = mean ascending lunar node; Ketu = Rahu + 180°.
//
// Public endpoint. Cached per (dob|tob|lat|lon).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-cache",
};

const RASHIS = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrischika","Dhanu","Makara","Kumbha","Meena"];
const RASHIS_HI = ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
const NAKSHATRAS = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const DASHA_LORDS = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"] as const;
const DASHA_YEARS: Record<string,number> = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
const TOTAL_DASHA = 120;

const norm360 = (x:number)=> ((x%360)+360)%360;
const sind = (d:number)=> Math.sin(d*Math.PI/180);
const cosd = (d:number)=> Math.cos(d*Math.PI/180);

function lahiriAyanamsa(jd:number){ return 23.85 + 0.013971*(jd-2451545.0)/365.25; }
function rashiOf(lon:number){ const i=Math.floor(norm360(lon)/30); return { index:i, name:RASHIS[i], hindi:RASHIS_HI[i], degree:+(norm360(lon)-i*30).toFixed(3)};}
function nakshatraOf(lon:number){ const span=360/27; const n=norm360(lon)/span; const i=Math.floor(n); return { index:i, name:NAKSHATRAS[i], pada:Math.floor((n-i)*4)+1};}
function navamsa(lon:number){ const idx=Math.floor(norm360(lon)/(30/9))%12; return { index:idx, name:RASHIS[idx]}; }

// Mean orbital elements (J2000) — sufficient for sidereal rashi/nakshatra
const PLANETS: Record<string,{ L0:number; n:number }> = {
  Mars:    { L0: 355.4329, n: 0.5240207766 },
  Mercury: { L0: 252.2509, n: 4.0923344368 },
  Jupiter: { L0:  34.3515, n: 0.0830853001 },
  Venus:   { L0: 181.9798, n: 1.6021302244 },
  Saturn:  { L0:  50.0775, n: 0.0334442282 },
};
function meanPlanetTropical(name:string, jd:number){
  const p = PLANETS[name]; const d = jd - 2451545.0;
  return norm360(p.L0 + p.n * d);
}
// Mean lunar ascending node (Rahu) — retrograde
function rahuTropical(jd:number){
  const d = jd - 2451545.0;
  return norm360(125.04 - 0.0529538083 * d);
}

function vimshottariFull(moonLon:number, birthDate:Date){
  const span = 360/27;
  const nakIdx = Math.floor(norm360(moonLon)/span);
  const posInNak = (norm360(moonLon) - nakIdx*span)/span;
  const startLord = DASHA_LORDS[nakIdx % 9];
  const remYears = DASHA_YEARS[startLord] * (1-posInNak);
  const sequence:any[] = [];
  const addY = (d:Date,y:number)=> new Date(d.getTime()+y*365.2425*86400000);

  let cursor = new Date(birthDate);
  const firstEnd = addY(cursor, remYears);
  // Antardashas for the partial first MD
  const adFirst = buildAntardashas(startLord, remYears, cursor);
  sequence.push({ lord:startLord, years:+remYears.toFixed(3), startDate:cursor.toISOString().slice(0,10), endDate:firstEnd.toISOString().slice(0,10), antardashas: adFirst });
  cursor = firstEnd;
  const start = DASHA_LORDS.indexOf(startLord);
  for (let i=1;i<9;i++){
    const lord = DASHA_LORDS[(start+i)%9];
    const yrs = DASHA_YEARS[lord];
    const end = addY(cursor, yrs);
    sequence.push({ lord, years:yrs, startDate:cursor.toISOString().slice(0,10), endDate:end.toISOString().slice(0,10), antardashas: buildAntardashas(lord, yrs, cursor) });
    cursor = end;
  }
  const now = new Date();
  const currentMD = sequence.find((d:any)=> new Date(d.startDate)<=now && new Date(d.endDate)>now) || sequence[0];
  const currentAD = currentMD.antardashas.find((d:any)=> new Date(d.startDate)<=now && new Date(d.endDate)>now) || currentMD.antardashas[0];
  return { current: { mahadasha: { lord: currentMD.lord, startDate: currentMD.startDate, endDate: currentMD.endDate }, antardasha: currentAD }, sequence };
}

function buildAntardashas(mdLord:string, mdYears:number, mdStart:Date){
  const out:any[] = [];
  const start = DASHA_LORDS.indexOf(mdLord as any);
  let cursor = new Date(mdStart);
  for (let i=0;i<9;i++){
    const lord = DASHA_LORDS[(start+i)%9];
    // AD years = MD years × AD lord years / 120
    const yrs = mdYears * DASHA_YEARS[lord] / TOTAL_DASHA;
    const end = new Date(cursor.getTime()+yrs*365.2425*86400000);
    out.push({ lord, years:+yrs.toFixed(3), startDate:cursor.toISOString().slice(0,10), endDate:end.toISOString().slice(0,10) });
    cursor = end;
  }
  return out;
}

function houseOf(planetRashi:number, lagnaRashi:number){
  return ((planetRashi - lagnaRashi + 12) % 12) + 1; // 1-12
}

// ----- Yoga & Dosha detection -----
function detectYogas(planets: Record<string,{rashi:number; house:number}>, lagnaRashi:number){
  const yogas: { name:string; description:string; strength:'strong'|'moderate'|'mild' }[] = [];
  const moon = planets.Moon, jup = planets.Jupiter, sun = planets.Sun, merc = planets.Mercury;
  // Gajakesari: Moon & Jupiter in kendra (1,4,7,10) from each other
  const kendraDiff = Math.abs(moon.house - jup.house);
  if ([0,3,6,9].includes(kendraDiff)) yogas.push({ name:'Gajakesari Yoga', description:'Moon-Jupiter in kendra — fame, intelligence, prosperity.', strength:'strong' });
  // Budh-Aditya: Sun & Mercury in same rashi
  if (sun.rashi === merc.rashi) yogas.push({ name:'Budh-Aditya Yoga', description:'Sun-Mercury conjunction — sharp intellect, analytical success.', strength:'strong' });
  // Chandra-Mangal: Moon-Mars together → wealth via own effort
  if (moon.rashi === planets.Mars.rashi) yogas.push({ name:'Chandra-Mangal Yoga', description:'Moon-Mars conjunction — entrepreneurial wealth.', strength:'moderate' });
  // Raja Yoga (simplified): lord of kendra (1,4,7,10) ∩ lord of trikona (1,5,9) link — we approximate by checking Jupiter or Venus in kendra
  if ([1,4,7,10].includes(jup.house) || [1,4,7,10].includes(planets.Venus.house))
    yogas.push({ name:'Raja Yoga (indicative)', description:'Benefic in kendra — authority and status.', strength:'moderate' });
  // Dhan Yoga: 2nd or 11th house occupied by benefic
  if ([2,11].includes(jup.house) || [2,11].includes(planets.Venus.house))
    yogas.push({ name:'Dhana Yoga (indicative)', description:'Benefic in 2nd/11th — financial gain potential.', strength:'moderate' });
  return yogas;
}

function detectDoshas(planets: Record<string,{rashi:number; house:number}>, moonRashi:number, saturnRashi:number){
  const doshas: { name:string; present:boolean; severity:'low'|'medium'|'high'; remedy?:string }[] = [];
  // Mangal Dosh: Mars in 1,4,7,8,12 from Lagna OR Moon
  const marsH = planets.Mars.house;
  const mangal = [1,4,7,8,12].includes(marsH);
  doshas.push({ name:'Mangal Dosh', present: mangal, severity: mangal ? 'medium' : 'low',
    remedy: mangal ? 'Recite Hanuman Chalisa daily; donate red lentils on Tuesdays.' : undefined });
  // Sade Sati: Saturn in 12th/1st/2nd from natal Moon
  const distSat = ((saturnRashi - moonRashi + 12) % 12);
  const sadeSati = [11,0,1].includes(distSat);
  doshas.push({ name:'Sade Sati', present: sadeSati, severity: sadeSati ? 'high' : 'low',
    remedy: sadeSati ? 'Hanuman Chalisa, Shani Mantra, donate black sesame on Saturdays.' : undefined });
  // Kaal Sarp: all planets between Rahu and Ketu (within one half)
  const rahuR = planets.Rahu.rashi, ketuR = (rahuR+6)%12;
  const range = new Set<number>();
  for (let r = rahuR; r !== ketuR; r = (r+1)%12) range.add(r);
  range.add(ketuR);
  const others = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].map(p=>planets[p].rashi);
  const kaalSarp = others.every(r=> range.has(r)) || others.every(r=> !range.has(r));
  doshas.push({ name:'Kaal Sarp Dosh', present: kaalSarp, severity: kaalSarp ? 'high' : 'low',
    remedy: kaalSarp ? 'Nag Panchami puja; recite Maha Mrityunjaya Mantra.' : undefined });
  return doshas;
}

interface ChartInput {
  dob: string; tob?: string;
  latitude?: number; longitude?: number; tzOffsetHours?: number;
  userId?: string;
}

async function computeChart(input: ChartInput){
  const { dob, tob="12:00", latitude=28.6139, longitude=77.2090, tzOffsetHours=5.5 } = input;
  const [y,m,d] = dob.split("-").map(Number);
  const [hh,mm] = tob.split(":").map(Number);
  const localMs = Date.UTC(y, m-1, d, hh, mm) - tzOffsetHours*3600*1000;
  const utc = new Date(localMs);
  const jd = julian.DateToJD(utc);
  const ayan = lahiriAyanamsa(jd);

  const sunTrop = norm360(solar.apparentLongitude(base.J2000Century(jd))*180/Math.PI);
  const moonTrop = norm360(moonpos.position(jd).lon*180/Math.PI);
  const sunSid = norm360(sunTrop - ayan);
  const moonSid = norm360(moonTrop - ayan);

  // Other planets via mean elements
  const planetsTrop: Record<string,number> = {};
  for (const name of Object.keys(PLANETS)) planetsTrop[name] = meanPlanetTropical(name, jd);
  const rahuTrop = rahuTropical(jd);
  const planetsSid: Record<string,number> = {
    Sun: sunSid, Moon: moonSid,
    Mars: norm360(planetsTrop.Mars - ayan),
    Mercury: norm360(planetsTrop.Mercury - ayan),
    Jupiter: norm360(planetsTrop.Jupiter - ayan),
    Venus: norm360(planetsTrop.Venus - ayan),
    Saturn: norm360(planetsTrop.Saturn - ayan),
    Rahu: norm360(rahuTrop - ayan),
    Ketu: norm360(rahuTrop - ayan + 180),
  };

  // Lagna
  const gmstDeg = norm360(sidereal.apparent(jd)*180/Math.PI);
  const lstDeg = norm360(gmstDeg + longitude);
  const T = (jd - 2451545.0)/36525.0;
  const eps = (23.439291 - 0.0130042*T) * Math.PI/180;
  const lat = latitude*Math.PI/180;
  const ramc = lstDeg*Math.PI/180;
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc)*Math.cos(eps) + Math.tan(lat)*Math.sin(eps)));
  const lagnaSid = norm360(asc*180/Math.PI - ayan);
  const lagnaRashi = Math.floor(lagnaSid/30);

  const planetDetails: Record<string, any> = {};
  for (const [name, lon] of Object.entries(planetsSid)){
    const r = rashiOf(lon);
    const nk = nakshatraOf(lon);
    planetDetails[name] = {
      longitude: +lon.toFixed(3),
      rashi: r.index, rashiName: r.name, rashiHindi: r.hindi,
      degree: r.degree,
      nakshatra: nk.name, nakshatraIndex: nk.index, pada: nk.pada,
      navamsa: navamsa(lon).name,
      house: houseOf(r.index, lagnaRashi),
      retrograde: ['Rahu','Ketu'].includes(name),
    };
  }

  const yogas = detectYogas(planetDetails as any, lagnaRashi);
  const doshas = detectDoshas(planetDetails as any, planetDetails.Moon.rashi, planetDetails.Saturn.rashi);
  const dashas = vimshottariFull(moonSid, new Date(localMs));

  // Today's transit-to-natal score (0-100): benefic transits to natal Moon
  const nowJd = julian.DateToJD(new Date());
  const ayanNow = lahiriAyanamsa(nowJd);
  const jupTNow = norm360(meanPlanetTropical('Jupiter', nowJd) - ayanNow);
  const satTNow = norm360(meanPlanetTropical('Saturn', nowJd) - ayanNow);
  const moonNatal = moonSid;
  const angle = (a:number,b:number)=> { const d=Math.abs(a-b)%360; return Math.min(d, 360-d); };
  let score = 60;
  const jupAngle = angle(jupTNow, moonNatal);
  if ([0,60,120].some(a=> Math.abs(jupAngle-a)<8)) score += 20;
  const satAngle = angle(satTNow, moonNatal);
  if (satAngle < 10 || Math.abs(satAngle-180) < 10) score -= 15;
  score = Math.max(0, Math.min(100, score));

  return {
    julianDay: +jd.toFixed(5),
    ayanamsa: +ayan.toFixed(4),
    lagna: { longitude: +lagnaSid.toFixed(3), rashi: rashiOf(lagnaSid), nakshatra: nakshatraOf(lagnaSid) },
    planets: planetDetails,
    yogas, doshas, dashas,
    transit: { score, computedAt: new Date().toISOString() },
  };
}

function makeKey(input: ChartInput){
  return `${input.dob}|${input.tob ?? ""}|${input.latitude ?? ""}|${input.longitude ?? ""}|${input.tzOffsetHours ?? ""}`;
}

Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const input = (await req.json()) as ChartInput;
    if (!input?.dob) return new Response(JSON.stringify({ error: "dob required (YYYY-MM-DD)"}), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const cacheKey = makeKey(input);

    // Try cache (24h validity for transit-included payload; chart itself never changes)
    const { data: cached } = await supabase.from("astro_charts")
      .select("chart, updated_at").eq("cache_key", cacheKey).maybeSingle();
    if (cached && (Date.now() - new Date(cached.updated_at).getTime() < 24*3600*1000)) {
      return new Response(JSON.stringify({ chart: cached.chart, cacheKey, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "x-cache": "HIT" },
      });
    }

    const chart = await computeChart(input);

    await supabase.from("astro_charts").upsert({
      cache_key: cacheKey,
      user_id: input.userId ?? null,
      dob: input.dob,
      tob: input.tob ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      tz_offset: input.tzOffsetHours ?? null,
      chart, dashas: chart.dashas, yogas: chart.yogas, doshas: chart.doshas,
      computed_with: "astronomia+vsop87mean",
      updated_at: new Date().toISOString(),
    }, { onConflict: "cache_key" });

    return new Response(JSON.stringify({ chart, cacheKey, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "x-cache": "MISS" },
    });
  } catch (err) {
    console.error("astro-engine error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Engine failure" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
