## Phase C — Real OpenCV.js Palm Line Detection

Currently the platform uses MediaPipe for hand landmark detection (skeleton + approximate dashed line overlays), and the AI Vision model produces narrative line analysis. Actual pixel-level palm crease detection (Canny edge → Hough lines / contour tracing) is still TODO. This phase adds genuine computer-vision line extraction so the overlay reflects the user's real palm creases — closing the gap with top palmistry apps.

### Goals
1. Detect real palm creases from the captured image using OpenCV.js.
2. Use MediaPipe landmarks to crop and rectify the palm ROI (rotation + scale normalization) before edge detection.
3. Classify detected line segments into Heart / Head / Life / Fate / Sun based on angle + position relative to landmarks.
4. Feed real line coordinates (not LLM-guessed positions) into `AILineDetectionOverlay` for accurate animated rendering.
5. Improve AI analysis prompt by sending detected line geometry (length, curvature, depth proxy) alongside the image.

### Deliverables

**1. New module `src/lib/palmCV.ts`**
- Lazy-load OpenCV.js from CDN (`https://docs.opencv.org/4.x/opencv.js`) with a singleton loader + ready promise.
- Function `extractPalmLines(imageDataUrl, landmarks)`:
  - Convert to grayscale → CLAHE contrast boost → bilateral filter → Canny edges → morphological close.
  - Mask to palm polygon built from MediaPipe landmarks `[0,1,5,9,13,17]` (excludes finger area).
  - Run Probabilistic Hough Line Transform + contour-based skeleton extraction.
  - Return normalized `{startX,startY,endX,endY,length,angle,depthScore}[]` (0-100 percentages).
- Function `classifyLines(segments, landmarks)`:
  - Heart: horizontal, upper third, below finger bases.
  - Head: horizontal, middle, slight downward slope.
  - Life: curved arc, near thumb base (landmarks 1-2-0).
  - Fate: vertical, center palm.
  - Sun: vertical, ring-finger side.
  - Score by angle + bounding-box position; return best match per category.

**2. New component `src/components/PalmCVProcessor.tsx`**
- Accepts `imageUrl` and `landmarks` (passed from capture step or re-detected on uploaded image).
- Runs `extractPalmLines` + `classifyLines` off the main thread via `requestIdleCallback`.
- Emits `onLinesDetected(linesByCategory)` with real coordinates.
- Renders a small status badge ("CV: 4/5 lines found · 92% confidence").

**3. Static-image MediaPipe pass `src/lib/handLandmarksStatic.ts`**
- For uploaded (non-camera) images, run MediaPipe Hands once in `staticImageMode: true` to get landmarks needed for ROI/classification.

**4. Wire into `src/pages/PalmReading.tsx`**
- After capture/upload + before/parallel to AI analysis call, run `PalmCVProcessor`.
- Pass detected coordinates as `lineAnalysis.{x}Line.position` override into `AILineDetectionOverlay` so the animated overlay traces real creases.
- Also POST the CV geometry to `supabase/functions/palm-reading-analysis` as a new `lineGeometry` field.

**5. Update edge function `supabase/functions/palm-reading-analysis/index.ts`**
- Accept optional `lineGeometry` payload.
- Inject into Gemini prompt: "Computer-vision pre-analysis detected these lines (normalized 0-100): …". This grounds the model and reduces hallucinated positions.

**6. Update `AILineDetectionOverlay`**
- Prefer CV-supplied positions when present; fall back to AI/default positions.
- Add a "Source: CV / AI / Default" badge per line for transparency.

**7. Performance & UX**
- OpenCV.js (~8 MB) lazy-loaded only when user opens Palm Reading; cached by browser.
- Show loading state "Loading CV engine…" first time.
- Run detection in <1.5s on mid-range mobile (downscale ROI to 512px max).
- Fail gracefully → fall back to AI-only positions (current behavior) if OpenCV fails to load or no lines pass confidence threshold.

### Technical notes
- No new npm package — OpenCV.js loaded via `<script>` injection to keep bundle size unchanged.
- MediaPipe already loaded for camera path; static-image mode reuses same `@mediapipe/hands` dependency.
- All processing client-side (privacy preserved — image never leaves device for CV step).
- Types: `PalmLineGeometry` interface added to `src/lib/palmCV.ts`, imported where needed.

### Out of scope (future phases)
- Minor lines (Mercury, Marriage, Children) — focus on the 5 major lines first.
- ML-based line classifier — heuristic classifier is sufficient for v1.
- Mount/finger-shape analysis — separate iteration.

### Files
- create `src/lib/palmCV.ts`
- create `src/lib/handLandmarksStatic.ts`
- create `src/components/PalmCVProcessor.tsx`
- edit `src/pages/PalmReading.tsx`
- edit `src/components/AILineDetectionOverlay.tsx`
- edit `supabase/functions/palm-reading-analysis/index.ts`
