import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("calendar_events").select("*").order("date", { ascending: true });
      setEvents(data ?? []); setLoading(false);
    };
    load();
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold">Calendar & Events</h1>
        <p className="text-sm text-muted-foreground">{events.length} events</p>
      </div>
      <AdminDataTable data={events} columns={columns} searchKey="title" loading={loading} />
    </div>
  );
}
