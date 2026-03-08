

# BhaktVerse Platform Audit — Round 3 (Senior Expert Review)

After exhaustive code-level inspection of all pages, hooks, edge functions, database schema, RLS policies, and UI components, here are the remaining gaps and improvement opportunities. All Round 1 and Round 2 items have been addressed.

---

## Critical Issues

### 1. Community: Like System Has No Per-User Tracking (Vote Manipulation)
**File**: `src/pages/Community.tsx` lines 238-264
**Problem**: `likePost()` simply increments `likes_count` by 1 on every click. There is no `post_likes` table tracking which user liked which post. A user can spam-like any post infinitely. This is a fundamental data integrity issue for any social platform.
**Fix**: Create a `post_likes` table (`user_id`, `post_id`, unique constraint). Replace the direct increment with an insert/delete toggle. Use a DB trigger to maintain `likes_count` as a denormalized counter.
**Database**:
```sql
CREATE TABLE post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
-- Policies: users insert/delete own likes, select all
```
**UI**: Heart icon should toggle filled/outline state. Show "You liked this" state.

### 2. Community: `comments_count` Never Updates
**Problem**: When a comment is added via `CommentThread`, the `comments_count` on the parent `community_posts` row never increments. The count shown in the post footer is always stale (stays at 0).
**Fix**: Add a DB trigger on `post_comments` that increments/decrements `comments_count` on the parent `community_posts` row on INSERT/DELETE.
```sql
CREATE OR REPLACE FUNCTION update_comments_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_comments_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();
```

