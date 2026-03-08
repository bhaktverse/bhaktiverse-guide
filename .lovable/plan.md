

# BhaktVerse Platform Audit -- Round 12 (Senior Expert Review)

Rounds 1-11 resolved. This round addresses **2 critical security findings still open from the scanner**, plus **6 UX/architecture gaps** discovered through deep code and page inspection.

---

## CRITICAL SECURITY (Scanner Findings Still Open)

### Issue 1: Saint-Chat Edge Function Trusts Unverified User-ID Header

**File**: `supabase/functions/saint-chat/index.ts` lines 85-94
**Scanner**: `OPEN_ENDPOINTS` -- ERROR

**Problem**: The saint-chat function properly verifies the JWT via `supabaseAuth.auth.getUser()` to extract the user ID (line 92-93). However, the original `SaintChat.tsx` client code sends the user ID as a custom `user-id` header. If the function falls back to using that header instead of the verified JWT user, an attacker could impersonate another user's chat sessions. While the current implementation looks correct (it uses `userId = user?.id`), the function also creates a `supabase` service-role client (line 97) and uses it to upsert chat sessions with the extracted `userId`. The risk is that if `userId` is null (unauthenticated), the function still proceeds to call the AI -- consuming API credits without any user attribution or rate limiting.

**Fix**: Return 401 immediately if `userId` is null after JWT verification. Remove the custom `user-id` header pattern from the client entirely. Ensure all edge functions follow the same auth pattern:

```typescript
if (!userId) {
  return new Response(JSON.stringify({ error: 'Authentication required' }), 
    { status: 401, headers: corsHeaders });
}
```

### Issue 2: Notifications INSERT Policy Still Allows Authenticated Users

**Scanner**: `MISSING_RLS_PROTECTION` -- ERROR (still flagged)

**Problem**: The Round 10 migration created `"Only service role creates notifications"` but the scanner still flags it. Looking at the current policy list, the policy exists with `WITH CHECK (true)` but is scoped to `service_role`. However, the **old** policy `"System creates notifications"` may not have been dropped if the migration failed or was partial. The scanner sees two INSERT policies -- one permissive to `authenticated`.

**Fix**: Run a cleanup migration that explicitly drops the old policy name if it still exists:

```sql
DROP POLICY IF EXISTS "System creates notifications" ON notifications;
-- Verify "Only service role creates notifications" exists and is TO service_role
```

### Issue 3: `profiles` Table Still Has Permissive SELECT to All Authenticated

**Scanner**: `EXPOSED_SENSITIVE_DATA` -- ERROR (still flagged)

**Problem**: Same as above -- the Round 10 migration may not have fully applied. The scanner still sees `"Authenticated can view basic profile info"` with `USING (true)` exposing phone/location to all users.

**Fix**: Cleanup migration:
```sql
DROP POLICY IF EXISTS "Authenticated can view basic profile info" ON profiles;
```

---

## UX & ARCHITECTURE GAPS

### Issue 4: Profile Page Still Uses XP-Based Premium Check (Line 209)

**File**: `Profile.tsx` line 209

**Problem**: After Round 11 created the `subscriptions` table and updated `usePremium.tsx`, the Profile page still has a local `isPremium` state that checks `journeyData.level >= 3 || journeyData.experience_points >= 500` (line 209). This means the Profile page shows the "Premium" badge based on the old, bypassable logic instead of using the global `usePremium()` hook.

**Fix**: Replace the local `isPremium` state with the `usePremium()` hook:
```tsx
import { usePremium } from '@/hooks/usePremium';
// Remove local isPremium state
const { isPremium } = usePremium();
```
Remove lines 122, 209-211, and 217 (the local `isPremium` state and XP-based checks).

### Issue 5: Avatar Upload Has No File Validation

**File**: `Profile.tsx` lines 127-158

**Problem**: The avatar upload handler accepts `image/*` but has no file size limit. A user can upload a 50MB image, consuming storage and bandwidth. Community.tsx was fixed in Round 11 with `MAX_IMAGE_SIZE` validation, but Profile was missed.

