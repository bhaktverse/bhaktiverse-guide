import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminChartCard from "@/components/admin/AdminChartCard";
import { IndianRupee, CreditCard, TrendingUp } from "lucide-react";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";

export default function AdminDonations() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
      setSubs(data ?? []); setLoading(false);
    };
    load();
  }, []);

  const premiumCount = subs.filter(s => s.tier !== "free" && s.status === "active").length;

  const columns: Column<any>[] = [
    { key: "user_id", label: "User ID", render: (r) => <span className="text-xs font-mono">{r.user_id.slice(0, 8)}...</span> },
    { key: "tier", label: "Tier", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.tier}</Badge> },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "active" ? "default" : "outline"} className="text-[10px]">{r.status}</Badge> },
    { key: "started_at", label: "Started", render: (r) => <span className="text-xs">{r.started_at ? new Date(r.started_at).toLocaleDateString() : "—"}</span> },
    { key: "expires_at", label: "Expires", render: (r) => <span className="text-xs">{r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Donations & Payments</h1>
        <p className="text-sm text-muted-foreground">Financial overview (Stripe integration pending)</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AdminMetricCard title="Total Subscriptions" value={subs.length} icon={CreditCard} />
        <AdminMetricCard title="Active Premium" value={premiumCount} icon={TrendingUp} />
        <AdminMetricCard title="Revenue" value="₹0" subtitle="Stripe pending" icon={IndianRupee} />
      </div>
      <AdminDataTable data={subs} columns={columns} loading={loading} pageSize={10} />
    </div>
  );
}
