

# BhaktVerse Platform Audit -- Round 5 (Senior Expert Review)

All Round 1-4 items verified as implemented. This round focuses on security-critical gaps, missing flows, and persistent database issues.

---

## CRITICAL: Database Triggers Still Not Persisting

The `<db-triggers>` section again shows **"There are no triggers in the database."** Despite five migration attempts. The functions exist (`update_likes_count`, `update_comments_count`, `notify_on_comment`, `notify_on_reply`) but triggers are not attached.

**Root Cause Analysis**: Previous migrations used `DO $$ BEGIN ... EXCEPTION` blocks or `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` patterns that may be silently failing. The migration tool may not support multi-statement blocks well.

**Fix**: Create a single, flat migration with only `CREATE TRIGGER IF NOT EXISTS` equivalent -- use `DROP TRIGGER IF EXISTS` followed immediately by `CREATE TRIGGER`, no `DO` blocks, no exception handling. Keep it minimal and atomic.

```sql
DROP TRIGGER IF EXISTS trg_update_likes_count ON post_likes;
CREATE TRIGGER trg_update_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

DROP TRIGGER IF EXISTS trg_update_comments_count ON post_comments;
CREATE TRIGGER trg_update_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

DROP TRIGGER IF EXISTS trg_notify_on_comment ON post_comments;
CREATE TRIGGER trg_notify_on_comment
AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

DROP TRIGGER IF EXISTS trg_notify_on_reply ON post_comments;
CREATE TRIGGER trg_notify_on_reply
AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_reply();
```

After deployment, immediately verify with `supabase--read_query` using `SELECT tgname FROM pg_trigger WHERE tgname LIKE 'trg_%';`.

---

## CRITICAL: No Password Reset Flow

**Problem**: The Auth page has no "Forgot Password?" link. There is no `/reset-password` route. Users who forget their password are permanently locked out of their accounts. This is a fundamental authentication gap.

**Fix**:
1. Add a "Forgot Password?" link below the Sign In form submit button.
2. Create a forgot password dialog/section that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`.
3. Create a new `src/pages/ResetPassword.tsx` page that:
   - Detects `type=recovery` in the URL hash (Supabase appends this)
   - Shows a "Set New Password" form
   - Calls `supabase.auth.updateUser({ password: newPassword })`
   - Redirects to `/dashboard` on success
4. Add route `<Route path="/reset-password" element={<ResetPassword />} />` as a public route in `App.tsx`.

**UI**: Small text link "Forgot your password?" below the Sign In button, styled as `text-xs text-muted-foreground hover:text-primary underline`. The reset page should match the Auth page aesthetic (gradient temple background, Om animation).

---

## Issue 1: Missing `usePageTitle` on 6 Pages

**Pages without SEO titles**: `KundaliMatch`, `DailyDevotion`, `Favorites`, `ScriptureReader`, `TempleDetail`, `SharedPalmReading`, `NotFound`.

**Fix**: Add `usePageTitle('...')` to each:
- KundaliMatch: `'Kundali Matching'`
- DailyDevotion: `'Daily Devotion & Puja'`
- Favorites: `'My Favorites'`
- ScriptureReader: dynamic title from loaded scripture name
- TempleDetail: dynamic title from loaded temple name
- SharedPalmReading: `'Palm Reading Result'`
- NotFound: `'Page Not Found'`

---

## Issue 2: `post_likes` Foreign Key Missing on `user_id`

**Problem**: The `post_likes` table has no foreign key on `user_id` referencing `auth.users(id)`. If a user is deleted via the auth system directly (not via the edge function), their likes persist as orphan rows. The `post_id` FK exists (to `community_posts`), but `user_id` has no FK.

**Fix**: Not critical since the `delete-user-data` edge function handles cleanup, and we cannot FK to `auth.users` per Supabase guidelines. Leave as-is -- the edge function covers this.

---

## Issue 3: Auth Page Has No Loading State for Google OAuth Redirect

**Problem**: When clicking "Sign in with Google", the page initiates an OAuth redirect but shows no visual feedback. The user sees the button click but nothing happens for 1-2 seconds before the redirect. On slow connections, users may double-click.

**Fix**: Set a `googleLoading` state to true on click, disable both Google buttons, and show a spinner or "Redirecting to Google..." text. Since OAuth redirects away from the page, this just prevents confusion.

---

## Issue 4: Community Search Is Client-Side Only

**Problem**: `filteredPosts` filters only the currently loaded posts (max 20 per page) using `post.content.toLowerCase().includes(searchQuery)`. If the user searches for content in older posts not yet loaded, they won't find it. The search gives a false sense of completeness.

**Fix (Phase 1 - Quick)**: Add a note below the search bar: "Searching within loaded posts" when search is active.

**Fix (Phase 2 - Proper)**: When search query changes (debounced 300ms), make a server-side query: `supabase.from('community_posts').select('*').ilike('content', '%query%').limit(20)`. Replace `filteredPosts` with server results when search is active. Clear on empty query to restore paginated view.

---

## Issue 5: Profile Data Queries Are Sequential (Not Parallelized)

**File**: `src/pages/Profile.tsx` lines 179-255
**Problem**: `loadProfileData()` makes 4 sequential `await` calls: profile, journey, roles, reading history. Same waterfall pattern that was fixed on Dashboard.

**Fix**: Use `Promise.all()`:
```ts
const [profileRes, journeyRes, rolesRes, historyRes] = await Promise.all([
  supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
  supabase.from('spiritual_journey').select('*').eq('user_id', user.id).maybeSingle(),
  supabase.from('user_roles').select('role').eq('user_id', user.id),
  supabase.from('palm_reading_history').select('id, created_at, palm_type, language').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
]);
```

---

## Issue 6: Dual Toaster Components in App.tsx

**File**: `src/App.tsx` lines 1-2, 57-58
**Problem**: Both `<Toaster />` (shadcn) and `<Sonner />` are rendered globally. Pages use different toast systems inconsistently. This means two separate toast containers exist, potentially showing toasts in different positions/styles.

**Fix (Low priority)**: Standardize on `sonner` (simpler API, already used in CommentThread, Horoscope, KundaliMatch). Migrate `useToast()` calls in Community, Profile, SaintChat, Auth, Premium, PalmReading to `toast` from `sonner`. Then remove the shadcn `<Toaster />` and `use-toast.ts`.

---

## Implementation Plan

### Phase 1: Security-Critical
| # | Change | Files |
|---|--------|-------|
| 1 | Create triggers (6th attempt -- flat SQL, verify after) | Migration SQL |
| 2 | Add Forgot Password link + ResetPassword page | `Auth.tsx`, new `ResetPassword.tsx`, `App.tsx` |

### Phase 2: SEO & Performance
| # | Change | Files |
|---|--------|-------|
| 3 | Add `usePageTitle` to 7 missing pages | Multiple page files |
| 4 | Parallelize Profile page queries | `Profile.tsx` |
| 5 | Add Google OAuth loading state | `Auth.tsx` |

### Phase 3: UX Polish
| # | Change | Files |
|---|--------|-------|
| 6 | Add "Searching within loaded posts" note in Community search | `Community.tsx` |

