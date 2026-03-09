import AdminChartCard from "@/components/admin/AdminChartCard";
import { HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BUCKETS = [
  { name: "saints-images", desc: "Saint profile images", isPublic: true },
  { name: "scriptures-pdfs", desc: "Scripture PDF files", isPublic: true },
  { name: "scriptures-audio", desc: "Scripture audio files", isPublic: true },
  { name: "temple-images", desc: "Temple photos", isPublic: true },
  { name: "community-media", desc: "User-uploaded media", isPublic: true },
  { name: "audio-library", desc: "Mantras & bhajans", isPublic: true },
];

export default function AdminStorage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">File & Media Storage</h1>
        <p className="text-sm text-muted-foreground">{BUCKETS.length} storage buckets configured</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUCKETS.map(b => (
          <div key={b.name} className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <Badge variant={b.isPublic ? "secondary" : "outline"} className="text-[10px]">
                {b.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold">{b.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
