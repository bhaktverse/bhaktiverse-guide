import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminContent() {
  const [mantras, setMantras] = useState<any[]>([]);
  const [audio, setAudio] = useState<any[]>([]);
  const [scriptures, setScriptures] = useState<any[]>([]);
  const [saints, setSaints] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ type: string; item?: any } | null>(null);

  const runSync = async (fn: 'sync-archive-audio' | 'sync-wikipedia-saints' | 'check-audio-health', label: string) => {
    setSyncing(fn);
    try {
      const { data, error } = await supabase.functions.invoke(fn);
      if (error) throw error;
      if (fn === 'check-audio-health') {
        toast.success(`${label}: ${data?.ok ?? 0} OK, ${data?.broken ?? 0} broken / ${data?.checked ?? 0} checked`);
      } else {
        toast.success(`${label}: +${data?.inserted_count ?? 0} added, ${data?.updated_count ?? 0} updated, ${data?.skipped_count ?? 0} skipped`);
      }
      load();
    } catch (e: any) {
      toast.error(`${label} failed: ${e?.message ?? 'unknown error'}`);
    } finally {
      setSyncing(null);
    }
  };

  const load = async () => {
    setLoading(true);
    const [m, a, s, sa, f] = await Promise.all([
      supabase.from("mantras_library").select("*").order("created_at", { ascending: false }),
      supabase.from("audio_library").select("*").order("created_at", { ascending: false }),
      supabase.from("scriptures").select("*").order("created_at", { ascending: false }),
      supabase.from("saints").select("*").order("created_at", { ascending: false }),
      supabase.from("spiritual_faqs").select("*").order("created_at", { ascending: false }),
    ]);
    setMantras(m.data ?? []); setAudio(a.data ?? []); setScriptures(s.data ?? []);
    setSaints(sa.data ?? []); setFaqs(f.data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteRecord = async (table: string, id: string) => {
    await supabase.from(table as any).delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  const mantraColumns: Column<any>[] = [
    { key: "deity", label: "Deity" },
    { key: "mantra", label: "Mantra", render: (r) => <span className="truncate max-w-[200px] block text-xs">{r.mantra}</span> },
    { key: "planet", label: "Planet", render: (r) => <Badge variant="outline" className="text-[10px]">{r.planet}</Badge> },
    { key: "repetitions", label: "Reps" },
  ];
  const audioColumns: Column<any>[] = [
    { key: "title", label: "Title" },
    { key: "artist", label: "Artist" },
    { key: "category", label: "Category", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.category}</Badge> },
    { key: "language", label: "Lang" },
    { key: "duration", label: "Duration", render: (r) => `${Math.floor(r.duration / 60)}:${String(r.duration % 60).padStart(2, "0")}` },
  ];
  const scriptureColumns: Column<any>[] = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "tradition", label: "Tradition" },
    { key: "total_chapters", label: "Chapters" },
    { key: "difficulty_level", label: "Level", render: (r) => <Badge variant="outline" className="text-[10px]">{r.difficulty_level}</Badge> },
  ];
  const saintColumns: Column<any>[] = [
    { key: "name", label: "Name" },
    { key: "tradition", label: "Tradition" },
    { key: "birth_year", label: "Born" },
    { key: "verified", label: "Verified", render: (r) => r.verified ? <Badge className="bg-[hsl(var(--success))] text-[10px]">✓</Badge> : <Badge variant="outline" className="text-[10px]">No</Badge> },
  ];
  const faqColumns: Column<any>[] = [
    { key: "question", label: "Question", render: (r) => <span className="truncate max-w-[250px] block text-xs">{r.question}</span> },
    { key: "category", label: "Category", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.category}</Badge> },
    { key: "verified_by_scholar", label: "Verified", render: (r) => r.verified_by_scholar ? "✓" : "—" },
  ];

  const makeActions = (table: string, type: string) => (row: any) => (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialog({ type, item: row })}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRecord(table, row.id)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spiritual Content</h1>
          <p className="text-sm text-muted-foreground">Manage mantras, audio, scriptures, saints & FAQs</p>
        </div>
      </div>
      <Tabs defaultValue="mantras">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="mantras">Mantras ({mantras.length})</TabsTrigger>
          <TabsTrigger value="audio">Audio ({audio.length})</TabsTrigger>
          <TabsTrigger value="scriptures">Scriptures ({scriptures.length})</TabsTrigger>
          <TabsTrigger value="saints">Saints ({saints.length})</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mantras">
          <div className="mb-3"><Button size="sm" onClick={() => setDialog({ type: "mantra" })}><Plus className="h-4 w-4 mr-1" /> Add Mantra</Button></div>
          <AdminDataTable data={mantras} columns={mantraColumns} searchKey="deity" loading={loading} actions={makeActions("mantras_library", "mantra")} />
        </TabsContent>
        <TabsContent value="audio">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setDialog({ type: "audio" })}><Plus className="h-4 w-4 mr-1" /> Add Audio</Button>
            <Button size="sm" variant="outline" disabled={syncing === 'sync-archive-audio'} onClick={() => runSync('sync-archive-audio', 'Archive.org sync')}>
              {syncing === 'sync-archive-audio' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Sync from Archive.org
            </Button>
          </div>
          <AdminDataTable data={audio} columns={audioColumns} searchKey="title" loading={loading} actions={makeActions("audio_library", "audio")} />
        </TabsContent>
        <TabsContent value="scriptures">
          <div className="mb-3"><Button size="sm" onClick={() => setDialog({ type: "scripture" })}><Plus className="h-4 w-4 mr-1" /> Add Scripture</Button></div>
          <AdminDataTable data={scriptures} columns={scriptureColumns} searchKey="title" loading={loading} actions={makeActions("scriptures", "scripture")} />
        </TabsContent>
        <TabsContent value="saints">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setDialog({ type: "saint" })}><Plus className="h-4 w-4 mr-1" /> Add Saint</Button>
            <Button size="sm" variant="outline" disabled={syncing === 'sync-wikipedia-saints'} onClick={() => runSync('sync-wikipedia-saints', 'Wikipedia sync')}>
              {syncing === 'sync-wikipedia-saints' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Sync from Wikipedia
            </Button>
          </div>
          <AdminDataTable data={saints} columns={saintColumns} searchKey="name" loading={loading} actions={makeActions("saints", "saint")} />
        </TabsContent>
        <TabsContent value="faqs">
          <div className="mb-3"><Button size="sm" onClick={() => setDialog({ type: "faq" })}><Plus className="h-4 w-4 mr-1" /> Add FAQ</Button></div>
          <AdminDataTable data={faqs} columns={faqColumns} searchKey="question" loading={loading} actions={makeActions("spiritual_faqs", "faq")} />
        </TabsContent>
      </Tabs>

      {dialog && (
        <ContentDialog
          type={dialog.type}
          item={dialog.item}
          onClose={() => setDialog(null)}
          onSave={() => { setDialog(null); load(); }}
        />
      )}
    </div>
  );
}

