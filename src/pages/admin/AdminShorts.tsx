import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Plus, Trash2, Youtube, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getYouTubeThumbnailUrl } from "@/services/youtubeShorts";

export default function AdminShorts() {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [importing, setImporting] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("bhakti_shorts").select("*").order("created_at", { ascending: false });
    setShorts(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (s: any) => {
    await supabase.from("bhakti_shorts").update({ approved: !s.approved }).eq("id", s.id);
    toast.success(s.approved ? "Unapproved" : "Approved"); load();
  };

  const del = async (id: string) => {
    await supabase.from("bhakti_shorts").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  const save = async () => {
    await supabase.from("bhakti_shorts").insert({
      title: form.title, video_url: form.video_url, description: form.description,
      category: form.category || "devotional", approved: true,
    });
    toast.success("Created"); setDialog(false); load();
  };

  const importFromYouTube = async () => {
    if (!youtubeUrl.trim()) return;
    setImporting(true);
    try {
      // Extract video ID
      const match = youtubeUrl.match(/(?:shorts\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (!match) {
        toast.error("Invalid YouTube URL");
        return;
      }
      const videoId = match[1];
      const thumbnail = getYouTubeThumbnailUrl(videoId);

      // Normalize URL to shorts format
      const videoUrl = `https://www.youtube.com/shorts/${videoId}`;

      await supabase.from("bhakti_shorts").insert({
        title: `YouTube Short ${videoId}`,
        video_url: videoUrl,
        thumbnail_url: thumbnail,
        category: "devotional",
        approved: true,
      });
      toast.success("Imported from YouTube!");
      setYoutubeUrl("");
      setImportDialog(false);
      load();
    } catch (err) {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const columns: Column<any>[] = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.category}</Badge> },
    { key: "views_count", label: "Views" },
    { key: "likes_count", label: "Likes" },
    { key: "approved", label: "Status", render: (r) => r.approved ? <Badge className="bg-[hsl(var(--success))] text-[10px]">Approved</Badge> : <Badge variant="destructive" className="text-[10px]">Pending</Badge> },
    { key: "featured", label: "Featured", render: (r) => r.featured ? "★" : "—" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bhakti Shorts</h1>
          <p className="text-sm text-muted-foreground">{shorts.length} videos · {shorts.filter(s => !s.approved).length} pending</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImportDialog(true)}>
            <Youtube className="h-4 w-4 mr-1" /> Import from YouTube
          </Button>
          <Button size="sm" onClick={() => { setForm({}); setDialog(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Short
          </Button>
        </div>
      </div>
      <AdminDataTable
        data={shorts} columns={columns} searchKey="title" loading={loading}
        actions={(row) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleApproval(row)}>
              {row.approved ? <X className="h-4 w-4 text-destructive" /> : <Check className="h-4 w-4 text-[hsl(var(--success))]" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del(row.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      {/* Add Short Dialog */}
      {dialog && (
        <Dialog open onOpenChange={() => setDialog(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Bhakti Short</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label className="text-xs">Title</Label><Input value={form.title ?? ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Video URL</Label><Input value={form.video_url ?? ""} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={form.description ?? ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} /></div>
              <div><Label className="text-xs">Category</Label><Input value={form.category ?? "devotional"} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="mt-1" /></div>
              <Button onClick={save} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Import from YouTube Dialog */}
      {importDialog && (
        <Dialog open onOpenChange={() => setImportDialog(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Import from YouTube</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">Paste a YouTube Shorts URL to auto-import it as a Bhakti Short.</p>
              <div>
                <Label className="text-xs">YouTube URL</Label>
                <Input
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/shorts/..."
                  className="mt-1"
                />
              </div>
              <Button onClick={importFromYouTube} className="w-full" disabled={importing}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Youtube className="h-4 w-4 mr-2" />}
                Import Short
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
