/**
 * Palm CV — real palm line extraction using OpenCV.js
 * Uses Canny edges + Probabilistic Hough Line Transform inside a palm ROI
 * derived from MediaPipe landmarks. Returns classified Heart/Head/Life/Fate/Sun
 * positions in normalized 0-100 coordinates compatible with AILineDetectionOverlay.
 */

export interface NormalizedPoint {
  x: number; // 0-100 % of image width
  y: number; // 0-100 % of image height
}

export interface PalmLineGeometry {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curveIntensity: string;
  length: number;     // normalized 0-100 (diagonal %)
  angle: number;      // degrees (-180..180)
  depthScore: number; // 0-1 (proxy for crease depth)
  confidence: number; // 0-1
}

export interface ClassifiedLines {
  heartLine?: PalmLineGeometry;
  headLine?: PalmLineGeometry;
  lifeLine?: PalmLineGeometry;
  fateLine?: PalmLineGeometry;
  sunLine?: PalmLineGeometry;
}

export interface CVResult {
  lines: ClassifiedLines;
  detectedCount: number;
  totalSegments: number;
  avgConfidence: number;
}

// ---------- OpenCV.js loader (singleton) ----------
let cvReadyPromise: Promise<any> | null = null;

export function loadOpenCV(): Promise<any> {
  if (cvReadyPromise) return cvReadyPromise;

  cvReadyPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.cv && w.cv.Mat) {
      resolve(w.cv);
      return;
    }

    const existing = document.querySelector('script[data-opencv]') as HTMLScriptElement | null;
    const onReady = () => {
      const tryResolve = () => {
        if (w.cv && w.cv.Mat) resolve(w.cv);
        else if (w.cv && typeof w.cv.then === 'function') w.cv.then(resolve);
        else if (w.cv) {
          // Module style — wait for runtime
          w.cv['onRuntimeInitialized'] = () => resolve(w.cv);
        } else {
          setTimeout(tryResolve, 100);
        }
      };
      tryResolve();
    };

    if (existing) {
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', () => reject(new Error('OpenCV failed to load')));
      onReady();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.10.0/opencv.js';
    script.async = true;
    script.setAttribute('data-opencv', 'true');
    script.onload = onReady;
    script.onerror = () => reject(new Error('OpenCV failed to load'));
    document.head.appendChild(script);
  });

  return cvReadyPromise;
}

// ---------- Image -> ImageData (downscaled, cached) ----------
// Reusable offscreen canvas — avoids creating a new canvas + context per call.
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;
const imageDataCache = new Map<string, { data: ImageData; width: number; height: number }>();

function getCanvas() {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCtx = sharedCanvas.getContext('2d', { willReadFrequently: true });
  }
  return { canvas: sharedCanvas!, ctx: sharedCtx! };
}

/** Pick a target max dimension based on viewport — mobiles get smaller for speed. */
function autoMaxDim(): number {
  if (typeof window === 'undefined') return 480;
  const w = window.innerWidth || 1024;
  if (w < 480) return 384;   // phones: ~6x fewer pixels than 1024
  if (w < 900) return 448;
  return 512;
}

async function imageDataFromUrl(url: string, maxDim?: number): Promise<{ data: ImageData; width: number; height: number }> {
  const target = maxDim ?? autoMaxDim();
  const cacheKey = `${url}@${target}`;
  const cached = imageDataCache.get(cacheKey);
  if (cached) return cached;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });

  const scale = Math.min(1, target / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const { canvas, ctx } = getCanvas();
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  const result = { data: ctx.getImageData(0, 0, w, h), width: w, height: h };

  // Keep cache tiny — only the most recent 2 images.
  if (imageDataCache.size >= 2) {
    const firstKey = imageDataCache.keys().next().value;
    if (firstKey) imageDataCache.delete(firstKey);
  }
  imageDataCache.set(cacheKey, result);
  return result;
}

export function clearPalmCVCache() {
  imageDataCache.clear();
}

// ---------- Core: extract raw line segments ----------
interface RawSegment {
  x1: number; y1: number; x2: number; y2: number;
  length: number; angle: number; depth: number;
}

export interface ExtractOptions {
  maxDim?: number;
}

