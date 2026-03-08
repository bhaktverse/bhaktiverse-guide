

# BhaktVerse Platform Audit -- Round 6 (Senior Expert Review)

Rounds 1-5 verified. This audit identifies remaining gaps through deep code inspection.

---

## CRITICAL: Database Triggers Still Missing (7th Attempt Needed)

The `<db-triggers>` section shows **"There are no triggers in the database"** -- again. Six migration attempts have all failed silently. The functions exist but no triggers are attached, meaning:
- Likes count never auto-updates (only optimistic UI, stale on reload)
- Comments count never auto-updates
- No notifications fire for comments/replies

**Root cause hypothesis**: Previous migrations may have syntax that the migration runner silently skips. This attempt will use the absolute simplest possible SQL -- one statement per migration file if needed, or a single clean block with no `DO $$` wrappers.

**Fix**: Create a new migration with the flattest possible SQL. Additionally, verify immediately after with `supabase--read_query`.

---

## Issue 1: No `spiritual_journey` Row Created on Sign-Up

**File**: `src/hooks/useAuth.tsx` lines 59-87
**Problem**: `ensureUserProfile` creates a `profiles` row but does NOT create a `spiritual_journey` row. This means:
- Dashboard shows `level: 1, xp: 0` from default state, but the DB has no row
- Profile page shows journey data as empty
- Premium check (`usePremium.tsx` line 66) queries `spiritual_journey` and finds nothing -- user is always "free" tier even if they should qualify
- Any XP-earning action that tries to UPDATE `spiritual_journey` will fail silently (no row to update)

**Fix**: In `ensureUserProfile`, after inserting the profile, also insert a `spiritual_journey` row:
```ts
await supabase.from('spiritual_journey').insert({
  user_id: user.id,
  level: 1,
  experience_points: 0,
  mantras_chanted: 0,
  reports_generated: 0,
  karma_score: 0
});
```

**UI impact**: None visible, but fixes the entire gamification/premium pipeline.

---

## Issue 2: Dual Toast Systems Still Active

**Files**: 8 pages use `useToast` (shadcn), while `Horoscope.tsx`, `Numerology.tsx`, `CommentThread.tsx` use `sonner`. Both `<Toaster />` and `<Sonner />` render in `App.tsx`.

**Problem**: Users see toasts in different positions/styles depending on which page they're on. Inconsistent UX.

**Fix**: Migrate all 8 pages (`Community`, `Profile`, `SaintChat`, `Auth`, `Premium`, `PalmReading`, `AudioLibrary`, `SharedPalmReading`) from `useToast` to `import { toast } from "sonner"`. Then remove shadcn `<Toaster />` from `App.tsx` and delete `src/hooks/use-toast.ts` + `src/components/ui/toaster.tsx`.

**UI change**: All toasts will appear consistently at bottom-right with sonner's cleaner style.

---

## Issue 3: `post_likes` Type Casts Still Using `as any`

**File**: `src/pages/Community.tsx` lines 218, 357, 364
**Problem**: `supabase.from('post_likes' as any)` bypasses TypeScript. The generated types file doesn't include `post_likes`. Since we can't edit the types file directly, we need to add a manual type extension.

**Fix**: Create `src/integrations/supabase/types-extension.ts` with a type merge that adds `post_likes` to the Database interface, then update the client import. This removes all `as any` casts.

---

## Issue 4: Community Realtime Subscription Doesn't Update Counts from Triggers

**File**: `src/pages/Community.tsx` lines 126-137
**Problem**: The realtime subscription listens for `UPDATE` on `community_posts` which SHOULD catch trigger-updated `likes_count`/`comments_count`. But since triggers don't exist yet (Issue 0), this has never worked. Once triggers are fixed, the subscription handler at line 131 correctly merges the updated row. However, the `CommentThread` component doesn't signal the parent when a comment is added.

**Fix**: After confirming triggers work, add a callback prop `onCommentCountChange` to `CommentThread` so the parent can optimistically update the local count while waiting for the realtime event.

---

## Issue 5: No Email Verification Enforcement

**Problem**: Users can sign up with any email and immediately access all features without verifying their email. Supabase supports email confirmation but it's not enforced in the UI. The `Auth.tsx` page shows a success message after signup but doesn't mention verification.

**Fix (UI only)**: After successful signup, show an alert: "Please check your email to verify your account before signing in." Check Supabase Auth settings to ensure email confirmation is enabled.

**UI**: Replace the generic success toast with a prominent `Alert` component with `AlertTriangle` icon: "Verification email sent to {email}. Please check your inbox."

---

## Issue 6: No Rate Limiting UI Feedback for AI Features

**Problem**: The `check_and_increment_api_usage` DB function exists and returns `{allowed: false}` when limits are hit, but none of the edge functions actually call it. The `user_api_usage` table is populated on the Dashboard for display only.

**Fix (Phase 1)**: Add API usage tracking in the `saint-chat` and `palm-reading-analysis` edge functions. When `allowed: false`, return a 429 status. On the frontend, catch 429s and show a friendly "You've reached your daily limit. Upgrade to Premium for unlimited access." dialog with a CTA to `/premium`.

---

## Issue 7: Storage Cleanup Not Handled on Post/Account Deletion

**Problem**: When a community post with images is deleted, or when an account is deleted via the edge function, the uploaded files in `community-media` bucket remain orphaned. Over time this accumulates storage costs.

**Fix**: In `deletePost()` in `Community.tsx`, before deleting the post row, iterate `post.media_urls` and call `supabase.storage.from('community-media').remove([path])` for each. In the `delete-user-data` edge function, add a step to list and remove all files under `community-media/posts/{userId}/`.

---

## Issue 8: Missing Accessibility on Interactive Elements

**Problem**: Several interactive elements lack proper ARIA labels:
- Like button has no `aria-label` (screen readers see nothing)
- Post delete button has no confirmation context
- Audio player controls lack labels
- Mobile bottom nav items lack `aria-label`

**Fix**: Add `aria-label` attributes to all interactive icons/buttons across Community, AudioLibrary, and MobileBottomNav components.

---

## Implementation Plan

### Phase 1: Critical Database & Data Integrity
| # | Change | Files |
|---|--------|-------|
| 1 | Create triggers (7th attempt, verify immediately) | Migration SQL |
| 2 | Add `spiritual_journey` row creation in `ensureUserProfile` | `useAuth.tsx` |

### Phase 2: UX Consistency
| # | Change | Files |
|---|--------|-------|
| 3 | Migrate all pages from `useToast` to `sonner`, remove dual toaster | 8 page files + `App.tsx` |
| 4 | Add `post_likes` type extension to remove `as any` casts | New types-extension file + `Community.tsx` |

### Phase 3: Production Hardening
| # | Change | Files |
|---|--------|-------|
| 5 | Add storage cleanup on post deletion and account deletion | `Community.tsx`, `delete-user-data/index.ts` |
| 6 | Add accessibility labels to interactive elements | `Community.tsx`, `MobileBottomNav.tsx`, `AudioLibrary.tsx` |