function ContentDialog({ type, item, onClose, onSave }: { type: string; item?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState<Record<string, any>>(item ?? {});
  const isEdit = !!item;
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    try {
      if (type === "mantra") {
        const payload = { mantra: form.mantra, deity: form.deity, planet: form.planet || "sun", meaning: form.meaning, repetitions: parseInt(form.repetitions) || 108 };
        if (isEdit) await supabase.from("mantras_library").update(payload).eq("id", item.id);
        else await supabase.from("mantras_library").insert(payload);
      } else if (type === "audio") {
        const payload = { title: form.title, artist: form.artist, category: form.category || "mantra", language: form.language || "hi", duration: parseInt(form.duration) || 0, audio_url: form.audio_url };
        if (isEdit) await supabase.from("audio_library").update(payload).eq("id", item.id);
        else await supabase.from("audio_library").insert(payload);
      } else if (type === "scripture") {
        const payload = { title: form.title, author: form.author, tradition: form.tradition, total_chapters: parseInt(form.total_chapters) || 1, difficulty_level: form.difficulty_level || "beginner", description: form.description };
        if (isEdit) await supabase.from("scriptures").update(payload).eq("id", item.id);
        else await supabase.from("scriptures").insert(payload);
      } else if (type === "saint") {
        const payload = { name: form.name, tradition: form.tradition, birth_year: parseInt(form.birth_year) || null, biography: form.biography, key_teachings: form.key_teachings, verified: form.verified ?? false };
        if (isEdit) await supabase.from("saints").update(payload).eq("id", item.id);
        else await supabase.from("saints").insert(payload);
      } else if (type === "faq") {
        const payload = { question: form.question, answer: form.answer, category: form.category || "rituals", difficulty_level: form.difficulty_level || "beginner" };
        if (isEdit) await supabase.from("spiritual_faqs").update(payload).eq("id", item.id);
        else await supabase.from("spiritual_faqs").insert(payload);
      }
      toast.success(isEdit ? "Updated" : "Created");
      onSave();
    } catch { toast.error("Failed to save"); }
  };

  const titles: Record<string, string> = { mantra: "Mantra", audio: "Audio Track", scripture: "Scripture", saint: "Saint", faq: "FAQ" };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} {titles[type]}</DialogTitle></DialogHeader>
        <div className="space-y-3 pt-2">
          {type === "mantra" && <>
            <Field label="Deity" value={form.deity} onChange={v => set("deity", v)} />
            <Field label="Mantra Text" value={form.mantra} onChange={v => set("mantra", v)} textarea />
            <Field label="Meaning" value={form.meaning} onChange={v => set("meaning", v)} textarea />
            <SelectField label="Planet" value={form.planet} onChange={v => set("planet", v)} options={["sun","moon","mars","mercury","jupiter","venus","saturn","rahu","ketu"]} />
            <Field label="Repetitions" value={form.repetitions} onChange={v => set("repetitions", v)} type="number" />
          </>}
          {type === "audio" && <>
            <Field label="Title" value={form.title} onChange={v => set("title", v)} />
            <Field label="Artist" value={form.artist} onChange={v => set("artist", v)} />
            <SelectField label="Category" value={form.category} onChange={v => set("category", v)} options={["mantra","bhajan","aarti","meditation","story","discourse"]} />
            <Field label="Audio URL" value={form.audio_url} onChange={v => set("audio_url", v)} />
            <Field label="Language" value={form.language} onChange={v => set("language", v)} />
            <Field label="Duration (seconds)" value={form.duration} onChange={v => set("duration", v)} type="number" />
          </>}
          {type === "scripture" && <>
            <Field label="Title" value={form.title} onChange={v => set("title", v)} />
            <Field label="Author" value={form.author} onChange={v => set("author", v)} />
            <Field label="Tradition" value={form.tradition} onChange={v => set("tradition", v)} />
            <Field label="Total Chapters" value={form.total_chapters} onChange={v => set("total_chapters", v)} type="number" />
            <SelectField label="Difficulty" value={form.difficulty_level} onChange={v => set("difficulty_level", v)} options={["beginner","intermediate","advanced"]} />
            <Field label="Description" value={form.description} onChange={v => set("description", v)} textarea />
          </>}
          {type === "saint" && <>
            <Field label="Name" value={form.name} onChange={v => set("name", v)} />
            <Field label="Tradition" value={form.tradition} onChange={v => set("tradition", v)} />
            <Field label="Birth Year" value={form.birth_year} onChange={v => set("birth_year", v)} type="number" />
            <Field label="Biography" value={form.biography} onChange={v => set("biography", v)} textarea />
            <Field label="Key Teachings" value={form.key_teachings} onChange={v => set("key_teachings", v)} textarea />
          </>}
          {type === "faq" && <>
            <Field label="Question" value={form.question} onChange={v => set("question", v)} textarea />
            <Field label="Answer" value={form.answer} onChange={v => set("answer", v)} textarea />
            <SelectField label="Category" value={form.category} onChange={v => set("category", v)} options={["rituals","philosophy","practices","festivals","mantras","meditation"]} />
            <SelectField label="Difficulty" value={form.difficulty_level} onChange={v => set("difficulty_level", v)} options={["beginner","intermediate","advanced"]} />
          </>}
          <Button onClick={save} className="w-full">{isEdit ? "Update" : "Create"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, textarea, type }: { label: string; value?: any; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {textarea ? <Textarea value={value ?? ""} onChange={e => onChange(e.target.value)} className="mt-1" rows={3} />
        : <Input value={value ?? ""} onChange={e => onChange(e.target.value)} type={type} className="mt-1" />}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value ?? options[0]} onValueChange={onChange}>
        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
