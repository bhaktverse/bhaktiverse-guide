

# BhaktVerse Platform Audit — Round 4 (Senior Expert Review)

All Round 1-3 items have been verified as implemented. This audit focuses on remaining gaps found through deep code inspection.

---

## Critical: Database Triggers Still Not Persisting

The `<db-triggers>` context shows **"There are no triggers in the database"** — again. Despite four separate migration attempts to create `trg_update_likes_count`, `trg_update_comments_count`, `trg_notify_on_comment`, and `trg_notify_on_reply`, none exist. This means:
- **Likes count** never updates via trigger (only optimistic UI)
- **Comments count** never updates (always stale)
- **Notifications for comments/replies** never fire

**Root Cause**: The migration SQL creates triggers referencing functions (`update_likes_count`, `update_comments_count`, `notify_on_comment`, `notify_on_reply`) that exist as DB functions. The triggers should work. The issue is likely that migrations keep getting rolled back or the CREATE TRIGGER statements fail silently.

**Fix**: Combine all trigger creation into a single robust migration with explicit `DO $$ BEGIN ... EXCEPTION WHEN ... END $$` guards, and verify with `supabase--read_query` after deployment.

---

## Issue 1: `post_likes` Queried with `as any` Type Cast

**File**: `src/pages/Community.tsx` lines 199-200, 298-307
**Problem**: `supabase.from('post_likes' as any)` — the `post_likes` table is not reflected in `src/integrations/supabase/types.ts`. While this works at runtime, it bypasses TypeScript safety and will show linting warnings. The types file is auto-generated from the Supabase schema, so it should already include `post_likes` if the table exists.
**Fix**: The types file needs to be regenerated. Since we can't edit it directly, we need to trigger a regeneration by running a no-op migration or asking the user to refresh types. Alternatively, leave `as any` as a pragmatic workaround (no runtime impact).

---

## Issue 2: `delete-user-data` Edge Function Includes `horoscope_cache` in Delete List

**File**: `supabase/functions/delete-user-data/index.ts` line 58
**Problem**: `horoscope_cache` is in the table array but skipped with a `continue`. This is confusing dead code. Also, `user_roles` is missing from the delete list — when a user deletes their account, their role assignments persist as orphaned rows.
**Fix**: Remove `horoscope_cache` from the array. Add `user_roles` to the list before `profiles`.

---

## Issue 3: Dashboard Makes 10+ Sequential DB Queries

**File**: `src/pages/Dashboard.tsx` lines 125-358
**Problem**: `loadDashboardData()` makes ~12 sequential `await` calls: profile, journey, activities, events, shorts, devotion, palm history, API usage, chat sessions (with nested saint lookups), scripture progress (with nested scripture lookup), and quotes. This creates a waterfall of network requests, making the dashboard slow on mobile/poor connections.
**Fix**: Use `Promise.all()` to parallelize independent queries. Group into 3 parallel batches:
1. `profile + journey + activities + API usage` (user-specific, fast)
2. `events + shorts + devotion + quotes` (public data, cacheable)
3. `palm history + chat sessions + scripture progress` (user-specific, resumption data)

**UI**: No change — just faster load. The existing `DashboardSkeleton` already handles the loading state.

---

## Issue 4: Community "Active This Week" Is Actually "Active in Current Page"

**File**: `src/pages/Community.tsx` line 189
**Problem**: `setActiveDevotees(uniqueUserIds.length)` counts unique authors in the currently loaded page (max 20 posts). The label says "Active This Week" but it's really "Authors on this page." After paginating, it could show 3 one moment and 7 the next.
**Fix**: Query `community_posts` with a `created_at >= 7 days ago` filter and count distinct `user_id`. Run as a separate lightweight query:
```ts
const { data } = await supabase.rpc('count_active_devotees_this_week');
```
Or simpler: query posts from last 7 days with `select('user_id')` and count unique IDs.

---

## Issue 5: No Image Upload in Community Post Creation

