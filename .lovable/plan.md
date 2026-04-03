# PDF Redesign + Devanagari Font + Mobile Overflow Fix

## Three Workstreams

### A. PDF Report Complete Redesign (matching uploaded HTML reference)

The uploaded HTML shows a clean, modern, card-based layout with 9 sections:

1. Cover (meta pills: name, age, hand, date + confidence indicator)
2. Hand Constitution (4 meta pills + interpretation)
3. Major Lines (2-col grid of 6 line cards with colored dots, attributes, predictions)
4. Age Timeline (vertical timeline with dot markers)
5. Mounts (3-col grid cards with progress bars) + Marriage Lines (side-by-side two-col)
6. Special Markings (chip cards with symbols: ★ ◇ ○ □)
7. Remedies (2x2 grid: gemstone, rudraksha, mantra, advice)
8. Overall Summary (archetype, life theme, peak age + jyotishi note)
9. Bilingual Summary (Hindi + English paragraphs)

**Current PDF problems:**

- Old "GURU JI" branding still in TOC/greeting (should be Pandit VisionHast)
- Heavy ornamental borders, swastik corners, watermarks — cluttered vs the clean reference
- No age timeline section
- No special markings section
- No marriage line detail section
- Transliteration strips Hindi to ugly IAST romanized text
- Cover page has text overflow issues

**Approach:** Complete rewrite of `pdfGenerator.ts` to match the reference HTML's clean, card-based layout using jsPDF drawing primitives. Remove ornamental borders/swastik/watermarks. Use clean section numbering, subtle rounded rects, colored dots for lines, progress bars for mounts, timeline dots for age predictions.

### B. Devanagari Font Support

**Problem:** Current code strips all Devanagari to IAST transliteration because jsPDF's built-in Helvetica cannot render Unicode Devanagari.

**Solution:** Embed Noto Sans Devanagari font (subset, ~200KB) into jsPDF. Remove the `transliterate()` function and `getSafeText()` transliteration pipeline. When Hindi text is detected, switch to the Devanagari font; otherwise use Helvetica.

**Implementation:**

- Download Noto Sans Devanagari Regular + Bold (TTF) 
- Convert to base64 and embed via `doc.addFont()`
- Create a `setFont()` wrapper that detects Devanagari characters and switches fonts
- Remove the entire transliteration map and character-level conversion

### C. Mobile Horizontal Scroll Fix

**Problem:** Pages scroll horizontally on mobile, breaking the premium app feel.

**Root causes:**

1. No `overflow-x: hidden` on `html` or `body`
2. Content elements (grids, cards, text) may exceed viewport width on small screens
3. Borders/decorative elements extending beyond viewport

**Fixes in `src/index.css`:**

- Add `overflow-x: hidden` to `html` and `body`
- Add `max-width: 100vw` to body

**Fixes in `index.html`:**

- Add `maximum-scale=1, user-scalable=no` to viewport meta (prevents pinch-zoom-triggered horizontal scroll)

---

## File Changes


| File                        | Change                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/utils/pdfGenerator.ts` | Complete rewrite — new clean layout matching HTML reference, remove transliteration, add Devanagari font |
| `src/index.css`             | Add `overflow-x: hidden` to html/body                                                                    |
| `index.html`                | Update viewport meta                                                                                     |


## PDF Section Structure (New)

```text
Page 1: Cover
  - "Hasta Rekha Vishleshan · Samudrika Shastra" header
  - Palm icon + title + subtitle
  - 4 meta pills (name, age, hand, date)
  - Confidence indicator with green dot
  - QR code

Page 2: Hand Constitution (Section 1)
  - 4 meta pills (shape, finger ratio, texture, thumb)
  - Interpretation paragraph

Page 2-3: Major Lines (Section 2)
  - 2-col grid of 6 line cards
  - Each: colored dot, name, 4 attribute rows, prediction

Page 3: Age Timeline (Section 3)
  - Vertical timeline with 5 age brackets
  - Dot markers (active for current phase)

Page 4: Mounts + Marriage (Sections 4-5)
  - 3-col mount grid with bars
  - Marriage lines with numbered rows

Page 4-5: Special Markings (Section 6)
  - Chip cards with symbols

Page 5: Remedies (Section 7)
  - 2x2 grid cards

Page 5-6: Summary (Section 8)
  - 3-col archetype cards
  - Jyotishi note with left border

Page 6: Bilingual Summary (Section 9)
  - Hindi paragraph + English paragraph

Footer: Disclaimer + page numbers
```

## Implementation Order

1. Add Devanagari font embedding to pdfGenerator
2. Rewrite PDF layout to match reference HTML
3. Add mobile overflow fix to CSS
4. Update viewport meta
5. do audit securty issues including - **Something went wrong**
  An unexpected error occurred.