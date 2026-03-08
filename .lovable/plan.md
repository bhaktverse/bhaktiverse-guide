

# BhaktVerse Platform Audit -- Round 7 (Senior Expert Review)

Rounds 1-6 verified. **Database triggers are confirmed working** (all 4 exist). This round focuses on remaining gaps found through deep code inspection.

---

## RESOLVED: Database Triggers Now Persist

Verified via `pg_trigger` query -- all 4 triggers exist:
- `trg_update_likes_count` on `post_likes`
- `trg_update_comments_count` on `post_comments`
- `trg_notify_on_comment` on `post_comments`
- `trg_notify_on_reply` on `post_comments`

No further action needed.

---

## Issue 1: Storage Files Never Cleaned Up on Post or Account Deletion

**Files**: `Community.tsx` line 401-417, `delete-user-data/index.ts`

**Problem**: When a community post with images is deleted, `deletePost()` only removes the DB row. The uploaded files in `community-media/posts/{userId}/` remain as orphaned blobs, accumulating storage costs. Same issue when the `delete-user-data` edge function deletes a user -- it removes DB rows but leaves all uploaded files (avatars, post images) in storage.

**Fix**:
1. In `deletePost()` -- before deleting the row, extract `media_urls` from the post, parse storage paths, and call `supabase.storage.from('community-media').remove([paths])`.
2. In `delete-user-data/index.ts` -- after deleting DB rows but before deleting the auth user, list all files under `community-media/posts/{userId}/` and `community-media/avatars/{userId}.*`, then remove them.

---

## Issue 2: SaintChat Missing `usePageTitle`

**File**: `src/pages/SaintChat.tsx`

**Problem**: SaintChat is the only major page without `usePageTitle`. When chatting with a saint, the browser tab still shows the default BhaktVerse title instead of something like "Chat with Kabir | BhaktVerse".

**Fix**: Add `usePageTitle` with a dynamic title based on the loaded saint name. Use a default "Saint Chat" before the saint loads, then update when `saint` state is set.

---

## Issue 3: `CommentThread` Uses `supabase as any` for `post_comments`

**File**: `src/components/CommentThread.tsx` lines 38, 87, 102

**Problem**: All three Supabase calls cast `supabase as any` before querying `post_comments`. However, looking at the generated types schema, `post_comments` IS in the database schema. The `as any` cast is unnecessary and masks potential type errors.

**Fix**: Remove the `(supabase as any)` casts and use `supabase` directly. The types should already support `post_comments` since it's in the schema.

---

## Issue 4: Community Post Deletion Has No Confirmation Dialog

**File**: `src/pages/Community.tsx` line 724-733

**Problem**: The "Delete" button on a post calls `deletePost()` immediately with no confirmation. A single accidental click permanently removes a post and all its comments/likes. This is a destructive action that should require confirmation.

**Fix**: Wrap the delete button in an `AlertDialog` (already imported in other pages). Show "Are you sure you want to delete this post? This action cannot be undone." with Cancel/Delete buttons.

**UI**: Replace the text "Delete" button with a `Trash2` icon button that opens an `AlertDialog`.

---

## Issue 5: Community Sidebar Stats Show Only Currently-Loaded Page Data

**File**: `src/pages/Community.tsx` lines 793-804

**Problem**: "Blessings Shared" and "Comments" stats are computed from `posts.reduce(...)` which only counts the currently-loaded page of posts (max 20). This gives misleadingly low numbers. A community with 500 posts might show "12 Blessings" because only 20 posts are loaded.

**Fix**: Query aggregate totals from the database. Add two lightweight queries in `useEffect`:
```ts
const { data: likesTotal } = await supabase.rpc('sum_column', { table: 'community_posts', column: 'likes_count' });
```
Or simpler -- just query `community_posts` with `.select('likes_count, comments_count')` and sum client-side (limited to 1000 rows, but better than 20).

**UI**: No change -- same stat cards, just accurate numbers.

---

## Issue 6: No Error Boundary Around Realtime Subscription

**File**: `src/pages/Community.tsx` lines 86-143

**Problem**: The realtime subscription in the `useEffect` hook has no error handling. If the WebSocket connection drops (common on mobile), the subscription silently stops working. New posts from other users won't appear, and the user gets a stale view with no indication.

**Fix**: Add `.on('system', {}, (status) => {...})` handler to the channel to detect disconnections. Show a subtle banner "Live updates paused. Pull to refresh." when disconnected. Also add error handling in the subscription callback.

---

## Issue 7: Profile Page Missing Email Display for Users Without Name

**File**: `src/pages/Profile.tsx` line 343-344

**Problem**: Minor but the profile header shows `user?.email` below the name. If the user hasn't set a name yet, the header shows "Spiritual Seeker" (the default) with their email below. But there's no visual indication that "Spiritual Seeker" is a placeholder they should change.

**Fix**: If `profileData.name` equals the default "Spiritual Seeker" or is empty, show an inline prompt: "Tap to set your spiritual name" with a subtle edit icon, styled as `text-muted-foreground italic`.

---

## Issue 8: `post_likes as any` Casts in Community.tsx

**File**: `src/pages/Community.tsx` lines 218, 346, 353

**Problem**: Three places cast `'post_likes' as any` because the generated types file doesn't include `post_likes`. This is a persistent issue since the types file is auto-generated and can't be manually edited. The table exists in the DB and works at runtime.

**Fix**: Create a typed helper function that wraps the untyped calls:
```ts
const postLikesTable = () => supabase.from('post_likes' as any) as any;
```
This centralizes the cast to one place. Not ideal but pragmatic until types are regenerated.

---

## Implementation Plan

### Phase 1: Data Integrity & Safety
| # | Change | Files |
|---|--------|-------|
| 1 | Add storage cleanup on post deletion (parse URLs, remove files) | `Community.tsx` |
| 2 | Add storage cleanup on account deletion (list & remove user files) | `delete-user-data/index.ts` |
| 3 | Add confirmation dialog before post deletion | `Community.tsx` |

### Phase 2: Code Quality & SEO
| # | Change | Files |
|---|--------|-------|
| 4 | Add dynamic `usePageTitle` to SaintChat | `SaintChat.tsx` |
| 5 | Remove unnecessary `as any` casts from CommentThread | `CommentThread.tsx` |
| 6 | Centralize `post_likes as any` into helper function | `Community.tsx` |

### Phase 3: UX Polish
| # | Change | Files |
|---|--------|-------|
| 7 | Fix sidebar stats to query total counts from DB | `Community.tsx` |
| 8 | Add "set your name" prompt for default profile names | `Profile.tsx` |