**File**: `src/pages/Community.tsx` lines 471-511
**Problem**: The create post dialog only has a text area and tag selector. There's no way to attach images despite `media_urls` JSONB column existing and the media gallery renderer being implemented. The `community-media` storage bucket exists and is public.
**Fix**: Add an image upload button to the create post dialog. On file select, upload to `community-media/posts/{user_id}/{timestamp}.{ext}`, get public URL, store in a local array, and include in the insert as `media_urls`. Show image previews below the textarea before posting.

**UI**: Add a row of action icons (📷 Image, 🎥 Video, 🎙️ Audio) below the textarea. On click, open file picker. Show thumbnails of selected images with an X to remove.

---

## Issue 6: Community Comment Count Display Doesn't Refresh After Adding Comment

**File**: `src/pages/Community.tsx` line 624-627 and `src/components/CommentThread.tsx`
**Problem**: Even if the DB trigger works, the `comments_count` in the post card footer won't update because the Community page only fetches posts once and doesn't re-fetch after a comment is added. The realtime subscription listens for `UPDATE` on `community_posts` (line 121-131), which should catch the trigger-updated count — but only if the trigger actually fires.
**Fix**: Once triggers are confirmed working, the realtime subscription should handle this. As a belt-and-suspenders approach, have `CommentThread` call `onCountChange?.(newCount)` after adding a comment, and update the local post state.

---

## Issue 7: Horoscope & Numerology Pages Use Different Toast Libraries

**Files**: `src/pages/Horoscope.tsx` uses `import { toast } from "sonner"`, while `src/pages/Community.tsx` uses `import { useToast } from '@/hooks/use-toast'`.
**Problem**: Inconsistent toast usage across the app. Both `sonner` and `shadcn/ui toast` are installed. Some pages use one, some the other. This isn't a bug but creates inconsistent UX (different toast styles/positions).
**Fix**: Standardize on one. Since `sonner` is simpler and already widely used, migrate remaining `useToast` calls to `sonner`. Or keep both — low priority.

---

## Issue 8: Missing SEO Meta Tags on Key Pages

**Problem**: The app has `robots.txt` allowing all crawlers but no dynamic `<title>` or `<meta>` tags per page. Every page shows the same title from `index.html`. For a public-facing spiritual platform, pages like Saints, Temples, Scriptures, and the landing page should have proper SEO.
**Fix**: Add `document.title` updates in `useEffect` for each page. For example:
- `/saints` → "Saints & Spiritual Leaders | BhaktVerse"
- `/temples` → "Sacred Temples of India | BhaktVerse"
- `/scriptures` → "Holy Scriptures & Books | BhaktVerse"

---

## Issue 9: MobileBottomNav Rendered Twice on Some Pages

**Files**: `src/components/Navigation.tsx` line 173 renders `<MobileBottomNav />` when user is logged in. But many pages also render `<MobileBottomNav />` directly (Dashboard line 933, Community line 759, Profile line 725, SaintChat line 389, etc.).
**Problem**: Two `MobileBottomNav` components render simultaneously for logged-in users, causing double bottom nav or wasted DOM nodes (one hidden, one visible).
**Fix**: Remove `MobileBottomNav` from `Navigation.tsx` and keep it only in individual pages, OR remove it from all pages and keep only in `Navigation.tsx`. The latter is cleaner — single source of truth.

---

## Implementation Plan

### Phase 1: Critical Database Fix
| # | Change | Files |
|---|--------|-------|
| 1 | Create robust migration with error-guarded trigger creation, then verify with `read_query` | Migration SQL |
| 2 | Remove `horoscope_cache` from delete list, add `user_roles` | `delete-user-data/index.ts` |

### Phase 2: Performance & Data Integrity
| # | Change | Files |
|---|--------|-------|
| 3 | Parallelize Dashboard DB queries with `Promise.all()` | `Dashboard.tsx` |
| 4 | Fix "Active This Week" to query last 7 days | `Community.tsx` |
| 5 | Add image upload to Community post creation | `Community.tsx` |

### Phase 3: Polish
| # | Change | Files |
|---|--------|-------|
| 6 | Remove duplicate `MobileBottomNav` from `Navigation.tsx` | `Navigation.tsx` |
| 7 | Add `document.title` for SEO on all public pages | Multiple page files |
| 8 | Remove `as any` casts for `post_likes` if types regenerate | `Community.tsx` |

