import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { generatePalmReadingPDF } from '@/utils/pdfGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import SocialShare from '@/components/SocialShare';
import PalmAnalysisResults from '@/components/PalmAnalysisResults';
import EnhancedPalmVisualization from '@/components/EnhancedPalmVisualization';
import AILineDetectionOverlay from '@/components/AILineDetectionOverlay';
import PalmScannerBiometric from '@/components/PalmScannerBiometric';
import TarotPull from '@/components/TarotPull';
import FreePalmReadingSummary from '@/components/FreePalmReadingSummary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  Hand,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Heart,
  Briefcase,
  Activity,
  Users,
  GraduationCap,
  Flame,
  Plane,
  Star,
  Globe,
  Volume2,
  History,
  Download,
  HeartHandshake,
  FileText,
  Trash2,
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Sun,
  Moon,
  Sunrise,
  Upload
} from 'lucide-react';

interface CategoryPrediction {
  title: string;
  prediction: string;
  palmFeatures?: string[];
  planetaryInfluence?: string;
  timeline?: string;
  guidance: string;
  rating: number;
}

interface MountAnalysis {
  strength: string;
  meaning: string;
}

interface LineAnalysis {
  type: string;
  meaning: string;
  loveStyle?: string;
  thinkingStyle?: string;
  vitality?: string;
  destinyPath?: string;
  successPath?: string;
  observed?: string;
  rating?: number;
  position?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    curveIntensity: string;
  };
}

interface PalmAnalysis {
  language?: string;
  palmType?: string;
  dominantPlanet?: string;
  nakshatra?: string;
  greeting?: string;
  overallDestiny?: string;
  categories?: {
    career?: CategoryPrediction;
    love?: CategoryPrediction;
    health?: CategoryPrediction;
    family?: CategoryPrediction;
    education?: CategoryPrediction;
    spiritual?: CategoryPrediction;
    travel?: CategoryPrediction;
  };
  mountAnalysis?: {
    jupiter?: MountAnalysis;
    saturn?: MountAnalysis;
    apollo?: MountAnalysis;
    mercury?: MountAnalysis;
    venus?: MountAnalysis;
    mars?: MountAnalysis;
    moon?: MountAnalysis;
  };
  lineAnalysis?: {
    heartLine?: LineAnalysis;
    headLine?: LineAnalysis;
    lifeLine?: LineAnalysis;
    fateLine?: LineAnalysis;
    sunLine?: LineAnalysis;
  };
  specialMarks?: string[];
  luckyElements?: {
    colors?: string[];
    gemstones?: string[];
    mantras?: string[];
    days?: string[];
    numbers?: number[];
    metals?: string[];
    directions?: string[];
  };
  remedies?: string[];
  warnings?: string[];
  yogas?: string[];
  blessings?: string;
  rawAnalysis?: string;
}

interface PalmReadingRecord {
  id: string;
  palm_image_url: string | null;
  language: string;
  palm_type: string | null;
  analysis: PalmAnalysis;
  created_at: string;
}

interface CompatibilityResult {
  overallScore?: number;
  greeting?: string;
  summary?: string;
  categories?: Record<string, {
    score: number;
    title: string;
    analysis: string;
    advice: string;
  }>;
  strengths?: string[];
  challenges?: string[];
  remedies?: string[];
  bestPeriods?: string[];
  blessings?: string;
  rawAnalysis?: string;
}

interface DailyHoroscope {
  date?: string;
  dayPlanet?: string;
  tithi?: string;
  greeting?: string;
  overallEnergy?: string;
  energyScore?: number;
  cosmicAlignment?: string;
  luckyTime?: string;
  luckyColor?: string;
  luckyNumber?: number;
  luckyDirection?: string;
  predictions?: {
    morning?: { title: string; ruling?: string; prediction: string; bestActivity?: string; advice: string; caution?: string };
    afternoon?: { title: string; ruling?: string; prediction: string; bestActivity?: string; advice: string; caution?: string };
    evening?: { title: string; ruling?: string; prediction: string; bestActivity?: string; advice: string; caution?: string };
  };
  categories?: Record<string, { score: number; planetInfluence?: string; prediction: string; tip: string; auspiciousTime?: string }>;
  mantraOfTheDay?: string | { sanskrit?: string; transliteration?: string; meaning?: string; japaCount?: string; bestTime?: string };
  mantraMeaning?: string;
  rituals?: { morning?: string; evening?: string; special?: string };
  doToday?: string[];
  avoidToday?: string[];
  gemstoneAdvice?: { wear?: string; avoid?: string };
  cosmicMessage?: string;
  affirmation?: string;
  blessings?: string;
  rawAnalysis?: string;
}

