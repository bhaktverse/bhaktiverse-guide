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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("calendar_events").select("*").order("date", { ascending: true });
    setEvents(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDialog = (item?: any) => {
    setForm(item ?? { event_type: "festival", reminder_enabled: true });
    setDialog(item ?? "new");
  };

  const save = async () => {
    const payload = { title: form.title, event_type: form.event_type, date: form.date, time: form.time || null, description: form.description, significance: form.significance, is_recurring: form.is_recurring ?? false, reminder_enabled: form.reminder_enabled ?? true };
    if (form.id) await supabase.from("calendar_events").update(payload).eq("id", form.id);
    else await supabase.from("calendar_events").insert(payload);
    toast.success(form.id ? "Updated" : "Created"); setDialog(null); load();
  };

  const del = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  const columns: Column<any>[] = [
    { key: "title", label: "Event" },
    { key: "event_type", label: "Type", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.event_type}</Badge> },
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString() },
    { key: "time", label: "Time", render: (r) => r.time ?? "All day" },
    { key: "is_recurring", label: "Recurring", render: (r) => r.is_recurring ? "✓" : "—" },
    { key: "reminder_enabled", label: "Reminder", render: (r) => r.reminder_enabled ? "🔔" : "—" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar & Events</h1>
          <p className="text-sm text-muted-foreground">{events.length} events</p>
        </div>
        <Button size="sm" onClick={() => openDialog()}><Plus className="h-4 w-4 mr-1" /> Add Event</Button>
      </div>
      <AdminDataTable data={events} columns={columns} searchKey="title" loading={loading}
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
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} Event</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label className="text-xs">Title</Label><Input value={form.title ?? ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Type</Label>
                <Select value={form.event_type ?? "festival"} onValueChange={v => setForm(p => ({ ...p, event_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["festival","vrat","ekadashi","amavasya","purnima","personal"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.date ?? ""} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Time</Label><Input type="time" value={form.time ?? ""} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={form.description ?? ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} /></div>
              <div><Label className="text-xs">Significance</Label><Textarea value={form.significance ?? ""} onChange={e => setForm(p => ({ ...p, significance: e.target.value }))} className="mt-1" rows={2} /></div>
              <Button onClick={save} className="w-full">{form.id ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
