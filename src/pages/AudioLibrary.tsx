import React, { useState, useEffect, useCallback } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import ScrollToTop from '@/components/ScrollToTop';
import Breadcrumbs from '@/components/Breadcrumbs';
import EnhancedAudioPlayer from '@/components/EnhancedAudioPlayer';
import PlaylistManager from '@/components/PlaylistManager';
import { useDownload } from '@/hooks/useDownload';
import { supabase } from '@/integrations/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { fetchJamendoTracks, type JamendoTrack } from '@/services/jamendoAudio';
import { toast } from 'sonner';
import { 
  Play, 
  Search, 
  Heart,
  Download,
  Music,
  Clock,
  Users,
  Star,
  Loader2,
  X
} from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  category: string;
  duration: number;
  audio_url: string;
  lyrics?: string;
  meaning?: string;
  language: string;
  difficulty_level: string;
  download_count?: number;
  rating?: number;
}

const AudioLibrary = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  usePageTitle('Spiritual Audio Library');
  
  const { downloadAudio, downloadState } = useDownload();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);
  const { isFavorited, toggleFavorite } = useFavorites('audio');
  
  // Jamendo Discover state
  const [activeTab, setActiveTab] = useState<string>('library');
  const [jamendoTracks, setJamendoTracks] = useState<JamendoTrack[]>([]);
  const [jamendoLoading, setJamendoLoading] = useState(false);
  const [jamendoSearch, setJamendoSearch] = useState('');

  useEffect(() => { loadTracks(); }, []);

  const loadJamendo = useCallback(async (query?: string) => {
    setJamendoLoading(true);
    const results = await fetchJamendoTracks(query || undefined, query ? undefined : "meditation+spiritual");
    setJamendoTracks(results);
    setJamendoLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'discover' && jamendoTracks.length === 0) loadJamendo();
  }, [activeTab]);

  const handleJamendoPlay = (jt: JamendoTrack) => {
    const converted: AudioTrack = {
      id: jt.id,
      title: jt.title,
      artist: jt.artist,
      category: 'meditation',
      duration: jt.duration,
      audio_url: jt.audioUrl,
      language: 'english',
      difficulty_level: 'beginner',
    };
    setCurrentTrack(converted);
  };

  const loadTracks = async () => {
    try {
      setLoading(true);
      const normalizeUrl = (url: string): string => {
        if (!url) return url;
        if (/^https?:\/\//i.test(url)) return url;
        let bucket = 'audio-library';
        let path = url;
        const parts = url.split('/');
        if (parts.length > 1 && (parts[0] === 'audio-library' || parts[0] === 'scriptures-audio')) {
          bucket = parts[0];
          path = parts.slice(1).join('/');
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      };

      const { data: audioTracks, error } = await supabase
        .from('audio_library')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const mapped: AudioTrack[] = audioTracks?.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        category: track.category,
        duration: track.duration,
        audio_url: normalizeUrl(track.audio_url),
        lyrics: track.lyrics,
        meaning: track.meaning,
        language: track.language,
        difficulty_level: track.difficulty_level || 'beginner',
        download_count: track.download_count || 0,
        rating: track.rating || 0
      })) || [];

      setTracks(mapped);
      setPlaylist(mapped);
    } catch (error) {
      console.error('Error loading tracks:', error);
      setTracks([]);
      setPlaylist([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mantra': return '📿';
      case 'bhajan': return '🎵';
      case 'aarti': return '🪔';
      case 'meditation': return '🧘‍♀️';
      case 'story': return '📖';
      case 'discourse': return '🎤';
      case 'devotional': return '🙏';
      case 'stotram': return '📜';
      default: return '🎵';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mantra': return 'bg-primary/20 text-primary border-primary/30';
      case 'bhajan': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'aarti': return 'bg-accent/20 text-accent border-accent/30';
      case 'meditation': return 'bg-lotus/20 text-wisdom border-lotus/30';
      case 'devotional': return 'bg-primary/20 text-primary border-primary/30';
      case 'stotram': return 'bg-wisdom/20 text-wisdom border-wisdom/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const handlePlay = (track: AudioTrack) => setCurrentTrack(track);
  const handleTrackChange = (track: AudioTrack) => setCurrentTrack(track);

  const handlePlaylistShuffle = () => {
    setPlaylist(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleDownload = async (track: AudioTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingTrackId(track.id);
    await downloadAudio(track.audio_url, track.title, track.artist);
    setDownloadingTrackId(null);
  };

  const handlePlayPlaylist = (playlistTracks: AudioTrack[]) => {
    setPlaylist(playlistTracks);
    if (playlistTracks.length > 0) setCurrentTrack(playlistTracks[0]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLanguage('all');
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (track.artist && track.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || track.category === selectedCategory;
    const matchesLanguage = !selectedLanguage || selectedLanguage === 'all' || track.language === selectedLanguage;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const categories = Array.from(new Set(tracks.map(t => t.category)));
  const languages = Array.from(new Set(tracks.map(t => t.language)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🎵</div>
          <p className="text-muted-foreground">Loading spiritual audio library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peace">
      <Navigation />
      
      {/* Extra bottom padding on mobile for mini-player + bottom nav */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-36 sm:pb-6">
        <Breadcrumbs className="mb-4 sm:mb-6" />

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent">
              Spiritual Audio Library 🎵
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Immerse yourself in divine sounds and sacred chanting
            </p>
          </div>

          {/* Library / Discover Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="library" className="flex-1 sm:flex-none">🎵 Library</TabsTrigger>
              <TabsTrigger value="discover" className="flex-1 sm:flex-none">🌐 Discover</TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === 'library' && (
            <>
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mantras, bhajans, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/70 border-border/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[calc(50%-4px)] sm:w-[140px] bg-background/70">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang === 'hindi' ? 'Hindi' : lang === 'sanskrit' ? 'Sanskrit' : lang === 'english' ? 'English' : lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin snap-x -mx-1 px-1 mb-4">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background/70 text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background/70 text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {getCategoryIcon(cat)} {cat}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === 'discover' && (
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Jamendo tracks..."
                    value={jamendoSearch}
                    onChange={(e) => setJamendoSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadJamendo(jamendoSearch)}
                    className="pl-10 bg-background/70 border-border/50"
                  />
                </div>
                <Button onClick={() => loadJamendo(jamendoSearch)} variant="outline" size="sm">Search</Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Track List */}
          <div className="lg:col-span-2">
            <Card className="bg-card-sacred/80 backdrop-blur-md border-border/50 shadow-divine">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Music className="h-5 w-5 text-primary" />
                  <span>Audio Tracks ({filteredTracks.length})</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Discover sacred sounds and spiritual teachings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3 max-h-[calc(100vh-340px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
                  {filteredTracks.map((track) => {
                    const isActive = currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`group flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-xl hover:bg-background/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20 hover:shadow-lotus ${
                          isActive ? 'bg-primary/10 border-primary/30 shadow-divine' : ''
                        }`}
                        onClick={() => handlePlay(track)}
                      >
                        {/* Play / Equalizer */}
                        <div className="flex-shrink-0 relative">
                          {isActive ? (
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/20 flex items-center justify-center gap-[2px]">
                              <span className="equalizer-bar" style={{ height: 10 }} />
                              <span className="equalizer-bar" style={{ height: 14 }} />
                              <span className="equalizer-bar" style={{ height: 8 }} />
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0 shadow-divine group-hover:shadow-glow"
                              onClick={(e) => { e.stopPropagation(); handlePlay(track); }}
                            >
                              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-lg sm:text-2xl leading-none">{getCategoryIcon(track.category)}</span>
                            <h4 className="font-semibold truncate text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                              {track.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-wrap">
                            <span className="truncate max-w-[100px] sm:max-w-none">{track.artist}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{formatDuration(track.duration)}</span>
                            <span className="hidden sm:inline">•</span>
                            <Users className="h-3 w-3 hidden sm:block flex-shrink-0" />
                            <span className="hidden sm:inline">{track.download_count || 0}</span>
                          </div>
                        </div>

                        {/* Actions - always visible */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] sm:text-xs hidden sm:inline-flex ${getCategoryColor(track.category)}`}
                          >
                            {track.category}
                          </Badge>
                          
                          {track.rating !== undefined && track.rating > 0 && (
                            <div className="hidden sm:flex items-center gap-0.5 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span>{track.rating}</span>
                            </div>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className={`h-8 w-8 ${isFavorited(track.id) ? 'text-destructive' : 'text-muted-foreground'}`}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id, 'audio'); }}
                          >
                            <Heart className={`h-4 w-4 ${isFavorited(track.id) ? 'fill-current' : ''}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={(e) => handleDownload(track, e)}
                            disabled={downloadingTrackId === track.id}
                          >
                            {downloadingTrackId === track.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredTracks.length === 0 && (
                    <div className="text-center py-12">
                      <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">
                        {tracks.length === 0 ? 'No audio tracks available yet' : 'No tracks found'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {tracks.length === 0 
                          ? 'Audio will appear once uploaded via the admin panel.' 
                          : 'Try adjusting your search or filters'}
                      </p>
                      {tracks.length > 0 && (
                        <Button variant="outline" onClick={resetFilters} className="gap-2">
                          <X className="h-4 w-4" />
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Player & Playlist Manager - on desktop only, mobile uses fixed mini-player */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <EnhancedAudioPlayer
              track={currentTrack}
              playlist={playlist}
              onTrackChange={handleTrackChange}
              onPlaylistShuffle={handlePlaylistShuffle}
              isFavorited={isFavorited}
              toggleFavorite={toggleFavorite}
            />
            
            <PlaylistManager 
              allTracks={tracks}
              onPlayPlaylist={handlePlayPlaylist}
            />
          </div>
        </div>

        {/* Mobile-only PlaylistManager below track list */}
        <div className="lg:hidden mt-6">
          <PlaylistManager 
            allTracks={tracks}
            onPlayPlaylist={handlePlayPlaylist}
          />
        </div>
      </div>
      
      {/* Mobile mini-player (rendered outside grid) */}
      <div className="lg:hidden">
        <EnhancedAudioPlayer
          track={currentTrack}
          playlist={playlist}
          onTrackChange={handleTrackChange}
          onPlaylistShuffle={handlePlaylistShuffle}
          isFavorited={isFavorited}
          toggleFavorite={toggleFavorite}
        />
      </div>

      <ScrollToTop />
      <MobileBottomNav />
    </div>
  );
};

export default AudioLibrary;
