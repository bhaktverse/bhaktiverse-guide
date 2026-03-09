import { useState } from "react";
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
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("admin_feature_toggles");
    return saved ? JSON.parse(saved) : Object.fromEntries(FEATURES.map(f => [f.key, true]));
  });
  const [siteName, setSiteName] = useState("BhaktVerse");

  const handleToggle = (key: string) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    localStorage.setItem("admin_feature_toggles", JSON.stringify(next));
    toast.success(`${key} ${next[key] ? "enabled" : "disabled"}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration and feature toggles</p>
      </div>

      <div className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Site Configuration</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Site Name</Label>
            <Input value={siteName} onChange={e => setSiteName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Default Theme</Label>
            <Input value="dark" disabled />
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
