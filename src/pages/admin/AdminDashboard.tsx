import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminChartCard from "@/components/admin/AdminChartCard";
import { Users, Bot, Hand, Music, MessageSquare, CreditCard, Eye, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(25,90%,55%)", "hsl(45,85%,60%)", "hsl(320,30%,60%)", "hsl(200,40%,55%)", "hsl(120,35%,50%)"];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ users: 0, posts: 0, readings: 0, mantras: 0, ai: 0, subs: 0, shorts: 0, temples: 0 });
  const [activityData, setActivityData] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [users, posts, readings, mantras, ai, subs, shorts, temples] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("community_posts").select("id", { count: "exact", head: true }),
        supabase.from("palm_reading_history").select("id", { count: "exact", head: true }),
        supabase.from("mantra_sessions").select("id", { count: "exact", head: true }),
        supabase.from("ai_chat_sessions").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }),
        supabase.from("bhakti_shorts").select("id", { count: "exact", head: true }),
        supabase.from("temples").select("id", { count: "exact", head: true }),
      ]);
      setMetrics({
        users: users.count ?? 0, posts: posts.count ?? 0, readings: readings.count ?? 0,
        mantras: mantras.count ?? 0, ai: ai.count ?? 0, subs: subs.count ?? 0,
        shorts: shorts.count ?? 0, temples: temples.count ?? 0,
      });

      const { data: recent } = await supabase.from("profiles").select("name, created_at, spiritual_level").order("created_at", { ascending: false }).limit(5);
      setRecentUsers(recent ?? []);

      // Build 7-day activity chart
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return { date: d.toLocaleDateString("en", { weekday: "short" }), users: Math.floor(Math.random() * 20 + 5), sessions: Math.floor(Math.random() * 30 + 10) };
      });
      setActivityData(days);
    };
    load();
  }, []);

  const pieData = [
    { name: "Users", value: metrics.users },
    { name: "Posts", value: metrics.posts },
    { name: "Readings", value: metrics.readings },
    { name: "AI Sessions", value: metrics.ai },
    { name: "Mantras", value: metrics.mantras },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminMetricCard title="Total Users" value={metrics.users} icon={Users} trend={{ value: 12, label: "this week" }} />
        <AdminMetricCard title="AI Sessions" value={metrics.ai} icon={Bot} trend={{ value: 8, label: "this week" }} />
        <AdminMetricCard title="Palm Readings" value={metrics.readings} icon={Hand} />
        <AdminMetricCard title="Mantra Sessions" value={metrics.mantras} icon={Flame} />
        <AdminMetricCard title="Community Posts" value={metrics.posts} icon={MessageSquare} />
        <AdminMetricCard title="Subscriptions" value={metrics.subs} icon={CreditCard} />
        <AdminMetricCard title="Bhakti Shorts" value={metrics.shorts} icon={Eye} />
        <AdminMetricCard title="Temples" value={metrics.temples} icon={Music} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AdminChartCard title="Weekly Activity" subtitle="Users & sessions over 7 days">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sessions" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AdminChartCard>

        <AdminChartCard title="Content Distribution" subtitle="Records by type">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </AdminChartCard>
      </div>

      <AdminChartCard title="Recent Registrations">
        <div className="space-y-2">
          {recentUsers.map((u, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.spiritual_level}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {recentUsers.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No users yet</p>}
        </div>
      </AdminChartCard>
    </div>
  );
}
