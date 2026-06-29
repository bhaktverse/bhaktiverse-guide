import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

type Row = {
  quality_preset: string;
  detection_rate: number;
  avg_confidence: number;
  jitter_px: number;
  fps: number;
  frames_total: number;
  created_at: string;
};

type Agg = {
  preset: string;
  samples: number;
  detection_rate: number;
  avg_confidence: number;
  jitter_px: number;
  fps: number;
};

export default function PalmTelemetryPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from("palm_quality_telemetry")
        .select("quality_preset, detection_rate, avg_confidence, jitter_px, fps, frames_total, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(2000);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const presets = ["fast", "balanced", "high"];
  const agg: Agg[] = presets.map(p => {
    const subset = rows.filter(r => r.quality_preset === p);
    const n = subset.length;
    if (n === 0) return { preset: p, samples: 0, detection_rate: 0, avg_confidence: 0, jitter_px: 0, fps: 0 };
    return {
      preset: p,
      samples: n,
      detection_rate: subset.reduce((s, r) => s + r.detection_rate, 0) / n,
      avg_confidence: subset.reduce((s, r) => s + r.avg_confidence, 0) / n,
      jitter_px: subset.reduce((s, r) => s + r.jitter_px, 0) / n,
      fps: subset.reduce((s, r) => s + r.fps, 0) / n,
    };
  });

  const fmt = (n: number, suffix = "") => `${n.toFixed(suffix === "%" ? 0 : 2)}${suffix}`;

  // Daily trend by preset for the past 30 days
  const trend = useMemo(() => {
    const buckets = new Map<string, Record<string, { sum: number; n: number }>>();
    for (const r of rows) {
      const day = r.created_at.slice(0, 10);
      if (!buckets.has(day)) buckets.set(day, { fast: { sum: 0, n: 0 }, balanced: { sum: 0, n: 0 }, high: { sum: 0, n: 0 } });
      const b = buckets.get(day)!;
      const slot = b[r.quality_preset];
      if (slot) { slot.sum += r.detection_rate * 100; slot.n += 1; }
    }
    return Array.from(buckets.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([day, v]) => ({
      day: day.slice(5),
      fast: v.fast.n ? +(v.fast.sum / v.fast.n).toFixed(1) : null,
      balanced: v.balanced.n ? +(v.balanced.sum / v.balanced.n).toFixed(1) : null,
      high: v.high.n ? +(v.high.sum / v.high.n).toFixed(1) : null,
    }));
  }, [rows]);

  const presetAccent: Record<string, string> = {
    fast: "from-primary/20 to-transparent",
    balanced: "from-accent/30 to-transparent",
    high: "from-destructive/20 to-transparent",
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Palm Landmark Accuracy <span className="text-muted-foreground font-normal">(30d)</span></CardTitle>
        <p className="text-[11px] text-muted-foreground">Compare MediaPipe Fast / Balanced / High presets.</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {loading ? (
          <p className="text-xs text-muted-foreground p-3">Loading telemetry…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {agg.map(a => (
                <div key={a.preset} className={`relative overflow-hidden border border-border/40 rounded-xl p-3 space-y-2 bg-gradient-to-br ${presetAccent[a.preset]}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize">{a.preset}</span>
                    <Badge variant="outline" className="text-[10px]">{a.samples} samples</Badge>
                  </div>
                  <Row label="Detection" value={fmt(a.detection_rate * 100, "%")} />
                  <Row label="Confidence" value={fmt(a.avg_confidence)} />
                  <Row label="Jitter" value={`${fmt(a.jitter_px)} px`} />
                  <Row label="FPS" value={fmt(a.fps)} />
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-2">Daily detection rate (%) by preset</p>
              <div className="h-48 sm:h-64 w-full -ml-2">
                <ResponsiveContainer>
                  <LineChart data={trend} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="fast" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" dataKey="balanced" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" dataKey="high" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
