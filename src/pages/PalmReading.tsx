import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import SocialShare from '@/components/SocialShare';
import PalmAnalysisResults from '@/components/PalmAnalysisResults';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera as CameraPlugin } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import {
  Camera,
  Upload,
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
  Sunset,
  Languages
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

const SCAN_STEPS = [
  { id: 'center', label: 'Center Palm', icon: Hand, description: 'Place palm flat, fingers spread' },
  { id: 'left', label: 'Left Side', icon: Hand, description: 'Tilt hand slightly left' },
  { id: 'right', label: 'Right Side', icon: Hand, description: 'Tilt hand slightly right' },
  { id: 'fingers', label: 'Finger Lines', icon: Hand, description: 'Focus on finger tips' },
];

const PalmReading = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [activeTab, setActiveTab] = useState('scan');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [currentScanStep, setCurrentScanStep] = useState(0);
  const [palmImages, setPalmImages] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PalmAnalysis | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  
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

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    if (isScanning && palmImages.length > 0) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            if (currentScanStep < SCAN_STEPS.length - 1) {
              setCurrentScanStep(currentScanStep + 1);
              setScanProgress(0);
            }
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning, palmImages.length, currentScanStep]);

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

  const startBiometricScan = () => {
    if (!selectedLanguage) {
      toast({
        title: "Select Language",
        description: "Please select your preferred language first",
        variant: "destructive"
      });
      return;
    }
    setShowLanguageSelector(false);
    setCurrentScanStep(0);
    setPalmImages([]);
  };

  const handleCaptureScanStep = async () => {
    try {
      const image = await CameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: `Capture: ${SCAN_STEPS[currentScanStep].label}`,
        promptLabelPhoto: 'Take Photo',
      });

      if (image.dataUrl) {
        setPalmImages(prev => [...prev, image.dataUrl!]);
        setIsScanning(true);
        
        toast({
          title: `${SCAN_STEPS[currentScanStep].label} captured ✓`,
          description: currentScanStep < SCAN_STEPS.length - 1 
            ? `Next: ${SCAN_STEPS[currentScanStep + 1].label}` 
            : 'All scans complete!',
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera access failed",
        description: "Please try uploading an image instead",
        variant: "destructive"
      });
    }
  };

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
      setShowLanguageSelector(false);
      setIsScanning(true);
      setScanProgress(0);
      
      toast({
        title: "Palm image uploaded",
        description: "Processing biometric scan...",
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
          language: selectedLanguage 
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
    
    setGeneratingPdf(true);
    try {
      // Create PDF content
      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Palm Reading Report - BhaktVerse</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #ff9933; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #ff6600; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0; }
    .section { margin-bottom: 25px; padding: 20px; background: #fef5e7; border-radius: 10px; border-left: 4px solid #ff9933; }
    .section h2 { color: #ff6600; margin: 0 0 10px 0; font-size: 18px; }
    .section p { margin: 5px 0; line-height: 1.6; }
    .category { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; }
    .category h3 { color: #333; margin: 0 0 8px 0; display: flex; justify-content: space-between; align-items: center; }
    .category .rating { background: #ff9933; color: white; padding: 2px 8px; border-radius: 4px; font-size: 14px; }
    .lucky { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .lucky-item { background: white; padding: 10px; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    .om { font-size: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="om">🕉️</div>
    <h1>AI Guru Palm Reading Report</h1>
    <p>Generated by BhaktVerse • ${new Date().toLocaleDateString()}</p>
    <p>Palm Type: ${analysis.palmType || 'Standard'}</p>
  </div>

  ${analysis.greeting ? `
  <div class="section">
    <h2>🙏 AI Guru's Greeting</h2>
    <p><em>"${analysis.greeting}"</em></p>
  </div>
  ` : ''}

  ${analysis.overallDestiny ? `
  <div class="section">
    <h2>⭐ Your Life Path</h2>
    <p>${analysis.overallDestiny}</p>
  </div>
  ` : ''}

  ${analysis.categories ? `
  <div class="section">
    <h2>📊 Category-wise Predictions</h2>
    ${Object.entries(analysis.categories).map(([key, cat]) => cat ? `
    <div class="category">
      <h3>${cat.title} <span class="rating">${cat.rating}/10</span></h3>
      <p>${cat.prediction}</p>
      ${cat.timeline ? `<p><strong>Timeline:</strong> ${cat.timeline}</p>` : ''}
      ${cat.guidance ? `<p><strong>Guidance:</strong> ${cat.guidance}</p>` : ''}
    </div>
    ` : '').join('')}
  </div>
  ` : ''}

  ${analysis.luckyElements ? `
  <div class="section">
    <h2>🍀 Lucky Elements</h2>
    <div class="lucky">
      ${analysis.luckyElements.colors ? `<div class="lucky-item"><strong>Colors:</strong> ${analysis.luckyElements.colors.join(', ')}</div>` : ''}
      ${analysis.luckyElements.gemstones ? `<div class="lucky-item"><strong>Gemstones:</strong> ${analysis.luckyElements.gemstones.join(', ')}</div>` : ''}
      ${analysis.luckyElements.days ? `<div class="lucky-item"><strong>Days:</strong> ${analysis.luckyElements.days.join(', ')}</div>` : ''}
      ${analysis.luckyElements.numbers ? `<div class="lucky-item"><strong>Numbers:</strong> ${analysis.luckyElements.numbers.join(', ')}</div>` : ''}
    </div>
  </div>
  ` : ''}

  ${analysis.remedies && analysis.remedies.length > 0 ? `
  <div class="section">
    <h2>🔱 Spiritual Remedies</h2>
    <ul>
      ${analysis.remedies.map(r => `<li>${r}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${analysis.blessings ? `
  <div class="section" style="background: #e8f5e9; border-left-color: #4caf50;">
    <h2>🙏 Final Blessings</h2>
    <p><em>"${analysis.blessings}"</em></p>
  </div>
  ` : ''}

  <div class="footer">
    <p>🕉️ This report was generated by BhaktVerse AI Guru Palm Reading System</p>
    <p>For spiritual guidance purposes only • www.bhaktverse.com</p>
  </div>
</body>
</html>`;

      // Create and download PDF
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `palm-reading-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: "Your palm reading report has been downloaded",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download failed",
        description: "Could not generate report",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const resetScan = () => {
    setPalmImages([]);
    setCurrentScanStep(0);
    setScanProgress(0);
    setAnalysis(null);
    setShowLanguageSelector(true);
    setIsScanning(false);
    setAudioUrl(null);
    setIsNarrating(false);
    setCompatibilityResult(null);
    setSelectedForCompatibility(null);
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
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="scan" className="gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
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
            {/* Language Selection */}
            {showLanguageSelector && (
              <Card className="max-w-2xl mx-auto mb-8 card-sacred border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>Select Your Language / भाषा चुनें</span>
                  </CardTitle>
                  <CardDescription>
                    AI Guru will speak to you in your chosen language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full text-lg">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code} className="text-lg">
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Scanner */}
              <div className="space-y-6">
                {!analysis && (
                  <Card className="card-sacred border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Camera className="h-5 w-5 text-primary" />
                        <span>Biometric Palm Scanner</span>
                      </CardTitle>
                      <CardDescription>
                        Advanced multi-angle scanning for accurate predictions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {palmImages.length === 0 ? (
                        <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center space-y-4 bg-gradient-to-br from-primary/5 to-secondary/5">
                          <div className="relative">
                            <Hand className="h-24 w-24 mx-auto text-primary animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-32 w-32 border-4 border-primary/20 rounded-full animate-ping" />
                            </div>
                          </div>
                          <p className="text-lg font-semibold text-foreground">
                            Ready to scan your destiny
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                              onClick={startBiometricScan}
                              disabled={!selectedLanguage}
                              className="gap-2 bg-gradient-temple text-lg px-8 py-6"
                            >
                              <Sparkles className="h-5 w-5" />
                              Start Biometric Scan
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={!selectedLanguage}
                              className="gap-2 text-lg px-8 py-6"
                            >
                              <Upload className="h-5 w-5" />
                              Upload Image
                            </Button>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Scan Progress */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {SCAN_STEPS.map((step, idx) => {
                                  const Icon = step.icon;
                                  return (
                                    <div key={step.id} className="flex items-center">
                                      <div className={`p-2 rounded-full ${
                                        idx < palmImages.length ? 'bg-success text-success-foreground' :
                                        idx === currentScanStep ? 'bg-primary text-primary-foreground animate-pulse' :
                                        'bg-muted text-muted-foreground'
                                      }`}>
                                        {idx < palmImages.length ? (
                                          <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                          <Icon className="h-4 w-4" />
                                        )}
                                      </div>
                                      {idx < SCAN_STEPS.length - 1 && (
                                        <div className={`h-0.5 w-8 ${
                                          idx < palmImages.length - 1 ? 'bg-success' : 'bg-muted'
                                        }`} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <Badge variant="outline">
                                {palmImages.length}/{SCAN_STEPS.length}
                              </Badge>
                            </div>
                            
                            {isScanning && (
                              <div className="space-y-2">
                                <Progress value={scanProgress} className="h-2" />
                                <p className="text-sm text-center text-primary font-medium animate-pulse">
                                  Analyzing biometric data... {scanProgress}%
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Current Scan Preview */}
                          <div className="relative rounded-xl overflow-hidden shadow-divine border-2 border-primary/30">
                            <img 
                              src={palmImages[palmImages.length - 1]} 
                              alt="Palm scan" 
                              className="w-full h-auto"
                            />
                            {isScanning && (
                              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px]">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="grid grid-cols-3 grid-rows-3 w-full h-full opacity-30">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className="border border-primary/50 animate-pulse"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50 animate-scan-line" />
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            {palmImages.length < SCAN_STEPS.length && !isScanning && (
                              <Button
                                onClick={handleCaptureScanStep}
                                className="flex-1 gap-2 bg-gradient-temple"
                              >
                                <Camera className="h-4 w-4" />
                                Capture {SCAN_STEPS[currentScanStep].label}
                              </Button>
                            )}
                            
                            {palmImages.length >= 1 && !analyzing && (
                              <Button
                                onClick={analyzePalm}
                                disabled={isScanning}
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
                                    Get Reading
                                  </>
                                )}
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline"
                              onClick={resetScan}
                              disabled={isScanning || analyzing}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
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
                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                      <Button
                        onClick={toggleNarration}
                        disabled={narrationLoading}
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
                      >
                        <Sun className="h-4 w-4" />
                        Horoscope
                      </Button>
                      
                      <Button
                        onClick={() => setActiveTab('visualization')}
                        variant="outline"
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Lines
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
                        Download
                      </Button>
                      
                      <Button
                        onClick={resetScan}
                        variant="outline"
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Enhanced Analysis Results Component */}
                    <ScrollArea className="h-[750px] pr-4">
                      <PalmAnalysisResults 
                        analysis={analysis} 
                        palmImage={palmImages[0]}
                      />
                    </ScrollArea>
                  </div>
                )}
              </div>
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
              <PalmLineVisualization 
                imageUrl={palmImages[0]} 
                palmType={analysis?.palmType}
              />
            ) : (
              <Card className="card-sacred">
                <CardContent className="text-center py-16">
                  <Eye className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mt-4">
                    Upload a palm image to see line visualization
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
