import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  pageSize?: number;
  actions?: (row: T) => React.ReactNode;
  loading?: boolean;
  bulkActions?: (selectedIds: string[]) => React.ReactNode;
  enableExport?: boolean;
  enableBulkSelect?: boolean;
}

export default function AdminDataTable<T extends Record<string, any>>({
  data, columns, searchKey, pageSize = 10, actions, loading,
  bulkActions, enableExport = true, enableBulkSelect = false,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = searchKey
    ? data.filter((row) => String(row[searchKey] ?? "").toLowerCase().includes(search.toLowerCase()))
    : data;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const allPageSelected = paged.length > 0 && paged.every(r => selectedIds.has(r.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allPageSelected) {
      paged.forEach(r => next.delete(r.id));
    } else {
      paged.forEach(r => next.add(r.id));
    }
    setSelectedIds(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const exportCSV = () => {
    const headers = columns.map(c => c.label);
    const rows = filtered.map(row => columns.map(c => {
      const val = row[c.key];
      return typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
    }));
    const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {searchKey && (
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 h-9 bg-muted/50"
            />
          </div>
        )}
        {enableExport && filtered.length > 0 && (
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
        )}
        {enableBulkSelect && selectedIds.size > 0 && bulkActions && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
            {bulkActions(Array.from(selectedIds))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {enableBulkSelect && (
                <TableHead className="w-10">
                  <Checkbox checked={allPageSelected} onCheckedChange={toggleAll} />
                </TableHead>
              )}
              {columns.map((c) => (
                <TableHead key={c.key} className="text-xs uppercase tracking-wider font-semibold">{c.label}</TableHead>
              ))}
              {actions && <TableHead className="text-xs uppercase tracking-wider font-semibold">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length + (actions ? 1 : 0) + (enableBulkSelect ? 1 : 0)} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : paged.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + (actions ? 1 : 0) + (enableBulkSelect ? 1 : 0)} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow key={row.id ?? i} className="hover:bg-muted/20 transition-colors">
                  {enableBulkSelect && (
                    <TableCell><Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => toggleOne(row.id)} /></TableCell>
                  )}
                  {columns.map((c) => (
                    <TableCell key={c.key} className="text-sm">
                      {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                    </TableCell>
                  ))}
                  {actions && <TableCell>{actions(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} records · Page {page + 1}/{totalPages}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
