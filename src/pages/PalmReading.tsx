import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { generatePalmReadingPDF } from '@/utils/pdfGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import MobileBottomNav from '@/components/MobileBottomNav';
import SocialShare from '@/components/SocialShare';
import PalmAnalysisResults from '@/components/PalmAnalysisResults';
import EnhancedPalmVisualization from '@/components/EnhancedPalmVisualization';
import AILineDetectionOverlay from '@/components/AILineDetectionOverlay';
import PalmScannerBiometric from '@/components/PalmScannerBiometric';
import TarotPull from '@/components/TarotPull';
import FreePalmReadingSummary from '@/components/FreePalmReadingSummary';
import PalmReadingReport from '@/components/PalmReadingReport';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Camera, Hand, Sparkles, AlertCircle, Loader2, CheckCircle2,
  Heart, Briefcase, Activity, Users, GraduationCap, Flame, Plane,
  Star, Globe, Volume2, History, Download, HeartHandshake, FileText,
  Trash2, Calendar, Clock, Play, Pause, RotateCcw, Eye, Sun, Moon,
  Sunrise, Upload, Share2
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
  overallScore?: number;
  confidenceScore?: number;
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
  
  const [userName, setUserName] = useState<string>('');
  const [userDob, setUserDob] = useState<string>('');
  const [userTimeOfBirth, setUserTimeOfBirth] = useState<string>('');
  
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [history, setHistory] = useState<PalmReadingRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PalmReadingRecord | null>(null);
  
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [selectedForCompatibility, setSelectedForCompatibility] = useState<PalmReadingRecord | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [analyzingCompatibility, setAnalyzingCompatibility] = useState(false);
  
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  
  const [showFullReading, setShowFullReading] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [showReportView, setShowReportView] = useState(false);

  // Auto-transition to report view when analysis completes
  useEffect(() => {
    if (analysis && !showReportView) {
      // Small delay for smooth transition after analysis toast
      const timer = setTimeout(() => setShowReportView(true), 800);
      return () => clearTimeout(timer);
    }
  }, [analysis]);

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) { setIsPremiumUser(false); return; }
      try {
        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
        if (roles?.some(r => r.role === 'admin' || r.role === 'moderator')) {
          setIsPremiumUser(true); setShowFullReading(true); return;
        }
        const { data: journey } = await supabase.from('spiritual_journey').select('level, experience_points').eq('user_id', user.id).single();
        if (journey && (journey.level >= 3 || journey.experience_points >= 500)) {
          setIsPremiumUser(true); setShowFullReading(true);
        }
      } catch (error) { console.error('Error checking premium status:', error); }
    };
    checkPremiumStatus();
  }, [user]);

  useEffect(() => { if (user) loadHistory(); }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase.from('palm_reading_history' as never).select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setHistory((data || []) as PalmReadingRecord[]);
    } catch (error) { console.error('Error loading history:', error); }
    finally { setLoadingHistory(false); }
  };

  const saveToHistory = async (palmAnalysis: PalmAnalysis, imageData: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('palm_reading_history' as never).insert({
        user_id: user.id, palm_image_url: imageData.substring(0, 500),
        language: selectedLanguage, palm_type: palmAnalysis.palmType || null, analysis: palmAnalysis
      } as never);
      if (error) console.error('Save error:', error);
      loadHistory();
    } catch (error) { console.error('Error saving to history:', error); }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await supabase.from('palm_reading_history' as never).delete().eq('id', id);
      setHistory(prev => prev.filter(item => item.id !== id));
      toast({ title: "Reading deleted", description: "Palm reading removed from history" });
    } catch (error) { console.error('Error deleting:', error); }
  };

  const handleBiometricScanComplete = (images: string[], metadata: { name?: string; dob?: string; timeOfBirth?: string }) => {
    setPalmImages(images);
    setUserName(metadata.name || '');
    setUserDob(metadata.dob || '');
    setUserTimeOfBirth(metadata.timeOfBirth || '');
  };

  const handleBiometricScanCancel = () => { setPalmImages([]); setAnalysis(null); };

  const handleBiometricAnalyze = async (images: string[], metadata: { name?: string; dob?: string; timeOfBirth?: string }) => {
    setPalmImages(images);
    setUserName(metadata.name || '');
    setUserDob(metadata.dob || '');
    setUserTimeOfBirth(metadata.timeOfBirth || '');
    setAnalyzing(true); setAnalysis(null); setAudioUrl(null); setShowReportView(false);

    try {
      const { data, error } = await supabase.functions.invoke('palm-reading-analysis', {
        body: { imageData: images[0], language: selectedLanguage, userName: metadata.name || undefined, userDob: metadata.dob || undefined, userTimeOfBirth: metadata.timeOfBirth || undefined }
      });
      if (error) throw error;
      if (data?.analysis) {
        setAnalysis(data.analysis);
        await saveToHistory(data.analysis, images[0]);
        toast({ title: "🙏 Palm Reading Complete", description: "Your detailed destiny reading is ready" });
      } else throw new Error('No analysis returned');
    } catch (error) {
      console.error('Palm analysis error:', error);
      toast({ title: "Analysis failed", description: error instanceof Error ? error.message : "Failed to analyze palm. Please try again.", variant: "destructive" });
    } finally { setAnalyzing(false); }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedLanguage) { toast({ title: "Select Language", description: "Please select your preferred language first", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPalmImages([reader.result as string]); toast({ title: "Palm image uploaded", description: "Ready for analysis" }); };
    reader.readAsDataURL(file);
  };

  const analyzePalm = async () => {
    if (palmImages.length === 0) { toast({ title: "No palm scan", description: "Please complete the biometric scan first", variant: "destructive" }); return; }
    setAnalyzing(true); setAnalysis(null); setAudioUrl(null); setShowReportView(false);
    try {
      const { data, error } = await supabase.functions.invoke('palm-reading-analysis', {
        body: { imageData: palmImages[0], language: selectedLanguage, userName: userName || undefined, userDob: userDob || undefined, userTimeOfBirth: userTimeOfBirth || undefined }
      });
      if (error) throw error;
      if (data?.analysis) {
        setAnalysis(data.analysis);
        await saveToHistory(data.analysis, palmImages[0]);
        toast({ title: "🙏 Palm Reading Complete", description: "Your detailed destiny reading is ready" });
      } else throw new Error('No analysis returned');
    } catch (error) {
      console.error('Palm analysis error:', error);
      toast({ title: "Analysis failed", description: error instanceof Error ? error.message : "Failed to analyze palm. Please try again.", variant: "destructive" });
    } finally { setAnalyzing(false); }
  };

  const generateNarration = async () => {
    if (!analysis) return;
    setNarrationLoading(true);
    try {
      let narrationText = analysis.greeting || '';
      if (analysis.overallDestiny) narrationText += ` ${analysis.overallDestiny}`;
      if (analysis.categories) {
        Object.values(analysis.categories).forEach(cat => { if (cat?.prediction) narrationText += ` ${cat.title}: ${cat.prediction}`; });
      }
      if (analysis.blessings) narrationText += ` ${analysis.blessings}`;

      const { data, error } = await supabase.functions.invoke('palm-reading-tts', {
        body: { text: narrationText.substring(0, 4000), voice: selectedLanguage === 'hi' ? 'alloy' : 'nova' }
      });
      if (error) throw error;
      if (data?.audioContent) {
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (audioRef.current) { audioRef.current.src = url; audioRef.current.play(); setIsNarrating(true); }
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast({ title: "Voice generation failed", description: "Could not generate audio narration", variant: "destructive" });
    } finally { setNarrationLoading(false); }
  };

  const toggleNarration = () => {
    if (audioRef.current) {
      if (isNarrating) { audioRef.current.pause(); } else { audioRef.current.play(); }
      setIsNarrating(!isNarrating);
    } else if (!audioUrl) { generateNarration(); }
  };

  const analyzeCompatibility = async () => {
    if (!analysis || !selectedForCompatibility) { toast({ title: "Select readings", description: "Please select two palm readings to compare", variant: "destructive" }); return; }
    setAnalyzingCompatibility(true);
    try {
      const { data, error } = await supabase.functions.invoke('palm-compatibility', {
        body: { palmAnalysis1: analysis, palmAnalysis2: selectedForCompatibility.analysis, language: selectedLanguage }
      });
      if (error) throw error;
      if (data?.compatibility) { setCompatibilityResult(data.compatibility); toast({ title: "💕 Compatibility Analysis Complete", description: "Your relationship insights are ready" }); }
    } catch (error) {
      console.error('Compatibility error:', error);
      toast({ title: "Analysis failed", description: "Could not analyze compatibility", variant: "destructive" });
    } finally { setAnalyzingCompatibility(false); }
  };

  const generateDailyHoroscope = async () => {
    if (!analysis) { toast({ title: "Complete palm reading first", description: "Get a palm reading to generate personalized horoscope", variant: "destructive" }); return; }
    setLoadingHoroscope(true); setHoroscope(null);
    try {
      const { data, error } = await supabase.functions.invoke('palm-daily-horoscope', { body: { palmAnalysis: analysis, language: selectedLanguage } });
      if (error) throw error;
      if (data?.horoscope) { setHoroscope(data.horoscope); toast({ title: "🌟 Daily Horoscope Ready", description: "Your personalized predictions for today" }); }
    } catch (error) {
      console.error('Horoscope error:', error);
      toast({ title: "Failed to generate horoscope", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
    } finally { setLoadingHoroscope(false); }
  };

  const generatePdfReport = async () => {
    if (!analysis) return;
    if (!isPremiumUser) { toast({ title: "Premium Feature", description: "Upgrade to Premium to download PDF reports", variant: "destructive" }); navigate('/premium'); return; }
    setGeneratingPdf(true);
    try {
      generatePalmReadingPDF(analysis, userName, selectedLanguage, userDob);
      toast({ title: "📄 Report Downloaded", description: "Your beautiful PDF report has been saved" });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "Download failed", description: "Could not generate report. Please try again.", variant: "destructive" });
    } finally { setGeneratingPdf(false); }
  };

  const handleUpgradeToPremium = () => navigate('/premium');

  const resetScan = () => {
    setPalmImages([]); setAnalysis(null); setAudioUrl(null); setIsNarrating(false);
    setCompatibilityResult(null); setSelectedForCompatibility(null);
    setUserName(''); setUserDob(''); setUserTimeOfBirth(''); setShowReportView(false);
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

  if (!user) { navigate('/auth'); return null; }

  // Show full immersive report view when analysis is ready
  if (showReportView && analysis) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <audio ref={audioRef} onEnded={() => setIsNarrating(false)} className="hidden" />
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs className="mb-4" />
        </div>
        
        <PalmReadingReport
          analysis={analysis}
          palmImage={palmImages.length > 0 ? palmImages[palmImages.length - 1] : undefined}
          userName={userName || user?.email?.split('@')[0]}
          onDownloadPDF={generatePdfReport}
          isPremium={isPremiumUser}
          onVoiceNarration={toggleNarration}
          onNewScan={resetScan}
          narrationLoading={narrationLoading}
          isNarrating={isNarrating}
          generatingPdf={generatingPdf}
          onGenerateHoroscope={generateDailyHoroscope}
          loadingHoroscope={loadingHoroscope}
          horoscope={horoscope}
          history={history}
          onDeleteHistory={deleteFromHistory}
          selectedLanguage={selectedLanguage}
        />
        
        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-primary/20 py-3 px-4 shadow-[0_-4px_30px_rgba(255,102,0,0.1)]">
          <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap max-w-2xl">
            <Button onClick={toggleNarration} disabled={narrationLoading || (!isPremiumUser && !showFullReading)} variant="outline" size="sm" className="gap-1.5">
              {narrationLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isNarrating ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{narrationLoading ? 'Loading...' : isNarrating ? 'Pause' : 'Listen'}</span>
              {!isPremiumUser && <span className="text-[10px]">👑</span>}
            </Button>
            <Button onClick={generatePdfReport} disabled={generatingPdf || !isPremiumUser} variant="outline" size="sm" className="gap-1.5">
              {generatingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">PDF</span> {!isPremiumUser && <span className="text-[10px]">👑</span>}
            </Button>
            <SocialShare title="AI Guru Palm Reading" text={analysis.overallDestiny || analysis.greeting || 'My palm reading from BhaktVerse'} palmType={analysis.palmType} />
            <Button onClick={resetScan} variant="ghost" size="sm" className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Scan</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <audio ref={audioRef} onEnded={() => setIsNarrating(false)} className="hidden" />
      
      <div className="container mx-auto px-4 py-6 pb-28">
        <Breadcrumbs className="mb-4" />

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
            🤚 AI Guru Palm Reading
          </h1>
          <p className="text-sm text-muted-foreground">
            Vedic Samudrika Shastra Analysis • Voice Narration • PDF Reports
          </p>
        </div>

        {/* Progress Stepper - Fixed logic */}
        <div className="flex items-center justify-center gap-2 mb-8 max-w-md mx-auto">
          {[
            { label: 'Language', done: !!selectedLanguage },
            { label: 'Scan', done: palmImages.length > 0 },
            { label: 'Analyzing', done: !!analysis, active: analyzing },
            { label: 'Results', done: !!analysis && !analyzing },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step.done ? 'bg-primary text-primary-foreground' : 
                step.active ? 'bg-primary/50 text-primary-foreground animate-pulse' : 
                'bg-muted text-muted-foreground'
              }`}>
                {step.done ? '✓' : step.active ? <Loader2 className="h-3 w-3 animate-spin" /> : i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">{step.label}</span>
              {i < 3 && <div className={`flex-1 h-0.5 ${step.done ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* SCAN PHASE */}
        <div className="max-w-4xl mx-auto">
          {palmImages.length === 0 ? (
            <PalmScannerBiometric
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onScanComplete={handleBiometricScanComplete}
              onAnalyze={handleBiometricAnalyze}
              analyzing={analyzing}
              languages={LANGUAGES}
            />
          ) : !analysis ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Palm Captured
                    <Badge variant="outline" className="ml-auto">{palmImages.length} scan{palmImages.length > 1 ? 's' : ''}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-border/50">
                    <img src={palmImages[palmImages.length - 1]} alt="Palm" className="w-full h-auto max-h-[350px] object-contain" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={analyzePalm} disabled={analyzing} className="flex-1 gap-2">
                      {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="h-4 w-4" />Get Reading</>}
                    </Button>
                    <Button variant="outline" onClick={resetScan} disabled={analyzing}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />Scanning Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>🤚 Use your dominant hand</p>
                  <p>💡 Bright, natural lighting works best</p>
                  <p>📸 Keep palm flat with fingers spread</p>
                  <p>🔍 Ensure all major lines are visible</p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {analyzing && (
            <Card className="mt-6 border-primary/30">
              <CardContent className="text-center py-12 space-y-4">
                <div className="relative inline-block">
                  <div className="text-6xl animate-pulse">🙏</div>
                  <div className="absolute -inset-4 border-2 border-primary/20 rounded-full animate-ping" />
                </div>
                <p className="text-lg font-semibold">AI Guru is reading your palm...</p>
                <p className="text-sm text-muted-foreground">Analyzing lines, mounts, and destiny patterns</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            🔮 <strong>Disclaimer:</strong> This service is for spiritual reflection and entertainment only.
            Readings use traditional Vedic Samudrika Shastra interpreted through AI. Consult qualified professionals for important decisions.
          </p>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default PalmReading;
