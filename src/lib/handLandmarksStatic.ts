/**
 * Static-image hand landmark detection using MediaPipe Hands.
 * Used for uploaded images (no live video). Returns landmarks
 * normalized to 0-100 percentage coordinates for compatibility
 * with palmCV.ts and AILineDetectionOverlay.
 */

import type { NormalizedPoint } from './palmCV';

let handsPromise: Promise<any> | null = null;

async function getHands() {
  if (handsPromise) return handsPromise;
  handsPromise = (async () => {
    const { Hands } = await import('@mediapipe/hands');
    const hands = new Hands({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      staticImageMode: true,
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
    });
    return hands;
  })();
  return handsPromise;
}

export async function detectLandmarksFromImageUrl(imageUrl: string): Promise<NormalizedPoint[] | null> {
  try {
    const hands = await getHands();
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = imageUrl;
    });

    return await new Promise((resolve) => {
      let resolved = false;
      const handler = (results: any) => {
        if (resolved) return;
        resolved = true;
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const lm = results.multiHandLandmarks[0];
          // MediaPipe returns x,y in 0..1 — convert to 0..100
          resolve(lm.map((p: any) => ({ x: p.x * 100, y: p.y * 100 })));
        } else {
          resolve(null);
        }
      };
      hands.onResults(handler);
      hands.send({ image: img }).catch(() => {
        if (!resolved) { resolved = true; resolve(null); }
      });
      // Safety timeout
      setTimeout(() => { if (!resolved) { resolved = true; resolve(null); } }, 8000);
    });
  } catch (err) {
    console.error('Static landmark detection failed:', err);
    return null;
  }
}
