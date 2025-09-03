import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/Navigation";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  Download,
  Search,
  Filter,
  Music,
  Repeat,
  Shuffle
} from "lucide-react";

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  category: 'mantra' | 'bhajan' | 'aarti' | 'meditation' | 'story' | 'discourse';
  duration: number;
  language: string;
  audio_url: string;
  lyrics?: string;
  meaning?: string;
  associated_deity?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  download_count: number;
  image_url?: string;
}

const AudioLibrary = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadTracks();
    }
  }, [user]);

  const loadTracks = async () => {
    // Generate sample audio tracks
    const sampleTracks: AudioTrack[] = [
      {
        id: "1",
        title: "Om Namah Shivaya",
        artist: "Krishna Das",
        category: "mantra",
        duration: 480,
        language: "hi",
        audio_url: "#",
        lyrics: "Om Namah Shivaya\nOm Namah Shivaya\nOm Namah Shivaya\nShivaya Namah Om",
        meaning: "I bow to Shiva, the auspicious one who is the true Self within all.",
        associated_deity: "Shiva",
        difficulty_level: "beginner",
        rating: 4.8,
        download_count: 15420,
        image_url: "/placeholder.svg"
      },
      {
        id: "2",
        title: "Hanuman Chalisa",
        artist: "Hariharan",
        category: "bhajan",
        duration: 720,
        language: "hi",
        audio_url: "#",
        lyrics: "Shri Guru charan saroj raj...",
        meaning: "Forty verses in praise of Lord Hanuman's divine qualities.",
        associated_deity: "Hanuman",
        difficulty_level: "intermediate",
        rating: 4.9,
        download_count: 23890,
        image_url: "/placeholder.svg"
      },
      {
        id: "3",
        title: "Maha Mrityunjaya Mantra",
        artist: "Sanskrit Scholars",
        category: "mantra",
        duration: 360,
        language: "hi",
        audio_url: "#",
        lyrics: "Om Tryambakam yajamahe sugandhim pushtivardhanam...",
        meaning: "The great death-conquering mantra for healing and liberation.",
        associated_deity: "Shiva",
        difficulty_level: "advanced",
        rating: 4.7,
        download_count: 12340,
        image_url: "/placeholder.svg"
      },
      {
        id: "4",
        title: "Gayatri Mantra",
        artist: "Pandit Jasraj",
        category: "mantra",
        duration: 300,
        language: "hi",
        audio_url: "#",
        lyrics: "Om Bhur Bhuvaḥ Swaḥ...",
        meaning: "The most sacred Vedic mantra for wisdom and enlightenment.",
        associated_deity: "Gayatri",
        difficulty_level: "beginner",
        rating: 4.9,
        download_count: 34567,
        image_url: "/placeholder.svg"
      },
      {
        id: "5",
        title: "Ganga Aarti",
        artist: "Traditional",
        category: "aarti",
        duration: 420,
        language: "hi",
        audio_url: "#",
        lyrics: "Om Jai Gange Mata...",
        meaning: "Evening aarti prayer to Mother Ganga.",
        associated_deity: "Ganga",
        difficulty_level: "beginner",
        rating: 4.6,
        download_count: 8900,
        image_url: "/placeholder.svg"
      },
      {
        id: "6",
        title: "Guided Vipassana Meditation",
        artist: "Spiritual Guide",
        category: "meditation",
        duration: 1800,
        language: "en",
        audio_url: "#",
        meaning: "A guided meditation for mindfulness and inner peace.",
        difficulty_level: "intermediate",
        rating: 4.5,
        download_count: 5678,
        image_url: "/placeholder.svg"
      }
    ];

    setTracks(sampleTracks);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mantra': return '📿';
      case 'bhajan': return '🎵';
      case 'aarti': return '🪔';
      case 'meditation': return '🧘‍♀️';
      case 'story': return '📖';
      case 'discourse': return '🎤';
      default: return '🎵';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mantra': return 'bg-primary text-primary-foreground';
      case 'bhajan': return 'bg-secondary text-secondary-foreground';
      case 'aarti': return 'bg-gold-light text-foreground';
      case 'meditation': return 'bg-peace text-foreground';
      case 'story': return 'bg-lotus text-foreground';
      case 'discourse': return 'bg-wisdom text-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handlePlay = (track: AudioTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.associated_deity?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || track.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "all" || track.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const categories = ['mantra', 'bhajan', 'aarti', 'meditation', 'story', 'discourse'];
  const languages = Array.from(new Set(tracks.map(t => t.language)));

  if (authLoading) {
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            Spiritual Audio Library 🎵
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Immerse yourself in divine sounds - mantras, bhajans, meditation music, 
            and spiritual discourses from masters around the world.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title, artist, or deity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Languages</option>
                {languages.map(language => (
                  <option key={language} value={language}>
                    {language === 'hi' ? 'Hindi' : language === 'en' ? 'English' : language}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Track List */}
          <div className="lg:col-span-2">
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Audio Tracks ({filteredTracks.length})</CardTitle>
                <CardDescription>
                  Discover sacred sounds and spiritual teachings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                        currentTrack?.id === track.id ? 'bg-muted/50 border border-primary/20' : ''
                      }`}
                      onClick={() => handlePlay(track)}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(track);
                        }}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{getCategoryIcon(track.category)}</span>
                          <h4 className="font-medium truncate">{track.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{track.artist}</span>
                          <span>•</span>
                          <span>{formatDuration(track.duration)}</span>
                          {track.associated_deity && (
                            <>
                              <span>•</span>
                              <span>{track.associated_deity}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getCategoryColor(track.category)}`}>
                          {track.category}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>{track.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player & Controls */}
          <div className="space-y-6">
            {/* Current Track Player */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="text-lg">Now Playing</CardTitle>
              </CardHeader>
              <CardContent>
                {currentTrack ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{getCategoryIcon(currentTrack.category)}</div>
                      <h3 className="font-semibold truncate">{currentTrack.title}</h3>
                      <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <Slider
                        value={[currentTime]}
                        max={currentTrack.duration}
                        step={1}
                        className="w-full"
                        onValueChange={(value) => setCurrentTime(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatDuration(currentTime)}</span>
                        <span>{formatDuration(currentTrack.duration)}</span>
                      </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsShuffling(!isShuffling)}
                        className={isShuffling ? 'bg-primary text-primary-foreground' : ''}
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      
                      <Button size="default" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRepeating(!isRepeating)}
                        className={isRepeating ? 'bg-primary text-primary-foreground' : ''}
                      >
                        <Repeat className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => {
                          setVolume(value[0]);
                          setIsMuted(value[0] === 0);
                        }}
                      />
                    </div>

                    {/* Track Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="h-4 w-4 mr-1" />
                        Like
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a track to start playing</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lyrics/Meaning */}
            {currentTrack && (currentTrack.lyrics || currentTrack.meaning) && (
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {currentTrack.lyrics ? 'Lyrics' : 'Meaning'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    {currentTrack.lyrics && (
                      <div>
                        <h4 className="font-medium mb-2">Sanskrit/Hindi:</h4>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {currentTrack.lyrics}
                        </p>
                      </div>
                    )}
                    {currentTrack.meaning && (
                      <div>
                        <h4 className="font-medium mb-2">Meaning:</h4>
                        <p className="text-muted-foreground">
                          {currentTrack.meaning}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioLibrary;