import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import EnhancedAudioPlayer from '@/components/EnhancedAudioPlayer';
import PlaylistManager from '@/components/PlaylistManager';
import { useDownload } from '@/hooks/useDownload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Search, 
  Filter,
  Heart,
  Download,
  Music,
  ArrowLeft,
  Clock,
  Users,
  Star,
  Loader2
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
  const { toast } = useToast();
  const { downloadAudio, downloadState } = useDownload();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);

      const normalizeUrl = (url: string): string => {
        if (!url) return url;
        if (/^https?:\/\//i.test(url)) return url;
        // Treat bare paths as coming from the public storage buckets
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
      
      // Load audio tracks from audio_library table
      const { data: audioTracks, error } = await supabase
        .from('audio_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database data to AudioTrack format
      const tracks: AudioTrack[] = audioTracks?.map(track => ({
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

      setTracks(tracks);
      setPlaylist(tracks);
      
      // Show helpful message if no audio files are working
      if (tracks.length > 0) {
        console.log(`✅ Loaded ${tracks.length} audio tracks`);
      }
      
    } catch (error) {
      console.error('❌ Error loading tracks:', error);
      
      // Provide fallback demo tracks with working public URLs
      const demoTracks: AudioTrack[] = [
        {
          id: 'demo-1',
          title: '🕉️ Om Chanting (Demo)',
          artist: 'BhaktVerse Demo',
          category: 'mantra',
          duration: 180,
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Demo audio
          lyrics: 'ॐ ॐ ॐ\nOm Om Om',
          meaning: 'The sacred sound of the universe. Chanting Om brings peace and spiritual alignment.',
          language: 'sanskrit',
          difficulty_level: 'beginner',
          download_count: 1234,
          rating: 4.8
        },
        {
          id: 'demo-2',
          title: '🎵 Meditation Music (Demo)',
          artist: 'BhaktVerse Demo',
          category: 'meditation',
          duration: 300,
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Demo audio
          meaning: 'Peaceful meditation music for spiritual practice and inner calm.',
          language: 'instrumental',
          difficulty_level: 'beginner',
          download_count: 2345,
          rating: 4.7
        },
        {
          id: 'demo-3',
          title: '🪔 Devotional Bhajan (Demo)',
          artist: 'BhaktVerse Demo',
          category: 'bhajan',
          duration: 240,
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Demo audio
          lyrics: 'राधे राधे राधे श्याम\nRadhe Radhe Radhe Shyam',
          meaning: 'A devotional song praising Radha and Krishna, expressing divine love.',
          language: 'hindi',
          difficulty_level: 'intermediate',
          download_count: 3456,
          rating: 4.9
        }
      ];
      
      setTracks(demoTracks);
      setPlaylist(demoTracks);
      
      console.log('📣 Using demo tracks. To add real spiritual audio, upload files to Supabase storage.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const handlePlay = (track: AudioTrack) => {
    setCurrentTrack(track);
  };

  const handleTrackChange = (track: AudioTrack) => {
    setCurrentTrack(track);
  };

  const handlePlaylistShuffle = () => {
    const shuffled = [...playlist].sort(() => Math.random() - 0.5);
    setPlaylist(shuffled);
  };

  const handleDownload = async (track: AudioTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingTrackId(track.id);
    await downloadAudio(track.audio_url, track.title, track.artist);
    setDownloadingTrackId(null);
  };

  const handlePlayPlaylist = (playlistTracks: AudioTrack[]) => {
    setPlaylist(playlistTracks);
    if (playlistTracks.length > 0) {
      setCurrentTrack(playlistTracks[0]);
    }
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
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Breadcrumbs className="mb-6" />
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent">
              Spiritual Audio Library 🎵
            </h1>
            <p className="text-muted-foreground mt-1">
              Immerse yourself in divine sounds and sacred chanting
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mantras, bhajans, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/70 border-border/50"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] bg-background/70">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[120px] bg-background/70">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language === 'hindi' ? 'Hindi' : 
                       language === 'sanskrit' ? 'Sanskrit' : 
                       language === 'english' ? 'English' : language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Track List */}
          <div className="lg:col-span-2">
            <Card className="bg-card-sacred/80 backdrop-blur-md border-border/50 shadow-divine">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span>Audio Tracks ({filteredTracks.length})</span>
                </CardTitle>
                <CardDescription>
                  Discover sacred sounds and spiritual teachings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`group flex items-center space-x-4 p-4 rounded-xl hover:bg-background/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20 hover:shadow-lotus ${
                        currentTrack?.id === track.id ? 'bg-primary/10 border-primary/30 shadow-divine' : ''
                      }`}
                      onClick={() => handlePlay(track)}
                    >
                      <Button
                        size="sm"
                        variant={currentTrack?.id === track.id ? "default" : "outline"}
                        className="flex-shrink-0 shadow-divine group-hover:shadow-glow transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(track);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">{getCategoryIcon(track.category)}</span>
                          <h4 className="font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                            {track.title}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{track.artist}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(track.duration)}</span>
                          <span>•</span>
                          <Users className="h-3 w-3" />
                          <span>{track.download_count || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(track.category)} transition-colors`}
                        >
                          {track.category}
                        </Badge>
                        
                        {track.rating && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span>{track.rating}</span>
                          </div>
                        )}
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
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
                    </div>
                  ))}
                  
                  {filteredTracks.length === 0 && (
                    <div className="text-center py-12">
                      <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No tracks found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Player & Playlist Manager */}
          <div className="lg:col-span-1 space-y-6">
            <EnhancedAudioPlayer
              track={currentTrack}
              playlist={playlist}
              onTrackChange={handleTrackChange}
              onPlaylistShuffle={handlePlaylistShuffle}
            />
            
            <PlaylistManager 
              allTracks={tracks}
              onPlayPlaylist={handlePlayPlaylist}
            />
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default AudioLibrary;