const LANGUAGES = [
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
];

const PalmReading = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [activeTab, setActiveTab] = useState('scan');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [palmImages, setPalmImages] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PalmAnalysis | null>(null);
  
  // User metadata for enhanced analysis
  const [userName, setUserName] = useState<string>('');
  const [userDob, setUserDob] = useState<string>('');
  const [userTimeOfBirth, setUserTimeOfBirth] = useState<string>('');
  
  // Voice Narration
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // History
  const [history, setHistory] = useState<PalmReadingRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PalmReadingRecord | null>(null);
  
  // Compatibility
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [selectedForCompatibility, setSelectedForCompatibility] = useState<PalmReadingRecord | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [analyzingCompatibility, setAnalyzingCompatibility] = useState(false);
  
  // PDF Generation
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Horoscope & Visualization
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  
  // Free vs Premium reading toggle
  const [showFullReading, setShowFullReading] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Check premium status (demo: check if user has level 3+ or 500+ XP)
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremiumUser(false);
        return;
      }

      try {
        // Check for admin role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roles?.some(r => r.role === 'admin' || r.role === 'moderator')) {
          setIsPremiumUser(true);
          setShowFullReading(true);
          return;
        }

        // Check spiritual journey for demo premium access
        const { data: journey } = await supabase
          .from('spiritual_journey')
          .select('level, experience_points')
          .eq('user_id', user.id)
          .single();

        if (journey && (journey.level >= 3 || journey.experience_points >= 500)) {
          setIsPremiumUser(true);
          setShowFullReading(true);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };

    checkPremiumStatus();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  // Note: Scanning animation is handled by PalmScannerBiometric component

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('palm_reading_history' as never)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setHistory((data || []) as PalmReadingRecord[]);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveToHistory = async (palmAnalysis: PalmAnalysis, imageData: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('palm_reading_history' as never)
        .insert({
          user_id: user.id,
          palm_image_url: imageData.substring(0, 500),
          language: selectedLanguage,
          palm_type: palmAnalysis.palmType || null,
          analysis: palmAnalysis
        } as never);
      if (error) console.error('Save error:', error);
      loadHistory();
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await supabase.from('palm_reading_history' as never).delete().eq('id', id);
      setHistory(prev => prev.filter(item => item.id !== id));
      toast({ title: "Reading deleted", description: "Palm reading removed from history" });
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Note: Biometric scan is now handled directly by PalmScannerBiometric component

  const handleBiometricScanComplete = (images: string[], metadata: { name?: string; dob?: string; timeOfBirth?: string }) => {
    setPalmImages(images);
    setUserName(metadata.name || '');
    setUserDob(metadata.dob || '');
    setUserTimeOfBirth(metadata.timeOfBirth || '');
  };

  const handleBiometricScanCancel = () => {
    setPalmImages([]);
    setAnalysis(null);
  };

  const handleBiometricAnalyze = async (images: string[], metadata: { name?: string; dob?: string; timeOfBirth?: string }) => {
    setPalmImages(images);
    setUserName(metadata.name || '');
    setUserDob(metadata.dob || '');
    setUserTimeOfBirth(metadata.timeOfBirth || '');
    
    // Trigger analysis
    setAnalyzing(true);
    setAnalysis(null);
    setAudioUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('palm-reading-analysis', {
        body: { 
          imageData: images[0],
          language: selectedLanguage,
          userName: metadata.name || undefined,
          userDob: metadata.dob || undefined,
          userTimeOfBirth: metadata.timeOfBirth || undefined
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        await saveToHistory(data.analysis, images[0]);
        toast({
          title: "🙏 Palm Reading Complete",
          description: "Your detailed destiny reading is ready",
        });
      } else {
        throw new Error('No analysis returned');
      }

    } catch (error) {
      console.error('Palm analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze palm. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Note: Camera capture is handled by PalmScannerBiometric component

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedLanguage) {
      toast({
        title: "Select Language",
        description: "Please select your preferred language first",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPalmImages([reader.result as string]);
      toast({
        title: "Palm image uploaded",
        description: "Ready for analysis",
      });
    };
    reader.readAsDataURL(file);
  };

  const analyzePalm = async () => {
    if (palmImages.length === 0) {
      toast({
        title: "No palm scan",
        description: "Please complete the biometric scan first",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setAudioUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('palm-reading-analysis', {
        body: { 
          imageData: palmImages[0],
          language: selectedLanguage,
          userName: userName || undefined,
          userDob: userDob || undefined,
          userTimeOfBirth: userTimeOfBirth || undefined
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        await saveToHistory(data.analysis, palmImages[0]);
        toast({
          title: "🙏 Palm Reading Complete",
          description: "Your detailed destiny reading is ready",
        });
      } else {
        throw new Error('No analysis returned');
      }

    } catch (error) {
      console.error('Palm analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze palm. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateNarration = async () => {
    if (!analysis) return;
    
    setNarrationLoading(true);
    try {
      // Build narration text from analysis
      let narrationText = analysis.greeting || '';
      if (analysis.overallDestiny) {
        narrationText += ` ${analysis.overallDestiny}`;
      }
      if (analysis.categories) {
        Object.values(analysis.categories).forEach(cat => {
          if (cat?.prediction) {
            narrationText += ` ${cat.title}: ${cat.prediction}`;
          }
        });
      }
      if (analysis.blessings) {
        narrationText += ` ${analysis.blessings}`;
      }

      const { data, error } = await supabase.functions.invoke('palm-reading-tts', {
        body: { 
          text: narrationText.substring(0, 4000),
          voice: selectedLanguage === 'hi' ? 'alloy' : 'nova'
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Auto-play
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsNarrating(true);
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "Voice generation failed",
        description: "Could not generate audio narration",
        variant: "destructive"
      });
    } finally {
      setNarrationLoading(false);
    }
  };

  const toggleNarration = () => {
    if (audioRef.current) {
      if (isNarrating) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsNarrating(!isNarrating);
    } else if (!audioUrl) {
      generateNarration();
    }
  };

  const analyzeCompatibility = async () => {
    if (!analysis || !selectedForCompatibility) {
      toast({
        title: "Select readings",
        description: "Please select two palm readings to compare",
        variant: "destructive"
      });
      return;
    }

    setAnalyzingCompatibility(true);
    try {
      const { data, error } = await supabase.functions.invoke('palm-compatibility', {
        body: {
          palmAnalysis1: analysis,
          palmAnalysis2: selectedForCompatibility.analysis,
          language: selectedLanguage
        }
      });

      if (error) throw error;

      if (data?.compatibility) {
        setCompatibilityResult(data.compatibility);
        toast({
          title: "💕 Compatibility Analysis Complete",
          description: "Your relationship insights are ready",
        });
      }
    } catch (error) {
      console.error('Compatibility error:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze compatibility",
        variant: "destructive"
      });
    } finally {
      setAnalyzingCompatibility(false);
    }
  };

  const generateDailyHoroscope = async () => {
    if (!analysis) {
      toast({
        title: "Complete palm reading first",
        description: "Get a palm reading to generate personalized horoscope",
        variant: "destructive"
      });
      return;
    }

    setLoadingHoroscope(true);
    setHoroscope(null);
    try {
      const { data, error } = await supabase.functions.invoke('palm-daily-horoscope', {
        body: {
          palmAnalysis: analysis,
          language: selectedLanguage
        }
      });

      if (error) throw error;

      if (data?.horoscope) {
        setHoroscope(data.horoscope);
        toast({
          title: "🌟 Daily Horoscope Ready",
          description: "Your personalized predictions for today",
        });
      }
    } catch (error) {
      console.error('Horoscope error:', error);
      toast({
        title: "Failed to generate horoscope",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoadingHoroscope(false);
    }
  };

  const generatePdfReport = async () => {
    if (!analysis) return;
    
    if (!isPremiumUser) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to download PDF reports",
        variant: "destructive"
      });
      navigate('/premium');
      return;
    }
    
    setGeneratingPdf(true);
    try {
      generatePalmReadingPDF(analysis, userName);
      toast({
        title: "📄 Report Downloaded",
        description: "Your beautiful PDF report has been saved",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download failed",
        description: "Could not generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleUpgradeToPremium = () => {
    navigate('/premium');
  };

  const resetScan = () => {
    setPalmImages([]);
    setAnalysis(null);
    setAudioUrl(null);
    setIsNarrating(false);
    setCompatibilityResult(null);
    setSelectedForCompatibility(null);
    setUserName('');
    setUserDob('');
    setUserTimeOfBirth('');
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'career': return Briefcase;
      case 'love': return Heart;
      case 'health': return Activity;
      case 'family': return Users;
      case 'education': return GraduationCap;
      case 'spiritual': return Flame;
      case 'travel': return Plane;
      default: return Star;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🤚</div>
          <p className="text-muted-foreground">Loading palm reading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-peace">
      <Navigation />
      <audio ref={audioRef} onEnded={() => setIsNarrating(false)} className="hidden" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full animate-pulse">
            <Hand className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
            AI Guru Palm Reading
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Premium Vedic Palm Analysis • Voice Narration • History & Compatibility
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="scan" className="gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="tarot" className="gap-2">
              <span className="text-lg">🔮</span>
              <span className="hidden sm:inline">Tarot</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="horoscope" className="gap-2">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Horoscope</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Lines</span>
            </TabsTrigger>
            <TabsTrigger value="compatibility" className="gap-2">
              <HeartHandshake className="h-4 w-4" />
              <span className="hidden sm:inline">Match</span>
            </TabsTrigger>
          </TabsList>

          {/* Scan Tab */}
          <TabsContent value="scan">
            {/* Show Scanner if no analysis or images */}
            {!analysis && palmImages.length === 0 && (
              <PalmScannerBiometric
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                onScanComplete={handleBiometricScanComplete}
                onAnalyze={handleBiometricAnalyze}
                analyzing={analyzing}
                languages={LANGUAGES}
              />
            )}

            {/* Show Results Grid when palm images exist */}
            {palmImages.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Image Preview */}
              <div className="space-y-6">
                {!analysis && (
                  <Card className="card-sacred border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <span>Palm Captured</span>
                        </span>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          {palmImages.length} scan{palmImages.length > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative rounded-xl overflow-hidden shadow-divine border-2 border-primary/30">
                        <img 
                          src={palmImages[palmImages.length - 1]} 
                          alt="Palm scan" 
                          className="w-full h-auto max-h-[400px] object-contain"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={analyzePalm}
                          disabled={analyzing}
                          className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          {analyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Consulting AI Guru...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Get Divine Reading
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={resetScan}
                          disabled={analyzing}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scanning Tips */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <span>Scanning Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>🤚 Use your dominant hand (right for most people)</p>
                    <p>💡 Bright, natural lighting works best</p>
                    <p>📸 Keep palm flat with fingers slightly spread</p>
                    <p>🎯 Follow on-screen guidance for each angle</p>
                    <p>🔍 Ensure all major lines are clearly visible</p>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Results */}
              <div className="space-y-6">
                {!analysis && !analyzing && (
                  <Card className="card-sacred">
                    <CardContent className="text-center py-16">
                      <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        Complete your biometric palm scan to receive<br />your personalized destiny reading from AI Guru
                      </p>
                    </CardContent>
                  </Card>
                )}

                {analyzing && (
                  <Card className="card-sacred border-primary/30">
                    <CardContent className="text-center py-16 space-y-4">
                      <div className="relative inline-block">
                        <div className="text-6xl animate-om-pulse">🙏</div>
                        <div className="absolute -inset-4 border-4 border-primary/20 rounded-full animate-ping" />
                      </div>
                      <p className="text-lg font-semibold">AI Guru is reading your palm...</p>
                      <p className="text-sm text-muted-foreground">Analyzing destiny patterns</p>
                    </CardContent>
                  </Card>
                )}

                {analysis && (
                  <div className="space-y-4">
                    {/* Premium Toggle */}
                    {!isPremiumUser && (
                      <Card className="border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">👑</span>
                              <div>
                                <p className="font-semibold">Viewing Free Summary</p>
                                <p className="text-sm text-muted-foreground">Upgrade to see all 7 detailed category predictions</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={showFullReading ? "outline" : "default"}
                                size="sm"
                                onClick={() => setShowFullReading(!showFullReading)}
                              >
                                {showFullReading ? 'Show Free' : 'Preview Full'}
                              </Button>
                              <Button
                                onClick={handleUpgradeToPremium}
                                size="sm"
                                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500"
                              >
                                Unlock Premium
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                      <Button
                        onClick={toggleNarration}
                        disabled={narrationLoading || (!isPremiumUser && !showFullReading)}
                        variant="outline"
                        className="gap-2"
                      >
                        {narrationLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isNarrating ? (
                          <Pause className="h-4 w-4" />
                        ) : audioUrl ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                        {narrationLoading ? 'Generating...' : isNarrating ? 'Pause' : 'Listen'}
                        {!isPremiumUser && <span className="text-xs">👑</span>}
                      </Button>
                      
                      <SocialShare 
                        title="AI Guru Palm Reading"
                        text={analysis.overallDestiny || analysis.greeting || 'My palm reading from BhaktVerse'}
                        palmType={analysis.palmType}
                      />
                      
                      <Button
                        onClick={() => setActiveTab('horoscope')}
                        variant="outline"
                        className="gap-2"
                        disabled={!isPremiumUser && !showFullReading}
                      >
                        <Sun className="h-4 w-4" />
                        Horoscope
                        {!isPremiumUser && <span className="text-xs">👑</span>}
                      </Button>
                      
                      <Button
                        onClick={() => setActiveTab('visualization')}
                        variant="outline"
                        className="gap-2"
                        disabled={!isPremiumUser && !showFullReading}
                      >
                        <Eye className="h-4 w-4" />
                        View Lines
                        {!isPremiumUser && <span className="text-xs">👑</span>}
                      </Button>
                      
                      <Button
                        onClick={generatePdfReport}
                        disabled={generatingPdf}
                        variant="outline"
                        className="gap-2"
                      >
                        {generatingPdf ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        PDF Report
                        {!isPremiumUser && <span className="text-xs">👑</span>}
                      </Button>
                      
                      <Button
                        onClick={resetScan}
                        variant="outline"
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => navigate('/saint-chat')}
                        variant="outline"
                        className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                      >
                        <Sparkles className="h-4 w-4" />
                        Chat with Guru
                      </Button>
                    </div>

                    {/* Conditional Results Display */}
                    <ScrollArea className="h-[750px] pr-4">
                      {(isPremiumUser || showFullReading) ? (
                        <PalmAnalysisResults 
                          analysis={analysis} 
                          palmImage={palmImages[0]}
                        />
                      ) : (
                        <FreePalmReadingSummary 
                          analysis={analysis}
                          onUpgrade={handleUpgradeToPremium}
                          showUpgradePrompt={true}
                        />
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
            )}
          </TabsContent>

          {/* Tarot Tab */}
          <TabsContent value="tarot">
            <div className="grid lg:grid-cols-2 gap-8">
              <TarotPull 
                palmAnalysis={analysis || undefined}
                language={selectedLanguage}
                onPullComplete={(cards, interpretation) => {
                  toast({
                    title: "🔮 Tarot Reading Complete",
                    description: "Your cards have revealed their wisdom",
                  });
                }}
              />
              
              {/* Tarot + Palm Combo Info */}
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    Palm + Tarot Synergy
                  </CardTitle>
                  <CardDescription>
                    Combining ancient wisdom traditions for deeper insight
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-lg">🤚</span>
                      <div>
                        <p className="font-medium">Palm Reading</p>
                        <p className="text-muted-foreground">Reveals your inherent nature, life patterns, and long-term destiny through physical features</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-lg">🎴</span>
                      <div>
                        <p className="font-medium">Tarot Cards</p>
                        <p className="text-muted-foreground">Illuminates current energies, immediate circumstances, and near-future possibilities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-lg">🔮</span>
                      <div>
                        <p className="font-medium text-primary">Combined Insight</p>
                        <p className="text-muted-foreground">Together they provide a complete picture - what you're born with + what you're experiencing now</p>
                      </div>
                    </div>
                  </div>
                  
                  {!analysis && (
                      <div className="space-y-3">
                        <Button 
                          onClick={() => setActiveTab('scan')}
                          className="w-full gap-2"
                        >
                          <Hand className="h-4 w-4" />
                          Get Palm Reading First
                        </Button>
                        <Button 
                          onClick={() => navigate('/saint-chat')}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Chat with AI Guru
                        </Button>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary" />
                  <span>Your Palm Reading History</span>
                </CardTitle>
                <CardDescription>
                  View and manage your past palm readings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-2">Loading history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mt-4">No palm readings yet</p>
                    <Button 
                      onClick={() => setActiveTab('scan')}
                      className="mt-4 gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Get Your First Reading
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {history.map((item) => (
                      <Card key={item.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{item.palm_type || 'Standard'}</Badge>
                                <Badge variant="secondary">
                                  {LANGUAGES.find(l => l.code === item.language)?.name || item.language}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(item.created_at).toLocaleDateString()}
                                <Clock className="h-4 w-4 ml-2" />
                                {new Date(item.created_at).toLocaleTimeString()}
                              </p>
                              {item.analysis?.overallDestiny && (
                                <p className="text-sm mt-2 line-clamp-2">
                                  {item.analysis.overallDestiny}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedHistoryItem(item)}
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Palm Reading Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedHistoryItem && (
                                    <div className="space-y-4">
                                      {selectedHistoryItem.analysis?.greeting && (
                                        <div className="bg-primary/10 p-4 rounded-lg">
                                          <p className="italic">"{selectedHistoryItem.analysis.greeting}"</p>
                                        </div>
                                      )}
                                      {selectedHistoryItem.analysis?.overallDestiny && (
                                        <div>
                                          <h4 className="font-semibold mb-2">Life Path</h4>
                                          <p className="text-sm">{selectedHistoryItem.analysis.overallDestiny}</p>
                                        </div>
                                      )}
                                      {selectedHistoryItem.analysis?.blessings && (
                                        <div className="bg-success/10 p-4 rounded-lg">
                                          <p className="italic text-center">🙏 {selectedHistoryItem.analysis.blessings}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedForCompatibility(item);
                                  setActiveTab('compatibility');
                                }}
                              >
                                <HeartHandshake className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteFromHistory(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compatibility Tab */}
          <TabsContent value="compatibility">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HeartHandshake className="h-5 w-5 text-primary" />
                    <span>Palm Compatibility Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Compare two palm readings to discover relationship insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium mb-2">Person 1 (Current Reading)</p>
                      {analysis ? (
                        <Badge variant="secondary">{analysis.palmType || 'Current'} Palm</Badge>
                      ) : (
                        <p className="text-sm text-muted-foreground">Complete a new reading first</p>
                      )}
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium mb-2">Person 2 (From History)</p>
                      {selectedForCompatibility ? (
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{selectedForCompatibility.palm_type || 'Selected'} Palm</Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedForCompatibility(null)}
                          >
                            Clear
                          </Button>
                        </div>
                      ) : (
                        <Select 
                          onValueChange={(value) => {
                            const item = history.find(h => h.id === value);
                            setSelectedForCompatibility(item || null);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select from history" />
                          </SelectTrigger>
                          <SelectContent>
                            {history.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.palm_type || 'Reading'} - {new Date(item.created_at).toLocaleDateString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={analyzeCompatibility}
                    disabled={!analysis || !selectedForCompatibility || analyzingCompatibility}
                    className="w-full gap-2 bg-gradient-to-r from-pink-500 to-red-500"
                  >
                    {analyzingCompatibility ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing Compatibility...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        Check Compatibility
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Compatibility Results */}
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle>Compatibility Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {!compatibilityResult ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mt-4">
                        Select two readings to analyze compatibility
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {compatibilityResult.overallScore !== undefined && (
                          <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl">
                            <div className="text-5xl font-bold text-primary">
                              {compatibilityResult.overallScore}%
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Overall Compatibility</p>
                          </div>
                        )}

                        {compatibilityResult.greeting && (
                          <div className="bg-primary/10 p-4 rounded-lg">
                            <p className="italic">"{compatibilityResult.greeting}"</p>
                          </div>
                        )}

                        {compatibilityResult.summary && (
                          <div>
                            <h4 className="font-semibold mb-2">Summary</h4>
                            <p className="text-sm">{compatibilityResult.summary}</p>
                          </div>
                        )}

                        {compatibilityResult.categories && Object.entries(compatibilityResult.categories).map(([key, cat]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">{cat.title}</h4>
                              <Badge variant={cat.score >= 70 ? 'default' : cat.score >= 50 ? 'secondary' : 'destructive'}>
                                {cat.score}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{cat.analysis}</p>
                            <p className="text-sm text-primary">{cat.advice}</p>
                          </div>
                        ))}

                        {compatibilityResult.strengths && compatibilityResult.strengths.length > 0 && (
                          <div className="bg-success/10 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-success">Strengths</h4>
                            <ul className="text-sm space-y-1">
                              {compatibilityResult.strengths.map((s, i) => (
                                <li key={i}>✓ {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {compatibilityResult.challenges && compatibilityResult.challenges.length > 0 && (
                          <div className="bg-warning/10 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-warning">Challenges</h4>
                            <ul className="text-sm space-y-1">
                              {compatibilityResult.challenges.map((c, i) => (
                                <li key={i}>⚠ {c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {compatibilityResult.blessings && (
                          <div className="text-center p-4 bg-primary/5 rounded-lg">
                            <p className="italic">🙏 {compatibilityResult.blessings}</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Horoscope Tab */}
          <TabsContent value="horoscope">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-warning" />
                    <span>Daily Horoscope</span>
                  </CardTitle>
                  <CardDescription>
                    Personalized predictions based on your palm reading
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!analysis ? (
                    <div className="text-center py-12">
                      <Hand className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mt-4">
                        Complete a palm reading first to get personalized horoscope
                      </p>
                      <Button onClick={() => setActiveTab('scan')} className="mt-4 gap-2">
                        <Camera className="h-4 w-4" />
                        Get Palm Reading
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-warning/10 to-primary/10 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Your palm type</p>
                        <p className="text-xl font-bold">{analysis.palmType || 'Standard'} Hand</p>
                      </div>
                      <Button
                        onClick={generateDailyHoroscope}
                        disabled={loadingHoroscope}
                        className="w-full gap-2 bg-gradient-to-r from-orange-500 to-yellow-500"
                      >
                        {loadingHoroscope ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Consulting the stars...
                          </>
                        ) : (
                          <>
                            <Sun className="h-4 w-4" />
                            Generate Today's Horoscope
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Horoscope Results */}
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle>Today's Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  {!horoscope ? (
                    <div className="text-center py-12">
                      <Sun className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mt-4">
                        Generate your daily horoscope
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-4">
                        {horoscope.greeting && (
                          <div className="bg-warning/10 p-4 rounded-lg">
                            <p className="italic">"{horoscope.greeting}"</p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Lucky Time</p>
                            <p className="font-semibold">{horoscope.luckyTime || 'N/A'}</p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Lucky Color</p>
                            <p className="font-semibold">{horoscope.luckyColor || 'N/A'}</p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Lucky Number</p>
                            <p className="font-semibold">{horoscope.luckyNumber || 'N/A'}</p>
                          </div>
                        </div>

                        {horoscope.predictions && (
                          <div className="space-y-3">
                            {horoscope.predictions.morning && (
                              <div className="border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sunrise className="h-4 w-4 text-orange-500" />
                                  <h4 className="font-semibold">{horoscope.predictions.morning.title}</h4>
                                </div>
                                <p className="text-sm">{horoscope.predictions.morning.prediction}</p>
                                <p className="text-xs text-primary mt-1">{horoscope.predictions.morning.advice}</p>
                              </div>
                            )}
                            {horoscope.predictions.afternoon && (
                              <div className="border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sun className="h-4 w-4 text-yellow-500" />
                                  <h4 className="font-semibold">{horoscope.predictions.afternoon.title}</h4>
                                </div>
                                <p className="text-sm">{horoscope.predictions.afternoon.prediction}</p>
                                <p className="text-xs text-primary mt-1">{horoscope.predictions.afternoon.advice}</p>
                              </div>
                            )}
                            {horoscope.predictions.evening && (
                              <div className="border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Moon className="h-4 w-4 text-indigo-500" />
                                  <h4 className="font-semibold">{horoscope.predictions.evening.title}</h4>
                                </div>
                                <p className="text-sm">{horoscope.predictions.evening.prediction}</p>
                                <p className="text-xs text-primary mt-1">{horoscope.predictions.evening.advice}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {horoscope.categories && (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(horoscope.categories).map(([key, cat]) => (
                              <div key={key} className="bg-muted/30 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                  <h5 className="font-medium capitalize text-sm">{key}</h5>
                                  <Badge variant="outline" className="text-xs">{cat.score}/10</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{cat.prediction}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {horoscope.mantraOfTheDay && (
                          <div className="bg-primary/10 p-4 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">Mantra of the Day</p>
                            <p className="font-semibold text-primary">
                              {typeof horoscope.mantraOfTheDay === 'string' 
                                ? horoscope.mantraOfTheDay 
                                : horoscope.mantraOfTheDay.sanskrit || horoscope.mantraOfTheDay.transliteration}
                            </p>
                            {horoscope.mantraMeaning && (
                              <p className="text-xs mt-1">{horoscope.mantraMeaning}</p>
                            )}
                            {typeof horoscope.mantraOfTheDay === 'object' && horoscope.mantraOfTheDay.meaning && (
                              <p className="text-xs mt-1">{horoscope.mantraOfTheDay.meaning}</p>
                            )}
                          </div>
                        )}

                        {(horoscope.doToday || horoscope.avoidToday) && (
                          <div className="grid grid-cols-2 gap-3">
                            {horoscope.doToday && horoscope.doToday.length > 0 && (
                              <div className="bg-success/10 p-3 rounded-lg">
                                <h5 className="font-semibold text-success text-sm mb-2">✓ Do Today</h5>
                                <ul className="text-xs space-y-1">
                                  {horoscope.doToday.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {horoscope.avoidToday && horoscope.avoidToday.length > 0 && (
                              <div className="bg-destructive/10 p-3 rounded-lg">
                                <h5 className="font-semibold text-destructive text-sm mb-2">✗ Avoid Today</h5>
                                <ul className="text-xs space-y-1">
                                  {horoscope.avoidToday.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {horoscope.cosmicMessage && (
                          <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                            <p className="text-sm font-medium">✨ {horoscope.cosmicMessage}</p>
                          </div>
                        )}

                        {horoscope.blessings && (
                          <div className="text-center p-4 bg-primary/5 rounded-lg">
                            <p className="italic">🙏 {horoscope.blessings}</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visualization Tab */}
          <TabsContent value="visualization">
            {palmImages.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* AI Line Detection Overlay */}
                <AILineDetectionOverlay 
                  imageUrl={palmImages[0]} 
                  lineAnalysis={analysis?.lineAnalysis}
                  isAnalyzing={analyzing}
                  onAnalyzeRequest={analyzePalm}
                />
                
                {/* Enhanced Visualization */}
                <EnhancedPalmVisualization 
                  imageUrl={palmImages[0]} 
                  palmType={analysis?.palmType}
                  lineAnalysis={analysis?.lineAnalysis}
                  mountAnalysis={analysis?.mountAnalysis}
                />
              </div>
            ) : (
              <Card className="card-sacred">
                <CardContent className="text-center py-16">
                  <Eye className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4">
                    Upload a palm image to see AI-powered line visualization
                  </p>
                  <Button onClick={() => setActiveTab('scan')} className="mt-4 gap-2">
                    <Camera className="h-4 w-4" />
                    Scan Palm
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Disclaimer Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            🔮 <strong>Disclaimer:</strong> This palm reading and tarot service is for entertainment and spiritual reflection purposes only. 
            It is not intended as medical, legal, financial, or professional advice. Readings are based on traditional Vedic palmistry (Samudrika Shastra) 
            interpreted through AI assistance. Please consult qualified professionals for important life decisions.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(400px); }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PalmReading;
