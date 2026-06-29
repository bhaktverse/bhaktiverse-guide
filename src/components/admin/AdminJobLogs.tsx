import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, RotateCw, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type JobKind = "ingestion" | "qa" | "audio_heal";

type JobRow = {
  id: string;
  status: string;
  started_at: string;
  finished_at?: string | null;
  duration_ms?: number | null;
  source?: string;
  error?: string | null;
  meta: Record<string, any>;
};

const RETRY_FN: Record<JobKind, string> = {
  ingestion: "ingest-orchestrator",
  qa: "qa-runner",
  audio_heal: "audio-self-heal",
};

export default function AdminJobLogs() {
  const [kind, setKind] = useState<JobKind>("ingestion");
  const [rows, setRows] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let mapped: JobRow[] = [];
    if (kind === "ingestion") {
      const { data } = await supabase.from("ingestion_runs")
        .select("*").order("started_at", { ascending: false }).limit(30);
      mapped = (data ?? []).map((r: any) => ({
        id: r.id, status: r.status, started_at: r.started_at, finished_at: r.finished_at,
        duration_ms: r.duration_ms, source: r.source, error: r.error,
        meta: { inserted: r.inserted_count, updated: r.updated_count, skipped: r.skipped_count, errors: r.error_count, details: r.details },
      }));
    } else if (kind === "qa") {
      const { data } = await supabase.from("qa_runs")
        .select("*").order("started_at", { ascending: false }).limit(30);
      mapped = (data ?? []).map((r: any) => ({
        id: r.id, status: r.status, started_at: r.started_at, finished_at: r.finished_at,
        duration_ms: r.duration_ms, source: r.trigger_kind,
        meta: { total: r.total, passed: r.passed, failed: r.failed, skipped: r.skipped },
      }));
    } else {
      const { data } = await supabase.from("audio_heal_runs")
        .select("*").order("started_at", { ascending: false }).limit(30);
      mapped = (data ?? []).map((r: any) => ({
        id: r.id, status: r.status, started_at: r.started_at, finished_at: r.finished_at,
        duration_ms: r.duration_ms, source: r.trigger_kind, error: r.error,
        meta: { checked: r.total_checked, healthy: r.healthy_count, broken: r.broken_count, healed: r.healed_count, failed: r.failed_count, details: r.details },
      }));
    }
    setRows(mapped);
    setLoading(false);
  }, [kind]);

  useEffect(() => { load(); }, [load]);

  const retry = async (row: JobRow) => {
    const fn = RETRY_FN[kind];
    setBusy(row.id);
    try {
      const { error } = await supabase.functions.invoke(fn, {
        body: kind === "ingestion" && row.source ? { source: row.source } : {},
      });
      if (error) throw error;
      toast.success(`Re-ran ${fn}`);
      await load();
    } catch (e: any) {
      toast.error(`Retry failed: ${e.message ?? "unknown"}`);
    } finally {
      setBusy(null);
    }
  };

  const statusVariant = (s: string) =>
    s === "ok" || s === "passed" || s === "success" ? "default"
      : s === "failed" || s === "error" ? "destructive" : "secondary";

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-sm">Job Logs</CardTitle>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={kind} onValueChange={(v) => setKind(v as JobKind)}>
          <div className="-mx-1 px-1 overflow-x-auto mb-3">
            <TabsList className="w-max">
              <TabsTrigger value="ingestion">Ingestion</TabsTrigger>
              <TabsTrigger value="qa">QA Runner</TabsTrigger>
              <TabsTrigger value="audio_heal">Audio Self-Heal</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={kind} className="m-0">
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {rows.map(r => {
                const isOpen = expanded === r.id;
                return (
                  <div key={r.id} className="border border-border/30 rounded-lg bg-background/40 hover:bg-muted/20 transition-colors">
                    <div className="p-2.5 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setExpanded(isOpen ? null : r.id)} className="text-muted-foreground shrink-0">
                          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                        <Badge variant={statusVariant(r.status)} className="text-[10px] shrink-0">{r.status}</Badge>
                        {r.source && <span className="font-mono text-[11px] truncate max-w-[120px]">{r.source}</span>}
                        <span className="text-muted-foreground text-[10px] ml-auto tabular-nums shrink-0">
                          {format(new Date(r.started_at), "MMM d HH:mm")}
                        </span>
                        <Button size="sm" variant="ghost" className="h-6 px-2 shrink-0" onClick={() => retry(r)} disabled={busy === r.id}>
                          {busy === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground pl-5">
                        {Object.entries(r.meta).filter(([k]) => k !== "details").map(([k, v]) => (
                          <span key={k}><span className="opacity-70">{k}:</span> <span className="font-mono">{String(v ?? 0)}</span></span>
                        ))}
                        <span><span className="opacity-70">dur:</span> <span className="font-mono">{r.duration_ms ?? 0}ms</span></span>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-3 pb-3 text-[11px] text-muted-foreground space-y-1 border-t border-border/20">
                        {r.error && <div className="text-red-500 break-all pt-2">Error: {r.error}</div>}
                        {r.meta.details && (
                          <pre className="bg-muted/40 p-2 rounded overflow-x-auto max-h-[200px] mt-2">
                            {JSON.stringify(r.meta.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {rows.length === 0 && !loading && (
                <p className="text-xs text-muted-foreground p-6 text-center">No {kind.replace("_", " ")} runs yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
