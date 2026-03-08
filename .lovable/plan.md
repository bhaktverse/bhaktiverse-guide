

# BhaktVerse Platform Audit — Senior Expert Review (Round 2)

After a thorough code-level review of all pages, edge functions, database schema, navigation, and UX flows, here are the remaining issues and improvement opportunities. Previous audit items (dark theme, Rashi chip bar, past matches, past reports, pagination, WhatsApp CTA, rate limiting) have been successfully implemented.

---

## Critical Issues

### 1. Horoscope: Rate Limiting Not Applied on Cache Hit Path
**File**: `supabase/functions/daily-horoscope/index.ts` lines 37-41
**Problem**: When the cache hits, the function returns immediately without checking rate limits. This is by design to save API calls, but the rate limit check only runs on cache miss. However, the function also doesn't authenticate the user on cache-hit path. A malicious user could hammer the cache path. Not critical since cache hits are cheap, but inconsistent.
**Verdict**: Acceptable. No change needed.

### 2. Auth Page: No Google/GitHub OAuth Buttons
**File**: `src/pages/Auth.tsx`
**Problem**: Only email/password auth is available. The user base for a devotional platform (India-centric) heavily relies on Google sign-in. This is a major friction point for user acquisition.
**Fix**: Add a "Sign in with Google" button using `supabase.auth.signInWithOAuth({ provider: 'google' })`. Requires enabling Google provider in Supabase Auth settings.

### 3. Dashboard: No API Usage Display
**Problem**: Rate limiting is implemented (20 calls/day) but users have no visibility into how many calls they've used. This leads to unexpected 429 errors with no context.
**Fix**: Add a small "AI Credits" indicator on the Dashboard showing `X/20 used today` by querying `user_api_usage` for today's date.

---

## UX/UI Improvements

### 4. Profile Page: No Delete Account Option
**Problem**: GDPR/privacy compliance requires a way for users to delete their account or data. Currently no option exists.
**Fix**: Add a danger zone section at bottom of Profile page with "Delete My Data" button that clears user content from all tables.

### 5. Community: No Image Upload for Posts
**File**: `src/pages/Community.tsx`
**Problem**: The UI has an Image icon button but the create post dialog only accepts text. The `community-media` storage bucket exists but isn't used for post images.
**Fix**: Add image upload in the create post dialog using the existing `community-media` bucket. Store URLs in the `media_urls` JSONB column.

### 6. SaintChat: No Session Persistence Across Visits
**File**: `src/pages/SaintChat.tsx`
**Problem**: Chat messages are stored in component state only. When the user navigates away and returns, the conversation is lost. The `ai_chat_sessions` table exists but isn't used.
**Fix**: On mount, load the latest session for this saint from `ai_chat_sessions`. After each message exchange, upsert the messages array.

### 7. Horoscope: No "Save to Profile" for Auto-detected Rashi
**Problem**: If a user doesn't have an astro profile, they must select their rashi every visit. There's no CTA to save their selected rashi to `astro_profiles` for future auto-detection.
**Fix**: After selecting a rashi manually, show a subtle "Save as my Rashi" button that creates/updates an `astro_profiles` row.

### 8. Numerology: Past Reports Not Loadable
**Problem**: Past reports are listed but clicking them does nothing. Users can see they exist but can't reload a previous analysis.
**Fix**: Make each past report card clickable — on click, fetch the full report from `numerology_reports` and populate the results view.

### 9. Dashboard: Bhakti Shorts Section Shows Empty State
**Problem**: The `bhakti_shorts` table likely has no data. The dashboard renders an empty section for Bhakti Shorts, wasting premium screen real estate.
**Fix**: Conditionally render the Bhakti Shorts section only when data exists. If empty, show a different content block (e.g., "Explore Temples" or "Today's Mantra").

### 10. No Error Boundary
**Problem**: If any page component throws a runtime error, the entire app crashes to a white screen. No error boundary exists.
**Fix**: Add a React Error Boundary component wrapping the Routes in `App.tsx` that shows a graceful "Something went wrong" screen with a retry button.

---

## Design & Polish

