import { useAudioHealth } from "@/hooks/useAudioHealth";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, HardDrive, Loader2 } from "lucide-react";

export default function AudioSyncIndicator({ url, className = "" }: { url?: string | null; className?: string }) {
  const { status, cachedCount, loading, failed } = useAudioHealth(url);

  const cfg = loading
    ? { Icon: Loader2, label: "Checking", variant: "secondary" as const, spin: true }
    : status === "online"
    ? { Icon: Wifi, label: failed ? "Streaming (degraded)" : "Online", variant: failed ? "destructive" as const : "default" as const, spin: false }
    : status === "cached"
    ? { Icon: HardDrive, label: `Cached (${cachedCount})`, variant: "secondary" as const, spin: false }
    : { Icon: WifiOff, label: "Offline", variant: "destructive" as const, spin: false };

  const { Icon } = cfg;
  return (
    <Badge variant={cfg.variant} className={`text-[10px] gap-1 ${className}`} title={`Cached tracks: ${cachedCount}`}>
      <Icon className={`h-3 w-3 ${cfg.spin ? "animate-spin" : ""}`} />
      {cfg.label}
    </Badge>
  );
}
