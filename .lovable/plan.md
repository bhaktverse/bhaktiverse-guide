

# BhaktVerse Platform Audit -- Round 10 (Senior Expert Review)

Rounds 1-9 verified and resolved. This round focuses on **2 critical security vulnerabilities** found by the security scanner, plus 6 production-quality gaps discovered through deep code inspection.

---

## CRITICAL SECURITY (From Security Scanner)

### Issue 1: Any User Can Inject Notifications Into Other Users' Accounts

**Table**: `notifications`
**Severity**: CRITICAL (ERROR)

**Problem**: The INSERT policy `System creates notifications` uses `WITH CHECK (true)` -- meaning any authenticated user can insert a notification row with ANY `user_id`. An attacker can push fake notifications ("Your account is compromised, click here") into any user's feed.

**Fix**: Change the INSERT policy so only server-side triggers/functions can create notifications. Since notifications are currently created by database triggers (`notify_on_comment`, `notify_on_reply`) running as `SECURITY DEFINER`, the policy should restrict inserts to the service role only:

```sql
DROP POLICY "System creates notifications" ON notifications;
CREATE POLICY "Only service role creates notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);
```

This ensures only triggers and edge functions (using service_role) can insert notifications. Regular authenticated users cannot.

---

### Issue 2: All Users Can Read Other Users' Phone Numbers

**Table**: `profiles`
**Severity**: CRITICAL (ERROR)

**Problem**: The SELECT policy `Authenticated can view basic profile info` uses `USING (true)`, exposing the `phone` column (and all other profile data) to every authenticated user. Any logged-in user can query `SELECT phone FROM profiles` and get everyone's phone numbers.

**Fix**: The `profiles_public` view already exists to expose safe columns (name, avatar_url, spiritual_level). The broad SELECT policy on `profiles` should be restricted to own data only:

```sql
DROP POLICY "Authenticated can view basic profile info" ON profiles;
-- "Users view own full profile" policy already exists with (auth.uid() = user_id)
-- Community features should use profiles_public view instead
```

**Code Impact**: Check `Community.tsx` -- it currently queries `profiles` to get commenter names. Change to query `profiles_public` instead, since it has the same `name` and `avatar_url` fields needed.

---

## Issue 3: `profiles_public` View Has No RLS Policies

**Severity**: WARN

**Problem**: The `profiles_public` view (which is actually a view, not a table) has no RLS policies. Since it's a VIEW on the `profiles` table, it inherits the parent table's RLS. However, once we tighten `profiles` RLS (Issue 2), the view may stop working for cross-user lookups.

**Fix**: Ensure `profiles_public` is defined as a `SECURITY DEFINER` view so it bypasses the tightened `profiles` RLS. Verify the view definition and recreate if needed:

```sql
CREATE OR REPLACE VIEW profiles_public
WITH (security_invoker = false) AS
SELECT id, user_id, name, avatar_url, spiritual_level, preferred_language, created_at
FROM profiles;
```

---

## Issue 4: Enable Leaked Password Protection

**Severity**: WARN

**Problem**: Supabase's leaked password protection is disabled. This feature checks new passwords against known breach databases (HaveIBeenPwned) and prevents users from choosing compromised passwords.

**Fix**: Enable in Supabase Dashboard > Authentication > Settings > Password Protection. No code change needed -- just a dashboard toggle.

**UI**: No change.

---

## Issue 5: `DailyDevotion` Page Has No Error Recovery

**File**: `DailyDevotion.tsx` lines 25-41

**Problem**: If the `daily-divine-recommendation` edge function fails, the page shows a Hindi error toast and stays in a loading-completed state with all data as `null`. The entire page renders empty cards with undefined values. There's no retry button or fallback content.

**Fix**: Add an `error` state. When the API fails, show a retry card with "Unable to load today's devotion. Tap to retry." and a `loadDailyDevotion` button. Also add a static fallback for the devotion data based on `new Date().getDay()` from the `daily_devotions` DB table (direct query, no edge function needed).

**UI**: Error state card with retry button + "Load from database" fallback.

---

## Issue 6: `ScriptureReader` Page Title Is Static

**File**: `ScriptureReader.tsx` line 55

**Problem**: `usePageTitle('Scripture Reader')` never updates to show the actual scripture name. When reading "Bhagavad Gita Chapter 3", the browser tab still says "Scripture Reader | BhaktVerse".

**Fix**: Same pattern as SaintChat -- use `usePageTitle(scripture ? scripture.title : 'Scripture Reader')` and update when scripture data loads.

---

## Issue 7: Community Profiles Query Uses `profiles` Instead of `profiles_public`

**File**: `Community.tsx` (profile fetching logic)

**Problem**: The community page fetches user profiles using the `profiles` table to display names/avatars on posts. After fixing Issue 2 (tightening `profiles` RLS), this will break -- users won't be able to see other users' names on posts.

**Fix**: Change all community profile queries from `profiles` to `profiles_public`. The view has the same `user_id`, `name`, and `avatar_url` columns needed.

---

## Issue 8: `HeroSection` Stats Show "0+" When DB Is Empty or Loading

**File**: `HeroSection.tsx` lines 38-43

**Problem**: Before the stats load (or if the query fails), the hero shows "0+ Saint Personalities", "0+ Sacred Texts" etc. For a landing page, showing "0+" is worse than showing nothing -- it suggests the platform is empty.

**Fix**: Don't render stats until they've loaded with non-zero values. Add a `loaded` state. While loading, show skeleton placeholders or hide the stats row entirely. If all counts are 0 after loading, hide the stats section.

**UI**: Replace `{dbStats.saints}+` with skeleton `<Skeleton className="h-8 w-16" />` while loading, then render the actual number only if > 0.

---

## Implementation Plan

### Phase 1: Critical Security (Must Deploy Immediately)
| # | Change | Type |
|---|--------|------|
| 1 | Fix notifications INSERT policy to `service_role` only | SQL Migration |
| 2 | Drop overly-permissive `profiles` SELECT policy | SQL Migration |
| 3 | Ensure `profiles_public` view works as `security_definer` | SQL Migration |
| 4 | Update Community.tsx to use `profiles_public` instead of `profiles` | Code |

### Phase 2: Quality & UX
| # | Change | Files |
|---|--------|-------|
| 5 | Add error recovery + retry to DailyDevotion | `DailyDevotion.tsx` |
| 6 | Dynamic page title for ScriptureReader | `ScriptureReader.tsx` |
| 7 | Fix HeroSection "0+" stats display | `HeroSection.tsx` |
| 8 | Enable leaked password protection | Supabase Dashboard (manual) |

