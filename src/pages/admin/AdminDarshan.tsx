import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDarshan() {
  const [temples, setTemples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("temples").select("*").order("name");
    setTemples(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDialog = (item?: any) => {
    setForm(item ?? { location: { city: "", state: "" } });
    setDialog(item ?? "new");
  };

  const save = async () => {
    const payload = {
      name: form.name,
      primary_deity: form.primary_deity,
      tradition: form.tradition,
      live_darshan_url: form.live_darshan_url || null,
      youtube_channel_id: form.youtube_channel_id || null,
      description: form.description,
      location: typeof form.location === "object" ? form.location : { city: form.location },
      verified: form.verified ?? false,
    };
    if (form.id) await supabase.from("temples").update(payload).eq("id", form.id);
    else await supabase.from("temples").insert(payload);
    toast.success(form.id ? "Updated" : "Created"); setDialog(null); load();
  };

  const del = async (id: string) => {
    await supabase.from("temples").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Darshan Management</h1>
          <p className="text-sm text-muted-foreground">{temples.length} temples · {temples.filter(t => t.live_darshan_url).length} with live streams</p>
        </div>
        <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> Add Temple</Button>
      </div>
      <AdminDataTable data={temples} columns={columns} searchKey="name" loading={loading}
        actions={(row) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog(row)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )}
      />
      {dialog && (
        <Dialog open onOpenChange={() => setDialog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} Temple</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label className="text-xs">Name</Label><Input value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Primary Deity</Label><Input value={form.primary_deity ?? ""} onChange={e => setForm(p => ({ ...p, primary_deity: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Tradition</Label><Input value={form.tradition ?? ""} onChange={e => setForm(p => ({ ...p, tradition: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Live Darshan URL</Label><Input value={form.live_darshan_url ?? ""} onChange={e => setForm(p => ({ ...p, live_darshan_url: e.target.value }))} className="mt-1" placeholder="https://youtube.com/..." /></div>
              <div><Label className="text-xs">YouTube Channel ID</Label><Input value={form.youtube_channel_id ?? ""} onChange={e => setForm(p => ({ ...p, youtube_channel_id: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={form.description ?? ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} /></div>
              <Button onClick={save} className="w-full">{form.id ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