### 3. Profile: No Delete Account / Data Erasure Option
**File**: `src/pages/Profile.tsx`
**Problem**: No way for users to delete their data. Required for privacy compliance (GDPR, India's DPDPA). The Profile page ends with a "My Favorites" card but has no danger zone.
**Fix**: Add a "Danger Zone" section at the bottom of Profile with a red-bordered card containing a "Delete My Data" button. On click, show an AlertDialog confirming the action. On confirm, call a new edge function `delete-user-data` that uses the service role to cascade-delete from all user-related tables (`profiles`, `spiritual_journey`, `user_activities`, `user_favorites`, `palm_reading_history`, `numerology_reports`, `ai_chat_sessions`, `user_api_usage`, `kundali_match_history`, `astro_profiles`, `community_posts`, `post_comments`, `playlists`, `notifications`, `user_achievements`, `mantra_sessions`, `divine_conversations`, `user_progress`), then calls `supabase.auth.admin.deleteUser()`.

### 4. Notification Triggers Still Missing from Database
**Problem**: The `<db-triggers>` section shows "There are no triggers in the database." Despite creating migration SQL for `on_new_comment` and `on_new_reply` triggers, and then dropping them, the original `trg_notify_*` triggers also don't exist. Comment/reply notifications are completely broken.
**Fix**: Create fresh triggers with proper names that actually exist in the database:
```sql
CREATE TRIGGER trg_notify_on_comment
AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

CREATE TRIGGER trg_notify_on_reply
AFTER INSERT ON post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_reply();
```

---

## UX/UI Improvements

### 5. Auth: Google OAuth Button Missing from Sign Up Tab
**File**: `src/pages/Auth.tsx`
**Problem**: The Google OAuth button only appears in the "Sign In" tab (line 277-292). The "Sign Up" tab has no social login option. Users who land on the Sign Up tab see no Google option and may abandon.
**Fix**: Add the same Google OAuth button below the Sign Up form, after the submit button.

### 6. Community: Share Button Is Non-Functional
**File**: `src/pages/Community.tsx` lines 526-533
**Problem**: The Share button renders but has no `onClick` handler. It shows the share count but clicking does nothing.
**Fix**: Add Web Share API integration (with clipboard fallback) similar to Horoscope page. On share, increment `shares_count`.

### 7. Dashboard: No "Continue Where You Left Off" Section
**Problem**: Users who were reading a scripture, chatting with a saint, or had an in-progress numerology session have no quick-resume CTA on the dashboard. The dashboard shows generic services but nothing personalized for returning users.
**Fix**: Add a "Continue Your Journey" card at the top of the main content area (below Daily Sadhana). Query the latest `ai_chat_sessions`, `user_progress` (scriptures), and `numerology_reports` to show up to 3 recent items with direct resume links.
**UI**: Horizontal scroll of compact cards with icon, title, and "Continue" button. Example: "📖 Bhagavad Gita Ch.3 — 45% done" or "🧘 Chat with Kabir — 2h ago".

### 8. SaintChat: No "Clear Conversation" Button
**File**: `src/pages/SaintChat.tsx`
**Problem**: Once a session is persisted, there's no way to start a fresh conversation. Old conversations accumulate forever. Users may want to reset context for a new topic.
**Fix**: Add a "New Chat" button in the header (next to the Teachings button). On click, clear messages, reset to welcome message, and delete the existing `ai_chat_sessions` row for this saint. Since DELETE is not allowed by RLS, either add a DELETE policy or use an edge function.

### 9. Horoscope/Numerology/KundaliMatch: No Breadcrumb Back-Navigation on Mobile
**Problem**: On mobile, these pages show breadcrumbs but the primary back navigation is the browser back button. The sticky header in SaintChat has a back arrow, but other AI pages don't. Users get "trapped" in long result pages.
**Fix**: Add a sticky "Back to Dashboard" mini-header on mobile for these three pages, or ensure the MobileBottomNav has a clear "Home" action that's always visible.

---

## Design & Polish

### 10. Dashboard: Quick Actions Grid Has Duplicate Entry
**File**: `src/pages/Dashboard.tsx` line 343
**Problem**: "Tarot" links to `/palm-reading` which is the same as the featured "AI Palm Reading" card above. Users see two entries going to the same page. Tarot should have its own route or be clearly labeled as a sub-feature.
**Fix**: Either change the Tarot quick action to navigate to `/palm-reading?tab=tarot` and handle tab switching, or remove the duplicate and add a different quick action (e.g., "FAQ", "Profile", or "Favorites").

### 11. Profile: XP Progress Calculation May Overflow
**File**: `src/pages/Profile.tsx` line 335
**Problem**: `xpProgress = (xp % 200) / 200 * 100` — this means at exactly 200 XP, progress shows 0% (just leveled up). But the level formula `xpToNextLevel = level * 200` implies level 2 needs 400 total, yet `xp % 200` doesn't account for cumulative scaling. The progress bar may show misleading values at higher levels.
**Fix**: Use `const xpInCurrentLevel = xp - ((level - 1) * 200)` and `const xpNeeded = level * 200 - (level - 1) * 200` (which is always 200). Or better: `xpProgress = ((xp % 200) / 200) * 100` is actually correct for flat 200-per-level. Verify and add a tooltip showing "150/200 XP to Level 4".

### 12. Community: "Total Devotees" Count Is Misleading
**File**: `src/pages/Community.tsx` line 178
**Problem**: `setTotalDevotees(uniqueUserIds.length)` counts unique post authors in the current page only (max 20 posts). This shows "3 Active Devotees" when there might be thousands of registered users. It's misleading.
**Fix**: Run a separate count query: `supabase.from('profiles').select('id', { count: 'exact', head: true })` to get total registered users. Show that as "Total Members" and keep unique post authors as "Active This Week".

### 13. Community Posts: No Media Display
**Problem**: Posts have `media_urls` JSONB column but the UI never renders attached images. Even if image upload is added, existing posts with media won't display.
**Fix**: After `post.content` rendering, add a media gallery section that maps over `post.media_urls` (if non-empty) and renders `<img>` tags in a responsive grid.

---

## Implementation Plan

### Phase 1: Data Integrity Fixes (Critical)
| # | Change | Files |
|---|--------|-------|
| 1 | Create `post_likes` table with unique constraint, toggle like logic | Migration SQL, `Community.tsx` |
| 2 | Add `comments_count` update trigger on `post_comments` | Migration SQL |
| 3 | Create notification triggers (`trg_notify_on_comment`, `trg_notify_on_reply`) | Migration SQL |
| 4 | Add "Delete My Data" to Profile page with edge function | `Profile.tsx`, new edge function |

### Phase 2: UX Completion
| # | Change | Files |
|---|--------|-------|
| 5 | Add Google OAuth to Sign Up tab | `Auth.tsx` |
| 6 | Wire Community Share button with Web Share API | `Community.tsx` |
| 7 | Add "Continue Your Journey" section to Dashboard | `Dashboard.tsx` |
| 8 | Add "New Chat" button in SaintChat + DELETE policy | `SaintChat.tsx`, Migration SQL |

### Phase 3: Polish & Fixes
| # | Change | Files |
|---|--------|-------|
| 9 | Fix Tarot duplicate in Dashboard quick actions | `Dashboard.tsx` |
| 10 | Fix Community "Total Devotees" count to use real user count | `Community.tsx` |
| 11 | Render `media_urls` images in Community post cards | `Community.tsx` |
| 12 | Add XP tooltip on Profile progress bar | `Profile.tsx` |

