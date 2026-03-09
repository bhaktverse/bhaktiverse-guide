import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminChartCard from "@/components/admin/AdminChartCard";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import { Users, TrendingUp, Flame, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(25,90%,55%)", "hsl(45,85%,60%)", "hsl(320,30%,60%)", "hsl(200,40%,55%)", "hsl(120,35%,50%)", "hsl(0,65%,50%)", "hsl(280,40%,55%)"];

export default function AdminAnalytics() {
  const [userCount, setUserCount] = useState(0);
  const [activityTypes, setActivityTypes] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      setUserCount(count ?? 0);

      const { data: activities } = await supabase.from("user_activities").select("activity_type");
      const typeCounts: Record<string, number> = {};
      (activities ?? []).forEach((a: any) => { typeCounts[a.activity_type] = (typeCounts[a.activity_type] ?? 0) + 1; });
      setActivityTypes(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

      // Simulated growth data (would need aggregation query in prod)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      setGrowthData(months.map((m, i) => ({ month: m, users: Math.floor(Math.random() * 50 * (i + 1)) + 10 })));
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Insights</h1>
        <p className="text-sm text-muted-foreground">Platform performance metrics</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminMetricCard title="Total Users" value={userCount} icon={Users} />
        <AdminMetricCard title="Activity Types" value={activityTypes.length} icon={BarChart3} />
        <AdminMetricCard title="Growth" value="+12%" subtitle="This month" icon={TrendingUp} />
        <AdminMetricCard title="Engagement" value="78%" subtitle="Active ratio" icon={Flame} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <AdminChartCard title="User Growth" subtitle="Monthly registrations">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={growthData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </AdminChartCard>
        <AdminChartCard title="Feature Usage" subtitle="Activity distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={activityTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {activityTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </AdminChartCard>
      </div>
    </div>
  );
}
