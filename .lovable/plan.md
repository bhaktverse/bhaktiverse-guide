

# Palm Reading Improvements - Implementation Plan

## Issues Identified

### Issue 1: Palm Reading Deduplication (Name-based history reuse)
Currently every scan creates a new analysis and saves to DB, wasting AI credits. The `palm_reading_history` table lacks `user_name` and `user_dob` columns, making person-wise lookup impossible.

**Plan:**
1. **Database migration**: Add `user_name` (varchar), `user_dob` (date) columns to `palm_reading_history`
2. **Frontend logic in `PalmReading.tsx`**: Before calling the edge function, query `palm_reading_history` for matching `user_name + user_id` records. If a match exists and is less than 1 month old, load results directly from DB and skip AI analysis. Show a toast: "Previous reading found, loading from history"
3. **History display**: Show `user_name` in history items so users can identify person-wise readings and click to reopen them
4. **Save metadata**: Update `saveToHistory` to include `user_name` and `user_dob` in the insert

### Issue 2: PDF Report - Hindi Content Rendered in English/Transliteration
The uploaded PDF confirms the problem: user selected Hindi but the PDF shows Roman transliteration (e.g., "AapKe Hath Ki Yah tsveer") instead of actual Hindi Devanagari. This is by design — the `transliterate()` function strips all Devanagari and converts to IAST/Roman because jsPDF's default Helvetica font cannot render Devanagari.

**Fix approach** (without aggressive changes):
- The AI already returns Hindi content when language='hi'. The `getSafeText()` function calls `transliterate()` which strips all Hindi. 
- **Solution**: When language is 'hi', skip the transliteration step entirely and use the raw Hindi text. jsPDF can render Devanagari if we register a Devanagari-capable font. However, embedding a full font adds ~2-5MB to bundle.
- **Practical alternative**: Use a lightweight approach — add a Noto Sans Devanagari subset font (base64 embedded, ~300KB for a subset). Register it with jsPDF and use it when language='hi'. This preserves Hindi content authentically.
- **Kundali format improvements**: Add more decorative borders, section dividers with Om symbols, saffron/gold color scheme enhancements, and traditional table layouts for line analysis sections (matching traditional Kundali paper reports).
- Fix the "85/10" score display bug (should be "8.5/10")

### Issue 3: Listen/TTS Feature Not Working
The `palm-reading-tts` edge function uses `OPENAI_API_KEY` with direct `api.openai.com` — the same invalid API key causing 401 errors (confirmed in logs for `palm-daily-horoscope`).

**Fix**: Migrate `palm-reading-tts` to use Lovable AI Gateway. The gateway supports TTS or we use a text-based approach: generate a spoken-style text response via the gateway and use browser's Web Speech API (`speechSynthesis`) as fallback for actual audio playback. Since the Lovable AI Gateway is a chat completion endpoint (not TTS), we need to use the browser's built-in `SpeechSynthesis` API for voice narration instead.

### Issue 4: Edge Functions Returning Non-2xx Errors
Three edge functions still use `OPENAI_API_KEY` directly (invalid key):
- `palm-daily-horoscope` — uses `api.openai.com` with `OPENAI_API_KEY` (401 confirmed in logs)
- `daily-horoscope` — uses `api.openai.com` with `OPENAI_API_KEY`
- `kundali-match` — uses `api.openai.com` with `OPENAI_API_KEY`
- `spiritual-audio-tts` — uses `api.openai.com` with `OPENAI_API_KEY`

All need migration to Lovable AI Gateway (`ai.gateway.lovable.dev` with `LOVABLE_API_KEY`).

Also missing full CORS headers on `palm-daily-horoscope`, `daily-horoscope`, `kundali-match`, `spiritual-audio-tts`, `palm-reading-tts`.

---

## Implementation Phases

### Phase 1: Fix Broken Edge Functions (Critical)
Migrate 4 edge functions from OpenAI direct to Lovable AI Gateway:

| Function | Current | Fix |
|----------|---------|-----|
| `palm-daily-horoscope` | `api.openai.com` + `OPENAI_API_KEY` | `ai.gateway.lovable.dev` + `LOVABLE_API_KEY` + model `google/gemini-2.0-flash` |
| `daily-horoscope` | `api.openai.com` + `OPENAI_API_KEY` | Same gateway migration |
| `kundali-match` | `api.openai.com` + `OPENAI_API_KEY` | Same gateway migration |
| `palm-reading-tts` | `api.openai.com/v1/audio/speech` | Replace with browser SpeechSynthesis API (client-side) |
| `spiritual-audio-tts` | `api.openai.com/v1/audio/speech` | Replace with browser SpeechSynthesis API (client-side) |

Fix CORS headers on all 4 functions to include full header set.

### Phase 2: Listen Feature (TTS via Browser SpeechSynthesis)
Since the Lovable AI Gateway doesn't support TTS audio generation, replace the server-side TTS with browser-native `window.speechSynthesis`:
- Update `generateNarration()` and `toggleNarration()` in `PalmReading.tsx` to use `SpeechSynthesisUtterance` with Hindi voice selection
- Remove dependency on `palm-reading-tts` edge function
- Support pause/resume natively

### Phase 3: Palm Reading Deduplication
1. **Migration**: Add `user_name`, `user_dob` to `palm_reading_history`
2. **Dedup logic in `PalmReading.tsx`**: 
   - In `handleBiometricAnalyze`, before calling the edge function, check DB for existing reading with same `user_name` (case-insensitive) + `user_id` where `created_at` is within last 30 days
   - If found: load from DB, show toast, skip AI call
   - If not found or older than 1 month: proceed with new analysis
3. **History UI**: Show person name in history items, allow clicking to view full report

### Phase 4: PDF Hindi + Kundali Layout Fix
1. Remove transliteration when `language === 'hi'` — pass raw Hindi text through
2. Embed a subset Devanagari font (Noto Sans Devanagari) for jsPDF
3. Use the Devanagari font for all content sections when Hindi is selected
4. Fix score display bug (85/10 → 8.5/10)
5. Enhance Kundali-style layout: traditional grid for planetary analysis, decorative mandala borders, Sanskrit section headers

### Files Modified

| Phase | File | Change |
|-------|------|--------|
| 1 | `supabase/functions/palm-daily-horoscope/index.ts` | Gateway migration + CORS fix |
| 1 | `supabase/functions/daily-horoscope/index.ts` | Gateway migration + CORS fix |
| 1 | `supabase/functions/kundali-match/index.ts` | Gateway migration + CORS fix |
| 2 | `src/pages/PalmReading.tsx` | Browser SpeechSynthesis for Listen, dedup logic, name/DOB in save |
| 3 | Migration SQL | Add `user_name`, `user_dob` columns |
| 4 | `src/utils/pdfGenerator.ts` | Hindi font support, skip transliteration for Hindi, Kundali layout, score fix |

