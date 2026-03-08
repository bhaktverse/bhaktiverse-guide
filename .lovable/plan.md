

# BhaktVerse Platform Audit -- Round 8 (Senior Expert Review)

Rounds 1-7 verified. Database triggers confirmed working (all 4 active). Storage cleanup, confirmation dialogs, sidebar stats, and toast migration all implemented. This round identifies remaining gaps.

---

## CONFIRMED RESOLVED
- Database triggers: All 4 active and verified
- Storage cleanup on post/account deletion: Implemented
- Post deletion confirmation dialog: Implemented
- Community sidebar stats from DB: Implemented
- Profile queries parallelized: Implemented
- `usePageTitle` on SaintChat: Implemented
- `spiritual_journey` row created on signup: Implemented

---

## Issue 1: Three Components Still Use Legacy `useToast` (Shadcn)

**Files**: `EnhancedAudioPlayer.tsx`, `TarotPull.tsx`, `PalmScannerBiometric.tsx`

**Problem**: Round 6 migrated 8 pages to sonner, but these 3 components were missed. They still import `useToast` from `@/hooks/use-toast`. The `<Toaster />` (shadcn) was removed from `App.tsx`, so these toasts silently fail -- users see nothing when errors occur in the palm scanner or audio player.

**Fix**: Migrate all three to `import { toast } from 'sonner'`:
- `EnhancedAudioPlayer.tsx`: Replace `toast({ title, description })` calls with `toast.success()` / `toast.error()`
- `TarotPull.tsx`: Same pattern
- `PalmScannerBiometric.tsx`: Same pattern -- this is critical since it shows language validation errors

After migration, delete `src/hooks/use-toast.ts` and `src/components/ui/toaster.tsx` as they become dead code.

---

## Issue 2: Rate Limit (429) Not Handled on Frontend

**Problem**: Edge functions (`saint-chat`, `daily-horoscope`, `kundali-match`, `numerology-analysis`) correctly return 429 with `{ rate_limited: true }` when daily limits are exceeded. But the frontend catches all errors generically -- `SaintChat.tsx` line 176-180 shows a generic "Could not get a response" toast. Users have no idea they hit a limit or how to resolve it.

**Fix**: In `SaintChat.tsx`, `Horoscope.tsx`, `KundaliMatch.tsx`, and `Numerology.tsx`, check for rate limit responses and show a specific message:
```tsx
if (error?.message?.includes('429') || data?.rate_limited) {
  toast.error("Daily limit reached! Upgrade to Premium for unlimited access.", {
    action: { label: 'Upgrade', onClick: () => navigate('/premium') }
  });
  return;
}
```

**UI**: The toast should include a CTA button linking to `/premium`.

---

## Issue 3: `loadCommunityStats` Hits 1000-Row Supabase Limit

**File**: `Community.tsx` lines 172-181

**Problem**: `loadCommunityStats` queries `community_posts` with `.select('likes_count, comments_count')` -- this returns max 1000 rows (Supabase default). For a community with 2000+ posts, totals will be underreported. The query also fetches full rows just to sum two integers.

**Fix**: Create a database function `get_community_stats()` that runs server-side:
```sql
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT jsonb_build_object(
    'total_likes', COALESCE(SUM(likes_count), 0),
    'total_comments', COALESCE(SUM(comments_count), 0)
  ) FROM community_posts WHERE visibility = 'public';
$$;
```
Then call `supabase.rpc('get_community_stats')` on the frontend.

---

## Issue 4: Post Content Not Sanitized for XSS

**File**: `Community.tsx` line 693-695

**Problem**: Post content is rendered with `{post.content}` inside a `<p>` tag with `whitespace-pre-wrap`. While React auto-escapes JSX text, the content is not sanitized before database insertion (line 299-312 -- raw `newPost` is inserted). If a future change renders content with `dangerouslySetInnerHTML` (e.g., for markdown support), this becomes an XSS vector.

**Fix (Preventive)**: Add basic input sanitization in `createPost()` before inserting -- strip HTML tags:
```ts
const sanitizedContent = newPost.replace(/<[^>]*>/g, '').trim();
```

Also add a `maxLength` attribute to the post `<Textarea>` (e.g., 2000 characters) to prevent abuse.

**UI**: Add a character counter below the textarea: `{newPost.length}/2000`.

---

## Issue 5: No Content Length Limit on Post Creation

**File**: `Community.tsx` line 548-552

**Problem**: The `<Textarea>` for creating posts has no `maxLength` attribute. Users can paste arbitrarily large text. While the DB column is `text` (unlimited), extremely long posts degrade the feed UX and increase payload sizes.

**Fix**: Add `maxLength={2000}` to the Textarea. Show a live character counter: `<span className="text-xs text-muted-foreground">{newPost.length}/2000</span>`.

---

## Issue 6: `EnhancedAudioPlayer` Does Not Track Play History

**File**: `EnhancedAudioPlayer.tsx`

**Problem**: The `user_activities` table supports `activity_type: 'mantra_chant'` and similar, but audio plays are never logged. The Dashboard shows "reading minutes" and "mantras chanted" but has no audio listening stats. This is a gamification gap -- listening to bhajans/mantras should earn XP.

**Fix (Phase 2)**: After a track plays for 30+ seconds, insert a `user_activities` row:
```ts
{ activity_type: 'audio_listen', activity_data: { track_id, title, category, duration_seconds }, points_earned: 5 }
```
Update the Dashboard to show "Minutes Listened" alongside existing stats.

---

## Issue 7: No "Edit Post" Capability

**Problem**: Users can delete posts but cannot edit them. If someone makes a typo or wants to add a tag, the only option is delete and re-post, losing all likes and comments.

**Fix**: Add an "Edit" button next to "Delete" for the post owner. Open the same `Dialog` used for creation but pre-filled with existing content and tags. On save, call `supabase.from('community_posts').update({ content, tags }).eq('id', postId).eq('user_id', user.id)`. The realtime subscription already handles UPDATE events (line 133-143).

**UI**: Add a pencil icon button between Share and Delete, visible only to post owner.

---

## Issue 8: `ErrorBoundary` Does Not Report Errors

**File**: `ErrorBoundary.tsx` line 20-22

**Problem**: `componentDidCatch` only logs to console. In production, errors vanish silently. No analytics, no error reporting service integration.

**Fix (Phase 2)**: Add error reporting to the edge function or a third-party service. For now, at minimum log the error to a `error_logs` table via a non-blocking fetch to an edge function. This gives the team visibility into production crashes.

---

## Implementation Plan

### Phase 1: Critical (Silent Failures)
| # | Change | Files |
|---|--------|-------|
| 1 | Migrate 3 remaining components from `useToast` to `sonner`, delete dead code | `EnhancedAudioPlayer.tsx`, `TarotPull.tsx`, `PalmScannerBiometric.tsx`, delete `use-toast.ts` + `toaster.tsx` |
| 2 | Handle 429 rate limit on frontend with Premium upgrade CTA | `SaintChat.tsx`, `Horoscope.tsx`, `KundaliMatch.tsx`, `Numerology.tsx` |

### Phase 2: Data Accuracy & UX
| # | Change | Files |
|---|--------|-------|
| 3 | Create `get_community_stats()` DB function, use RPC | Migration SQL + `Community.tsx` |
| 4 | Add post content length limit (2000 chars) with character counter | `Community.tsx` |
| 5 | Add "Edit Post" functionality for post owners | `Community.tsx` |

### Phase 3: Hardening
| # | Change | Files |
|---|--------|-------|
| 6 | Add input sanitization to post creation | `Community.tsx` |

