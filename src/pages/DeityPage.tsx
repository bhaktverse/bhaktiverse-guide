import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Music, BookOpen, Building, Users, MessageCircle, Play, ArrowRight } from "lucide-react";

interface DeityData {
  slug: string;
  name: string;
  sanskritName: string;
  emoji: string;
  description: string;
  iconography: string;
  mantras: string[];
  gradient: string;
  traditions: string[];
  deityFilter: string; // matches temples.primary_deity & audio_library.associated_deity
}

const DEITIES: Record<string, DeityData> = {
  krishna: {
    slug: "krishna",
    name: "Lord Krishna",
    sanskritName: "कृष्ण",
    emoji: "🪈",
    description: "Supreme Personality of Godhead, the divine cowherd, speaker of the Bhagavad Gita, and the embodiment of love, wisdom and divine play (leela). Krishna is central to Vaishnavism and revered across all Hindu traditions.",
    iconography: "Dark blue skin, peacock feather crown, yellow silk garments, flute in hand, often depicted with Radha or as a child (Bal Krishna).",
    mantras: ["ॐ नमो भगवते वासुदेवाय", "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे", "ॐ कृष्णाय नमः"],
    gradient: "from-blue-600 via-indigo-500 to-purple-600",
    traditions: ["Gaudiya", "Vallabha", "Nimbarka", "ISKCON"],
    deityFilter: "Krishna",
  },
  vishnu: {
    slug: "vishnu",
    name: "Lord Vishnu",
    sanskritName: "विष्णु",
    emoji: "🔱",
    description: "The Preserver and Protector of the universe, one of the Trimurti. Vishnu incarnates on earth in times of crisis as his ten avatars (Dashavatara), including Rama and Krishna.",
    iconography: "Four arms holding Shankha (conch), Chakra (disc), Gada (mace), and Padma (lotus). Blue skin, adorned with Kaustubha jewel, reclining on Shesha Naga.",
    mantras: ["ॐ नमो नारायणाय", "ॐ विष्णवे नमः", "शान्ताकारं भुजगशयनं"],
    gradient: "from-sky-500 via-blue-600 to-blue-800",
    traditions: ["Sri (Ramanuja)", "Madhva", "Pancharatra"],
    deityFilter: "Vishnu",
  },
  hanuman: {
    slug: "hanuman",
    name: "Lord Hanuman",
    sanskritName: "हनुमान",
    emoji: "🐒",
    description: "The divine vanara (monkey) deity, the supreme devotee of Lord Rama, embodiment of strength, courage, selfless service, and unwavering bhakti. Son of Vayu (wind god).",
    iconography: "Mighty monkey-faced warrior, carrying a mountain or mace, often depicted with Rama and Sita in his heart, flying through the sky.",
    mantras: ["ॐ हनुमते नमः", "जय हनुमान ज्ञान गुन सागर", "मनोजवं मारुततुल्यवेगं"],
    gradient: "from-orange-500 via-red-500 to-red-700",
    traditions: ["Ramayana tradition", "Shakti worship"],
    deityFilter: "Hanuman",
  },
};

const DeityPage = () => {
  const { deitySlug } = useParams<{ deitySlug: string }>();
  const deity = DEITIES[deitySlug || ""];
  usePageTitle(deity?.name || "Deity");

  const [saints, setSaints] = useState<any[]>([]);
  const [temples, setTemples] = useState<any[]>([]);
  const [audio, setAudio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deity) return;
    setLoading(true);
    Promise.all([
      supabase.from("saints").select("id, name, tradition, image_url, biography").limit(6),
      supabase.from("temples").select("id, name, primary_deity, location, image_urls, rating").ilike("primary_deity", `%${deity.deityFilter}%`).limit(6),
      supabase.from("audio_library").select("id, title, artist, category, duration, associated_deity").ilike("associated_deity", `%${deity.deityFilter}%`).limit(6),
    ]).then(([sRes, tRes, aRes]) => {
      // Filter saints by related traditions
      const allSaints = sRes.data || [];
      const filtered = allSaints.filter((s: any) =>
        deity.traditions.some((t) => (s.tradition || "").toLowerCase().includes(t.toLowerCase()))
      );
      setSaints(filtered.length > 0 ? filtered.slice(0, 6) : allSaints.slice(0, 4));
      setTemples(tRes.data || []);
      setAudio(aRes.data || []);
      setLoading(false);
    });
  }, [deitySlug]);

  if (!deity) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h1 className="text-2xl font-bold mb-2">Deity Not Found</h1>
          <p className="text-muted-foreground mb-6">This deity page is not available yet.</p>
          <Button asChild><Link to="/">Go Home</Link></Button>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-6xl">
        <Breadcrumbs className="mb-6" />

        {/* Hero */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${deity.gradient} p-6 sm:p-10 mb-8 text-white`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-2xl">
            <div className="text-5xl sm:text-7xl mb-3">{deity.emoji}</div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-1">{deity.name}</h1>
            <p className="text-xl sm:text-2xl font-sanskrit opacity-90 mb-4">{deity.sanskritName}</p>
            <p className="text-sm sm:text-base leading-relaxed opacity-90">{deity.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {deity.traditions.map((t) => (
                <Badge key={t} className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Mantras */}
        <Card className="card-sacred mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Sacred Mantras 📿</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deity.mantras.map((m, i) => (
              <div key={i} className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-lg font-sanskrit text-center">{m}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Iconography */}
        <Card className="card-sacred mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Iconography & Symbolism 🎨</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{deity.iconography}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Related Saints */}
          <Card className="card-sacred">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" /> Related Saints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
              ) : saints.length > 0 ? (
                saints.map((s) => (
                  <Link key={s.id} to={`/saints/${s.id}/chat`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={s.image_url} />
                      <AvatarFallback className="bg-primary/10 text-sm">{s.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.tradition}</p>
                    </div>
                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No saints found for this tradition</p>
              )}
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/saints">View All Saints <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Related Temples */}
          <Card className="card-sacred">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4 text-primary" /> Related Temples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
              ) : temples.length > 0 ? (
                temples.map((t) => (
                  <Link key={t.id} to={`/temples/${t.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🏛️</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.primary_deity}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No temples tagged for {deity.name} yet</p>
              )}
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/temples">View All Temples <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Related Audio */}
          <Card className="card-sacred">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Music className="h-4 w-4 text-primary" /> Bhajans & Mantras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
              ) : audio.length > 0 ? (
                audio.map((a) => (
                  <Link key={a.id} to="/audio-library" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🎵</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.artist} · {a.category}</p>
                    </div>
                    <Play className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No audio tagged for {deity.name} yet</p>
              )}
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/audio-library">View Audio Library <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <ScrollToTop />
      <MobileBottomNav />
    </div>
  );
};

export default DeityPage;
