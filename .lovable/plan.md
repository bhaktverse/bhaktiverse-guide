

# Database, Audio, Shorts & Quality Fix Plan

## Overview

This plan addresses: storage RLS for admin uploads, audio player playing real DB tracks, Bhakti Shorts missing from Dashboard, removing hardcoded demo data, and ensuring all data comes from the database.

---

## 1. Storage RLS - Admin Upload for Community Media

**Problem**: The `community-media` bucket is missing an admin INSERT policy. All other buckets (audio-library, saints-images, temple-images, scriptures-pdfs, scriptures-audio) already have admin upload policies.

**Fix**: Add migration with INSERT policy for `community-media` bucket allowing admin uploads.

```sql
CREATE POLICY "Admins can upload to community media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community-media' AND has_role(auth.uid(), 'admin'::app_role));
```

---

## 2. Audio Player - Play Real Database Tracks

**Problem**: The `audio_library` table has 10+ tracks with Archive.org URLs. The audio player already loads from the database and normalizes URLs. However, the fallback demo tracks (SoundHelix) in the catch block muddy things. The real issue is that Archive.org URLs may fail CORS or be broken.

**Fix in `AudioLibrary.tsx`**:
- Remove the hardcoded SoundHelix fallback demo tracks entirely from the catch block
- Show a proper empty state instead ("No audio tracks available. Admin can upload audio files.")
- The player already has error handling and auto-skip -- this is sufficient

---

## 3. Bhakti Shorts on Dashboard

**Problem**: The `bhakti_shorts` table has 10 YouTube Shorts with valid URLs and thumbnails, all approved and featured. But NO page or component in `src/` references this table -- zero usage.

**Fix**: Add a "Bhakti Shorts" section to the Dashboard page after the Quick Actions grid:
- Query `bhakti_shorts` table where `approved = true AND featured = true`, limit 6
- Display as a horizontal scrollable row of video thumbnail cards
- Each card shows thumbnail, title, and a play button
- Clicking opens the YouTube Shorts URL in a new tab (since these are YouTube shorts, embedding requires iframe)
- Use YouTube embed format: `https://www.youtube.com/embed/{videoId}` extracted from the shorts URL

---

## 4. Remove All Hardcoded/Fake Data

**Files to clean**:

| File | Hardcoded Data | Fix |
|------|---------------|-----|
| `AudioLibrary.tsx` | SoundHelix demo tracks in catch block | Remove, show empty state |
| `Dashboard.tsx` | Hardcoded quotes array (lines 190-198) | Load from `spiritual_content` or keep as static motivational quotes (acceptable since these are universal quotes, not fake data) |

---

## 5. Ensure All Admin CRUD Works via External Admin Panel

**Current state**: All table RLS policies already allow admin ALL operations via `has_role(auth.uid(), 'admin')`. The external admin panel at bhaktiverse-admin.lovable.app can:
- Upload audio files to `audio-library` bucket (policy exists)
- Update saint images in `saints-images` bucket (policy exists)
- Update temple images in `temple-images` bucket (policy exists)
- Manage scriptures, content, FAQs, calendar events (all have admin ALL policies)

**Only missing**: community-media upload policy (addressed in item 1 above).

---

## Technical Implementation Summary

| Priority | File | Changes |
|----------|------|---------|
| 1 | Migration SQL | Add community-media storage INSERT policy for admin |
| 2 | `src/pages/AudioLibrary.tsx` | Remove SoundHelix fallback demo tracks, show proper empty state |
| 3 | `src/pages/Dashboard.tsx` | Add Bhakti Shorts section fetching from `bhakti_shorts` table with YouTube embed thumbnails |

### No Other Database Changes Required
- All table-level RLS policies already support admin operations
- Storage policies for 5/6 buckets already exist (adding the 6th)
- User `44ac479f` already has admin role and gets premium via `usePremium` hook

