

# Palm Reading E2E Fix + PDF Report Overhaul

## Current Issues Identified

### 1. Edge Function: Deployed & Working
The `palm-reading-analysis` function is now deployed and responding correctly (returns proper 400 for missing image). No logs yet from real usage — needs a real palm image test via the UI.

### 2. PDF Report: Critical Text Rendering Problems

**Hindi/Devanagari text**: jsPDF's built-in fonts (Helvetica, Times, Courier) do NOT support Unicode/Devanagari glyphs. The current `transliterate()` function converts Hindi to Roman script, but it has gaps — any unmapped characters produce garbage or get stripped, leaving broken text. Embedding a full Hindi TTF font (~2-5MB base64) into the bundle is impractical.

**Text overlap/out-of-page issues** — root causes found:
- `addWrappedText()` does NOT call `checkPageBreak()` before rendering — long text blocks overflow past page bottom
- Category predictions can be up to 1500 chars each (7 categories = ~10,500 chars) — `checkPageBreak` is called once before the block but not during multi-line rendering
- Mount analysis, secondary lines, and finger analysis sections render without adequate page break checks between items
- The guidance boxes use `roundedRect` with a calculated height but don't verify the box + text fit on the current page
- `addPageFooter()` is called after sections but not on every new page created by `checkPageBreak()`

---

## Implementation Plan

### Phase 1: Fix PDF Text Rendering & Layout (Critical)

**File: `src/utils/pdfGenerator.ts`** — Complete overhaul of text rendering

1. **Replace `addWrappedText` with a page-aware version** that splits text into lines, checks remaining space before each line group, and adds a new page when needed — instead of writing all lines at once and hoping they fit.

2. **Fix `checkPageBreak`** to also call `addPageFooter()` on the page being left, so every page gets its footer.

3. **Improve Hindi handling**: Instead of trying to render Devanagari (which jsPDF can't do with built-in fonts), enforce the transliteration approach but:
   - Expand `transliterationMap` with 50+ more common Hindi spiritual terms
   - Add a smarter character-level fallback that handles conjunct consonants (e.g., "श्री" → "Shri")
   - When language is Hindi, add a header note: "Hindi content displayed in Roman transliteration (IAST) for PDF compatibility"
   - Strip ALL remaining non-ASCII after transliteration (current regex already does this, but misses some edge cases)

4. **Cap content per section** to prevent overflow:
   - Category predictions: max 1200 chars (down from 1500)
   - Guidance text: max 200 chars
   - Mount/line descriptions: max 150 chars per item
   - Blessings: max 500 chars

5. **Fix guidance box rendering**: Calculate actual text height BEFORE drawing the rounded rect, and call `checkPageBreak` with the real height.

6. **Ensure total report stays 8-10 pages**: Add a page counter check — if we exceed 10 pages, truncate remaining category predictions more aggressively.

### Phase 2: Professional PDF Layout Improvements

**File: `src/utils/pdfGenerator.ts`**

1. **Consistent margins**: Ensure all text respects a `bottomMargin = pageHeight - 25` boundary (currently 25mm from bottom, but some sections ignore it)

2. **Section headers always start with space**: Each major section header should `checkPageBreak(40)` to avoid orphaned headers at page bottom

3. **Cleaner category cards**: Remove the lotus divider between each category (too repetitive for 7 categories) — use a simple thin line instead

4. **Fix mantra rendering**: Currently mantras in structured format (sanskrit/transliteration/meaning) render in a fixed 18mm box — make this dynamic based on content length

5. **Add watermark**: Light "BhaktVerse" watermark text at 45° angle on each page (very light gray, adds professionalism)

### Phase 3: Test Palm Reading E2E

Deploy the fixed PDF generator, then verify:
- Upload palm image → analysis completes
- All report sections render (Hand Type, Secondary Lines, Finger Analysis, Line Quality, Reading Depth Score)
- PDF download produces a clean 8-10 page report with no text overlap
- Hindi language selection produces readable transliterated PDF

---

## Technical Details

### Page-Aware Text Rendering Fix
```text
// Current (broken):
addWrappedText(longText, x, y, width, lineHeight)
// → Writes ALL lines at y position, overflows page

// Fixed:
addWrappedTextSafe(text, x, y, maxWidth, lineHeight, maxLines?)
// → Splits into lines, checks page break every 5 lines
// → Returns new yPos accounting for page breaks
```

### Files Modified
| File | Changes |
|------|---------|
| `src/utils/pdfGenerator.ts` | Complete text rendering overhaul, page-aware layout, content caps, Hindi transliteration improvements, watermark |

### No Other Files Changed
The edge function is already deployed and working. The UI components already handle all report sections. Only the PDF generator needs fixing.