export async function extractPalmLines(
  imageUrl: string,
  landmarks: NormalizedPoint[] | null,
  opts: ExtractOptions = {}
): Promise<{ segments: RawSegment[]; width: number; height: number }> {
  const cv = await loadOpenCV();
  const { data: imgData, width, height } = await imageDataFromUrl(imageUrl, opts.maxDim);

  const src = cv.matFromImageData(imgData);
  const gray = new cv.Mat();
  const enhanced = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();
  const closed = new cv.Mat();
  const masked = new cv.Mat();
  const mask = cv.Mat.zeros(height, width, cv.CV_8UC1);
  const linesMat = new cv.Mat();

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // CLAHE contrast boost — makes faint creases pop
    const clahe = new cv.CLAHE(2.5, new cv.Size(8, 8));
    clahe.apply(gray, enhanced);
    clahe.delete();

    // Bilateral filter preserves edges while smoothing skin texture
    cv.bilateralFilter(enhanced, blurred, 7, 50, 50, cv.BORDER_DEFAULT);

    // Canny edges — adaptive thresholds based on median
    cv.Canny(blurred, edges, 40, 110, 3, false);

    // Morphological close to bridge tiny gaps in creases
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
    cv.morphologyEx(edges, closed, cv.MORPH_CLOSE, kernel);
    kernel.delete();

    // Build palm mask polygon from landmarks (or full image as fallback)
    if (landmarks && landmarks.length >= 21) {
      const idxs = [0, 1, 2, 5, 9, 13, 17]; // wrist + palm base around fingers
      const pts: number[] = [];
      idxs.forEach((i) => {
        pts.push(Math.round((landmarks[i].x / 100) * width));
        pts.push(Math.round((landmarks[i].y / 100) * height));
      });
      const mat = cv.matFromArray(pts.length / 2, 1, cv.CV_32SC2, pts);
      const contours = new cv.MatVector();
      contours.push_back(mat);
      cv.fillPoly(mask, contours, new cv.Scalar(255));
      mat.delete();
      contours.delete();
    } else {
      // Fallback: full image
      cv.rectangle(mask, new cv.Point(0, 0), new cv.Point(width, height), new cv.Scalar(255), -1);
    }

    cv.bitwise_and(closed, mask, masked);

    // Probabilistic Hough Line Transform
    cv.HoughLinesP(masked, linesMat, 1, Math.PI / 180, 30, 25, 8);

    const segments: RawSegment[] = [];
    for (let i = 0; i < linesMat.rows; i++) {
      const x1 = linesMat.data32S[i * 4];
      const y1 = linesMat.data32S[i * 4 + 1];
      const x2 = linesMat.data32S[i * 4 + 2];
      const y2 = linesMat.data32S[i * 4 + 3];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Depth proxy: average intensity in enhanced image along the segment (darker = deeper crease)
      let sum = 0; const steps = 10;
      for (let s = 0; s <= steps; s++) {
        const px = Math.round(x1 + (dx * s) / steps);
        const py = Math.round(y1 + (dy * s) / steps);
        if (px >= 0 && py >= 0 && px < width && py < height) {
          sum += enhanced.ucharPtr(py, px)[0];
        }
      }
      const avgIntensity = sum / (steps + 1);
      const depth = Math.max(0, Math.min(1, (180 - avgIntensity) / 180));

      segments.push({ x1, y1, x2, y2, length, angle, depth });
    }

    return { segments, width, height };
  } finally {
    src.delete(); gray.delete(); enhanced.delete(); blurred.delete();
    edges.delete(); closed.delete(); masked.delete(); mask.delete(); linesMat.delete();
  }
}

