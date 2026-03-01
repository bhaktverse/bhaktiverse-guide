

# BhaktVerse Comprehensive Quality & UX Upgrade Plan

## Audit Findings

After reviewing all 15+ pages, edge functions, RLS policies, and the database schema, here are the remaining issues and upgrades needed.

---

## 1. SEO & Meta Tags (Critical - index.html)

**Problem**: `index.html` has generic Lovable meta tags:
- Title: "bhaktiverse-guide" 
- Description: "Lovable Generated Project"
- OG image: Lovable default image

**Fix**: Update to BhaktVerse-branded SEO meta tags with proper title, description, keywords, canonical URL, and structured data hints. Add `lang="hi"` for Hindi primary audience.

---

## 2. Community - Show Real User Names (Missing from prior plan)

**Problem**: Posts display "Devotee" for other users (line 368 in Community.tsx). The plan said to query profiles table but implementation still shows generic labels.

**Fix**: After loading posts, collect unique `user_id` values, batch query `profiles` table for names, and display real names. For privacy, show first name + initial.

---

## 3. Temples Page - Remove Hardcoded Fallback & Fix HTML Selects

**Problem**: 
- Lines 146-184: Hardcoded Kedarnath temple fallback in catch block
- Lines 282-301: Raw HTML `<select>` elements instead of Radix Select components

**Fix**: Remove fallback temple, show empty state on error. Replace HTML selects with Radix `Select` component.

---

## 4. Profile - Avatar Upload

**Problem**: Avatar always shows `/placeholder.svg`. No way to upload.

**Fix**: Add camera icon overlay on avatar. On click, open file picker. Upload to `community-media` bucket under `avatars/{user_id}`. Update `profiles.avatar_url`. Display real avatar across Dashboard and Profile.

---

## 5. SaintChat - Improve Error Fallback

**Problem**: Line 128 shows hardcoded "Chant Hare Krishna and be happy" when AI fails. This is generic and not saint-specific.

**Fix**: On error, only show the toast with retry button (already exists). Remove the fallback message injection entirely - let the user retry instead of showing fake responses.

---

## 6. Community Sidebar Stats - Dynamic

**Problem**: Lines 470+ in Community.tsx - sidebar stats may be hardcoded or missing real counts.

**Fix**: Query actual counts: total posts from `community_posts`, total users from distinct `user_id` in posts.

---

## 7. Dashboard Avatar - Use Real Avatar

**Problem**: Line 309 in Dashboard.tsx still shows `src="/placeholder.svg"` for avatar.

**Fix**: Load `avatar_url` from profile and use it. Same in Navigation if user avatar is shown.

---

## 8. HTML Smooth Scroll

**Fix**: Add `scroll-smooth` class to the `<html>` element in `index.html`.

---

## 9. Responsive Audit Fixes

**Issues found**:
- Numerology: Language toggle could overlap on very small screens (320px)
- Dashboard: Quick actions grid `grid-cols-3` on mobile could be tight at 320px
- Scripture Reader: Reading controls toolbar wraps awkwardly on mobile
- Temples: Filter row overflows on mobile

**Fix**: Add responsive breakpoints: `grid-cols-2 sm:grid-cols-3` for quick actions, `flex-wrap` for filter rows, ensure language toggles don't overlap.

---

## 10. Missing from Prior Plans - Quick Wins

| Item | Fix |
|------|-----|
| Audio player empty state | Already done ✅ |
| Horoscope fake fallback removed | Already done ✅ |
| Calendar hardcoded events removed | Already done ✅ |
| Navigation dropdowns | Already done ✅ |
| MobileBottomNav icons | Already done ✅ |
| Premium toast on upgrade | Already done ✅ |
| Copyright 2026 | Already done ✅ |
| Dynamic hero stats | Already done ✅ |

---

## Implementation Summary

| # | File | Changes |
|---|------|---------|
| 1 | `index.html` | SEO meta tags, lang, smooth scroll, favicon description |
| 2 | `src/pages/Community.tsx` | Batch query profiles for user names, dynamic sidebar stats |
| 3 | `src/pages/Temples.tsx` | Remove hardcoded fallback, Radix Select for filters |
| 4 | `src/pages/Profile.tsx` | Avatar upload to community-media bucket |
| 5 | `src/pages/Dashboard.tsx` | Use real avatar_url from profile |
| 6 | `src/pages/SaintChat.tsx` | Remove hardcoded fallback message on error |
| 7 | `src/pages/Numerology.tsx` | Responsive fixes for 320px screens |
| 8 | `src/pages/ScriptureReader.tsx` | Responsive toolbar wrap fix |

### No Database Changes Required
All RLS policies are correctly configured. Only 2 infra-level Supabase warnings (leaked password protection, Postgres version) which require Supabase dashboard action, not code changes.

