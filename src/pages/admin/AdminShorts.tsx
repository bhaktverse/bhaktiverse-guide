import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminShorts() {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("bhakti_shorts").select("*").order("created_at", { ascending: false });
    setShorts(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (s: any) => {
    await supabase.from("bhakti_shorts").update({ approved: !s.approved }).eq("id", s.id);
    toast.success(s.approved ? "Unapproved" : "Approved");
    load();
  };

  const columns: Column<any>[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.category}</Badge> },
    { key: "views_count", label: "Views" },
    { key: "likes_count", label: "Likes" },
    { key: "approved", label: "Status", render: (r) => r.approved ? <Badge className="bg-[hsl(var(--success))] text-[10px]">Approved</Badge> : <Badge variant="destructive" className="text-[10px]">Pending</Badge> },
    { key: "featured", label: "Featured", render: (r) => r.featured ? "★" : "—" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Bhakti Shorts</h1>
        <p className="text-sm text-muted-foreground">{shorts.length} videos · {shorts.filter(s => !s.approved).length} pending</p>
      </div>
      <AdminDataTable
        data={shorts} columns={columns} searchKey="title" loading={loading}
        actions={(row) => (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleApproval(row)}>
            {row.approved ? <X className="h-4 w-4 text-destructive" /> : <Check className="h-4 w-4 text-[hsl(var(--success))]" />}
          </Button>
        )}
      />
    </div>
  );
}
