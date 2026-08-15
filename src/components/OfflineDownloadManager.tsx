import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  cacheAudioTrack, removeCachedTrack, listCachedUrls, clearAudioCache,
} from "@/lib/audioCache";
import { trackAudioEvent } from "@/lib/audioTelemetry";
import { CloudDownload, HardDrive, Trash2, CheckCircle2, Loader2, WifiOff } from "lucide-react";

export interface DownloadableTrack {
  id: string;
  title: string;
  artist?: string;
  category?: string;
  audio_url: string;
}

interface Props {
  tracks: DownloadableTrack[];
  /** Optional named groups (playlists) for bulk selection. */
  playlists?: { name: string; trackIds: string[] }[];
}

const fmtBytes = (b: number) => {
  if (!b) return "0 MB";
  const mb = b / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
};

export default function OfflineDownloadManager({ tracks, playlists = [] }: Props) {
  const [cached, setCached] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quota, setQuota] = useState<{ usage: number; quota: number } | null>(null);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  const refresh = async () => {
    const urls = await listCachedUrls();
    setCached(new Set(urls));
    try {
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
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const isCached = (url: string) => cached.has(url);
  const cachedCount = useMemo(
    () => tracks.filter((t) => isCached(t.audio_url)).length,
    [tracks, cached],
  );
  const usedPct = quota && quota.quota ? Math.min(100, (quota.usage / quota.quota) * 100) : 0;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectPlaylist = (ids: string[]) => {
    setSelected(new Set(ids.filter((id) => tracks.some((t) => t.id === id))));
  };

  const downloadSelected = async () => {
    const list = tracks.filter((t) => selected.has(t.id) && !isCached(t.audio_url));
    if (!list.length) {
      toast.info("Nothing new to download — selection is already offline.");
      return;
    }
    if (!online) {
      // Queue now, resume automatically when connectivity returns.
      enqueueDownloads(list.map((t) => ({ url: t.audio_url, title: t.title })));
      toast.info(`${list.length} tracks queued — they'll download when you're back online.`);
      setSelected(new Set());
      return;
    }
    setBusy(true);
    setProgress(0);
    let ok = 0;
    const failed: typeof list = [];
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const success = await cacheAudioTrack(t.audio_url);
      if (success) ok++;
      else failed.push(t);
      trackAudioEvent({
        event_type: success ? "cache_store" : "playback_error",
        track_title: t.title,
        track_url: t.audio_url,
        outcome: success ? "success" : "failure",
        detail: { source: "download_manager" },
      });
      setProgress(Math.round(((i + 1) / list.length) * 100));
    }
    // Anything that failed is retried in the background (survives restarts).
    if (failed.length) {
      enqueueDownloads(failed.map((t) => ({ url: t.audio_url, title: t.title })));
    }
    await refresh();
    setBusy(false);
    setSelected(new Set());
    toast.success(
      failed.length
        ? `${ok}/${list.length} saved · ${failed.length} queued for background retry`
        : `${ok}/${list.length} tracks saved for offline listening`,
    );
  };

    await refresh();
    setBusy(false);
    setSelected(new Set());
    toast.success(`${ok}/${list.length} tracks saved for offline listening`);
  };

  const removeOne = async (t: DownloadableTrack) => {
    await removeCachedTrack(t.audio_url);
    await refresh();
    toast.success(`Removed "${t.title}" from offline storage`);
  };

  const clearAll = async () => {
    await clearAudioCache();
    await refresh();
    toast.success("Offline audio cleared");
  };

  return (
    <Card className="border-border/50 bg-card/70 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CloudDownload className="h-5 w-5 text-primary" />
              Offline Downloads
            </CardTitle>
            <CardDescription>
              Save bhajans and mantras to listen without internet.
            </CardDescription>
          </div>
          <Badge variant={online ? "secondary" : "destructive"} className="gap-1">
            {online ? <CheckCircle2 className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Storage */}
        <div className="rounded-lg border border-border/50 p-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" /> Device storage
            </span>
            <span className="font-medium">
              {quota ? `${fmtBytes(quota.usage)} of ${fmtBytes(quota.quota)}` : "Not reported"}
            </span>
          </div>
          <Progress value={usedPct} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {cachedCount} of {tracks.length} tracks available offline
          </p>
        </div>

        {/* Playlists */}
        {playlists.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {playlists.map((p) => (
              <Button
                key={p.name}
                size="sm"
                variant="outline"
                className="min-h-[36px]"
                onClick={() => selectPlaylist(p.trackIds)}
              >
                {p.name} ({p.trackIds.length})
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set(tracks.map((t) => t.id)))}>
              Select all
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        )}

        {/* Track list */}
        <ScrollArea className="h-64 rounded-lg border border-border/50">
          <div className="divide-y divide-border/40">
            {tracks.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No tracks loaded yet.</p>
            )}
            {tracks.map((t) => {
              const done = isCached(t.audio_url);
              return (
                <div key={t.id} className="flex items-center gap-3 p-3">
                  <Checkbox
                    checked={selected.has(t.id)}
                    onCheckedChange={() => toggle(t.id)}
                    aria-label={`Select ${t.title}`}
                    className="h-5 w-5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.artist || "Unknown"} {t.category ? `· ${t.category}` : ""}
                    </p>
                  </div>
                  {done ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" /> Offline
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9"
                        aria-label={`Remove ${t.title} from offline`}
                        onClick={() => removeOne(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Streaming</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {busy && <Progress value={progress} className="h-2" />}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="min-h-[44px] flex-1" onClick={downloadSelected} disabled={busy || !selected.size}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudDownload className="mr-2 h-4 w-4" />}
            Download {selected.size ? `${selected.size} selected` : "selection"}
          </Button>
          <Button variant="outline" className="min-h-[44px]" onClick={clearAll} disabled={busy}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear offline data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
