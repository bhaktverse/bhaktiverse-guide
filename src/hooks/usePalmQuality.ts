import { useEffect, useState } from "react";

export type PalmQuality = "fast" | "balanced" | "high";

export const QUALITY_PRESETS: Record<PalmQuality, {
  label: string;
  width: number;
  modelComplexity: 0 | 1;
  smoothFrames: number;
  enableCLAHE: boolean;
  minDetectionConfidence: number;
}> = {
  fast:     { label: "Fast",     width: 320, modelComplexity: 0, smoothFrames: 1, enableCLAHE: false, minDetectionConfidence: 0.5 },
  balanced: { label: "Balanced", width: 640, modelComplexity: 1, smoothFrames: 3, enableCLAHE: true,  minDetectionConfidence: 0.6 },
  high:     { label: "High",     width: 960, modelComplexity: 1, smoothFrames: 5, enableCLAHE: true,  minDetectionConfidence: 0.7 },
};

const KEY = "bv.palm.quality";

export function usePalmQuality() {
  const [quality, setQuality] = useState<PalmQuality>(() => {
    if (typeof window === "undefined") return "balanced";
    const v = window.localStorage.getItem(KEY);
    return (v === "fast" || v === "high" || v === "balanced") ? v : "balanced";
  });

  useEffect(() => {
    try { window.localStorage.setItem(KEY, quality); } catch { /* ignore */ }
  }, [quality]);

  return { quality, setQuality, preset: QUALITY_PRESETS[quality] };
}
