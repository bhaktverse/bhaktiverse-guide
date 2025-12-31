import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Hand,
  Camera,
  Sun,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Lightbulb,
  Target,
  Eye,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  tip: string;
  narration: string;
  icon: React.ComponentType<{ className?: string }>;
  animation: 'pulse' | 'bounce' | 'wave' | 'glow';
  highlightArea?: 'palm' | 'lighting' | 'camera' | 'position';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Palm Reading',
    description: 'Our AI-powered scanner will analyze your palm lines to reveal insights about your destiny.',
    tip: 'This tutorial will guide you through the scanning process step by step.',
    narration: 'Welcome to Palm Reading. Our AI-powered scanner will analyze your palm lines to reveal insights about your destiny. This tutorial will guide you through the scanning process step by step.',
    icon: Sparkles,
    animation: 'glow'
  },
  {
    id: 'lighting',
    title: 'Good Lighting is Essential',
    description: 'Find a well-lit area. Natural daylight or bright indoor lighting works best.',
    tip: 'Avoid shadows on your palm for accurate line detection.',
    narration: 'Good lighting is essential for accurate readings. Find a well-lit area. Natural daylight or bright indoor lighting works best. Make sure to avoid shadows on your palm.',
    icon: Sun,
    animation: 'pulse',
    highlightArea: 'lighting'
  },
  {
    id: 'position',
    title: 'Position Your Palm',
    description: 'Place your palm flat facing the camera with fingers spread naturally.',
    tip: 'Keep your hand steady and fill the frame with your palm.',
    narration: 'Now position your palm correctly. Place your palm flat facing the camera with fingers spread naturally. Keep your hand steady and fill the frame with your palm.',
    icon: Hand,
    animation: 'wave',
    highlightArea: 'palm'
  },
  {
    id: 'capture',
    title: 'Multi-Angle Capture',
    description: 'We\'ll capture 4 angles: center palm, left side, right side, and finger lines.',
    tip: 'The camera will guide you through each step automatically.',
    narration: 'We will capture 4 different angles for accurate analysis. Center palm, left side, right side, and finger lines. The camera will guide you through each step automatically.',
    icon: Camera,
    animation: 'bounce',
    highlightArea: 'camera'
  },
  {
    id: 'analysis',
    title: 'AI Analysis',
    description: 'Our AI guru analyzes heart, head, life, fate, and sun lines using Vedic Samudrika Shastra.',
    tip: 'The more angles captured, the more accurate your reading!',
    narration: 'Finally, our AI guru will analyze your heart line, head line, life line, fate line, and sun line using the ancient Vedic Samudrika Shastra. The more angles captured, the more accurate your reading will be. You are now ready to begin!',
    icon: Eye,
    animation: 'glow',
    highlightArea: 'position'
  }
];

