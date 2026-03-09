import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setNotifs(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const columns: Column<any>[] = [
    { key: "title", label: "Title" },
    { key: "message", label: "Message", render: (r) => <span className="truncate max-w-[200px] block text-xs">{r.message}</span> },
    { key: "type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
    { key: "read", label: "Read", render: (r) => r.read ? "✓" : "—" },
    { key: "created_at", label: "Date", render: (r) => <span className="text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Notifications System</h1>
        <p className="text-sm text-muted-foreground">{notifs.length} notifications · {notifs.filter(n => !n.read).length} unread</p>
      </div>
      <AdminDataTable data={notifs} columns={columns} searchKey="title" loading={loading} />
    </div>
  );
}
