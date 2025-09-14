import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
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

interface AudioPlayerProps {
  track: AudioTrack | null;
  playlist: AudioTrack[];
  onTrackChange: (track: AudioTrack) => void;
  onPlaylistShuffle?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  track, 
  playlist, 
  onTrackChange,
  onPlaylistShuffle 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all' || shuffleEnabled) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track, repeatMode, shuffleEnabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePrevious = () => {
    if (!playlist.length) return;
    
    const currentIndex = playlist.findIndex(t => t.id === track?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    onTrackChange(playlist[prevIndex]);
  };

  const handleNext = () => {
    if (!playlist.length) return;
    
    const currentIndex = playlist.findIndex(t => t.id === track?.id);
    let nextIndex;
    
    if (shuffleEnabled) {
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    }
    
    onTrackChange(playlist[nextIndex]);
  };

  const toggleShuffle = () => {
    setShuffleEnabled(!shuffleEnabled);
    if (onPlaylistShuffle) {
      onPlaylistShuffle();
    }
  };

  const cycleRepeatMode = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mantra': return '📿';
      case 'bhajan': return '🎵';
      case 'aarti': return '🪔';
      case 'meditation': return '🧘';
      case 'story': return '📖';
      default: return '🎶';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mantra': return 'bg-primary/20 text-primary border-primary/30';
      case 'bhajan': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'aarti': return 'bg-accent/20 text-accent border-accent/30';
      case 'meditation': return 'bg-lotus/20 text-wisdom border-lotus/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  if (!track) {
    return (
      <Card className="bg-card-sacred/50 backdrop-blur-md border-border/50">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select a track to begin your spiritual journey</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={track.audio_url}
        preload="metadata"
      />
      
      <Card className="bg-gradient-temple/10 backdrop-blur-md border-border/50 shadow-divine">
        <CardContent className="p-6">
          {/* Now Playing Header */}
          <div className="flex items-center space-x-3 mb-6">
            <Avatar className="h-16 w-16 shadow-divine ring-2 ring-primary/20">
              <AvatarImage src="/placeholder-album.png" alt={track.title} />
              <AvatarFallback className="bg-gradient-temple text-primary-foreground text-lg">
                {getCategoryIcon(track.category)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate text-foreground">
                {track.title}
              </h3>
              {track.artist && (
                <p className="text-muted-foreground truncate">{track.artist}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getCategoryColor(track.category)}`}
                >
                  {getCategoryIcon(track.category)} {track.category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {track.language.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-500' : 'text-muted-foreground'}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <Slider
              value={[progressPercentage]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(duration)}</span>
              </span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={shuffleEnabled ? 'text-primary' : 'text-muted-foreground'}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={playlist.length <= 1}
              className="hover:bg-primary/10"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              onClick={togglePlay}
              size="lg"
              className="bg-gradient-temple text-primary-foreground shadow-divine hover:shadow-glow transition-all duration-300 w-14 h-14 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleNext}
              disabled={playlist.length <= 1}
              className="hover:bg-primary/10"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={cycleRepeatMode}
              className={repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'}
            >
              <div className="relative">
                <Repeat className="h-4 w-4" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
                )}
              </div>
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            <span className="text-xs text-muted-foreground w-8 text-right">
              {Math.round(isMuted ? 0 : volume * 100)}
            </span>
          </div>

          {/* Track Info */}
          {(track.lyrics || track.meaning) && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="grid grid-cols-1 gap-4">
                {track.meaning && (
                  <div className="bg-background/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-primary mb-2">Meaning & Significance</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {track.meaning}
                    </p>
                  </div>
                )}
                
                {track.lyrics && (
                  <div className="bg-background/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-primary mb-2">Lyrics</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {track.lyrics}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AudioPlayer;