interface PalmScanTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const PalmScanTutorial = ({ onComplete, onSkip }: PalmScanTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<number, string>>(new Map());

  // Stop any playing audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  // Play narration for current step
  const playNarration = useCallback(async (stepIndex: number) => {
    if (!voiceEnabled) return;
    
    stopAudio();
    
    // Check cache first
    if (audioCache.current.has(stepIndex)) {
      const cachedAudio = audioCache.current.get(stepIndex)!;
      const audio = new Audio(cachedAudio);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onplay = () => setIsSpeaking(true);
      await audio.play();
      return;
    }

    setIsLoadingAudio(true);
    try {
      const { data, error } = await supabase.functions.invoke('palm-reading-tts', {
        body: {
          text: TUTORIAL_STEPS[stepIndex].narration,
          voice: 'nova'
        }
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content');

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      audioCache.current.set(stepIndex, audioUrl);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onplay = () => setIsSpeaking(true);
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [voiceEnabled, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  useEffect(() => {
    // Trigger hint after delay
    const hintTimer = setTimeout(() => setShowHint(true), 1500);
    return () => clearTimeout(hintTimer);
  }, [currentStep]);

  useEffect(() => {
    setIsAnimating(true);
    setShowHint(false);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    
    // Play narration after animation completes
    const narrationTimer = setTimeout(() => {
      playNarration(currentStep);
    }, 700);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(narrationTimer);
    };
  }, [currentStep, playNarration]);

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const handleNext = () => {
    stopAudio();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    stopAudio();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    stopAudio();
    onSkip();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopAudio();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'pulse': return 'animate-pulse';
      case 'bounce': return 'animate-bounce';
      case 'wave': return 'tutorial-wave';
      case 'glow': return 'tutorial-glow';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* Voice toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVoice}
          className={`text-muted-foreground hover:text-foreground ${voiceEnabled ? 'text-primary' : ''}`}
        >
          {isLoadingAudio ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : voiceEnabled ? (
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
        
        {/* Skip button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Skip
        </Button>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
        {TUTORIAL_STEPS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentStep 
                ? 'bg-primary scale-125' 
                : idx < currentStep 
                  ? 'bg-success' 
                  : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`relative max-w-md mx-4 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {/* Icon display */}
        <div className="flex justify-center mb-8">
          <div className={`relative ${getAnimationClass(step.animation)}`}>
            {/* Background glow */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
            
            {/* Main icon container */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-16 h-16 text-primary" />
              
              {/* Orbiting elements */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 bg-secondary rounded-full" />
              </div>
            </div>

            {/* Checkmark for completed feel */}
            {currentStep > 0 && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center border-2 border-background">
                <CheckCircle2 className="w-5 h-5 text-success-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {step.title}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {step.description}
          </p>
          
          {/* Animated tip */}
          <div className={`transition-all duration-500 ${showHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm text-primary">
              <Lightbulb className="w-4 h-4" />
              <span>{step.tip}</span>
            </div>
          </div>
        </div>

        {/* Visual demonstration area */}
        {step.highlightArea && (
          <div className="mt-8 relative h-48 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 overflow-hidden">
            {step.highlightArea === 'palm' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Hand className="w-24 h-24 text-primary/60 tutorial-wave" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-dashed border-primary/40 rounded-lg animate-pulse" />
                  </div>
                  {/* Finger spread indicators */}
                  <Target className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-success animate-ping" />
                  <Target className="absolute top-1/3 -left-4 w-4 h-4 text-success animate-ping" style={{ animationDelay: '0.2s' }} />
                  <Target className="absolute top-1/3 -right-4 w-4 h-4 text-success animate-ping" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            
            {step.highlightArea === 'lighting' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Sun className="w-20 h-20 text-yellow-500 animate-pulse" />
                  {/* Light rays */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-12 bg-gradient-to-t from-yellow-500/0 to-yellow-500/60"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-40px)`,
                        animation: 'pulse 2s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {step.highlightArea === 'camera' && (
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                {['Center', 'Left', 'Right', 'Fingers'].map((label, idx) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div 
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        idx === 0 ? 'bg-primary border-primary text-primary-foreground scale-110' : 'border-muted-foreground/30 text-muted-foreground'
                      }`}
                      style={{ animation: idx === 0 ? 'pulse 1.5s ease-in-out infinite' : 'none' }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            )}
            
            {step.highlightArea === 'position' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Simulated palm lines */}
                  <svg viewBox="0 0 100 100" className="w-32 h-32">
                    <path
                      d="M20,40 Q50,30 80,35"
                      stroke="hsl(var(--destructive))"
                      strokeWidth="2"
                      fill="none"
                      className="tutorial-line-draw"
                      style={{ animationDelay: '0s' }}
                    />
                    <path
                      d="M15,55 Q50,50 85,55"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      fill="none"
                      className="tutorial-line-draw"
                      style={{ animationDelay: '0.3s' }}
                    />
                    <path
                      d="M25,75 Q40,50 55,30"
                      stroke="hsl(var(--success))"
                      strokeWidth="2"
                      fill="none"
                      className="tutorial-line-draw"
                      style={{ animationDelay: '0.6s' }}
                    />
                  </svg>
                  {/* Labels */}
                  <div className="absolute top-2 right-0 text-xs text-destructive animate-fade-in" style={{ animationDelay: '0.2s' }}>Heart</div>
                  <div className="absolute top-1/2 right-0 text-xs text-primary animate-fade-in" style={{ animationDelay: '0.5s' }}>Head</div>
                  <div className="absolute bottom-2 left-0 text-xs text-success animate-fade-in" style={{ animationDelay: '0.8s' }}>Life</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>

          <Button
            onClick={handleNext}
            className="gap-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              <>
                Start Scanning
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
        }
        
        .tutorial-wave {
          animation: wave 2s ease-in-out infinite;
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        .tutorial-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px hsl(var(--primary) / 0.5)); }
          50% { filter: drop-shadow(0 0 25px hsl(var(--primary) / 0.8)); }
        }
        
        .tutorial-line-draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 1s ease-out forwards;
        }
        
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default PalmScanTutorial;
