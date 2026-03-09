import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import { Shield, AlertTriangle, Clock } from "lucide-react";

export default function AdminSecurity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_audit_logs" as any).select("*").order("created_at", { ascending: false }).limit(100);
      setLogs((data as any[]) ?? []); setLoading(false);
    };
    load();
  }, []);

  const columns: Column<any>[] = [
    { key: "admin_user_id", label: "Admin", render: (r) => <span className="text-xs font-mono">{r.admin_user_id?.slice(0, 8)}...</span> },
    { key: "action", label: "Action", render: (r) => <Badge variant="outline" className="text-[10px]">{r.action}</Badge> },
    { key: "target_table", label: "Table" },
    { key: "created_at", label: "Time", render: (r) => <span className="text-xs">{new Date(r.created_at).toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Security & Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Track admin actions and system security</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AdminMetricCard title="Audit Logs" value={logs.length} icon={Shield} />
        <AdminMetricCard title="Security Status" value="Healthy" icon={AlertTriangle} />
        <AdminMetricCard title="Last Activity" value={logs[0] ? new Date(logs[0].created_at).toLocaleDateString() : "—"} icon={Clock} />
      </div>
      <AdminDataTable data={logs} columns={columns} searchKey="action" loading={loading} />
    </div>
  );
}
