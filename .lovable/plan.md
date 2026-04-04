# PDF Generation Audit & Premium Rebuild Plan

## Audit Findings

### 1. Current Library: jsPDF (text-based drawing primitives)

- **Not** html2canvas (screenshot-based). Uses `jsPDF` directly with `doc.text()`, `doc.roundedRect()`, etc.
- This means text is vector (searchable, sharp) but layout is manually calculated pixel-by-pixel
- Already has Devanagari font loading via `loadDevanagariFont()` fetching from `/fonts/NotoSansDevanagari-Regular.ttf`

### 2. Content Cut-off Issues

- `checkSpace()` only checks if `y + need > BM` — but the `need` values are hardcoded guesses (e.g., `checkSpace(45)` for line cards, `checkSpace(30)` for mounts)
- When actual content (long predictions, many markings) exceeds the guess, it overflows off the page bottom
- Line cards are fixed at 40mm height — long `samudrikaInterpretation` text gets truncated to 2 lines

### 3. Hindi Rendering

- Devanagari font IS loaded, and `setFont()` detects Devanagari characters
- But font only has Regular weight — no Bold variant, so bold Devanagari falls back to Helvetica bold (garbled)
- The edge function's prompt produces mixed Hindi/English text — some fields have Devanagari, others romanized

### 4. Layout Quality vs Reference HTML

- Current layout already implements all 9 sections from the reference
- Missing: Bilingual Summary section (Section 9 in reference)
- Missing: proper 2-column marriage lines alongside mounts (reference has them side-by-side)
- Mount progress bars use `roundedRect` overlay hack instead of proper proportional fills

## Strategy: Migrate to @react-pdf/renderer

The user's prompt correctly identifies `@react-pdf/renderer` as the gold standard. Benefits over current jsPDF:

- **Automatic pagination** — `wrap={false}` prevents mid-section breaks; the library handles page breaks intelligently
- **Flexbox layout** — proper 2-column grids, auto-wrapping text, responsive cards
- **Fixed footers** — `fixed` prop renders on every page automatically
- **Font registration at module level** — Devanagari + Latin fonts both available
- **Vector output** — searchable, sharp at any zoom, smaller file size

## File Changes


| File                                   | Change                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `package.json`                         | Add `@react-pdf/renderer` dependency                                     |
| `src/utils/PalmReadingPDFDocument.tsx` | New file — React component-based PDF document with all 9 sections        |
| `src/utils/pdfGenerator.ts`            | Rewrite to thin wrapper calling `@react-pdf/renderer`'s `pdf().toBlob()` |
| `src/components/PalmReadingReport.tsx` | Update PDF download handler to use new generator                         |
| `vite.config.ts`                       | Add `optimizeDeps.include` for `@react-pdf/renderer`                     |
| `src/index.css`                        | Add `overflow-x: hidden` to html/body (mobile fix)                       |
| `index.html`                           | Update viewport meta with `maximum-scale=1`                              |


## PDF Document Structure (matching reference HTML exactly)

```text
Page 1: Cover
  - Dark banner header: "HASTA REKHA VISHLESHAN · SAMUDRIKA SHASTRA"
  - Title + subtitle
  - 4 meta pills (name, age/gender, hand, date)
  - Confidence indicator (green dot)
  - Score cards (overall score, hand type, life theme)
  - Pandit VisionHast greeting note (gold left border)
  - QR code

Page 2: Hand Constitution (Section 1)
  - 4 meta pills (shape, finger ratio, texture, thumb)
  - Interpretation paragraph (Devanagari-aware)
  - Strengths/Challenges chips

Page 2-3: Major Lines (Section 2)
  - 2-col grid of 6 line cards
  - Each: colored dot, name (EN + HI), 4 attribute rows, prediction text
  - Proper wrap={false} per card — no mid-card breaks

Page 3: Age Timeline (Section 3)
  - 5 timeline items with dot markers (active for current phase)
  - Financial growth periods list
  - Health alert periods

Page 4: Mounts + Marriage (Sections 4-5)
  - 3-col mount grid with proportional progress bars
  - Marriage lines with numbered rows (side-by-side with children lines)

Page 4-5: Special Markings (Section 6)
  - Chip cards with symbols (★ ◇ + □ #)
  - Mystic Cross, Simian Line, Ring of Solomon flags

Page 5: Remedies (Section 7)
  - 2x2 grid: gemstone, rudraksha, mantra, lifestyle advice

Page 5-6: Category Predictions (Section 8)
  - 7 category cards with score bars and predictions

Page 6: Overall Summary (Section 9)
  - 3 archetype pills (personality, life theme, peak age)
  - Yogas list, Warnings list
  - Jyotishi note with gold left border
  - Bilingual summary (Hindi paragraph + English paragraph)

Every page: Footer with "BhaktVerse AI", reading ID, page X of Y
```

