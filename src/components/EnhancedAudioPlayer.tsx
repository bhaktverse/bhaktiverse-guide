import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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
  Download,
  Share,
  MoreHorizontal,
  Clock,
  Music
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
}

const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({ 
  track, 
  playlist, 
  onTrackChange,
  onPlaylistShuffle 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        handleNext();
      }
    };
    
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      console.log('Failed to load:', track.audio_url);
    };

    const handleCanPlay = () => {
      console.log('✅ Audio ready to play:', track.title);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Reset playback when track changes
    setCurrentTime(0);
    setIsPlaying(false);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [repeatMode, track]);

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
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePrevious = () => {
    const currentIndex = playlist.findIndex(t => t.id === track?.id);
    if (currentIndex > 0) {
      onTrackChange(playlist[currentIndex - 1]);
    } else if (repeatMode === 'all') {
      onTrackChange(playlist[playlist.length - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = playlist.findIndex(t => t.id === track?.id);
    if (currentIndex < playlist.length - 1) {
      onTrackChange(playlist[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      onTrackChange(playlist[0]);
    }
  };

  const toggleShuffle = () => {
    setShuffleEnabled(!shuffleEnabled);
    if (onPlaylistShuffle) {
      onPlaylistShuffle();
    }
  };

  const cycleRepeatMode = () => {
    setRepeatMode(current => {
      switch (current) {
        case 'none': return 'one';
        case 'one': return 'all';
        case 'all': return 'none';
        default: return 'none';
      }
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateTTS = async (text: string, type: string = 'general') => {
    if (!text || isGeneratingTTS) return;
    
    try {
      setIsGeneratingTTS(true);
      
      const { data, error } = await supabase.functions.invoke('spiritual-audio-tts', {
        body: {
          text,
          voice: 'alloy',
          language: track?.language || 'hi',
          textType: type,
        },
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create a temporary audio element for TTS
        const ttsAudio = new Audio(audioUrl);
        await ttsAudio.play();
      }
    } catch (error) {
      console.error('Error generating TTS:', error);
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

  return (
    <Card className="card-sacred sticky bottom-4 lg:relative lg:bottom-0 shadow-divine">
      <CardContent className="p-6">
        <audio
          ref={audioRef}
          src={track.audio_url}
          preload="metadata"
        />
        
        {/* Track Info */}
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16 shadow-divine">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-gradient-saffron text-primary-foreground text-2xl">
              {getCategoryIcon(track.category)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {track.title}
            </h3>
            <p className="text-muted-foreground truncate">
              {track.artist || 'Unknown Artist'}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className={getCategoryColor(track.category)}>
                {track.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {track.language === 'sanskrit' ? 'Sanskrit' : 
                 track.language === 'hindi' ? 'Hindi' : 
                 track.language}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className={isLiked ? 'text-red-500' : 'text-muted-foreground'}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={shuffleEnabled ? 'text-primary' : 'text-muted-foreground'}
          >
            <Shuffle className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handlePrevious}>
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            size="lg"
            onClick={togglePlay}
            className="h-14 w-14 rounded-full shadow-divine hover:shadow-glow transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <SkipForward className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleRepeatMode}
            className={repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'}
          >
            <Repeat className="h-5 w-5" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                1
              </span>
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 mb-6">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>

        {/* Lyrics and Meaning */}
        <div className="space-y-4">
          {track.lyrics && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-primary">Lyrics</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateTTS(track.lyrics || '', 'mantra')}
                    disabled={isGeneratingTTS}
                    className="text-xs"
                  >
                    {isGeneratingTTS ? 'Generating...' : '🔊 Listen'}
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    {track.language === 'sanskrit' ? 'Sanskrit' : 
                     track.language === 'hindi' ? 'Hindi' : 
                     track.language}
                  </Badge>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
                <p className="text-sm leading-relaxed font-sanskrit">
                  {track.lyrics}
                </p>
              </div>
            </div>
          )}

          {track.meaning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-primary">Meaning & Significance</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateTTS(track.meaning || '', 'teaching')}
                  disabled={isGeneratingTTS}
                  className="text-xs"
                >
                  {isGeneratingTTS ? '🔄' : '🗣️'} Explain
                </Button>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {track.meaning}
                </p>
              </div>
            </div>
          )}

          {!track.lyrics && !track.meaning && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Enjoy the divine sounds and let your spirit soar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAudioPlayer;