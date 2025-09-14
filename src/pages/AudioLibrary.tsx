import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import AudioPlayer from '@/components/AudioPlayer';
import { supabase } from '@/integrations/supabase/client';
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
  Star
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
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    loadTracks();
  }, [user, authLoading, navigate]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      
      // Load audio tracks from spiritual_content and create mock data
      const { data: spiritualContent, error } = await supabase
        .from('spiritual_content')
        .select('*')
        .eq('content_type', 'audio')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create comprehensive sample tracks
      const sampleTracks: AudioTrack[] = [
        {
          id: '1',
          title: 'Gayatri Mantra',
          artist: 'Traditional Chanting',
          category: 'mantra',
          duration: 300,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्।',
          meaning: 'The most sacred mantra in Hinduism, invoking the divine light to illuminate our understanding and guide us toward truth.',
          language: 'sanskrit',
          difficulty_level: 'beginner',
          download_count: 1250,
          rating: 4.8
        },
        {
          id: '2',
          title: 'Hare Krishna Maha Mantra',
          artist: 'ISKCON Devotees',
          category: 'mantra',
          duration: 420,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे।',
          meaning: 'The great mantra for deliverance, chanted to invoke the divine names of Krishna and Rama for spiritual purification.',
          language: 'sanskrit',
          difficulty_level: 'beginner',
          download_count: 980,
          rating: 4.9
        },
        {
          id: '3',
          title: 'Hanuman Chalisa',
          artist: 'Pandit Jasraj',
          category: 'devotional',
          duration: 600,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनउं रघुवर बिमल जसु जो दायकु फल चारि।।',
          meaning: '40 verses praising Lord Hanuman, seeking strength, courage, and protection from evil forces.',
          language: 'hindi',
          difficulty_level: 'intermediate',
          download_count: 2150,
          rating: 4.7
        },
        {
          id: '4',
          title: 'Om Namah Shivaya',
          artist: 'Sadhguru',
          category: 'mantra',
          duration: 180,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'ॐ नमः शिवाय',
          meaning: 'The five-syllable mantra dedicated to Lord Shiva, meaning "I bow to Shiva" - representing the consciousness within all beings.',
          language: 'sanskrit',
          difficulty_level: 'beginner',
          download_count: 1800,
          rating: 4.6
        },
        {
          id: '5',
          title: 'Ganga Aarti',
          artist: 'Rishikesh Priests',
          category: 'aarti',
          duration: 480,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'ॐ जय गंगे माता, मैया जय गंगे माता।',
          meaning: 'Evening prayer ceremony dedicated to River Ganga, seeking purification and blessings.',
          language: 'hindi',
          difficulty_level: 'intermediate',
          download_count: 750,
          rating: 4.5
        },
        {
          id: '6',
          title: 'Krishna Bhajan - Govinda',
          artist: 'Anup Jalota',
          category: 'bhajan',
          duration: 360,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'गोविंद बोलो हरि गोपाल बोलो। राधा रमण हरि गोविंद बोलो।',
          meaning: 'Devotional song praising Lord Krishna as Govinda, the protector of cows and the universe.',
          language: 'hindi',
          difficulty_level: 'beginner',
          download_count: 1400,
          rating: 4.8
        },
        {
          id: '7',
          title: 'Guided Meditation - Inner Peace',
          artist: 'Sri Sri Ravi Shankar',
          category: 'meditation',
          duration: 900,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          meaning: 'Guided meditation for achieving inner peace, tranquility, and spiritual awareness.',
          language: 'english',
          difficulty_level: 'beginner',
          download_count: 920,
          rating: 4.7
        },
        {
          id: '8',
          title: 'Shiva Tandav Stotram',
          artist: 'Traditional Chanting',
          category: 'stotram',
          duration: 540,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'जटा टवी गलज्जल प्रवाह पावितस्थले गलेऽवलम्ब्य लम्बितां भुजंग तुंग मालिकाम्।',
          meaning: 'Powerful hymn describing the cosmic dance of Lord Shiva, representing creation and destruction.',
          language: 'sanskrit',
          difficulty_level: 'advanced',
          download_count: 680,
          rating: 4.9
        }
      ];

      // Add tracks from database if any
      const dbTracks = spiritualContent?.map(content => ({
        id: content.id,
        title: content.title || 'Untitled',
        artist: 'Various Artists',
        category: content.category,
        duration: content.duration || 300,
        audio_url: content.media_url || 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        lyrics: content.content,
        meaning: content.summary,
        language: content.language,
        difficulty_level: content.difficulty_level || 'beginner'
      })) || [];

      const allTracks = [...sampleTracks, ...dbTracks];
      setTracks(allTracks);
      setPlaylist(allTracks);
      
    } catch (error) {
      console.error('Error loading tracks:', error);
      
      // Fallback to sample data if database query fails
      const fallbackTracks: AudioTrack[] = [
        {
          id: '1',
          title: 'Gayatri Mantra',
          artist: 'Traditional Chanting',
          category: 'mantra',
          duration: 300,
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          lyrics: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्।',
          meaning: 'The most sacred mantra in Hinduism, invoking the divine light to illuminate our understanding.',
          language: 'sanskrit',
          difficulty_level: 'beginner',
          download_count: 1250,
          rating: 4.8
        }
      ];
      
      setTracks(fallbackTracks);
      setPlaylist(fallbackTracks);
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

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (track.artist && track.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || track.category === selectedCategory;
    const matchesLanguage = !selectedLanguage || track.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const categories = Array.from(new Set(tracks.map(t => t.category)));
  const languages = Array.from(new Set(tracks.map(t => t.language)));

  if (authLoading || loading) {
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent">
                Spiritual Audio Library 🎵
              </h1>
              <p className="text-muted-foreground mt-1">
                Immerse yourself in divine sounds and sacred chanting
              </p>
            </div>
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
                  <SelectItem value="">All Categories</SelectItem>
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
                  <SelectItem value="">All Languages</SelectItem>
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
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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

          {/* Audio Player */}
          <div className="lg:col-span-1">
            <AudioPlayer
              track={currentTrack}
              playlist={playlist}
              onTrackChange={handleTrackChange}
              onPlaylistShuffle={handlePlaylistShuffle}
            />
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default AudioLibrary;