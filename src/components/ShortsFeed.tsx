import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play, Search, X } from "lucide-react";
import { fetchYouTubeShorts, getYouTubeThumbnailUrl, SHORTS_CATEGORIES, type YouTubeShort } from "@/services/youtubeShorts";
import { supabase } from "@/integrations/supabase/client";

interface ShortsFeedProps {
  dbShorts?: any[];
}

const ShortsFeed: React.FC<ShortsFeedProps> = ({ dbShorts = [] }) => {
  const [activeCategory, setActiveCategory] = useState("featured");
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideo, setPlayingVideo] = useState<YouTubeShort | null>(null);

  // Convert DB shorts to the same shape
  const dbShortsConverted: YouTubeShort[] = dbShorts.map((s) => {
    const match = s.video_url?.match(/(?:shorts\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : "";
    return {
      videoId,
      title: s.title,
      thumbnail: getYouTubeThumbnailUrl(videoId, s.thumbnail_url),
      channelTitle: s.category,
    };
  });

  const loadShorts = useCallback(async (query: string) => {
    if (!query) {
      setShorts(dbShortsConverted);
      return;
    }
    setLoading(true);
    const results = await fetchYouTubeShorts(query);
    setShorts(results);
    setLoading(false);
  }, [dbShorts]);

  useEffect(() => {
    const cat = SHORTS_CATEGORIES.find((c) => c.key === activeCategory);
    if (cat) loadShorts(cat.query);
  }, [activeCategory, loadShorts]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setActiveCategory("");
      setLoading(true);
      fetchYouTubeShorts(searchQuery.trim()).then((r) => {
        setShorts(r);
        setLoading(false);
      });
    }
  }, [searchQuery]);

  const displayShorts = shorts.length > 0 ? shorts : dbShortsConverted;

  return (
    <>
      <Card className="card-sacred">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Bhakti Shorts 🎬
            </CardTitle>
          </div>
          {/* Search */}
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search shorts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-8 pl-8 text-xs"
              />
            </div>
            {searchQuery && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSearchQuery(""); setActiveCategory("featured"); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mt-2 scrollbar-thin">
            {SHORTS_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setSearchQuery(""); }}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/70 text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border -mx-1 px-1">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-28 sm:w-36">
                    <Skeleton className="rounded-xl aspect-[9/16]" />
                  </div>
                ))
              : displayShorts.length > 0
              ? displayShorts.map((short, idx) => (
                  <button
                    key={short.videoId || idx}
                    onClick={() => short.videoId && setPlayingVideo(short)}
                    className="flex-shrink-0 w-28 sm:w-36 group cursor-pointer text-left"
                  >
                    <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-sm group-hover:shadow-divine transition-all duration-300 group-hover:-translate-y-1">
                      <AspectRatio ratio={9 / 16}>
                        {short.thumbnail ? (
                          <img
                            src={short.thumbnail}
                            alt={short.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (short.videoId && !img.dataset.fallbackApplied) {
                                img.dataset.fallbackApplied = "true";
                                img.src = `https://i.ytimg.com/vi/${short.videoId}/default.jpg`;
                                return;
                              }
                              img.onerror = null;
                              img.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">🎬</div>
                        )}
                      </AspectRatio>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                        <p className="text-white text-xs font-medium line-clamp-2">{short.title}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-primary/90 rounded-full p-2">
                          <Play className="h-5 w-5 text-primary-foreground fill-current" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              : (
                <div className="w-full text-center py-8 text-muted-foreground text-sm">
                  No shorts found. Try a different search.
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none">
          {playingVideo && (
            <div className="w-full">
              <AspectRatio ratio={9 / 16}>
                <iframe
                  src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&rel=0`}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </AspectRatio>
              <div className="p-3 bg-card">
                <p className="text-sm font-medium line-clamp-2">{playingVideo.title}</p>
                {playingVideo.channelTitle && (
                  <p className="text-xs text-muted-foreground mt-1">{playingVideo.channelTitle}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShortsFeed;
