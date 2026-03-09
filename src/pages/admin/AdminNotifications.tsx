import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "announcement" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(200);
    setNotifs(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  const broadcast = async () => {
    setSending(true);
    // Get all user IDs
    const { data: profiles } = await supabase.from("profiles").select("user_id");
    if (!profiles || profiles.length === 0) { toast.error("No users found"); setSending(false); return; }

    const notifications = profiles.map((p: any) => ({
      user_id: p.user_id,
      title: form.title,
      message: form.message,
      type: form.type,
    }));

    // Insert in batches of 100
    for (let i = 0; i < notifications.length; i += 100) {
      await supabase.from("notifications").insert(notifications.slice(i, i + 100));
    }

    toast.success(`Broadcast sent to ${profiles.length} users`);
    setSending(false); setBroadcastOpen(false);
    setForm({ title: "", message: "", type: "announcement" });
    load();
  };

  const columns: Column<any>[] = [
    { key: "title", label: "Title" },
    { key: "message", label: "Message", render: (r) => <span className="truncate max-w-[200px] block text-xs">{r.message}</span> },
    { key: "type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
    { key: "read", label: "Read", render: (r) => r.read ? "✓" : "—" },
    { key: "created_at", label: "Date", render: (r) => <span className="text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications System</h1>
          <p className="text-sm text-muted-foreground">{notifs.length} notifications · {notifs.filter(n => !n.read).length} unread</p>
        </div>
        <Button size="sm" onClick={() => setBroadcastOpen(true)}><Send className="h-4 w-4 mr-1" /> Broadcast</Button>
      </div>
      <AdminDataTable data={notifs} columns={columns} searchKey="title" loading={loading}
        actions={(row) => (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(row.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      />
      {broadcastOpen && (
        <Dialog open onOpenChange={() => setBroadcastOpen(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Broadcast Notification</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Message</Label><Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="mt-1" rows={3} /></div>
              <div><Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["announcement","festival","reminder","community","system"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={broadcast} disabled={sending || !form.title || !form.message} className="w-full">
                {sending ? "Sending..." : "Send to All Users"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
