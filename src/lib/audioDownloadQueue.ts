/**
 * Background download queue for offline audio.
 *
 * Downloads requested by the Offline Download Manager are persisted to
 * localStorage, so an interrupted batch (lost connectivity, tab closed,
 * app restart) automatically resumes when the app comes back online.
 */
import { cacheAudioTrack, isTrackCached } from "@/lib/audioCache";
import { trackAudioEvent } from "@/lib/audioTelemetry";

const QUEUE_KEY = "bv-audio-download-queue-v1";
const MAX_ATTEMPTS = 4;

export type QueueItem = {
  url: string;
  title?: string;
  attempts: number;
  addedAt: string;
};

type Listener = (state: QueueState) => void;

export type QueueState = {
  pending: QueueItem[];
  running: boolean;
  lastError: string | null;
};

let running = false;
let lastError: string | null = null;
const listeners = new Set<Listener>();

function read(): QueueItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function write(items: QueueItem[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    /* quota — ignore */
  }
  emit();
}

function emit() {
  const state: QueueState = { pending: read(), running, lastError };
  listeners.forEach((l) => {
    try {
      l(state);
    } catch {
      /* noop */
    }
  });
}

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener);
  listener({ pending: read(), running, lastError });
  return () => listeners.delete(listener);
}

export function getQueue(): QueueItem[] {
  return read();
}

export function clearQueue() {
  write([]);
}

/** Add tracks to the persistent queue and kick off processing. */
export function enqueueDownloads(items: { url: string; title?: string }[]) {
  const existing = read();
  const seen = new Set(existing.map((i) => i.url));
  const next = [...existing];
  for (const it of items) {
    if (!it.url || seen.has(it.url)) continue;
    seen.add(it.url);
    next.push({ url: it.url, title: it.title, attempts: 0, addedAt: new Date().toISOString() });
  }
  write(next);
  void processQueue();
}

/** Drain the queue one item at a time; safe to call repeatedly. */
export async function processQueue(): Promise<void> {
  if (running) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  running = true;
  lastError = null;
  emit();

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const queue = read();
      if (queue.length === 0) break;
      if (typeof navigator !== "undefined" && !navigator.onLine) break;

      const item = queue[0];

      if (await isTrackCached(item.url)) {
        write(queue.slice(1));
        continue;
      }

      const ok = await cacheAudioTrack(item.url);
      if (ok) {
        trackAudioEvent({
          event_type: "cache_store",
          track_title: item.title,
          track_url: item.url,
          attempt: item.attempts + 1,
          outcome: "success",
          detail: { source: "background_sync" },
        });
        write(read().slice(1));
      } else {
        const attempts = item.attempts + 1;
        const rest = read().slice(1);
        if (attempts >= MAX_ATTEMPTS) {
          lastError = `Gave up on "${item.title || item.url}" after ${attempts} attempts`;
          trackAudioEvent({
            event_type: "playback_error",
            track_title: item.title,
            track_url: item.url,
            attempt: attempts,
            outcome: "failure",
            detail: { source: "background_sync", reason: "max_attempts" },
          });
          write(rest);
        } else {
          // Push to the back with an incremented attempt counter.
          write([...rest, { ...item, attempts }]);
          await new Promise((r) => setTimeout(r, Math.min(8000, 500 * 2 ** attempts)));
        }
      }
    }
  } finally {
    running = false;
    emit();
  }
}

/** Wire up automatic resume: on app start and whenever connectivity returns. */
export function initBackgroundDownloadSync() {
  if (typeof window === "undefined") return;
  const resume = () => void processQueue();
  window.addEventListener("online", resume);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resume();
  });
  // Slight delay so it never competes with first paint.
  setTimeout(resume, 3000);
}
