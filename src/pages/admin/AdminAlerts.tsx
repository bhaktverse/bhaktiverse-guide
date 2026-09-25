import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import { AlertTriangle, RefreshCw, WifiOff, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Event = {
  id: string;
  user_id: string | null;
  event_type: string;
  outcome: string | null;
  attempt: number;
  track_title: string | null;
  track_url: string | null;
  was_online: boolean | null;
  created_at: string;
};

type Bucket = {
  day: string;
  fallbacks: number;
  retry_failures: number;
  cache_misses: number;
  errors: number;
};

const CHART_CONFIG = {
  fallbacks: { label: "Fallback to network", color: "hsl(var(--primary))" },
  retry_failures: { label: "Retry failures", color: "hsl(var(--destructive))" },
  cache_misses: { label: "Offline cache misses", color: "hsl(var(--muted-foreground))" },
};

const FALLBACK_TYPES = ["fallback_network", "fallback_mirror"];
const WINDOW_DAYS = 14;

export default function AdminAlerts() {
  const [events, setEvents] = useState<Event[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();
    const { data } = await supabase
      .from("audio_reliability_events")
      .select("id, user_id, event_type, outcome, attempt, track_title, track_url, was_online, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    const rows = (data as Event[]) || [];
    setEvents(rows);

    const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", ids.slice(0, 200));
      setNames(Object.fromEntries((profiles || []).map((p: any) => [p.user_id, p.name])));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runScan = async () => {
    setRunning(true);
    const { error } = await supabase.functions.invoke("telemetry-alerts", { body: { manual: true } });
    setRunning(false);
    if (error) toast.error("Alert scan failed — check edge function logs");
    else {
      toast.success("Telemetry alert scan triggered");
      load();
    }
  };

  const isRetryFailure = (e: Event) =>
    (e.event_type === "retry" && e.outcome === "failure") || e.event_type === "playback_error";
  const isCacheMiss = (e: Event) => e.event_type === "cache_miss";
  const isFallback = (e: Event) => FALLBACK_TYPES.includes(e.event_type);

  const trend: Bucket[] = useMemo(() => {
    const map = new Map<string, Bucket>();
    for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(d, { day: d.slice(5), fallbacks: 0, retry_failures: 0, cache_misses: 0, errors: 0 });
    }
    for (const e of events) {
      const key = e.created_at.slice(0, 10);
      const b = map.get(key);
      if (!b) continue;
      if (isFallback(e)) b.fallbacks++;
      if (isRetryFailure(e)) b.retry_failures++;
      if (isCacheMiss(e)) b.cache_misses++;
      if (e.event_type === "playback_error") b.errors++;
    }
    return Array.from(map.values());
  }, [events]);

  const affected = useMemo(() => {
    const map = new Map<string, { user_id: string; fallbacks: number; retries: number; misses: number; last: string }>();
    for (const e of events) {
      if (!e.user_id) continue;
      if (!isFallback(e) && !isRetryFailure(e) && !isCacheMiss(e)) continue;
      const row = map.get(e.user_id) || { user_id: e.user_id, fallbacks: 0, retries: 0, misses: 0, last: e.created_at };
      if (isFallback(e)) row.fallbacks++;
      if (isRetryFailure(e)) row.retries++;
      if (isCacheMiss(e)) row.misses++;
      if (e.created_at > row.last) row.last = e.created_at;
      map.set(e.user_id, row);
    }
    return Array.from(map.values())
      .sort((a, b) => b.fallbacks + b.retries + b.misses - (a.fallbacks + a.retries + a.misses))
      .slice(0, 25);
  }, [events]);

  const totals = {
    fallbacks: events.filter(isFallback).length,
    retries: events.filter(isRetryFailure).length,
    misses: events.filter(isCacheMiss).length,
  };
  const cacheHits = events.filter((e) => e.event_type === "cache_hit").length;
  const missRate = cacheHits + totals.misses ? Math.round((totals.misses / (cacheHits + totals.misses)) * 100) : 0;

  const recentRuns = events
    .filter((e) => isFallback(e) || isRetryFailure(e) || isCacheMiss(e))
    .slice(0, 40);

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" /> Telemetry Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Reliability trends over the last {WINDOW_DAYS} days with per-user drill-down.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={runScan} disabled={running} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} /> Run alert scan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard title="Fallback to network" value={totals.fallbacks} icon={WifiOff} />
        <AdminMetricCard title="Retry failures" value={totals.retries} icon={RotateCcw} />
        <AdminMetricCard title="Offline cache misses" value={totals.misses} icon={AlertTriangle} />
        <AdminMetricCard title="Cache miss rate" value={`${missRate}%`} icon={Users} />
      </div>

      <Card className="border-border/50 bg-card/70 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alert trend</CardTitle>
          <CardDescription>Daily counts per alert category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area type="monotone" dataKey="fallbacks" stroke="var(--color-fallbacks)" fill="var(--color-fallbacks)" fillOpacity={0.18} />
              <Area type="monotone" dataKey="retry_failures" stroke="var(--color-retry_failures)" fill="var(--color-retry_failures)" fillOpacity={0.18} />
              <Area type="monotone" dataKey="cache_misses" stroke="var(--color-cache_misses)" fill="var(--color-cache_misses)" fillOpacity={0.18} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Affected devotees</TabsTrigger>
          <TabsTrigger value="runs">Recent events</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="border-border/50 bg-card/70 backdrop-blur">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/40">
                    <th className="text-left p-3">Devotee</th>
                    <th className="text-right p-3">Fallbacks</th>
                    <th className="text-right p-3">Retry failures</th>
                    <th className="text-right p-3">Cache misses</th>
                    <th className="text-right p-3">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {affected.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No reliability alerts in this window 🎉</td></tr>
                  )}
                  {affected.map((u) => (
                    <tr key={u.user_id} className="border-b border-border/20">
                      <td className="p-3">
                        <span className="font-medium">{names[u.user_id] || "Devotee"}</span>
                        <span className="block text-[11px] text-muted-foreground font-mono">{u.user_id.slice(0, 8)}…</span>
                      </td>
                      <td className="p-3 text-right">{u.fallbacks}</td>
                      <td className="p-3 text-right">{u.retries}</td>
                      <td className="p-3 text-right">{u.misses}</td>
                      <td className="p-3 text-right text-xs text-muted-foreground">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u.user_id)} aria-label={`View reliability details for ${names[u.user_id] || "devotee"}`}>
                          {new Date(u.last).toLocaleString()}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs">
          <Card className="border-border/50 bg-card/70 backdrop-blur">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/40">
                    <th className="text-left p-3">When</th>
                    <th className="text-left p-3">Event</th>
                    <th className="text-left p-3">Track</th>
                    <th className="text-right p-3">Attempt</th>
                    <th className="text-right p-3">Online</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((e) => (
                    <tr key={e.id} className="border-b border-border/20">
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge variant={isRetryFailure(e) ? "destructive" : "secondary"} className="text-[10px]">
                          {e.event_type}
                        </Badge>
                      </td>
                      <td className="p-3 max-w-[220px] truncate">{e.track_title || "—"}</td>
                      <td className="p-3 text-right">{e.attempt}</td>
                      <td className="p-3 text-right">{e.was_online === false ? "offline" : "online"}</td>
                    </tr>
                  ))}
                  {recentRuns.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No recent alert events.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={selectedUser !== null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedUser ? names[selectedUser] || "Devotee" : "Reliability details"}</SheetTitle>
            <SheetDescription>Audio reliability events recorded in the last {WINDOW_DAYS} days.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {events.filter((event) => event.user_id === selectedUser && (isFallback(event) || isRetryFailure(event) || isCacheMiss(event))).map((event) => (
              <div key={event.id} className="border-b border-border/50 pb-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={isRetryFailure(event) ? "destructive" : "secondary"}>{event.event_type}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 font-medium">{event.track_title || "Unknown track"}</p>
                <p className="text-xs text-muted-foreground">{event.outcome || "No outcome recorded"} · attempt {event.attempt} · {event.was_online === false ? "offline" : "online"}</p>
                {event.track_url && <p className="mt-1 break-all text-xs text-muted-foreground">{event.track_url}</p>}
              </div>
            ))}
            {selectedUser && !events.some((event) => event.user_id === selectedUser && (isFallback(event) || isRetryFailure(event) || isCacheMiss(event))) && (
              <p className="text-sm text-muted-foreground">No matching audio reliability events.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
