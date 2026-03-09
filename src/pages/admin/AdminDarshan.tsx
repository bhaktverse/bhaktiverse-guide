import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function AdminDarshan() {
  const [temples, setTemples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("temples").select("*").order("name");
      setTemples(data ?? []); setLoading(false);
    };
    load();
  }, []);

  const columns: Column<any>[] = [
    { key: "name", label: "Temple" },
    { key: "primary_deity", label: "Deity" },
    { key: "tradition", label: "Tradition" },
    { key: "live_darshan_url", label: "Live Stream", render: (r) => r.live_darshan_url ? (
      <a href={r.live_darshan_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
        Live <ExternalLink className="h-3 w-3" />
      </a>
    ) : <span className="text-xs text-muted-foreground">—</span> },
    { key: "verified", label: "Status", render: (r) => r.verified ? <Badge className="bg-[hsl(var(--success))] text-[10px]">Verified</Badge> : <Badge variant="outline" className="text-[10px]">Pending</Badge> },
    { key: "rating", label: "Rating", render: (r) => `${r.rating ?? 0}★` },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Live Darshan Management</h1>
        <p className="text-sm text-muted-foreground">{temples.length} temples · {temples.filter(t => t.live_darshan_url).length} with live streams</p>
      </div>
      <AdminDataTable data={temples} columns={columns} searchKey="name" loading={loading} />
    </div>
  );
}
