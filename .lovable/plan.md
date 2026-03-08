

# BhaktVerse Platform Audit & Fix Plan

## Critical Bugs Found

### 1. Invalid AI Model: `google/gemini-3-flash-preview`
**Files affected**: `supabase/functions/numerology-analysis/index.ts`, `supabase/functions/saint-chat/index.ts`
**Problem**: Model `google/gemini-3-flash-preview` does not exist on the Lovable AI Gateway. This causes 400/404 errors, making Numerology and Saint Chat completely non-functional.
**Fix**: Change to `google/gemini-2.5-flash` (the model used successfully by other edge functions like `daily-horoscope`, `kundali-match`, `palm-daily-horoscope`).

### 2. Daily Horoscope: No Error Resilience on AI Parse Failure
**File**: `src/pages/Horoscope.tsx` (lines 98-126)
**Problem**: If the AI returns malformed JSON or the edge function returns a fallback prediction, the frontend sets `prediction` to null and shows a generic error. The fallback prediction in the edge function works, but the frontend doesn't gracefully handle partial data.
**Fix**: Add try-catch around prediction display with fallback UI for each field.

### 3. Kundali Match: Fallback Silently Swallows AI Error
**File**: `src/pages/KundaliMatch.tsx` (lines 127-133)
**Problem**: When the edge function fails, the catch block falls back to local `calculateGunMilan()` but shows a success toast ("कुंडली मिलान पूर्ण!") — misleading the user into thinking AI analysis succeeded. The `aiAnalysis` field stays empty, so the "AI गुरु की सलाह" section is silently hidden.
**Fix**: Show a different toast clarifying it's a basic calculation without AI analysis. Add a banner in results saying "AI analysis unavailable, showing basic Gun Milan calculation."

### 4. Numerology: No Loading/Error State for Failed Edge Function
**File**: `src/pages/Numerology.tsx` (line 210)
**Problem**: When `numerology-analysis` edge function fails (due to invalid model), a generic "Analysis error" toast appears and the results panel stays in the "waiting" state with no actionable next step.

---

## UI/UX Quality Issues (Not Premium-Grade)

### 5. Horoscope Page: Missing Weekly/Monthly Tabs Content
**File**: `src/pages/Horoscope.tsx` (line 284-288)
**Problem**: Tab bar shows "दैनिक / Daily", "विस्तृत / Detailed", "उपाय / Remedies" — but the page header says "Daily, Weekly, Monthly" via `activeTab` state (line 42). The weekly/monthly tabs don't exist. Users expect weekly and monthly predictions from a premium Rashifal app.
**Fix**: Either add proper weekly/monthly prediction tabs (calling the AI with different timeframes) or rename existing tabs to match actual content. For MVP, rename tabs to "Overview", "Detailed", "Remedies" and remove the unused `activeTab` state.

### 6. Horoscope: No Rashi Auto-Selection on Page Load
**Problem**: Even when auto-detect succeeds (line 50-79), it only sets `selectedRashi` but doesn't call `generatePrediction()` automatically. User still has to manually click their rashi card.
**Fix**: After successful auto-detect, automatically trigger `generatePrediction(detectedRashi)`.

### 7. Kundali Match: No Place of Birth Field (Vedic Requirement)
**Problem**: Traditional Kundali matching requires birth place for Lagna calculation. The form only has Name, DOB, and Time. Missing place undermines authenticity.
**Fix**: Add "जन्म स्थान / Place of Birth" text input for each partner, pass to edge function for context.

### 8. Kundali Match: No Result Persistence or PDF Download
**Problem**: Results disappear on page refresh. No way to save or share the Gun Milan report. A premium app should offer PDF export and history.
**Fix**: Add "Download Report" button and save results to a new `kundali_match_history` table.

### 9. Numerology: Results Layout on Mobile
**Problem**: The 5-column grid layout (`lg:grid-cols-5`) puts the input form and results side-by-side on desktop but stacks them on mobile. When stacked, the results section (3 columns worth of content) can be extremely long, requiring excessive scrolling past the input form.
**Fix**: On mobile, after form submission, scroll to results section automatically. Add a "scroll to results" button.

