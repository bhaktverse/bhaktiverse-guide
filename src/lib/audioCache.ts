/**
 * Offline audio cache (Cache Storage backed).
 * Lets the audio library keep playing without internet and recover when
 * the network returns.
 */

export const AUDIO_CACHE_NAME = "bv-audio-v1";
const MAX_CACHED_TRACKS = 60;

const supported = () => typeof caches !== "undefined";

export async function openAudioCache(): Promise<Cache | null> {
  if (!supported()) return null;
  try {
    return await caches.open(AUDIO_CACHE_NAME);
  } catch {
    return null;
  }
}

export async function listCachedUrls(): Promise<string[]> {
  const cache = await openAudioCache();
  if (!cache) return [];
  try {
    return (await cache.keys()).map((k) => k.url);
  } catch {
    return [];
  }
}

export async function isTrackCached(url?: string | null): Promise<boolean> {
  if (!url) return false;
  const cache = await openAudioCache();
  if (!cache) return false;
  return !!(await cache.match(url, { ignoreVary: true, ignoreSearch: true }));
}

/** Download + store a track for offline playback. */
export async function cacheAudioTrack(url: string): Promise<boolean> {
  const cache = await openAudioCache();
  if (!cache) return false;
  try {
    if (await cache.match(url, { ignoreSearch: true })) return true;
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return false;
    await cache.put(url, res.clone());
    await enforceLimit(cache);
    return true;
  } catch {
    return false;
  }
}

export async function cacheAudioTracks(urls: string[]): Promise<number> {
  let ok = 0;
  for (const u of urls) {
    if (await cacheAudioTrack(u)) ok++;
  }
  return ok;
}

/** Returns an object URL served from cache, or null when not cached. */
export async function getCachedObjectUrl(url?: string | null): Promise<string | null> {
  if (!url) return null;
  const cache = await openAudioCache();
  if (!cache) return null;
  try {
    const hit = await cache.match(url, { ignoreVary: true, ignoreSearch: true });
    if (!hit) return null;
    const blob = await hit.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export async function removeCachedTrack(url: string): Promise<boolean> {
  const cache = await openAudioCache();
  if (!cache) return false;
  try {
    return await cache.delete(url, { ignoreSearch: true });
  } catch {
    return false;
  }
}

export async function clearAudioCache(): Promise<void> {
  if (!supported()) return;
  try {
    await caches.delete(AUDIO_CACHE_NAME);
  } catch {
    /* noop */
  }
}

export async function getAudioCacheStats(): Promise<{ count: number; bytes: number }> {
  const cache = await openAudioCache();
  if (!cache) return { count: 0, bytes: 0 };
  try {
    const keys = await cache.keys();
    let bytes = 0;
    for (const k of keys) {
      const res = await cache.match(k);
      const len = res?.headers.get("content-length");
      if (len) bytes += Number(len);
    }
    return { count: keys.length, bytes };
  } catch {
    return { count: 0, bytes: 0 };
  }
}

/** FIFO eviction so the cache never grows unbounded on mobile. */
async function enforceLimit(cache: Cache) {
  try {
    const keys = await cache.keys();
    if (keys.length <= MAX_CACHED_TRACKS) return;
    const excess = keys.slice(0, keys.length - MAX_CACHED_TRACKS);
    await Promise.all(excess.map((k) => cache.delete(k)));
  } catch {
    /* noop */
  }
}

/**
 * Best playable source for a track:
 * 1. network URL when online and reachable
 * 2. cached copy (object URL) otherwise
 * 3. first working mirror URL
 */
export async function resolvePlayableSource(
  url?: string | null,
  mirrors: string[] = [],
): Promise<{ src: string | null; offline: boolean }> {
  if (!url) return { src: null, offline: false };
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  if (online) {
    if (await reachable(url)) return { src: url, offline: false };
    for (const m of mirrors) {
      if (m && (await reachable(m))) return { src: m, offline: false };
    }
  }

  const cached = await getCachedObjectUrl(url);
  if (cached) return { src: cached, offline: true };

  // Last resort: let the element try the network anyway.
  return { src: url, offline: !online };
}

async function reachable(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4500);
    const r = await fetch(url, { method: "HEAD", signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}
