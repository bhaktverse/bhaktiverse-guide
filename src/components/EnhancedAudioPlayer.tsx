import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  Clock,
  Music,
  ChevronUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
}

interface EnhancedAudioPlayerProps {
  track: AudioTrack | null;
  playlist: AudioTrack[];
  onTrackChange: (track: AudioTrack) => void;
  onPlaylistShuffle?: () => void;
  isFavorited?: (id: string) => boolean;
  toggleFavorite?: (id: string, type: string) => void;
}

const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({ 
  track, 
  playlist, 
  onTrackChange,
  onPlaylistShuffle,
  isFavorited,
  toggleFavorite,
}) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [ttsAudioEl, setTtsAudioEl] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        handleNext();
      }
    };
    
    const handleError = () => {
      setIsPlaying(false);
      setTimeout(() => {
        const currentIndex = playlist.findIndex(t => t.id === track?.id);
        if (currentIndex < playlist.length - 1) {
          toast.info(`Skipping unavailable track: "${track.title}"`);
          onTrackChange(playlist[currentIndex + 1]);
        }
      }, 500);
    };

    const handleCanPlay = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [repeatMode, track, playlist, onTrackChange]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current || !track) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.readyState < 2) {
          await new Promise((resolve) => {
            const h = () => { audioRef.current?.removeEventListener('canplay', h); resolve(true); };
            audioRef.current?.addEventListener('canplay', h);
            audioRef.current?.load();
          });
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
      toast.error("Unable to play this audio.");
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handlePrevious = () => {
    const currentIndex = playlist.findIndex(t => t.id === track?.id);
    if (currentIndex > 0) onTrackChange(playlist[currentIndex - 1]);
    else if (repeatMode === 'all') onTrackChange(playlist[playlist.length - 1]);
  };

  const handleNext = () => {
    const currentIndex = playlist.findIndex(t => t.id === track?.id);
    if (currentIndex < playlist.length - 1) onTrackChange(playlist[currentIndex + 1]);
    else if (repeatMode === 'all') onTrackChange(playlist[0]);
  };

  const toggleShuffle = () => {
    setShuffleEnabled(!shuffleEnabled);
    onPlaylistShuffle?.();
  };

  const cycleRepeatMode = () => {
    setRepeatMode(c => c === 'none' ? 'one' : c === 'one' ? 'all' : 'none');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (!track) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: track.title, text: `Listen to ${track.title} on BhaktVerse`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied!');
      }
    } catch { /* user cancelled */ }
  };

  const generateTTS = async (text: string, type: string = 'general') => {
    if (!text || isGeneratingTTS) return;
    try {
      setIsGeneratingTTS(true);
      // Pause main audio
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      // Stop any existing TTS
      if (ttsAudioEl) { ttsAudioEl.pause(); ttsAudioEl.src = ''; }

      const { data, error } = await supabase.functions.invoke('spiritual-audio-tts', {
        body: { text, voice: 'alloy', language: track?.language || 'hi', textType: type },
      });
      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const tts = new Audio(audioUrl);
        setTtsAudioEl(tts);
        await tts.play();
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsGeneratingTTS(false);
    }
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

  const liked = track ? isFavorited?.(track.id) ?? false : false;

  // ----- Full Player Content (shared between desktop card & mobile drawer) -----
  const fullPlayerContent = (
    <div className="p-4 sm:p-6">

      {/* Track Info */}
      <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-6">
        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 shadow-divine flex-shrink-0">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gradient-saffron text-primary-foreground text-xl sm:text-2xl">
            {track ? getCategoryIcon(track.category) : '🎵'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
            {track?.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {track?.artist || 'Unknown Artist'}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {track && (
              <>
                <Badge variant="outline" className={`text-xs ${getCategoryColor(track.category)}`}>
                  {track.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {track.language === 'sanskrit' ? 'Sanskrit' : 
                   track.language === 'hindi' ? 'Hindi' : track.language}
                </Badge>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { if (track && toggleFavorite) toggleFavorite(track.id, 'audio'); }}
            className={liked ? 'text-destructive' : 'text-muted-foreground'}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4 sm:mb-6">
        <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleProgressChange} className="w-full" />
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" onClick={toggleShuffle} className={shuffleEnabled ? 'text-primary' : 'text-muted-foreground'}>
          <Shuffle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <SkipBack className="h-6 w-6" />
        </Button>
        <Button size="lg" onClick={togglePlay} className="h-14 w-14 rounded-full shadow-divine hover:shadow-glow transition-all duration-300">
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <SkipForward className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={cycleRepeatMode} className={`relative ${repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Repeat className="h-5 w-5" />
          {repeatMode === 'one' && (
            <span className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">1</span>
          )}
        </Button>
      </div>

      {/* Volume Control - hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Slider value={[isMuted ? 0 : volume]} max={1} step={0.1} onValueChange={handleVolumeChange} className="flex-1" />
      </div>

      {/* Lyrics and Meaning */}
      <div className="space-y-4">
        {track?.lyrics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-primary text-sm sm:text-base">Lyrics</h4>
              <Button size="sm" variant="outline" onClick={() => generateTTS(track.lyrics || '', 'mantra')} disabled={isGeneratingTTS} className="text-xs">
                {isGeneratingTTS ? 'Generating...' : '🔊 Listen'}
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 sm:p-4 max-h-32 overflow-y-auto scrollbar-thin">
              <p className="text-sm leading-relaxed font-sanskrit">{track.lyrics}</p>
            </div>
          </div>
        )}

        {track?.meaning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-primary text-sm sm:text-base">Meaning & Significance</h4>
              <Button size="sm" variant="outline" onClick={() => generateTTS(track.meaning || '', 'teaching')} disabled={isGeneratingTTS} className="text-xs">
                {isGeneratingTTS ? '🔄' : '🗣️'} Explain
              </Button>
            </div>
            <div className="bg-background/50 rounded-lg p-3 sm:p-4">
              <p className="text-sm leading-relaxed text-foreground">{track.meaning}</p>
            </div>
          </div>
        )}

        {track && !track.lyrics && !track.meaning && (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Enjoy the divine sounds and let your spirit soar</p>
          </div>
        )}
      </div>
    </div>
  );

  // ----- No Track State -----
  if (!track) {
    return (
      <Card className="card-sacred">
        <CardContent className="p-6 text-center">
          <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a track to start playing</p>
        </CardContent>
      </Card>
    );
  }

  // ----- Mobile: Fixed mini-player + Drawer -----
  if (isMobile) {
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        {/* Mini Player Bar - fixed at bottom above MobileBottomNav */}
        <DrawerTrigger asChild>
          <div className="fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border shadow-divine px-3 py-2 cursor-pointer">
            {/* Thin progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xl flex-shrink-0">{getCategoryIcon(track.category)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </DrawerTrigger>

        <DrawerContent className="max-h-[85vh] overflow-y-auto">
          {fullPlayerContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // ----- Desktop: Sticky card -----
  return (
    <Card className="card-sacred sticky top-24 shadow-divine">
      <CardContent className="p-0">
        {fullPlayerContent}
      </CardContent>
    </Card>
  );
};

export default EnhancedAudioPlayer;
