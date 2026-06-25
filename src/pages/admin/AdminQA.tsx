import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlayCircle, CheckCircle2, XCircle, MinusCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AdminSyncCenter from "@/components/admin/AdminSyncCenter";

type Run = {
  id: string; status: string; total: number; passed: number; failed: number; skipped: number;
  duration_ms: number | null; started_at: string; finished_at: string | null; trigger_kind: string;
};
type Result = {
  id: string; suite: string; test_name: string; status: string;
  duration_ms: number | null; error: string | null;
};

export default function AdminQA() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: rs } = await supabase.from("qa_runs").select("*").order("started_at", { ascending: false }).limit(20);
    setRuns((rs as Run[]) ?? []);
    if (rs?.[0]) {
      setActiveRun(rs[0] as Run);
      const { data: rr } = await supabase.from("qa_results").select("*").eq("run_id", rs[0].id).order("status", { ascending: false });
      setResults((rr as Result[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runQA = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("qa-runner");
      if (error) throw error;
      toast.success(`QA complete: ${data.passed}/${data.total} passed`);
      await load();
    } catch (e: any) {
      toast.error(`QA failed: ${e.message ?? "unknown"}`);
    } finally {
      setRunning(false);
    }
  };

  const selectRun = async (r: Run) => {
    setActiveRun(r);
    const { data: rr } = await supabase.from("qa_results").select("*").eq("run_id", r.id).order("status", { ascending: false });
    setResults((rr as Result[]) ?? []);
  };

  const passRate = activeRun && activeRun.total > 0 ? Math.round((activeRun.passed / activeRun.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">QA & System Health</h1>
          <p className="text-sm text-muted-foreground">End-to-end regression tests across routes, edge functions, and DB.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={runQA} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
            Run QA Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pass Rate</p>
          <p className="text-3xl font-bold">{passRate}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Passed</p>
          <p className="text-3xl font-bold text-green-500">{activeRun?.passed ?? 0}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-3xl font-bold text-red-500">{activeRun?.failed ?? 0}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Skipped</p>
          <p className="text-3xl font-bold text-muted-foreground">{activeRun?.skipped ?? 0}</p>
        </CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">Recent Runs</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {runs.map(r => (
              <button key={r.id} onClick={() => selectRun(r)}
                className={`w-full text-left p-3 rounded border transition ${activeRun?.id === r.id ? "border-primary bg-primary/5" : "border-border/40 hover:border-border"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs">{format(new Date(r.started_at), "MMM d, HH:mm")}</span>
                  <Badge variant={r.status === "passed" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.passed}/{r.total} • {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : "—"} • {r.trigger_kind}
                </p>
              </button>
            ))}
            {runs.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">No runs yet. Click "Run QA Now".</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Test Results {activeRun && <span className="text-xs text-muted-foreground font-normal">— {format(new Date(activeRun.started_at), "PPp")}</span>}</CardTitle></CardHeader>
          <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
            {results.map(r => (
              <div key={r.id} className="flex items-center gap-2 p-2 text-xs border-b border-border/20 last:border-0">
                {r.status === "passed" ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : r.status === "failed" ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  : <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0" />}
                <Badge variant="outline" className="text-[10px]">{r.suite}</Badge>
                <span className="font-mono">{r.test_name}</span>
                <span className="text-muted-foreground ml-auto">{r.duration_ms}ms</span>
                {r.error && <span className="text-red-500 max-w-[220px] truncate" title={r.error}>{r.error}</span>}
              </div>
            ))}
            {results.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">Select a run to view results.</p>}
          </CardContent>
        </Card>
      </div>

      <AdminSyncCenter />
    </div>
  );
}
