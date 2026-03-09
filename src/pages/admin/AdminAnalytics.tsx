import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminChartCard from "@/components/admin/AdminChartCard";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import { Users, TrendingUp, Flame, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays } from "date-fns";

const COLORS = ["hsl(25,90%,55%)", "hsl(45,85%,60%)", "hsl(320,30%,60%)", "hsl(200,40%,55%)", "hsl(120,35%,50%)", "hsl(0,65%,50%)", "hsl(280,40%,55%)"];

export default function AdminAnalytics() {
  const [userCount, setUserCount] = useState(0);
  const [activityTypes, setActivityTypes] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [activeRatio, setActiveRatio] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      setUserCount(count ?? 0);

      // Activity type distribution
      const { data: activities } = await supabase.from("user_activities").select("activity_type");
      const typeCounts: Record<string, number> = {};
      (activities ?? []).forEach((a: any) => { typeCounts[a.activity_type] = (typeCounts[a.activity_type] ?? 0) + 1; });
      setActivityTypes(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

      // Real growth data from profiles created_at (last 30 days grouped by day)
      const thirtyDaysAgo = subDays(new Date(), 29).toISOString();
      const { data: regs } = await supabase.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo);

      const dayMap: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        dayMap[format(subDays(new Date(), 29 - i), "yyyy-MM-dd")] = 0;
      }
      (regs ?? []).forEach((r: any) => {
        const key = format(new Date(r.created_at), "yyyy-MM-dd");
        if (dayMap[key] !== undefined) dayMap[key]++;
      });
      setGrowthData(Object.entries(dayMap).map(([date, users]) => ({
        date: format(new Date(date), "MMM d"),
        users,
      })));

      // Active ratio: users with activities in last 7 days / total users
      const sevenAgo = subDays(new Date(), 6).toISOString();
      const { data: activeUsers } = await supabase.from("user_activities").select("user_id").gte("created_at", sevenAgo);
      const uniqueActive = new Set((activeUsers ?? []).map((a: any) => a.user_id)).size;
      setActiveRatio(count && count > 0 ? Math.round((uniqueActive / count) * 100) : 0);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Insights</h1>
        <p className="text-sm text-muted-foreground">Platform performance metrics (real data)</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminMetricCard title="Total Users" value={userCount} icon={Users} />
        <AdminMetricCard title="Activity Types" value={activityTypes.length} icon={BarChart3} />
        <AdminMetricCard title="Total Activities" value={activityTypes.reduce((s, a) => s + a.value, 0)} icon={TrendingUp} />
        <AdminMetricCard title="7-Day Active" value={`${activeRatio}%`} subtitle="Active ratio" icon={Flame} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <AdminChartCard title="User Growth (30 Days)" subtitle="Daily registrations">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={growthData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={4} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 2 }} />
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