### 11. Index (Landing) Page: Missing `animate-fade-in`
**File**: `src/pages/Index.tsx` line 37
**Problem**: Root div uses `min-h-screen bg-background` but no entry animation, unlike other pages.
**Fix**: Add `animate-fade-in` class.

### 12. Mobile Bottom Nav: "Numerology" Missing from Quick Access
**Problem**: The bottom nav "More" sheet lists Horoscope, Kundali Match, but Numerology is not listed despite being a core feature.
**Fix**: Add Numerology to `secondaryNavItems` in MobileBottomNav.

### 13. Kundali Match: Loading State Uses Loader2 Instead of Om Pulse
**Problem**: Inconsistent with Horoscope page which uses the spiritual Om animation during AI processing.
**Fix**: Replace the `Loader2` spinner during matching with the Om pulse animation pattern used in Horoscope.

### 14. Community: Search/Filter Not Functional
**Problem**: `searchQuery` and `filterTag` state variables exist but are never applied to the query in `loadPosts()`. The search bar and filter dropdown are decorative.
**Fix**: Apply `.ilike('content', `%${searchQuery}%`)` and `.contains('tags', [filterTag])` filters in the loadPosts query.

---

## Backend & Security

### 15. Edge Functions: Missing `verify_jwt = false` for Some Functions
**File**: `supabase/config.toml`
**Problem**: `daily-horoscope`, `kundali-match`, `festival-notifications`, `palm-compatibility`, `palm-daily-horoscope` are NOT listed in config.toml with `verify_jwt = false`. These functions validate auth in code, but without the config entry, Supabase will reject requests without a valid JWT before the code even runs.
**Fix**: Add these entries to `config.toml`:
```toml
[functions.daily-horoscope]
verify_jwt = false

[functions.kundali-match]
verify_jwt = false

[functions.festival-notifications]
verify_jwt = false
```

### 16. Community: `post_comments` Triggers Missing
**Problem**: The `notify_on_comment` and `notify_on_reply` functions exist as database functions but the DB shows "There are no triggers in the database." The notification triggers were never created.
**Fix**: Create triggers:
```sql
CREATE TRIGGER on_new_comment AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

CREATE TRIGGER on_new_reply AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_reply();
```

---

## Implementation Plan

### Phase 1: Critical Backend Fixes
| # | Change |
|---|--------|
| 1 | Add missing `verify_jwt = false` entries in `config.toml` for daily-horoscope, kundali-match |
| 2 | Create comment notification triggers on `post_comments` table |
| 3 | Add Error Boundary component wrapping Routes |

### Phase 2: UX Upgrades
| # | Change |
|---|--------|
| 4 | Add Google OAuth button to Auth page |
| 5 | Add "AI Credits Used" indicator on Dashboard |
| 6 | Persist SaintChat sessions to `ai_chat_sessions` table |
| 7 | Make Numerology past reports clickable/loadable |
| 8 | Add "Save as my Rashi" button on Horoscope page |

### Phase 3: Polish
| # | Change |
|---|--------|
| 9 | Add Numerology to MobileBottomNav secondary items |
| 10 | Apply Community search/filter to actual query |
| 11 | Add `animate-fade-in` to Index page root |
| 12 | Conditionally hide empty Bhakti Shorts on Dashboard |
| 13 | Use Om pulse loader for Kundali Match loading state |
| 14 | Add image upload to Community post creation |

### Files to Modify
- `supabase/config.toml` — verify_jwt entries
- `src/App.tsx` — Error Boundary wrapper
- `src/pages/Auth.tsx` — Google OAuth button
- `src/pages/Dashboard.tsx` — AI credits indicator, conditional Bhakti Shorts
- `src/pages/SaintChat.tsx` — session persistence
- `src/pages/Numerology.tsx` — clickable past reports
- `src/pages/Horoscope.tsx` — "Save as my Rashi" CTA
- `src/pages/Community.tsx` — search/filter query, image upload
- `src/pages/Index.tsx` — animate-fade-in
- `src/pages/KundaliMatch.tsx` — Om pulse loader
- `src/components/MobileBottomNav.tsx` — add Numerology
- New migration SQL — comment notification triggers

