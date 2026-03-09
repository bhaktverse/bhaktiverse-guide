import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";

export default function AdminContent() {
  const [mantras, setMantras] = useState<any[]>([]);
  const [audio, setAudio] = useState<any[]>([]);
  const [scriptures, setScriptures] = useState<any[]>([]);
  const [saints, setSaints] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Spiritual Content</h1>
        <p className="text-sm text-muted-foreground">Manage mantras, audio, scriptures, saints & FAQs</p>
      </div>
      <Tabs defaultValue="mantras">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="mantras">Mantras ({mantras.length})</TabsTrigger>
          <TabsTrigger value="audio">Audio ({audio.length})</TabsTrigger>
          <TabsTrigger value="scriptures">Scriptures ({scriptures.length})</TabsTrigger>
          <TabsTrigger value="saints">Saints ({saints.length})</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mantras"><AdminDataTable data={mantras} columns={mantraColumns} searchKey="deity" loading={loading} /></TabsContent>
        <TabsContent value="audio"><AdminDataTable data={audio} columns={audioColumns} searchKey="title" loading={loading} /></TabsContent>
        <TabsContent value="scriptures"><AdminDataTable data={scriptures} columns={scriptureColumns} searchKey="title" loading={loading} /></TabsContent>
        <TabsContent value="saints"><AdminDataTable data={saints} columns={saintColumns} searchKey="name" loading={loading} /></TabsContent>
        <TabsContent value="faqs"><AdminDataTable data={faqs} columns={faqColumns} searchKey="question" loading={loading} /></TabsContent>
      </Tabs>
    </div>
  );
}
