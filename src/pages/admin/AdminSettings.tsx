import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FEATURES = [
  { key: "palm_reading", label: "Palm Reading", desc: "AI-powered palm analysis" },
  { key: "numerology", label: "Numerology", desc: "Numerology reports" },
  { key: "kundali_match", label: "Kundali Matching", desc: "Compatibility analysis" },
  { key: "community", label: "Community Wall", desc: "User posts and discussions" },
  { key: "bhakti_shorts", label: "Bhakti Shorts", desc: "Short devotional videos" },
  { key: "live_darshan", label: "Live Darshan", desc: "Temple live streams" },
  { key: "ai_chat", label: "AI Chat", desc: "Spiritual chatbot" },
  { key: "donations", label: "Donations", desc: "Temple donation system" },
];

export default function AdminSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FEATURES.map(f => [f.key, true]))
  );
  const [siteName, setSiteName] = useState("BhaktVerse");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings" as any).select("*");
      if (data) {
        const map: Record<string, any> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        if (map.feature_toggles) setToggles(map.feature_toggles);
        if (map.site_name) setSiteName(map.site_name);
      }
      setLoaded(true);
    };
    load();
  }, []);

  const handleToggle = async (key: string) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    await supabase.from("site_settings" as any).upsert({ key: "feature_toggles", value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
    toast.success(`${key} ${next[key] ? "enabled" : "disabled"}`);
  };

  const saveSiteName = async () => {
    await supabase.from("site_settings" as any).upsert({ key: "site_name", value: siteName, updated_at: new Date().toISOString() }, { onConflict: "key" });
    toast.success("Site name saved");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration and feature toggles{loaded ? "" : " (loading...)"}</p>
      </div>

      <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Site Configuration</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Site Name</Label>
            <div className="flex gap-2 mt-1">
              <Input value={siteName} onChange={e => setSiteName(e.target.value)} />
              <Button size="sm" onClick={saveSiteName}>Save</Button>
            </div>
          </div>
          <div>
            <Label className="text-xs">Default Theme</Label>
            <Input value="dark" disabled className="mt-1" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Feature Toggles</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURES.map(f => (
            <div key={f.key} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/20">
              <div>
                <Label className="text-sm">{f.label}</Label>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
              <Switch checked={toggles[f.key]} onCheckedChange={() => handleToggle(f.key)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
