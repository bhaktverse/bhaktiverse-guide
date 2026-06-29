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
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between gap-2 flex-wrap">
          <span>Audio Library Health <span className="text-muted-foreground font-normal">(30d)</span></span>
          <Badge variant={healthRate >= 90 ? "default" : healthRate >= 70 ? "secondary" : "destructive"} className="text-[10px]">
            {healthRate}% healthy
          </Badge>
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Cached / healed / broken tracks per self-heal run.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <p className="text-xs text-muted-foreground p-3">Loading audio health…</p>
        ) : runs.length === 0 ? (
          <p className="text-xs text-muted-foreground p-6 text-center">No self-heal runs yet. Trigger one from Sync Center.</p>
        ) : (
          <div className="h-48 sm:h-64 w-full -ml-2">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="hHealthy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="hBroken" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="healthy" stackId="1" stroke="hsl(var(--primary))" fill="url(#hHealthy)" />
                <Area type="monotone" dataKey="healed" stackId="1" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent-foreground) / 0.2)" />
                <Area type="monotone" dataKey="broken" stackId="1" stroke="hsl(var(--destructive))" fill="url(#hBroken)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
