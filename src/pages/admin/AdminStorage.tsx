import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardDrive, FolderOpen, Trash2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const BUCKETS = [
  { name: "saints-images", desc: "Saint profile images" },
  { name: "scriptures-pdfs", desc: "Scripture PDF files" },
  { name: "scriptures-audio", desc: "Scripture audio files" },
  { name: "temple-images", desc: "Temple photos" },
  { name: "community-media", desc: "User-uploaded media" },
  { name: "audio-library", desc: "Mantras & bhajans" },
];

interface StorageFile {
  name: string;
  id?: string;
  metadata?: any;
  created_at?: string;
}

export default function AdminStorage() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load file counts for each bucket
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const b of BUCKETS) {
        const { data } = await supabase.storage.from(b.name).list("", { limit: 1000 });
        counts[b.name] = (data ?? []).filter(f => f.name !== ".emptyFolderPlaceholder").length;
      }
      setFileCounts(counts);
    };
    loadCounts();
  }, []);

  const loadFiles = async (bucket: string) => {
    setLoading(true); setSelectedBucket(bucket);
    const { data } = await supabase.storage.from(bucket).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    setFiles((data ?? []).filter(f => f.name !== ".emptyFolderPlaceholder"));
    setLoading(false);
  };

  const deleteFile = async (name: string) => {
    if (!selectedBucket) return;
    const { error } = await supabase.storage.from(selectedBucket).remove([name]);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted"); loadFiles(selectedBucket);
  };

  if (selectedBucket) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedBucket(null)}><ChevronLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedBucket}</h1>
            <p className="text-sm text-muted-foreground">{files.length} files</p>
          </div>
        </div>
        <div className="rounded-lg border border-border/30 divide-y divide-border/20">
          {loading ? <p className="p-6 text-center text-muted-foreground">Loading...</p> :
            files.length === 0 ? <p className="p-6 text-center text-muted-foreground">Empty bucket</p> :
            files.map(f => (
              <div key={f.name} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                <div>
                  <p className="text-sm font-medium truncate max-w-[300px]">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{f.created_at ? new Date(f.created_at).toLocaleString() : ""}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteFile(f.name)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">File & Media Storage</h1>
        <p className="text-sm text-muted-foreground">{BUCKETS.length} storage buckets</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUCKETS.map(b => (
          <div
            key={b.name}
            className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 hover:border-primary/20 transition-all cursor-pointer"
            onClick={() => loadFiles(b.name)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10"><HardDrive className="h-5 w-5 text-primary" /></div>
              <Badge variant="secondary" className="text-[10px]">{fileCounts[b.name] ?? "..."} files</Badge>
            </div>
            <h3 className="text-sm font-semibold">{b.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-xs p-0 h-auto text-primary">
              <FolderOpen className="h-3 w-3 mr-1" /> Browse files
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
