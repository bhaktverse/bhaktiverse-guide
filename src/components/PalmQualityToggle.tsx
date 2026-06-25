import { Zap, Gauge, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePalmQuality, type PalmQuality } from "@/hooks/usePalmQuality";

const ICONS: Record<PalmQuality, any> = { fast: Zap, balanced: Gauge, high: Sparkles };

export default function PalmQualityToggle() {
  const { quality, setQuality } = usePalmQuality();
  return (
    <div className="inline-flex rounded-md border border-border/40 p-0.5 bg-background/60 backdrop-blur-sm">
      {(["fast", "balanced", "high"] as PalmQuality[]).map(q => {
        const Icon = ICONS[q];
        const active = quality === q;
        return (
          <Button
            key={q}
            size="sm"
            variant={active ? "default" : "ghost"}
            className="h-7 px-2 text-[11px] capitalize"
            onClick={() => setQuality(q)}
            title={`Processing quality: ${q}`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {q}
          </Button>
        );
      })}
    </div>
  );
}
