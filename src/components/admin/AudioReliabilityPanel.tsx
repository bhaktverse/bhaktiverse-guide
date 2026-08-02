import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CloudDownload, WifiOff, RotateCcw, AlertTriangle } from "lucide-react";

type Row = { event_type: string; outcome: string | null; created_at: string; was_online: boolean | null };

const CONFIG = {
  count: { label: "Events", color: "hsl(var(--primary))" },
};

export default function AudioReliabilityPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from("audio_reliability_events")
        .select("event_type, outcome, created_at, was_online")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);
      setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const count = (t: string | string[]) =>
    rows.filter((r) => (Array.isArray(t) ? t.includes(r.event_type) : r.event_type === t)).length;

  const cacheHits = count("cache_hit");
  const networkPlays = count("network_play");
  const fallbacks = count(["fallback_mirror", "fallback_network"]);
  const retries = count("retry");
  const errors = count("playback_error");
  const recovered = count("recovered");
  const hitRate = cacheHits + networkPlays ? Math.round((cacheHits / (cacheHits + networkPlays)) * 100) : 0;
  const recoveryRate = errors ? Math.round((recovered / errors) * 100) : 100;

  const chartData = [
    { name: "Cache hits", count: cacheHits },
    { name: "Network", count: networkPlays },
    { name: "Fallbacks", count: fallbacks },
    { name: "Retries", count: retries },
    { name: "Errors", count: errors },
    { name: "Recovered", count: recovered },
  ];

  if (loading) return <Skeleton className="h-72 w-full rounded-xl" />;

  return (
    <Card className="border-border/50 bg-card/70 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CloudDownload className="h-5 w-5 text-primary" /> Audio Reliability (7 days)
        </CardTitle>
        <CardDescription>Offline cache hits, retry outcomes and network fallbacks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Cache hit rate" value={`${hitRate}%`} icon={<WifiOff className="h-4 w-4" />} />
          <Stat label="Retries" value={retries} icon={<RotateCcw className="h-4 w-4" />} />
          <Stat label="Errors" value={errors} icon={<AlertTriangle className="h-4 w-4" />} />
          <Stat label="Recovery rate" value={`${recoveryRate}%`} icon={<CloudDownload className="h-4 w-4" />} />
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No playback telemetry recorded yet.</p>
        ) : (
          <ChartContainer config={CONFIG} className="h-64 w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} interval={0} angle={-15} dy={8} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{rows.length} events</Badge>
          <Badge variant="secondary">{rows.filter((r) => r.was_online === false).length} offline sessions</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
