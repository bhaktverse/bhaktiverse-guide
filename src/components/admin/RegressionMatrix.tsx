import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COVERAGE_MATRIX } from "@/lib/regressionMatrix";
import { CheckCircle2, XCircle, MinusCircle, ExternalLink, Search } from "lucide-react";
import { Link } from "react-router-dom";

type ResultRow = { test_name: string; status: string; suite: string; error: string | null };

export default function RegressionMatrix({ runId }: { runId?: string }) {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [filter, setFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  useEffect(() => {
    if (!runId) { setResults([]); return; }
    supabase.from("qa_results").select("test_name, status, suite, error").eq("run_id", runId)
      .then(({ data }) => setResults((data as ResultRow[]) ?? []));
  }, [runId]);

  const byTest = useMemo(() => {
    const m = new Map<string, ResultRow>();
    for (const r of results) m.set(`${r.suite}:${r.test_name}`, r);
    return m;
  }, [results]);

  const areas = useMemo(() => ["all", ...Array.from(new Set(COVERAGE_MATRIX.map(c => c.area)))], []);

  const visible = COVERAGE_MATRIX.filter(e =>
    (areaFilter === "all" || e.area === areaFilter) &&
    (filter === "" || `${e.page} ${e.route}`.toLowerCase().includes(filter.toLowerCase()))
  );

  const totals = visible.reduce((acc, e) => {
    for (const c of e.cases) {
      const r = byTest.get(c.id);
      if (!r) acc.unknown++;
      else if (r.status === "passed") acc.passed++;
      else if (r.status === "failed") acc.failed++;
      else acc.skipped++;
    }
    return acc;
  }, { passed: 0, failed: 0, skipped: 0, unknown: 0 });

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-sm">Regression Coverage Matrix</CardTitle>
          <div className="flex gap-3 text-xs">
            <span className="text-green-500">✓ {totals.passed}</span>
            <span className="text-red-500">✗ {totals.failed}</span>
            <span className="text-muted-foreground">— {totals.skipped}</span>
            <span className="text-muted-foreground">? {totals.unknown}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search page or route…" className="h-8 pl-7 text-xs" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {areas.map(a => (
              <Button key={a} size="sm" variant={areaFilter === a ? "default" : "outline"}
                className="h-7 text-[10px] px-2" onClick={() => setAreaFilter(a)}>
                {a}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
        {visible.map(entry => (
          <div key={entry.route} className="border border-border/40 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="text-[10px]">{entry.area}</Badge>
                <span className="text-sm font-medium truncate">{entry.page}</span>
                <Link to={entry.route} target="_blank"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {entry.route} <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="grid gap-1">
              {entry.cases.map(c => {
                const r = byTest.get(c.id);
                const icon = !r ? <MinusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  : r.status === "passed" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  : r.status === "failed" ? <XCircle className="h-3.5 w-3.5 text-red-500" />
                  : <MinusCircle className="h-3.5 w-3.5 text-muted-foreground" />;
                return (
                  <div key={c.id} className="grid grid-cols-[auto_1fr_2fr_auto] items-center gap-2 text-xs py-1 border-t border-border/20 first:border-0">
                    {icon}
                    <span className="font-mono text-[11px] truncate" title={c.id}>{c.title}</span>
                    <span className="text-muted-foreground truncate" title={c.expected}>{c.expected}</span>
                    <Badge variant="outline" className="text-[9px]">{c.suite}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-xs text-muted-foreground p-4 text-center">No coverage entries match the filter.</p>
        )}
      </CardContent>
    </Card>
  );
}
