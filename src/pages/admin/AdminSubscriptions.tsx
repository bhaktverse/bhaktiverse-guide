import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
      setSubs(data ?? []); setLoading(false);
    };
    load();
  }, []);

  const tiers = subs.reduce((acc: Record<string, number>, s) => {
    acc[s.tier] = (acc[s.tier] ?? 0) + 1; return acc;
  }, {});

  const columns: Column<any>[] = [
    { key: "user_id", label: "User", render: (r) => <span className="text-xs font-mono">{r.user_id.slice(0, 8)}...</span> },
    { key: "tier", label: "Plan", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.tier}</Badge> },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "active" ? "default" : "outline"} className="text-[10px]">{r.status}</Badge> },
    { key: "started_at", label: "Start", render: (r) => <span className="text-xs">{r.started_at ? new Date(r.started_at).toLocaleDateString() : "—"}</span> },
    { key: "expires_at", label: "Expiry", render: (r) => <span className="text-xs">{r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "Never"}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-sm text-muted-foreground">
          {Object.entries(tiers).map(([t, c]) => `${t}: ${c}`).join(" · ") || "No subscriptions"}
        </p>
      </div>
      <AdminDataTable data={subs} columns={columns} loading={loading} />
    </div>
  );
}
