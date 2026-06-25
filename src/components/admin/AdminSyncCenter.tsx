import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Music, Wrench } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type IngestRun = {
  id: string; source: string; status: string;
  inserted_count: number; updated_count: number; skipped_count: number; error_count: number;
  duration_ms: number | null; started_at: string;
};

const QUICK_ACTIONS: Array<{ fn: string; label: string; icon: any }> = [
  { fn: "ingest-orchestrator", label: "Run Full Ingestion Pipeline", icon: Database },
  { fn: "audio-self-heal", label: "Self-Heal Audio Library", icon: Music },
  { fn: "check-audio-health", label: "Quick Audio Health Check", icon: Wrench },
];

export default function AdminSyncCenter() {
  const [runs, setRuns] = useState<IngestRun[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("ingestion_runs").select("*").order("started_at", { ascending: false }).limit(15);
    setRuns((data as IngestRun[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const trigger = async (fn: string, label: string) => {
    setBusy(fn);
    try {
      const { data, error } = await supabase.functions.invoke(fn);
      if (error) throw error;
      toast.success(`${label} complete`, { description: JSON.stringify(data).slice(0, 200) });
      await load();
    } catch (e: any) {
      toast.error(`${label} failed: ${e.message ?? "unknown"}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Wrench className="h-4 w-4" /> Sync Center & Self-Healing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-2">
          {QUICK_ACTIONS.map(a => (
            <Button key={a.fn} variant="outline" onClick={() => trigger(a.fn, a.label)} disabled={busy === a.fn} className="justify-start">
              {busy === a.fn ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <a.icon className="h-4 w-4 mr-2" />}
              <span className="text-xs">{a.label}</span>
            </Button>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Recent ingestion runs</p>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {runs.map(r => (
              <div key={r.id} className="flex items-center gap-2 p-2 text-xs border-b border-border/20 last:border-0">
                <Badge variant={r.status === "ok" ? "default" : "destructive"} className="text-[10px]">{r.status}</Badge>
                <span className="font-mono">{r.source}</span>
                <span className="text-muted-foreground">+{r.inserted_count} ↑{r.updated_count} ⊘{r.skipped_count}</span>
                <span className="text-muted-foreground ml-auto">{r.duration_ms ?? 0}ms</span>
                <span className="text-muted-foreground">{format(new Date(r.started_at), "MMM d HH:mm")}</span>
              </div>
            ))}
            {runs.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">No ingestion runs yet.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
