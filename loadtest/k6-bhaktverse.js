// BhaktVerse production-shape load test.
// Run: k6 run -e BASE_URL=https://bhaktverse.lovable.app -e SUPABASE_URL=... -e ANON_KEY=... loadtest/k6-bhaktverse.js
//
// Traffic profile models a 1M MAU app:
//   p95 concurrent ≈ peak_DAU * avg_session_sec / 86400
//   With 200k DAU * 180s ≈ 420 concurrent. We ramp to 1500 (headroom 3.5x).
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "https://bhaktverse.lovable.app";
const SB   = __ENV.SUPABASE_URL || "https://rbdbrbijgehakdsmnccm.supabase.co";
const KEY  = __ENV.ANON_KEY || "";

export const options = {
  scenarios: {
    browse: {
      executor: "ramping-vus",
      startVUs: 10,
      stages: [
        { duration: "1m",  target: 200 },   // warm up
        { duration: "3m",  target: 800 },   // normal peak
        { duration: "2m",  target: 1500 },  // headroom
        { duration: "2m",  target: 1500 },  // sustain
        { duration: "1m",  target: 0 },     // cool down
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed:   ["rate<0.01"],
    http_req_duration: ["p(95)<800", "p(99)<2000"],
    "http_req_duration{type:edge}": ["p(95)<1500"],
  },
};

const errors = new Rate("biz_errors");
const edgeLatency = new Trend("edge_latency_ms");

function getJSON(url, tags = {}) {
  const r = http.get(url, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    tags,
  });
  check(r, { "200": (x) => x.status === 200 }) || errors.add(1);
  return r;
}

function postFn(name, body) {
  const r = http.post(`${SB}/functions/v1/${name}`, JSON.stringify(body), {
    headers: { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}` },
    tags: { type: "edge", fn: name },
  });
  edgeLatency.add(r.timings.duration);
  check(r, { "fn ok": (x) => x.status === 200 || x.status === 429 });
  return r;
}

export default function () {
  group("landing", () => {
    http.get(`${BASE}/`, { tags: { type: "page" } });
    sleep(1);
  });

  group("content-browse", () => {
    getJSON(`${SB}/rest/v1/saints?select=id,name,image_url&limit=20`, { type: "rest" });
    getJSON(`${SB}/rest/v1/temples?select=id,name&limit=20`, { type: "rest" });
    getJSON(`${SB}/rest/v1/audio_library?select=id,title,audio_url&limit=20`, { type: "rest" });
    sleep(2);
  });

  if (Math.random() < 0.35) {
    group("horoscope-cached", () => {
      postFn("daily-horoscope", { sign: ["aries","taurus","gemini"][Math.floor(Math.random()*3)] });
      sleep(1);
    });
  }

  if (Math.random() < 0.10) {
    group("astro-engine", () => {
      postFn("astro-engine", { dob: "1990-05-12", tob: "08:30", lat: 19.07, lon: 72.87 });
      sleep(2);
    });
  }

  if (Math.random() < 0.20) {
    group("audio-head", () => {
      http.request("HEAD", "https://archive.org/download/hanuman-chalisa/hanuman-chalisa.mp3", null, { tags: { type: "media" } });
    });
  }

  sleep(Math.random() * 3);
}
