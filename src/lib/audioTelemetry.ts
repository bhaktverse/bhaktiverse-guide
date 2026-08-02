/**
 * Audio reliability telemetry — records cache hits, retry outcomes and
 * fallback-to-network behaviour so admins can monitor playback health.
 * Buffered locally and flushed in batches; never blocks playback.
 */
import { supabase } from "@/integrations/supabase/client";

export type AudioEventType =
  | "cache_hit"
  | "cache_miss"
  | "cache_store"
  | "network_play"
  | "fallback_network"
  | "fallback_mirror"
  | "retry"
  | "playback_error"
  | "recovered";

export type AudioEvent = {
  event_type: AudioEventType;
  track_title?: string | null;
  track_url?: string | null;
  attempt?: number;
  outcome?: "success" | "failure" | "pending";
  detail?: Record<string, unknown>;
};

const LOCAL_KEY = "bv-audio-telemetry-v1";
const MAX_LOCAL = 200;
let queue: any[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export type LocalSummary = {
  total: number;
  cacheHits: number;
  networkPlays: number;
  fallbacks: number;
  retries: number;
  errors: number;
  recoveries: number;
  lastAt: string | null;
};

function readLocal(): any[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(rows: any[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(-MAX_LOCAL)));
  } catch {
    /* noop */
  }
}

export function localSummary(): LocalSummary {
  const rows = readLocal();
  const count = (t: AudioEventType | AudioEventType[]) =>
    rows.filter((r) => (Array.isArray(t) ? t.includes(r.event_type) : r.event_type === t)).length;
  return {
    total: rows.length,
    cacheHits: count("cache_hit"),
    networkPlays: count("network_play"),
    fallbacks: count(["fallback_network", "fallback_mirror"]),
    retries: count("retry"),
    errors: count("playback_error"),
    recoveries: count("recovered"),
    lastAt: rows.length ? rows[rows.length - 1].created_at : null,
  };
}

export function clearLocalTelemetry() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    /* noop */
  }
}

/** Fire-and-forget audio reliability event. */
export function trackAudioEvent(evt: AudioEvent) {
  const row = {
    event_type: evt.event_type,
    track_title: evt.track_title ?? null,
    track_url: evt.track_url ?? null,
    attempt: evt.attempt ?? 0,
    outcome: evt.outcome ?? null,
    was_online: typeof navigator === "undefined" ? null : navigator.onLine,
    detail: evt.detail ?? {},
    created_at: new Date().toISOString(),
  };
  writeLocal([...readLocal(), row]);
  queue.push(row);
  if (!timer) timer = setTimeout(flushAudioTelemetry, 4000);
}

export async function flushAudioTelemetry() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return; // retry on next event
  const batch = queue.splice(0, queue.length);
  try {
    const { data } = await supabase.auth.getUser();
    const uid = data?.user?.id ?? null;
    await supabase
      .from("audio_reliability_events")
      .insert(batch.map((r) => ({ ...r, user_id: uid })) as any);
  } catch {
    /* telemetry never blocks UX */
  }
}
