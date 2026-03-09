import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminChartCard from "@/components/admin/AdminChartCard";
import { Bot, MessageSquare, Zap, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AI_MODULES = [
  { key: "pooja_assistant", label: "AI Pooja Assistant", desc: "Step-by-step puja guidance" },
  { key: "palm_reading", label: "AI Palm Reading", desc: "Palm analysis engine" },
  { key: "spiritual_chatbot", label: "Spiritual Chatbot", desc: "General spiritual Q&A" },
  { key: "recommendation", label: "Recommendation Engine", desc: "Personalized content suggestions" },
];

export default function AdminAISystems() {
  const [sessions, setSessions] = useState(0);
  const [conversations, setConversations] = useState(0);
  const [apiUsage, setApiUsage] = useState(0);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("admin_ai_toggles");
    return saved ? JSON.parse(saved) : Object.fromEntries(AI_MODULES.map(m => [m.key, true]));
  });

  useEffect(() => {
    const load = async () => {
      const [s, c, a] = await Promise.all([
        supabase.from("ai_chat_sessions").select("id", { count: "exact", head: true }),
        supabase.from("divine_conversations").select("id", { count: "exact", head: true }),
        supabase.from("user_api_usage").select("id", { count: "exact", head: true }),
      ]);
      setSessions(s.count ?? 0); setConversations(c.count ?? 0); setApiUsage(a.count ?? 0);
    };
    load();
  }, []);

  const handleToggle = (key: string) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    localStorage.setItem("admin_ai_toggles", JSON.stringify(next));
  };

  const chartData = [
    { name: "Pooja", value: Math.floor(Math.random() * 50 + 10) },
    { name: "Palm", value: Math.floor(Math.random() * 40 + 15) },
    { name: "Chat", value: Math.floor(Math.random() * 80 + 20) },
    { name: "Reco", value: Math.floor(Math.random() * 30 + 5) },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">AI Systems Control</h1>
        <p className="text-sm text-muted-foreground">Monitor and manage AI modules</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AdminMetricCard title="Chat Sessions" value={sessions} icon={Bot} />
        <AdminMetricCard title="Conversations" value={conversations} icon={MessageSquare} />
        <AdminMetricCard title="API Usage Records" value={apiUsage} icon={Zap} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <AdminChartCard title="AI Module Toggles">
          <div className="space-y-4">
            {AI_MODULES.map(m => (
              <div key={m.key} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/20">
                <div>
                  <Label className="text-sm font-medium">{m.label}</Label>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <Switch checked={toggles[m.key]} onCheckedChange={() => handleToggle(m.key)} />
              </div>
            ))}
          </div>
        </AdminChartCard>
        <AdminChartCard title="AI Usage by Module">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AdminChartCard>
      </div>
    </div>
  );
}
