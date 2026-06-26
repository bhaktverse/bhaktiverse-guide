import { supabase } from "@/integrations/supabase/client";

export type TelemetrySample = {
  framesTotal: number;
  framesDetected: number;
  confidenceSum: number;
  jitterSum: number;     // px between consecutive wrist positions
  jitterCount: number;
  startedAt: number;
  lastWrist?: { x: number; y: number };
};

export const newSample = (): TelemetrySample => ({
  framesTotal: 0, framesDetected: 0, confidenceSum: 0, jitterSum: 0, jitterCount: 0, startedAt: performance.now(),
});

export function recordFrame(
  s: TelemetrySample,
  opts: { detected: boolean; confidence?: number; wrist?: { x: number; y: number } | null; canvasWidth?: number }
) {
  s.framesTotal++;
  if (opts.detected) {
    s.framesDetected++;
    if (typeof opts.confidence === "number") s.confidenceSum += opts.confidence;
    if (opts.wrist && s.lastWrist && opts.canvasWidth) {
      const dx = (opts.wrist.x - s.lastWrist.x) * opts.canvasWidth;
      const dy = (opts.wrist.y - s.lastWrist.y) * opts.canvasWidth;
      s.jitterSum += Math.sqrt(dx * dx + dy * dy);
      s.jitterCount++;
    }
    s.lastWrist = opts.wrist ?? s.lastWrist;
  }
}

export async function flushTelemetry(preset: string, s: TelemetrySample) {
  if (s.framesTotal < 30) return; // ignore micro-sessions
  const sessionMs = Math.round(performance.now() - s.startedAt);
  const detection_rate = s.framesDetected / s.framesTotal;
  const avg_confidence = s.framesDetected ? s.confidenceSum / s.framesDetected : 0;
  const jitter_px = s.jitterCount ? s.jitterSum / s.jitterCount : 0;
  const fps = sessionMs > 0 ? (s.framesTotal * 1000) / sessionMs : 0;
  try {
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("palm_quality_telemetry").insert({
      user_id: u?.user?.id ?? null,
      quality_preset: preset,
      detection_rate, avg_confidence, jitter_px, fps,
      frames_total: s.framesTotal, frames_detected: s.framesDetected,
      session_ms: sessionMs,
      device_info: {
        ua: navigator.userAgent.slice(0, 200),
        cores: navigator.hardwareConcurrency ?? null,
        dpr: window.devicePixelRatio ?? null,
      },
    });
  } catch {
    // silent: telemetry never blocks UX
  }
}
