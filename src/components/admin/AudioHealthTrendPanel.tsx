import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

type Run = {
  started_at: string;
  total_checked: number | null;
  healthy_count: number | null;
  healed_count: number | null;
  broken_count: number | null;
  failed_count: number | null;
  status: string;
};

export default function AudioHealthTrendPanel() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from("audio_heal_runs")
        .select("started_at,total_checked,healthy_count,healed_count,broken_count,failed_count,status")
        .gte("started_at", since)
        .order("started_at", { ascending: true })
        .limit(200);
      setRuns((data as Run[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const trend = useMemo(() => runs.map(r => ({
    day: r.started_at.slice(5, 10),
    healthy: r.healthy_count ?? 0,
    healed: r.healed_count ?? 0,
    broken: r.broken_count ?? 0,
  })), [runs]);

  const latest = runs[runs.length - 1];
  const total = latest?.total_checked ?? 0;
  const healthRate = total > 0 ? Math.round(((latest!.healthy_count ?? 0) / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Audio Library Health (last 30d)
          <Badge variant={healthRate >= 90 ? "default" : healthRate >= 70 ? "secondary" : "destructive"}>
            {healthRate}% healthy
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Cached / healed / broken track counts per self-heal run.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground p-3">Loading audio health…</p>
        ) : runs.length === 0 ? (
          <p className="text-xs text-muted-foreground p-3">No self-heal runs yet. Trigger one from Sync Center.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="healthy" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                <Area type="monotone" dataKey="healed" stackId="1" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent-foreground) / 0.3)" />
                <Area type="monotone" dataKey="broken" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