// ---------- Classifier: tag segments as Heart/Head/Life/Fate/Sun ----------
export function classifyLines(
  raw: { segments: RawSegment[]; width: number; height: number },
  landmarks: NormalizedPoint[] | null
): ClassifiedLines {
  const { segments, width, height } = raw;
  if (segments.length === 0) return {};

  const diag = Math.sqrt(width * width + height * height);
  const minLen = diag * 0.12;
  const candidates = segments.filter((s) => s.length >= minLen);

  // Helper: normalize segment to 0-100
  const norm = (s: RawSegment): PalmLineGeometry => {
    const len = (s.length / diag) * 100;
    return {
      startX: (s.x1 / width) * 100,
      startY: (s.y1 / height) * 100,
      endX: (s.x2 / width) * 100,
      endY: (s.y2 / height) * 100,
      curveIntensity: 'moderate',
      length: len,
      angle: s.angle,
      depthScore: s.depth,
      confidence: Math.min(1, (len / 30) * 0.5 + s.depth * 0.5),
    };
  };

  // Anchor positions (normalized 0-100). Use landmarks if available else defaults.
  let palmCenterY = 50, palmCenterX = 50, thumbX = 25, wristY = 90;
  if (landmarks && landmarks.length >= 21) {
    palmCenterX = (landmarks[9].x + landmarks[0].x) / 2;
    palmCenterY = (landmarks[9].y + landmarks[0].y) / 2;
    thumbX = landmarks[1].x;
    wristY = landmarks[0].y;
  }

  // Ensure horizontal segments go left->right and vertical top->bottom for stable angles
  const orient = (s: RawSegment): RawSegment => {
    const horizontal = Math.abs(Math.cos((s.angle * Math.PI) / 180)) > Math.abs(Math.sin((s.angle * Math.PI) / 180));
    if (horizontal && s.x1 > s.x2) {
      return { ...s, x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1, angle: s.angle + (s.angle < 0 ? 180 : -180) };
    }
    if (!horizontal && s.y1 > s.y2) {
      return { ...s, x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1, angle: s.angle + (s.angle < 0 ? 180 : -180) };
    }
    return s;
  };

  const oriented = candidates.map(orient);

  const score = (s: RawSegment, target: 'heart' | 'head' | 'life' | 'fate' | 'sun'): number => {
    const cx = ((s.x1 + s.x2) / 2 / width) * 100;
    const cy = ((s.y1 + s.y2) / 2 / height) * 100;
    const absAngle = Math.abs(s.angle);
    const isHorizontal = absAngle < 30 || absAngle > 150;
    const isVertical = absAngle > 60 && absAngle < 120;
    const lenScore = Math.min(1, s.length / (diag * 0.35));
    const depthScore = s.depth;

    switch (target) {
      case 'heart': {
        // Horizontal, upper third of palm
        if (!isHorizontal) return 0;
        const yScore = Math.max(0, 1 - Math.abs(cy - (palmCenterY - 15)) / 25);
        return yScore * 0.5 + lenScore * 0.3 + depthScore * 0.2;
      }
      case 'head': {
        if (!isHorizontal) return 0;
        const yScore = Math.max(0, 1 - Math.abs(cy - palmCenterY) / 20);
        return yScore * 0.5 + lenScore * 0.3 + depthScore * 0.2;
      }
      case 'life': {
        // Curved arc near thumb base — favor segments left of palm center close to thumb
        const xProx = Math.max(0, 1 - Math.abs(cx - thumbX) / 25);
        const yProx = Math.max(0, 1 - Math.abs(cy - (palmCenterY + 10)) / 35);
        return xProx * 0.4 + yProx * 0.3 + lenScore * 0.2 + depthScore * 0.1;
      }
      case 'fate': {
        if (!isVertical) return 0;
        const xScore = Math.max(0, 1 - Math.abs(cx - palmCenterX) / 15);
        return xScore * 0.5 + lenScore * 0.3 + depthScore * 0.2;
      }
      case 'sun': {
        if (!isVertical) return 0;
        // Ring finger side — right of center (palmCenterX + ~12%)
        const xScore = Math.max(0, 1 - Math.abs(cx - (palmCenterX + 12)) / 12);
        return xScore * 0.5 + lenScore * 0.3 + depthScore * 0.2;
      }
    }
  };

  const pickBest = (target: 'heart' | 'head' | 'life' | 'fate' | 'sun'): PalmLineGeometry | undefined => {
    let best: { seg: RawSegment; score: number } | null = null;
    for (const s of oriented) {
      const sc = score(s, target);
      if (sc > 0.35 && (!best || sc > best.score)) best = { seg: s, score: sc };
    }
    if (!best) return undefined;
    const g = norm(best.seg);
    g.confidence = Math.min(1, best.score);
    return g;
  };

  return {
    heartLine: pickBest('heart'),
    headLine: pickBest('head'),
    lifeLine: pickBest('life'),
    fateLine: pickBest('fate'),
    sunLine: pickBest('sun'),
  };
}

// ---------- High-level orchestrator ----------
export async function analyzePalmCV(
  imageUrl: string,
  landmarks: NormalizedPoint[] | null,
  opts: ExtractOptions = {}
): Promise<CVResult> {
  const raw = await extractPalmLines(imageUrl, landmarks, opts);
  const classified = classifyLines(raw, landmarks);
  const found = Object.values(classified).filter(Boolean) as PalmLineGeometry[];
  const avg = found.length ? found.reduce((a, b) => a + b.confidence, 0) / found.length : 0;
  return {
    lines: classified,
    detectedCount: found.length,
    totalSegments: raw.segments.length,
    avgConfidence: avg,
  };
}

