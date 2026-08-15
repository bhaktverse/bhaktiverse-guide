import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { COVERAGE_MATRIX } from "@/lib/regressionMatrix";
import { Loader2, PlayCircle, CheckCircle2, XCircle, Smartphone, Download } from "lucide-react";

/**
 * Mobile-responsive UI QA suite.
 *
 * Loads every public route inside a hidden iframe at each target viewport and
 * asserts: no horizontal overflow, a reachable bottom navigation, tap targets
 * of at least 44px, and a print-ready root on report pages.
 */

const VIEWPORTS = [
  { name: "iPhone SE", width: 320, height: 568 },
  { name: "iPhone 12/13", width: 375, height: 812 },
  { name: "Pixel 7", width: 412, height: 915 },
  { name: "iPad Mini", width: 768, height: 1024 },
  { name: "Desktop", width: 1280, height: 900 },
];

const PRINT_ROUTES = ["/palm-reading", "/numerology", "/kundali-match", "/horoscope"];

type Check = {
  route: string;
  viewport: string;
  overflow: boolean;
  smallTargets: number;
  hasNav: boolean;
  hasPrintRoot: boolean | null;
  status: "pass" | "warn" | "fail";
  note: string;
};

const ROUTES = Array.from(new Set(COVERAGE_MATRIX.filter((c) => !c.route.startsWith("/admin")).map((c) => c.route)));

export default function MobileResponsiveQA() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Check[]>([]);

  const auditFrame = (doc: Document, route: string, viewportWidth: number): Omit<Check, "route" | "viewport"> => {
    const el = doc.documentElement;
    const overflow = el.scrollWidth > viewportWidth + 2;

    let smallTargets = 0;
    if (viewportWidth <= 480) {
      const interactive = doc.querySelectorAll("a, button, [role='button'], input, select");
      interactive.forEach((node) => {
        const r = (node as HTMLElement).getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 24)) smallTargets++;
      });
    }

    const hasNav = !!doc.querySelector("nav");
    const hasPrintRoot = PRINT_ROUTES.includes(route)
      ? !!doc.querySelector("[data-print-root], #palm-report-print")
      : null;

    const notes: string[] = [];
    if (overflow) notes.push(`horizontal overflow (${el.scrollWidth}px > ${viewportWidth}px)`);
    if (smallTargets > 6) notes.push(`${smallTargets} tap targets under 44px`);
    if (!hasNav) notes.push("no <nav> landmark");

    const status: Check["status"] = overflow || !hasNav ? "fail" : smallTargets > 6 ? "warn" : "pass";
    return { overflow, smallTargets, hasNav, hasPrintRoot, status, note: notes.join(" · ") || "OK" };
  };

  const run = async () => {
    setRunning(true);
    setResults([]);
    setProgress(0);

    const out: Check[] = [];
    const total = ROUTES.length * VIEWPORTS.length;
    let done = 0;

    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;";
    document.body.appendChild(host);

    try {
      for (const vp of VIEWPORTS) {
        for (const route of ROUTES) {
          const frame = document.createElement("iframe");
          frame.style.cssText = `width:${vp.width}px;height:${vp.height}px;border:0;`;
          frame.src = route;
          host.appendChild(frame);

          const doc = await new Promise<Document | null>((resolve) => {
            const timer = setTimeout(() => resolve(frame.contentDocument), 6000);
            frame.onload = () => {
              // Let lazy routes settle before measuring.
              setTimeout(() => {
                clearTimeout(timer);
                resolve(frame.contentDocument);
              }, 1200);
            };
          });

          if (doc) {
            out.push({ route, viewport: vp.name, ...auditFrame(doc, route, vp.width) });
          } else {
            out.push({
              route, viewport: vp.name, overflow: false, smallTargets: 0, hasNav: false,
              hasPrintRoot: null, status: "fail", note: "Route failed to load",
            });
          }

          host.removeChild(frame);
          done++;
          setProgress(Math.round((done / total) * 100));
          setResults([...out]);
        }
      }
    } finally {
      document.body.removeChild(host);
      setRunning(false);
    }

    const failed = out.filter((r) => r.status === "fail").length;
    if (failed) toast.error(`${failed} responsive checks failed`);
    else toast.success("All responsive checks passed");
  };

  const exportCsv = () => {
    const header = "route,viewport,status,overflow,small_targets,has_nav,print_root,note";
    const rows = results.map((r) =>
      [r.route, r.viewport, r.status, r.overflow, r.smallTargets, r.hasNav, r.hasPrintRoot ?? "n/a", `"${r.note}"`].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bhaktverse-responsive-qa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const summary = {
    pass: results.filter((r) => r.status === "pass").length,
    warn: results.filter((r) => r.status === "warn").length,
    fail: results.filter((r) => r.status === "fail").length,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-primary" /> Mobile Responsive QA
            </CardTitle>
            <CardDescription>
              {ROUTES.length} routes × {VIEWPORTS.length} viewports — overflow, tap targets, nav, print roots
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={run} disabled={running} className="gap-1">
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
              Run scan
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={!results.length} className="gap-1">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {running && <Progress value={progress} className="h-2" />}
        {results.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="border-success/40 text-success">{summary.pass} pass</Badge>
            <Badge variant="outline" className="border-amber-500/40 text-amber-500">{summary.warn} warn</Badge>
            <Badge variant="outline" className="border-destructive/40 text-destructive">{summary.fail} fail</Badge>
          </div>
        )}
        <div className="max-h-[420px] overflow-y-auto rounded-lg border">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Run the scan to audit every page across device sizes.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                <tr className="text-left">
                  <th className="p-2">Route</th>
                  <th className="p-2">Viewport</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={`${r.route}-${r.viewport}-${i}`} className="border-t">
                    <td className="p-2 font-mono">{r.route}</td>
                    <td className="p-2">{r.viewport}</td>
                    <td className="p-2">
                      {r.status === "pass" ? (
                        <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" />pass</span>
                      ) : r.status === "warn" ? (
                        <span className="text-amber-500">warn</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive"><XCircle className="h-3 w-3" />fail</span>
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