**Fix**: Add the same validation pattern:
```tsx
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (file.size > MAX_AVATAR_SIZE) {
  toast.error('Avatar must be under 2MB');
  return;
}
if (!ALLOWED_TYPES.includes(file.type)) {
  toast.error('Only JPEG, PNG, and WebP images allowed');
  return;
}
```

### Issue 6: Empty State on Favorites Page Shows Loading Forever When Not Logged In

**File**: `Favorites.tsx` line 165

**Problem**: The Favorites page is a protected route, but the loading check on line 165 (`if (loading)`) can remain true indefinitely if `useFavorites()` never resolves (e.g., when the auth state is transitioning). The page shows a spinner with no timeout or fallback message.

**Fix**: Add a combined check:
```tsx
if (loading && !enriched.length) {
  // Show skeleton for max 5 seconds, then show empty state
}
```
Or simply ensure the loading state properly transitions by depending on both `favsLoading` and the enrichment process.

### Issue 7: KundaliMatch Uses `session` Instead of `user` for Auth Check

**File**: `KundaliMatch.tsx` line 46

**Problem**: KundaliMatch destructures `{ session }` from `useAuth()` while every other protected page uses `{ user }`. This is inconsistent and could lead to edge cases where `session` exists but `user` is null (during token refresh). The page also lacks the standard redirect-to-auth guard that other pages have.

**Fix**: Change to `const { user } = useAuth();` and add the standard auth redirect:
```tsx
useEffect(() => {
  if (!authLoading && !user) navigate('/auth');
}, [user, authLoading, navigate]);
```

### Issue 8: No "Terms of Service" or "Privacy Policy" Links

**Problem**: The footer and auth page have no links to Terms of Service or Privacy Policy. For a production spiritual platform handling personal data (palm images, birth dates, phone numbers), this is a legal compliance gap. The auth page says "By joining, you become part of a global spiritual community" but doesn't reference any legal agreement.

**Fix**: Add placeholder pages and footer links:
- Create `/terms` and `/privacy` routes (can be simple static pages initially)
- Add links to the footer in `Index.tsx`
- Add a checkbox or text on the Auth signup form: "By signing up, you agree to our Terms of Service and Privacy Policy"

### Issue 9: Dashboard "Continue Your Journey" Makes Waterfall Queries

**File**: `Dashboard.tsx` lines 216-254

**Problem**: After the main `Promise.all` batch (good), the dashboard has a second `Promise.all` for chat sessions and scripture progress (line 216). But then it does **sequential** queries inside loops -- line 228 fetches saints by ID (correct batch with `.in()`), but line 250 fetches a single scripture with `.eq()` which is fine. The real issue is that if a user has 0 chat sessions and 0 scripture progress, this second batch is wasteful. Minor but worth noting.

More importantly, the entire `loadDashboardData` function is ~130 lines long with no error isolation. If any single query in the main `Promise.all` fails, ALL dashboard data fails to load.

**Fix**: Wrap each query result processing in try-catch to isolate failures:
```tsx
// Process profile - isolated
try {
  const profile = profileRes.data;
  if (profile) { ... }
} catch (e) { console.error('Profile processing failed:', e); }
```

---

## Implementation Plan

### Phase 1: Security (Must Deploy)
| # | Change | Files |
|---|--------|-------|
| 1 | Enforce auth in saint-chat, return 401 for unauthenticated | `saint-chat/index.ts` |
| 2 | Cleanup stale notification + profiles policies | SQL Migration |
| 3 | Fix Profile.tsx to use `usePremium()` instead of local XP check | `Profile.tsx` |
| 4 | Add avatar upload file validation | `Profile.tsx` |

### Phase 2: UX & Quality
| # | Change | Files |
|---|--------|-------|
| 5 | Fix KundaliMatch auth pattern (session -> user) | `KundaliMatch.tsx` |
| 6 | Add Terms/Privacy links to footer and auth page | `Index.tsx`, `Auth.tsx`, new routes |
| 7 | Add error isolation to Dashboard query processing | `Dashboard.tsx` |

