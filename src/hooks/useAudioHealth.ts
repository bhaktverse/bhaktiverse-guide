import { useEffect, useState } from "react";

export type AudioSyncStatus = "online" | "offline" | "checking" | "cached";

type Health = {
  status: AudioSyncStatus;
  cachedCount: number;
  totalProbed: number;
  failed: number;
  loading: boolean;
  recheck: () => Promise<void>;
};

const CACHE_NAME = "bv-audio-v1";

async function listCachedUrls(): Promise<string[]> {
  if (typeof caches === "undefined") return [];
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.map(k => k.url);
  } catch {
    return [];
  }
}

async function probeReachable(url?: string | null): Promise<boolean> {
  if (!url) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(url, { method: "HEAD", signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

export function useAudioHealth(currentTrackUrl?: string | null): Health {
  const [status, setStatus] = useState<AudioSyncStatus>("checking");
  const [cachedCount, setCachedCount] = useState(0);
  const [totalProbed, setTotalProbed] = useState(0);
  const [failed, setFailed] = useState(0);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    const cached = await listCachedUrls();
    setCachedCount(cached.length);

    const navOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (!navOnline) {
      const hit = currentTrackUrl ? cached.some(u => u === currentTrackUrl) : false;
      setStatus(hit ? "cached" : "offline");
      setTotalProbed(0);
      setFailed(0);
      setLoading(false);
      return;
    }

    if (currentTrackUrl) {
      const ok = await probeReachable(currentTrackUrl);
      setTotalProbed(1);
      setFailed(ok ? 0 : 1);
      const cachedHit = cached.includes(currentTrackUrl);
      setStatus(ok ? "online" : cachedHit ? "cached" : "offline");
    } else {
      setStatus("online");
    }
    setLoading(false);
  };

  useEffect(() => {
    check();
    const onOn = () => check();
    const onOff = () => setStatus("offline");
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);
    return () => {
      window.removeEventListener("online", onOn);
      window.removeEventListener("offline", onOff);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackUrl]);

  return { status, cachedCount, totalProbed, failed, loading, recheck: check };
}

export async function cacheAudioTrack(url: string): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return false;
    await cache.put(url, res.clone());
    return true;
  } catch {
    return false;
  }
}