### 10. Community Page: No Real-Time Updates
**Problem**: Posts are fetched once on load. No polling or real-time subscription. New posts by other users don't appear until manual refresh.
**Fix**: Add Supabase real-time subscription for `community_posts` table.

### 11. Navigation: No Active Route Highlighting
**File**: `src/components/Navigation.tsx`
**Problem**: Current page isn't visually highlighted in the nav bar, making it unclear where the user is.

---

## Database Improvements Needed

### 12. Missing `kundali_match_history` Table
For premium feel, Kundali match results should be persisted.

```text
kundali_match_history
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── partner1_name (varchar)
├── partner1_dob (date)
├── partner1_rashi (varchar)
├── partner2_name (varchar)
├── partner2_dob (date)
├── partner2_rashi (varchar)
├── total_score (integer)
├── percentage (integer)
├── gun_milan_data (jsonb)
├── ai_analysis (text)
├── created_at (timestamptz)
```

### 13. Missing `horoscope_cache` Table
Daily horoscope predictions should be cached per rashi per day to avoid redundant AI calls.

```text
horoscope_cache
├── id (uuid, PK)
├── rashi_name (varchar)
├── prediction_date (date)
├── prediction_data (jsonb)
├── created_at (timestamptz)
├── UNIQUE(rashi_name, prediction_date)
```

---

## Implementation Plan (Prioritized)

### Phase 1: Fix Critical AI Failures (Immediate)
1. **Fix model name** in `numerology-analysis/index.ts` and `saint-chat/index.ts`: change `google/gemini-3-flash-preview` → `google/gemini-2.5-flash`
2. **Redeploy** both edge functions
3. **Test** both functions return valid responses

### Phase 2: Horoscope Page Premium Upgrade
1. **Auto-trigger prediction** after rashi auto-detection in `Horoscope.tsx`
2. **Add horoscope caching** — create `horoscope_cache` table, check cache in `daily-horoscope` edge function before calling AI
3. **Rename tabs** to match actual content (Overview / Detailed / Remedies)
4. **Add animated entry** for prediction cards (staggered fade-in)
5. **Add share button** for sharing daily prediction

### Phase 3: Kundali Match Premium Upgrade
1. **Add birth place** input field for both partners
2. **Fix error handling** — distinct toast for fallback vs AI-powered results
3. **Create `kundali_match_history` table** with RLS policies
4. **Save results** to history after successful match
5. **Add "View History"** section showing past matches
6. **Add PDF download** for match report

### Phase 4: Numerology Polish
1. **Auto-scroll to results** on mobile after form submission
2. **Add print/share** functionality for numerology report
3. **Improve empty state** with a more engaging illustration

### Phase 5: Platform-Wide Quality
1. **Navigation active state** — highlight current route in Navigation.tsx
2. **Kundali Match page**: add animated comparison visualization (two rashi symbols connecting with score arc)
3. **Horoscope page**: add a "compatible rashis today" section showing best matches for the day
4. **Add smooth page transitions** using CSS animations on route changes

### Files to Modify

| Priority | File | Changes |
|----------|------|---------|
| P0 | `supabase/functions/numerology-analysis/index.ts` | Fix model to `google/gemini-2.5-flash` |
| P0 | `supabase/functions/saint-chat/index.ts` | Fix model to `google/gemini-2.5-flash` |
| P1 | `src/pages/Horoscope.tsx` | Auto-trigger prediction, rename tabs, add share, animated entries |
| P1 | `supabase/functions/daily-horoscope/index.ts` | Add caching layer with `horoscope_cache` table |
| P1 | `src/pages/KundaliMatch.tsx` | Add birth place, fix error handling, add history/PDF, save results |
| P1 | Migration SQL | Create `horoscope_cache` + `kundali_match_history` tables with RLS |
| P2 | `src/pages/Numerology.tsx` | Auto-scroll on mobile, add share button |
| P2 | `src/components/Navigation.tsx` | Active route highlighting |
| P2 | `src/integrations/supabase/types.ts` | Will auto-update after migrations |

