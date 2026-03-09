import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABLES = [
  "profiles", "user_roles", "subscriptions", "community_posts", "post_comments",
  "saints", "scriptures", "scripture_chapters", "mantras_library", "audio_library",
  "temples", "calendar_events", "notifications", "palm_reading_history",
  "ai_chat_sessions", "divine_conversations", "user_activities", "spiritual_content",
  "spiritual_faqs", "bhakti_shorts", "daily_devotions", "horoscope_cache",
  "numerology_reports", "mantra_sessions", "achievements", "user_achievements",
  "spiritual_journey", "playlists", "user_favorites", "user_api_usage", "admin_audit_logs", "site_settings",
] as const;

type TableName = typeof TABLES[number];
const PAGE_SIZE = 50;

export default function AdminDatabase() {
  const [table, setTable] = useState<TableName>("profiles");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
      setTotal(count ?? 0);
      const { data: rows } = await supabase.from(table).select("*").range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      setData(rows ?? []);
      setLoading(false);
    };
    load();
  }, [table, page]);

  useEffect(() => { setPage(0); }, [table]);

  const columns = data.length > 0 ? Object.keys(data[0]).slice(0, 6) : [];
  const filtered = search
    ? data.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : data;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportCSV = () => {
    if (data.length === 0) return;
    const allCols = Object.keys(data[0]);
    const rows = data.map(row => allCols.map(c => {
      const v = row[c];
      return typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
    }));
    const csv = [allCols, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${table}-export.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Database Manager</h1>
        <p className="text-sm text-muted-foreground">Browse and inspect database tables</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Select value={table} onValueChange={(v) => setTable(v as TableName)}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TABLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[200px]" />
        </div>
        <Badge variant="outline" className="self-center"><Database className="h-3 w-3 mr-1" />{total} total rows</Badge>
        <Button variant="outline" size="sm" className="h-9 text-xs" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>
      <div className="rounded-lg border border-border/30 overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {columns.map(c => <TableHead key={c} className="text-xs uppercase font-semibold whitespace-nowrap">{c}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">No data</TableCell></TableRow>
            ) : (
              filtered.map((row, i) => (
                <TableRow key={i}>
                  {columns.map(c => (
                    <TableCell key={c} className="text-xs max-w-[200px] truncate">
                      {typeof row[c] === "object" ? JSON.stringify(row[c]).slice(0, 60) : String(row[c] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {page + 1} of {totalPages} · {total} records</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
