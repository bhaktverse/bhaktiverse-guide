import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlayCircle, CheckCircle2, XCircle, MinusCircle, RefreshCw, Activity, ShieldCheck, AlertTriangle, Gauge } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AdminSyncCenter from "@/components/admin/AdminSyncCenter";
import RegressionMatrix from "@/components/admin/RegressionMatrix";
import AdminJobLogs from "@/components/admin/AdminJobLogs";
import PalmTelemetryPanel from "@/components/admin/PalmTelemetryPanel";
import AudioHealthTrendPanel from "@/components/admin/AudioHealthTrendPanel";
import AudioReliabilityPanel from "@/components/admin/AudioReliabilityPanel";


type Run = {
  id: string; status: string; total: number; passed: number; failed: number; skipped: number;
  duration_ms: number | null; started_at: string; finished_at: string | null; trigger_kind: string;
};
type Result = {
  id: string; suite: string; test_name: string; status: string;
  duration_ms: number | null; error: string | null;
};

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: React.ReactNode; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-4 sm:p-5">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-30 ${accent}`} />
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

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
    <div className="space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-card/60 to-card/40 backdrop-blur-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> QA & System Health
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              End-to-end regression across routes, edge functions, and DB invariants.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="flex-1 sm:flex-none">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={runQA} disabled={running} className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80">
              {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
              Run QA Now
            </Button>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Gauge} label="Pass Rate" value={<span className={passRate >= 90 ? "text-green-500" : passRate >= 70 ? "text-yellow-500" : "text-red-500"}>{passRate}%</span>} accent="bg-primary" />
        <StatCard icon={CheckCircle2} label="Passed" value={<span className="text-green-500">{activeRun?.passed ?? 0}</span>} accent="bg-green-500" />
        <StatCard icon={XCircle} label="Failed" value={<span className="text-red-500">{activeRun?.failed ?? 0}</span>} accent="bg-red-500" />
        <StatCard icon={AlertTriangle} label="Skipped" value={<span className="text-muted-foreground">{activeRun?.skipped ?? 0}</span>} accent="bg-muted-foreground" />
      </div>

      <Tabs defaultValue="results">
        <div className="-mx-1 px-1 overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="results"><Activity className="h-3.5 w-3.5 mr-1.5" />Results</TabsTrigger>
            <TabsTrigger value="matrix">Coverage</TabsTrigger>
            <TabsTrigger value="jobs">Job Logs</TabsTrigger>
            <TabsTrigger value="palm">Telemetry</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="results" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1 border-border/40 bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Runs</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {runs.map(r => (
                  <button key={r.id} onClick={() => selectRun(r)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${activeRun?.id === r.id ? "border-primary bg-primary/10 shadow-sm" : "border-border/40 hover:border-border hover:bg-muted/30"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{format(new Date(r.started_at), "MMM d, HH:mm")}</span>
                      <Badge variant={r.status === "passed" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {r.passed}/{r.total} • {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : "—"} • {r.trigger_kind}
                    </p>
                  </button>
                ))}
                {runs.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">No runs yet. Click "Run QA Now".</p>}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-border/40 bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Test Results
                  {activeRun && <span className="block sm:inline sm:ml-2 text-xs text-muted-foreground font-normal">{format(new Date(activeRun.started_at), "PPp")}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
                {results.map(r => (
                  <div key={r.id} className="flex items-center gap-2 p-2 text-xs border-b border-border/20 last:border-0 hover:bg-muted/30 rounded">
                    {r.status === "passed" ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : r.status === "failed" ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      : <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <Badge variant="outline" className="text-[10px] shrink-0">{r.suite}</Badge>
                    <span className="font-mono truncate flex-1 min-w-0" title={r.test_name}>{r.test_name}</span>
                    <span className="text-muted-foreground tabular-nums shrink-0 hidden sm:inline">{r.duration_ms}ms</span>
                    {r.error && <span className="text-red-500 max-w-[140px] sm:max-w-[220px] truncate hidden md:inline" title={r.error}>{r.error}</span>}
                  </div>
                ))}
                {results.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">Select a run to view results.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <RegressionMatrix runId={activeRun?.id} />
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <AdminJobLogs />
        </TabsContent>

        <TabsContent value="palm" className="mt-4 space-y-4">
          <PalmTelemetryPanel />
          <AudioHealthTrendPanel />
          <AudioReliabilityPanel />
        </TabsContent>


        <TabsContent value="sync" className="mt-4">
          <AdminSyncCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
