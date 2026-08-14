import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  AUDIO_CACHE_NAME, listCachedUrls, removeCachedTrack, clearAudioCache, getAudioCacheStats,
} from "@/lib/audioCache";
import { getQueue, clearQueue, processQueue, subscribeQueue, type QueueItem } from "@/lib/audioDownloadQueue";
import { HardDrive, Trash2, RefreshCw, Loader2, ListRestart, Database } from "lucide-react";

const fmtBytes = (b: number) => {
  if (!b) return "0 MB";
  const mb = b / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
};

const prettyName = (u: string) => {
  try {
    return decodeURIComponent(new URL(u).pathname.split("/").pop() || u);
  } catch {
    return u;
  }
};

/** Settings surface: inspect and clear individual offline caches. */
export default function OfflineCacheSettings() {
  const [tracks, setTracks] = useState<string[]>([]);
  const [stats, setStats] = useState({ count: 0, bytes: 0 });
  const [quota, setQuota] = useState<{ usage: number; quota: number } | null>(null);
  const [assetCaches, setAssetCaches] = useState<string[]>([]);
  const [pending, setPending] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setTracks(await listCachedUrls());
    setStats(await getAudioCacheStats());
    setPending(getQueue());
    try {
      if (typeof caches !== "undefined") {
        const names = await caches.keys();
        setAssetCaches(names.filter((n) => n !== AUDIO_CACHE_NAME));
      }
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        setQuota({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
      }
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    refresh();
    return subscribeQueue((s) => setPending(s.pending));
  }, []);

  const usedPct = quota?.quota ? Math.min(100, (quota.usage / quota.quota) * 100) : 0;

  const handleClearTracks = async () => {
    setBusy(true);
    await clearAudioCache();
    await refresh();
    setBusy(false);
    toast.success("Offline tracks cleared");
  };

  const handleClearAssets = async () => {
    setBusy(true);
    try {
      await Promise.all(assetCaches.map((n) => caches.delete(n)));
      toast.success("App asset caches cleared");
    } catch {
      toast.error("Could not clear asset caches");
    }
    await refresh();
    setBusy(false);
  };

  const handleFullRefresh = async () => {
    setBusy(true);
    try {
      if (typeof caches !== "undefined") {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      clearQueue();
      toast.success("All offline data cleared — reloading");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error("Full refresh failed");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4 text-primary" /> Storage
          </CardTitle>
          <CardDescription>
            {stats.count} offline tracks · {fmtBytes(stats.bytes)} cached
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quota && (
            <>
              <Progress value={usedPct} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {fmtBytes(quota.usage)} used of {fmtBytes(quota.quota)} available
              </p>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={refresh} disabled={busy} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearTracks} disabled={busy || !stats.count} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Clear tracks
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearAssets} disabled={busy || !assetCaches.length} className="gap-1">
              <Database className="h-3.5 w-3.5" /> Clear app assets
            </Button>
            <Button size="sm" variant="destructive" onClick={handleFullRefresh} disabled={busy} className="gap-1">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ListRestart className="h-3.5 w-3.5" />}
              Full offline refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending downloads</CardTitle>
            <CardDescription>Resume automatically when you are back online.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.slice(0, 8).map((p) => (
              <div key={p.url} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{p.title || prettyName(p.url)}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">retry {p.attempts}</Badge>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => processQueue()} className="gap-1">
                <RefreshCw className="h-3.5 w-3.5" /> Resume now
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { clearQueue(); refresh(); }}>
                Cancel all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cached tracks</CardTitle>
          <CardDescription>Remove individual files to free space.</CardDescription>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracks cached yet.</p>
          ) : (
            <ScrollArea className="h-56 pr-2">
              <div className="space-y-2">
                {tracks.map((u) => (
                  <div key={u} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                    <span className="truncate text-sm">{prettyName(u)}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={async () => {
                        await removeCachedTrack(u);
                        await refresh();
                      }}
                      aria-label="Remove cached track"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
