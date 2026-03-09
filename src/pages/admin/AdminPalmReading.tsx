import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminChartCard from "@/components/admin/AdminChartCard";
import { Hand, Globe } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";

const COLORS = ["hsl(25,90%,55%)", "hsl(45,85%,60%)", "hsl(320,30%,60%)", "hsl(200,40%,55%)"];

export default function AdminPalmReading() {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("palm_reading_history").select("*").order("created_at", { ascending: false });
      setReadings(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const langDist = readings.reduce((acc: Record<string, number>, r) => {
    const lang = r.language ?? "hi";
    acc[lang] = (acc[lang] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(langDist).map(([name, value]) => ({ name, value }));

  const columns: Column<any>[] = [
    { key: "user_name", label: "User", render: (r) => r.user_name ?? "Anonymous" },
    { key: "palm_type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{r.palm_type ?? "—"}</Badge> },
    { key: "language", label: "Lang", render: (r) => <span className="uppercase text-xs">{r.language ?? "hi"}</span> },
    { key: "is_shared", label: "Shared", render: (r) => r.is_shared ? "✓" : "—" },
    { key: "created_at", label: "Date", render: (r) => <span className="text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Palm Reading System</h1>
        <p className="text-sm text-muted-foreground">{readings.length} total readings</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AdminMetricCard title="Total Readings" value={readings.length} icon={Hand} />
        <AdminMetricCard title="Languages" value={Object.keys(langDist).length} icon={Globe} />
        <AdminMetricCard title="Shared" value={readings.filter(r => r.is_shared).length} icon={Hand} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <AdminChartCard title="Language Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </AdminChartCard>
        <div className="flex flex-col">
          <AdminDataTable data={readings} columns={columns} searchKey="user_name" loading={loading} pageSize={5} />
        </div>
      </div>
    </div>
  );
}
