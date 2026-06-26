// Page-by-page regression coverage matrix.
// Each entry maps a public route to the QA suite/tests that cover it
// plus the expected output a human reviewer should see.

export type CoverageEntry = {
  page: string;
  route: string;
  area: "Core" | "Spiritual" | "AI" | "Astro" | "Community" | "Admin" | "Audio";
  cases: Array<{
    id: string;            // matches qa_results.test_name when applicable
    suite: string;         // matches qa_results.suite
    title: string;
    expected: string;
    docs?: string;
  }>;
};

export const COVERAGE_MATRIX: CoverageEntry[] = [
  {
    page: "Landing",
    route: "/",
    area: "Core",
    cases: [
      { id: "route:/", suite: "routes", title: "Landing renders 200", expected: "HTML 200, hero visible, CTA links to /auth or /dashboard" },
      { id: "seo:landing", suite: "seo", title: "Meta + JSON-LD present", expected: "<title> under 60 chars, meta description under 160 chars, Organization JSON-LD" },
    ],
  },
  {
    page: "Auth",
    route: "/auth",
    area: "Core",
    cases: [
      { id: "route:/auth", suite: "routes", title: "Auth route renders", expected: "Sign in / sign up tabs render without console errors" },
      { id: "supabase:session", suite: "edge", title: "Session bootstraps", expected: "supabase.auth.getSession() resolves under 1s" },
    ],
  },
  {
    page: "Dashboard",
    route: "/dashboard",
    area: "Core",
    cases: [
      { id: "route:/dashboard", suite: "routes", title: "Dashboard mounts", expected: "Daily Sadhana widget + horoscope chip render" },
      { id: "db:profiles", suite: "db", title: "Profile row exists for current user", expected: "profiles row returned (maybeSingle)" },
    ],
  },
  {
    page: "Palm Reading",
    route: "/palm-reading",
    area: "AI",
    cases: [
      { id: "route:/palm-reading", suite: "routes", title: "Scanner mounts", expected: "Camera CTA + history list render, MediaPipe overlay loads" },
      { id: "edge:palm-reading-analysis", suite: "edge", title: "Vision pipeline reachable", expected: "OPTIONS preflight 204 within 500ms" },
      { id: "db:palm_reading_history", suite: "db", title: "History writes succeed", expected: "Insert returns id when authenticated" },
    ],
  },
  {
    page: "Saints",
    route: "/saints",
    area: "Spiritual",
    cases: [
      { id: "route:/saints", suite: "routes", title: "Saints index renders", expected: "≥40 saints in grid, no broken images" },
      { id: "db:saints", suite: "db", title: "Saints have no duplicates", expected: "count(distinct name) == count(*)" },
    ],
  },
  {
    page: "Scriptures",
    route: "/scriptures",
    area: "Spiritual",
    cases: [
      { id: "route:/scriptures", suite: "routes", title: "Scriptures list", expected: "Scripture cards render with chapters count" },
      { id: "db:scriptures", suite: "db", title: "All scriptures have title + tradition", expected: "no nulls in title/tradition columns" },
    ],
  },
  {
    page: "Temples",
    route: "/temples",
    area: "Spiritual",
    cases: [
      { id: "route:/temples", suite: "routes", title: "Temple map/list", expected: "≥50 temples with primary_deity populated" },
      { id: "edge:sync-wikidata-temples", suite: "edge", title: "Temple sync reachable", expected: "Admin invoke returns inserted/updated counts" },
    ],
  },
  {
    page: "Audio Library",
    route: "/audio",
    area: "Audio",
    cases: [
      { id: "route:/audio", suite: "routes", title: "Audio list renders", expected: "Categories Mantra/Bhajan/Aarti visible, player mounts" },
      { id: "audio:health", suite: "audio", title: "Track URLs healthy", expected: ">90% of tracks return HTTP ok on probe" },
      { id: "audio:offline", suite: "audio", title: "Cache reports status", expected: "Player chip shows Online/Cached/Offline state" },
    ],
  },
  {
    page: "Mantras",
    route: "/mantras",
    area: "Spiritual",
    cases: [
      { id: "route:/mantras", suite: "routes", title: "Mantra library", expected: "Filter by deity works, mala counter starts at 0" },
    ],
  },
  {
    page: "Tarot",
    route: "/tarot",
    area: "AI",
    cases: [
      { id: "route:/tarot", suite: "routes", title: "Tarot pull renders", expected: "22 Major Arcana visible, flip animation runs" },
    ],
  },
  {
    page: "Numerology",
    route: "/numerology",
    area: "Astro",
    cases: [
      { id: "route:/numerology", suite: "routes", title: "Numerology form", expected: "Name + DOB validate, result card with Life Path number" },
      { id: "edge:numerology-analysis", suite: "edge", title: "Analysis function ok", expected: "Returns lifepath, expression, soulurge fields" },
    ],
  },
  {
    page: "Kundali Match",
    route: "/kundali-match",
    area: "Astro",
    cases: [
      { id: "route:/kundali-match", suite: "routes", title: "Form renders", expected: "Bride/Groom inputs, 36-point output card" },
      { id: "edge:kundali-match", suite: "edge", title: "Function returns gunas", expected: "JSON has gun_milan total ≤36" },
    ],
  },
  {
    page: "Panchang",
    route: "/panchang",
    area: "Astro",
    cases: [
      { id: "route:/panchang", suite: "routes", title: "Panchang renders", expected: "Tithi, Nakshatra, Yoga, Karana for today" },
      { id: "edge:hindu-panchang", suite: "edge", title: "Panchang function ok", expected: "200 with cached payload < 1s" },
    ],
  },
  {
    page: "Community",
    route: "/community",
    area: "Community",
    cases: [
      { id: "route:/community", suite: "routes", title: "Feed renders", expected: "Realtime channel subscribes once, posts paginated" },
      { id: "db:post_likes", suite: "db", title: "Likes RLS allows owner", expected: "Insert succeeds for auth user" },
    ],
  },
  {
    page: "Saint Chat",
    route: "/saint-chat",
    area: "AI",
    cases: [
      { id: "route:/saint-chat", suite: "routes", title: "Chat shell renders", expected: "Persona picker visible, stream connects" },
      { id: "edge:saint-chat", suite: "edge", title: "Saint chat reachable", expected: "POST returns SSE stream within 2s" },
    ],
  },
  {
    page: "Daily Horoscope",
    route: "/horoscope",
    area: "Astro",
    cases: [
      { id: "route:/horoscope", suite: "routes", title: "Horoscope page", expected: "Rashi auto-detected, cached payload renders" },
      { id: "edge:daily-horoscope", suite: "edge", title: "Function returns 12 rashis", expected: "Array length 12 in response" },
    ],
  },
  {
    page: "Admin Console",
    route: "/admin",
    area: "Admin",
    cases: [
      { id: "route:/admin", suite: "routes", title: "Admin guarded", expected: "Non-admins redirected, admins see dashboard" },
      { id: "rbac:user_roles", suite: "db", title: "has_role works", expected: "RPC returns boolean without recursion" },
    ],
  },
];

export type SuiteFilter = "all" | "routes" | "edge" | "db" | "audio" | "seo";
