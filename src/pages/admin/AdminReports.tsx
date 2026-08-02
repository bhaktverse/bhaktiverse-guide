import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, RefreshCw, ExternalLink } from "lucide-react";

const REPORTS = [
  { id: "astro", label: "Astro Accuracy", file: "/reports/ASTRO_ACCURACY_REPORT.md", desc: "Planetary position accuracy vs reference ephemeris" },
  { id: "qa", label: "Platform QA Audit", file: "/reports/PLATFORM_QA_AUDIT_2026.md", desc: "Route-by-route audit with pass/fail outcomes" },
  { id: "scaling", label: "Scaling Plan", file: "/reports/SCALING_PLAN.md", desc: "Capacity plan and load-test findings for 1M users" },
];

/** Minimal, dependency-free markdown renderer for our internal reports. */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: JSX.Element[] = [];
  let table: string[][] = [];
  let inCode = false;
  let code: string[] = [];

  const flushTable = (key: string) => {
    if (!table.length) return;
    const [head, ...rest] = table;
    const body = rest.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c.trim())));
    out.push(
      <div key={key} className="my-4 overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>{head.map((h, i) => <th key={i} className="px-3 py-2 text-left font-semibold">{h.trim()}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} className="border-t border-border/40">
                {r.map((c, ci) => <td key={ci} className="px-3 py-2 align-top">{c.trim()}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("```")) {
      if (inCode) {
        out.push(
          <pre key={`c${i}`} className="my-3 overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = [];
      }
      inCode = !inCode;
      return;
    }
    if (inCode) { code.push(raw); return; }

    if (line.trim().startsWith("|")) {
      table.push(line.trim().replace(/^\||\|$/g, "").split("|"));
      return;
    }
    flushTable(`t${i}`);

    if (!line.trim()) return;
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+\s*/, "");
      const cls = level === 1
        ? "mt-2 mb-3 text-2xl font-bold"
        : level === 2
          ? "mt-6 mb-2 text-xl font-semibold border-b border-border/50 pb-1"
          : "mt-4 mb-1 text-base font-semibold text-primary";
      out.push(<p key={i} className={cls}>{text}</p>);
      return;
    }
    if (/^[-*]\s/.test(line.trim())) {
      out.push(
        <p key={i} className="ml-4 flex gap-2 text-sm text-muted-foreground">
          <span className="text-primary">•</span>
          <span>{line.trim().replace(/^[-*]\s*/, "").replace(/\*\*/g, "")}</span>
        </p>,
      );
      return;
    }
    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={i} className="my-4 border-border/50" />);
      return;
    }
    out.push(<p key={i} className="my-2 text-sm leading-relaxed text-muted-foreground">{line.replace(/\*\*/g, "")}</p>);
  });
  flushTable("t-final");
  return out;
}

export default function AdminReports() {
  const [active, setActive] = useState(REPORTS[0].id);
  const [cache, setCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = REPORTS.find((r) => r.id === active)!;

  const load = async (force = false) => {
    if (cache[active] && !force) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${current.file}?t=${force ? Date.now() : ""}`);
      if (!res.ok) throw new Error(`Report not found (${res.status})`);
      const text = await res.text();
      setCache((c) => ({ ...c, [active]: text }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [active]);

  const body = useMemo(() => (cache[active] ? renderMarkdown(cache[active]) : null), [cache, active]);

  const download = () => {
    const blob = new Blob([cache[active] || ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = current.file.split("/").pop()!;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6 text-primary" /> Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Accuracy, QA and scaling reports rendered in-app.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="min-h-[40px]" onClick={() => load(true)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="min-h-[40px]" onClick={download} disabled={!cache[active]}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button variant="ghost" size="sm" className="min-h-[40px]" asChild>
            <a href={current.file} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Raw
            </a>
          </Button>
        </div>
      </div>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1">
          {REPORTS.map((r) => (
            <TabsTrigger key={r.id} value={r.id} className="text-xs sm:text-sm">{r.label}</TabsTrigger>
          ))}
        </TabsList>

        {REPORTS.map((r) => (
          <TabsContent key={r.id} value={r.id}>
            <Card className="border-border/50 bg-card/70 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {r.label}
                  <Badge variant="outline" className="text-[10px]">{r.file.split("/").pop()}</Badge>
                </CardTitle>
                <CardDescription>{r.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                  </div>
                )}
                {error && !loading && (
                  <p className="text-sm text-destructive">Could not load report: {error}</p>
                )}
                {!loading && !error && (
                  <ScrollArea className="h-[65vh] pr-3">{body}</ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
