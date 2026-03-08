

# BhaktVerse Platform Audit -- Round 11 (Senior Expert Review)

Rounds 1-10 resolved. This round addresses **3 critical security scanner findings still open**, plus **5 UX/architecture gaps** discovered through deep code inspection.

---

## CRITICAL SECURITY (Scanner Findings Still Open)

### Issue 1: Premium Bypass via Client-Writable XP Fields

**File**: `usePremium.tsx` lines 58-71
**Scanner**: `CLIENT_SIDE_AUTH` -- WARN

**Problem**: Premium access is granted when `level >= 3` or `experience_points >= 500` from `spiritual_journey`. Users have UPDATE access to their own `spiritual_journey` rows via RLS. Any user can run:
```js
await supabase.from('spiritual_journey').update({ level: 5, experience_points: 1000 }).eq('user_id', user.id);
```
This instantly grants premium access without payment.

**Fix**: Create a `subscriptions` table that users cannot write to:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE for users -- only service_role or admin
CREATE POLICY "Admins manage subscriptions" ON subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

Update `usePremium.tsx` to query `subscriptions` instead of `spiritual_journey`:
```ts
const { data: sub } = await supabase.from('subscriptions').select('tier, status, expires_at').eq('user_id', user.id).maybeSingle();
if (sub && sub.status === 'active' && (!sub.expires_at || new Date(sub.expires_at) > new Date())) {
  setIsPremium(true);
  setSubscriptionTier(sub.tier);
}
```

Update `Premium.tsx` CTA to say "Contact us to activate" since there's no payment gateway yet.

---

### Issue 2: Edge Functions Leak Raw Error Messages

**Scanner**: `INFO_LEAKAGE` -- WARN

**Problem**: 7 edge functions return `error.message` directly to clients. This can leak OpenAI API key names, internal paths, and service details to attackers.

**Affected**: `palm-reading-tts`, `palm-compatibility`, `spiritual-audio-tts`, `palm-daily-horoscope`, `daily-divine-recommendation`, `numerology-analysis`, `palm-reading-analysis`

**Fix**: In each function's catch block, replace `{ error: error.message }` with:
```ts
console.error('Function error:', error);
return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), { status: 500, headers: corsHeaders });
```

---

### Issue 3: Edge Functions Missing Input Size Validation

**Scanner**: `INPUT_VALIDATION` -- ERROR

**Problem**: 6 edge functions have no `content-length` check. Attackers can send multi-MB payloads to exhaust function memory/credits.

**Fix**: Add at the top of each function handler:
```ts
const contentLength = req.headers.get('content-length');
if (contentLength && parseInt(contentLength) > 50000) {
  return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: corsHeaders });
}
```

Also validate string field lengths (e.g., `name.length > 255`).

---

## UX & ARCHITECTURE GAPS

### Issue 4: Footer Links Use `<a>` Tags Instead of React Router `<Link>`

**File**: `Index.tsx` lines 121-144

**Problem**: All footer navigation links use raw `<a href="/saints">` instead of React Router `<Link to="/saints">`. This causes full page reloads instead of client-side navigation -- destroying SPA state, re-fetching all JS bundles, and losing the auth session momentarily.

**Fix**: Replace all `<a href="...">` in the footer with `<Link to="...">` from react-router-dom. The import already exists on line 3.

---

### Issue 5: Temples "Sort by Distance" Does Nothing

**File**: `Temples.tsx` line 141, 190-191

**Problem**: `distance` is hardcoded to `undefined` (line 141: `distance: undefined // Real geolocation not yet implemented`). The sort-by-distance option exists in the UI but does nothing -- all temples sort to 0. Users see "Sort by Distance" as the default but get random ordering.

**Fix (UX)**: Either:
- (a) Remove "Sort by Distance" from the sort dropdown and default to "Sort by Rating", OR
- (b) Implement actual geolocation using the Capacitor Geolocation plugin (already installed) to calculate distance from user's coordinates

Recommended: Option (a) for now -- change `useState<'distance' | 'rating' | 'name'>('distance')` to `useState<'rating' | 'name'>('rating')` and remove the distance SelectItem.

---

### Issue 6: Temple Share and Camera Buttons Are No-Ops

**File**: `Temples.tsx` lines 393-411

**Problem**: The Share and Camera buttons in the temple card have empty `onClick` handlers with just `e.stopPropagation()` and a comment `// Handle share` / `// Handle photo gallery`. Users tap buttons that do nothing.

**Fix**: Either implement the functionality or remove the buttons. For Share, reuse the existing `SocialShare` component pattern. For Camera, navigate to the temple detail page's gallery section: `navigate(\`/temples/${temple.id}#gallery\`)`.

---

### Issue 7: `post_likes` Table Accessed via Unsafe `as any` Cast

**File**: `Community.tsx` line 89

**Problem**: `const postLikesTable = () => supabase.from('post_likes' as any) as any;` -- This bypasses all TypeScript type safety. If the table schema changes, errors will only be caught at runtime.

**Fix**: Add `post_likes` to the Supabase types file. Since we can't edit the auto-generated types file, the correct fix is to create a typed helper:
```ts
const postLikesQuery = () => supabase.from('post_likes') as unknown as PostgrestQueryBuilder<any, { id: string; user_id: string; post_id: string; created_at: string }>;
```
Or better: regenerate the Supabase types to include `post_likes`.

---

### Issue 8: No "Back to Top" on Long Pages

**Problem**: Pages like Community (1010 lines), Dashboard (844 lines), Numerology (940 lines), and PalmReading (716 lines) generate very long scroll content. On mobile, scrolling back to the top requires extensive manual scrolling. No "Back to Top" floating button exists.

**Fix**: Create a reusable `ScrollToTop` component:
```tsx
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  if (!visible) return null;
  return (
    <Button size="icon" className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg md:bottom-8"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
};
```
Add to Dashboard, Community, Numerology, PalmReading, Temples, Saints, AudioLibrary, and Scriptures pages.

---

## Implementation Plan

### Phase 1: Critical Security
| # | Change | Files |
|---|--------|-------|
| 1 | Create `subscriptions` table, update `usePremium.tsx` to use it | SQL Migration + `usePremium.tsx` + `Premium.tsx` |
| 2 | Sanitize error responses in 7 edge functions | 7 edge function files |
| 3 | Add input size validation to 6 edge functions | 6 edge function files |

### Phase 2: UX Fixes
| # | Change | Files |
|---|--------|-------|
| 4 | Replace footer `<a>` tags with React Router `<Link>` | `Index.tsx` |
| 5 | Remove "Sort by Distance" default, set "Rating" as default | `Temples.tsx` |
| 6 | Remove no-op Share/Camera buttons from temple cards | `Temples.tsx` |
| 7 | Create `ScrollToTop` component, add to 8 long pages | New component + 8 pages |