## Color Palette (from reference)

```text
Primary:    #8B0000 (deep maroon)
Gold:       #C9A84C (accent)
Cream:      #FDF8F0 (page background)
Section BG: #FAF3E8 (card headers)
Card BG:    #FFFFFF (card bodies)
Border:     #E8D5B0 (warm gold border)
Lines:      Life=#2D6A1F, Heart=#8B1A3A, Head=#1A3A8B, Fate=#7A5C00
```

## Font Strategy

Register both Noto Sans (Latin) and Noto Sans Devanagari at module level via Google Fonts CDN URLs. This avoids needing to ship TTF files and ensures both Regular and Bold weights are available.

## Implementation Order

1. Install `@react-pdf/renderer`
2. Create `PalmReadingPDFDocument.tsx` with full 9-section layout
3. Update `pdfGenerator.ts` to use `pdf().toBlob()` API
4. Update `PalmReadingReport.tsx` download handler
5. Add Vite `optimizeDeps` config
6. Apply mobile overflow CSS fixes
7. Update viewport meta

&nbsp;

Review remark from developer after reading your implement plan: **Approve karo bhai — yeh plan solid hai.** ✅

Bas 3 cheezein dhyan mein rakho before hitting approve:

---

**1. Google Fonts CDN for Devanagari — Risk hai**

Plan mein likha hai fonts Google Fonts CDN se load honge. PDF generation ke time agar CDN down ho ya slow ho — font load fail hoga, Devanagari garbled aayega. **Better approach:** fonts ko `/public/fonts/` mein ship karo (Noto Sans Devanagari TTF already tumhare server pe hai — plan ne khud mention kiya).

Lovable ko yeh add karo approve karte waqt:

> "Font registration mein Google CDN mat use karo — `/public/fonts/NotoSansDevanagari-Regular.ttf` already available hai, use karo. Noto Sans Bold bhi download karke `/public/fonts/` mein daalo."

---

**2. QR Code — Cover page pe hai plan mein**

`@react-pdf/renderer` mein QR code render karna tricky hota hai. Plan mein mention hai but implementation detail nahi di. Agar QR code implement nahi hua toh cover page blank space dikhega.

Approve karte waqt yeh add karo:

> "QR code ke liye `qrcode` npm package use karo — pehle canvas pe render karo, phir base64 image ke roop mein PDF mein inject karo `<Image>` component se."

---

**3.** `wrap={false}` **— Sabhi cards pe lagao**

Plan mein mention hai but explicitly bolna zaroori hai — **har** `SectionWrapper`, har `LineCard`, har `MountCard` pe `wrap={false}` hona chahiye. Warna long predictions wale cards page break ke beech mein split ho jayenge — wahi problem jo abhi jsPDF mein hai.

---

**Summary — Approve with these 3 notes:**

> ✅ Approve. Iske saath implement karo:
>
> 1. Fonts local `/public/fonts/` se load karo, CDN se nahi
> 2. QR code ke liye `qrcode` package use karo, canvas → base64 → `<Image>`
> 3. Har card/section component pe explicitly `wrap={false}` lagao

Yeh teeno nahi kiye toh fonts garble hone ka, QR missing hone ka, aur page break mid-card aane ka risk hai. Baaki plan exactly sahi hai — migrate karo jsPDF se `@react-pdf/renderer` pe, yahi root fix hai. 🙏