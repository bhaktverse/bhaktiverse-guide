import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Download, Share2, Star, Sun, Moon, Heart, Brain, Activity, Briefcase,
  Users, GraduationCap, Flame, Plane, Gem, Calendar, Shield, AlertTriangle,
  Sparkles, Hand, Eye, Compass, Globe, Languages, Clock, FileText,
  Trash2, History, Loader2, Sunrise, ChevronRight
} from 'lucide-react';

interface PalmAnalysis {
  language?: string;
  palmType?: string;
  dominantPlanet?: string;
  nakshatra?: string;
  greeting?: string;
  overallDestiny?: string;
  overallScore?: number;
  confidenceScore?: number;
  categories?: Record<string, any>;
  lineAnalysis?: Record<string, any>;
  mountAnalysis?: Record<string, any>;
  luckyElements?: {
    colors?: string[];
    gemstones?: string[];
    mantras?: Array<{ sanskrit?: string; transliteration?: string; meaning?: string } | string>;
    days?: string[];
    numbers?: number[];
    metals?: string[];
    directions?: string[];
  };
  yogas?: string[];
  remedies?: string[];
  warnings?: string[];
  blessings?: string;
}

interface DailyHoroscope {
  greeting?: string;
  luckyTime?: string;
  luckyColor?: string;
  luckyNumber?: number;
  predictions?: Record<string, any>;
  mantraOfTheDay?: string | { sanskrit?: string; transliteration?: string; meaning?: string };
  blessings?: string;
}

interface PalmReadingRecord {
  id: string;
  palm_image_url: string | null;
  language: string;
  palm_type: string | null;
  analysis: any;
  created_at: string;
}

interface PalmReadingReportProps {
  analysis: PalmAnalysis;
  palmImage?: string;
  userName?: string;
  onDownloadPDF?: () => void;
  isPremium?: boolean;
  onVoiceNarration?: () => void;
  onNewScan?: () => void;
  narrationLoading?: boolean;
  isNarrating?: boolean;
  generatingPdf?: boolean;
  onGenerateHoroscope?: () => void;
  loadingHoroscope?: boolean;
  horoscope?: DailyHoroscope | null;
  history?: PalmReadingRecord[];
  onDeleteHistory?: (id: string) => void;
  selectedLanguage?: string;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; color: string; hindiTitle: string }> = {
  career: { icon: <Briefcase className="h-5 w-5" />, gradient: 'from-amber-500 to-orange-500', color: 'text-amber-500', hindiTitle: 'करियर एवं धन' },
  love: { icon: <Heart className="h-5 w-5" />, gradient: 'from-pink-500 to-rose-500', color: 'text-pink-500', hindiTitle: 'प्रेम एवं रिश्ते' },
  health: { icon: <Activity className="h-5 w-5" />, gradient: 'from-green-500 to-emerald-500', color: 'text-green-500', hindiTitle: 'स्वास्थ्य एवं शक्ति' },
  family: { icon: <Users className="h-5 w-5" />, gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-500', hindiTitle: 'परिवार एवं संतान' },
  education: { icon: <GraduationCap className="h-5 w-5" />, gradient: 'from-purple-500 to-violet-500', color: 'text-purple-500', hindiTitle: 'शिक्षा एवं ज्ञान' },
  spiritual: { icon: <Flame className="h-5 w-5" />, gradient: 'from-indigo-500 to-purple-500', color: 'text-indigo-500', hindiTitle: 'आध्यात्मिक विकास' },
  travel: { icon: <Plane className="h-5 w-5" />, gradient: 'from-teal-500 to-cyan-500', color: 'text-teal-500', hindiTitle: 'यात्रा एवं भाग्य' },
};

const LINE_CONFIG: Record<string, { icon: React.ReactNode; color: string; hindiName: string }> = {
  heartLine: { icon: <Heart className="h-4 w-4" />, color: 'text-pink-500', hindiName: 'हृदय रेखा' },
  headLine: { icon: <Brain className="h-4 w-4" />, color: 'text-blue-500', hindiName: 'मस्तिष्क रेखा' },
  lifeLine: { icon: <Activity className="h-4 w-4" />, color: 'text-green-500', hindiName: 'जीवन रेखा' },
  fateLine: { icon: <Star className="h-4 w-4" />, color: 'text-amber-500', hindiName: 'भाग्य रेखा' },
  sunLine: { icon: <Sun className="h-4 w-4" />, color: 'text-orange-500', hindiName: 'सूर्य रेखा' },
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋'
};

const TOC_SECTIONS = [
  { id: 'summary', label: 'Quick Summary', icon: '📊' },
  { id: 'destiny', label: 'Life Path & Destiny', icon: '🧭' },
  { id: 'lines', label: 'Palm Line Analysis', icon: '✋' },
  { id: 'mounts', label: 'Mount Analysis', icon: '☉' },
  { id: 'predictions', label: 'Category Predictions', icon: '🔮' },
  { id: 'lucky', label: 'Lucky Elements', icon: '💎' },
  { id: 'mantras', label: 'Recommended Mantras', icon: '🕉️' },
  { id: 'yogas', label: 'Special Yogas', icon: '⭐' },
  { id: 'remedies', label: 'Remedies', icon: '🛡️' },
  { id: 'blessings', label: 'Blessings', icon: '🙏' },
  { id: 'services', label: 'Continue Your Journey', icon: '🚀' },
];

const PalmReadingReport: React.FC<PalmReadingReportProps> = ({
  analysis, palmImage, userName = 'Seeker', onDownloadPDF, isPremium = false,
  onVoiceNarration, onNewScan, narrationLoading, isNarrating, generatingPdf,
  onGenerateHoroscope, loadingHoroscope, horoscope, history, onDeleteHistory, selectedLanguage
}) => {
  const [showHindi, setShowHindi] = useState(false);
  const navigate = useNavigate();
  const readingId = `BV-${Date.now().toString(36).toUpperCase()}`;
  const readingDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 8) return 'bg-green-500/10 border-green-500/30';
    if (rating >= 6) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getPlanetSymbol = (planet?: string) => {
    if (!planet) return '☆';
    for (const [name, symbol] of Object.entries(PLANET_SYMBOLS)) {
      if (planet.toLowerCase().includes(name.toLowerCase())) return symbol;
    }
    return '☆';
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Compute category scores for summary
  const categoryScores = analysis.categories
    ? Object.entries(analysis.categories).map(([key, cat]) => ({
        key,
        title: cat?.title || key,
        rating: cat?.rating || 7,
        config: CATEGORY_CONFIG[key]
      })).filter(c => c.config)
    : [];

  const avgScore = categoryScores.length > 0
    ? Math.round((categoryScores.reduce((sum, c) => sum + c.rating, 0) / categoryScores.length) * 10) / 10
    : (analysis.overallScore || 8.0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Sacred Geometry Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNGRjY2MDAiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGNjYwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />

      {/* ===== BANNER HEADER ===== */}
      <div className="relative overflow-hidden border-b-4 border-primary/30">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary/50" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary/50" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary/50" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary/50" />
        
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full -ml-32 -mb-32" />
          
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Palm Image with Sacred Border */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 animate-spin" style={{ animationDuration: '30s' }} />
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/50 shadow-divine overflow-hidden bg-card m-2">
                  {palmImage ? (
                    <img src={palmImage} alt="Palm" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Hand className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-sacred-float">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
              
              {/* Report Title */}
              <div className="text-center md:text-left flex-1">
                <div className="text-5xl mb-2 animate-om-pulse">🕉️</div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-2">
                  {showHindi ? 'AI गुरु हस्तरेखा विश्लेषण' : 'AI Guru Palm Reading Report'}
                </h1>
                <p className="text-muted-foreground mb-1">
                  {showHindi ? 'वैदिक हस्तसामुद्रिक शास्त्र विश्लेषण' : 'Comprehensive Vedic Samudrika Shastra Analysis'}
                  {' '}<span className="text-primary font-semibold">{userName}</span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    <Sun className="h-3 w-3 mr-1" />
                    {analysis.palmType || 'Analyzed'}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10 border-secondary/30">
                    <span className="mr-1">{getPlanetSymbol(analysis.dominantPlanet)}</span>
                    {analysis.dominantPlanet || 'Multiple Planets'}
                  </Badge>
                  {analysis.nakshatra && (
                    <Badge variant="outline" className="bg-accent/10 border-accent/30">
                      <Moon className="h-3 w-3 mr-1" />
                      {analysis.nakshatra}
                    </Badge>
                  )}
                </div>
                {/* Reading ID & Timestamp */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-center md:justify-start">
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {readingId}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {readingDate}</span>
                </div>
              </div>
              
              {/* Scores Box */}
              <div className="flex gap-4">
                <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-xl border-2 border-primary/30 shadow-divine">
                  <div className="text-3xl font-bold text-primary">{avgScore}</div>
                  <div className="text-xs text-muted-foreground">{showHindi ? 'समग्र स्कोर' : 'Overall Score'}</div>
                  <div className="text-xs text-muted-foreground">/10</div>
                </div>
                <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-xl border-2 border-secondary/30 shadow-divine">
                  <div className="text-3xl font-bold text-secondary">{analysis.confidenceScore || 85}%</div>
                  <div className="text-xs text-muted-foreground">{showHindi ? 'विश्वास' : 'Confidence'}</div>
                  <div className="text-xs text-muted-foreground">{showHindi ? 'स्तर' : 'Level'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Language Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-card rounded-full p-1 border border-border/50">
            <Button variant={showHindi ? 'ghost' : 'default'} size="sm" onClick={() => setShowHindi(false)} className="rounded-full gap-1">
              <Globe className="h-4 w-4" /> English
            </Button>
            <Button variant={showHindi ? 'default' : 'ghost'} size="sm" onClick={() => setShowHindi(true)} className="rounded-full gap-1">
              <Languages className="h-4 w-4" /> हिंदी
            </Button>
          </div>
        </div>

        {/* ===== QUICK SUMMARY DASHBOARD ===== */}
        <div id="summary" className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📊 {showHindi ? 'रिपोर्ट सारांश' : 'Report at a Glance'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
            {categoryScores.map(({ key, title, rating, config }) => (
              <div key={key} className="text-center p-3 bg-card/80 rounded-xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} text-white inline-flex mb-2`}>
                  {config.icon}
                </div>
                <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>{rating}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-1">{showHindi ? config.hindiTitle : title}</div>
                <Progress value={rating * 10} className="h-1 mt-2" />
              </div>
            ))}
          </div>

          {/* Key Highlights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Hand className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{showHindi ? 'हस्त प्रकार' : 'Palm Type'}</p>
                  <p className="font-bold text-primary">{analysis.palmType || 'Standard'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-secondary/5 to-transparent border-secondary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{getPlanetSymbol(analysis.dominantPlanet)}</span>
                <div>
                  <p className="text-xs text-muted-foreground">{showHindi ? 'प्रभावी ग्रह' : 'Dominant Planet'}</p>
                  <p className="font-bold text-secondary">{analysis.dominantPlanet || 'Multiple'}</p>
                </div>
              </CardContent>
            </Card>
            {analysis.nakshatra && (
              <Card className="bg-gradient-to-r from-accent/5 to-transparent border-accent/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Moon className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">{showHindi ? 'नक्षत्र' : 'Nakshatra'}</p>
                    <p className="font-bold">{analysis.nakshatra}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ===== TABLE OF CONTENTS ===== */}
        <Card className="mb-8 card-sacred">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              📋 {showHindi ? 'विषय सूची' : 'Table of Contents'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {TOC_SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-left text-sm hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                >
                  <span>{section.icon}</span>
                  <span className="truncate">{section.label}</span>
                  <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Guru Greeting */}
        {analysis.greeting && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-card to-secondary/5 border-2 border-primary/20 shadow-divine overflow-hidden">
            <div className="absolute top-0 right-0 text-[200px] opacity-5 -mt-20 -mr-10 select-none">🕉️</div>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl animate-sacred-float">🙏</div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {showHindi ? 'AI गुरु का आशीर्वाद' : "AI Guru's Blessing"}
                  </h3>
                  <p className="text-foreground italic leading-relaxed">{analysis.greeting}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Destiny */}
        {analysis.overallDestiny && (
          <Card id="destiny" className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                {showHindi ? 'आपका जीवन पथ एवं भाग्य' : 'Your Life Path & Destiny'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{analysis.overallDestiny}</p>
            </CardContent>
          </Card>
        )}

        {/* ===== PALM IMAGE ANALYSIS SECTION ===== */}
        {palmImage && (
          <Card id="palm-image" className="mb-8 card-sacred overflow-hidden">
            <div className="h-1 bg-gradient-temple" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                {showHindi ? 'हस्त छवि विश्लेषण' : 'Palm Image Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
                    <img src={palmImage} alt="Analyzed Palm" className="w-full h-auto max-h-[400px] object-contain bg-black/5" />
                  </div>
                </div>
                {/* Line Legend */}
                {analysis.lineAnalysis && (
                  <div className="lg:w-64 space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      {showHindi ? 'पहचानी गई रेखाएँ' : 'Detected Lines'}
                    </h4>
                    {Object.entries(analysis.lineAnalysis).map(([key, line]) => {
                      if (!line) return null;
                      const config = LINE_CONFIG[key];
                      if (!config) return null;
                      const lineNames: Record<string, string> = { heartLine: 'Heart Line', headLine: 'Head Line', lifeLine: 'Life Line', fateLine: 'Fate Line', sunLine: 'Sun Line' };
                      return (
                        <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
                          <div className={config.color}>{config.icon}</div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{showHindi ? config.hindiName : lineNames[key]}</span>
                            {line.rating && <span className={`text-xs ml-2 ${getRatingColor(line.rating)}`}>{line.rating}/10</span>}
                          </div>
                        </div>
                      );
                    })}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 mt-4">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {showHindi ? 'AI विश्वास स्तर' : 'AI Confidence Level'}: <span className="font-bold text-primary">{analysis.confidenceScore || 85}%</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== LINE ANALYSIS - All Expanded ===== */}
        {analysis.lineAnalysis && (
          <Card id="lines" className="mb-8 card-sacred overflow-hidden">
            <div className="h-1 bg-gradient-temple" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                {showHindi ? 'हस्त रेखा विश्लेषण' : 'Palm Line Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.lineAnalysis).map(([key, line]) => {
                  if (!line) return null;
                  const config = LINE_CONFIG[key] || { icon: <Star className="h-4 w-4" />, color: 'text-muted-foreground', hindiName: key };
                  const lineNames: Record<string, string> = { heartLine: 'Heart Line', headLine: 'Head Line', lifeLine: 'Life Line', fateLine: 'Fate Line', sunLine: 'Sun Line' };
                  return (
                    <div key={key} className="p-4 bg-card/50 rounded-xl border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-lotus">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color.replace('text-', 'from-')}/20 to-transparent`}>
                            {config.icon}
                          </div>
                          <div>
                            <span className="font-semibold block">{showHindi ? config.hindiName : lineNames[key] || key}</span>
                            {showHindi && <span className="text-xs text-muted-foreground">{lineNames[key]}</span>}
                          </div>
                        </div>
                        {line.rating && (
                          <Badge variant="outline" className={`${getRatingBg(line.rating)} ${getRatingColor(line.rating)}`}>
                            {line.rating}/10
                          </Badge>
                        )}
                      </div>
                      {/* Line depth visualization */}
                      {line.rating && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{showHindi ? 'गहराई' : 'Depth'}</span>
                            <span>{line.rating >= 8 ? 'Deep' : line.rating >= 5 ? 'Medium' : 'Thin'}</span>
                          </div>
                          <Progress value={line.rating * 10} className="h-2" />
                        </div>
                      )}
                      {line.observed && <p className="text-sm text-muted-foreground mb-2">{line.observed}</p>}
                      {line.meaning && <p className="text-sm text-foreground">{line.meaning}</p>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== MOUNT ANALYSIS ===== */}
        {analysis.mountAnalysis && (
          <Card id="mounts" className="mb-8 card-sacred overflow-hidden">
            <div className="h-1 bg-gradient-divine" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                {showHindi ? 'पर्वत विश्लेषण' : 'Mount Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(analysis.mountAnalysis).map(([key, mount]) => {
                  if (!mount) return null;
                  const mountData: Record<string, { name: string; hindiName: string; symbol: string }> = {
                    jupiter: { name: 'Jupiter', hindiName: 'बृहस्पति', symbol: '♃' },
                    saturn: { name: 'Saturn', hindiName: 'शनि', symbol: '♄' },
                    apollo: { name: 'Apollo/Sun', hindiName: 'सूर्य', symbol: '☉' },
                    mercury: { name: 'Mercury', hindiName: 'बुध', symbol: '☿' },
                    venus: { name: 'Venus', hindiName: 'शुक्र', symbol: '♀' },
                    mars: { name: 'Mars', hindiName: 'मंगल', symbol: '♂' },
                    moon: { name: 'Moon', hindiName: 'चंद्र', symbol: '☽' }
                  };
                  const info = mountData[key] || { name: key, hindiName: key, symbol: '☆' };
                  return (
                    <div key={key} className="p-3 bg-card/50 rounded-lg border border-border/50 text-center hover:border-primary/30 transition-all">
                      <div className="text-2xl mb-1">{info.symbol}</div>
                      <div className="font-semibold text-sm">{showHindi ? info.hindiName : info.name}</div>
                      <Badge variant="outline" className={`mt-1 ${
                        mount.strength === 'strong' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                        mount.strength === 'moderate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                        'bg-muted/50 text-muted-foreground'
                      }`}>
                        {mount.strength || 'Moderate'}
                      </Badge>
                      {mount.meaning && <p className="text-xs text-muted-foreground mt-2">{mount.meaning}</p>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== CATEGORY PREDICTIONS - All Expanded ===== */}
        {analysis.categories && (
          <div id="predictions" className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {showHindi ? 'विस्तृत जीवन भविष्यवाणी' : 'Detailed Life Predictions'}
            </h2>
            <div className="space-y-4">
              {Object.entries(analysis.categories).map(([key, category]) => {
                if (!category) return null;
                const config = CATEGORY_CONFIG[key] || { icon: <Star className="h-5 w-5" />, gradient: 'from-muted-foreground to-muted', color: 'text-muted-foreground', hindiTitle: key };
                return (
                  <Card key={key} className="overflow-hidden card-sacred">
                    <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-left">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} text-primary-foreground`}>
                            {config.icon}
                          </div>
                          <div>
                            <span className="block">{category.title || (showHindi ? config.hindiTitle : key)}</span>
                            {showHindi && <span className="text-xs text-muted-foreground font-normal">{key}</span>}
                          </div>
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <Progress value={category.rating ? category.rating * 10 : 80} className="w-20 h-2" />
                          <Badge variant="outline" className={`${getRatingBg(category.rating || 8)} ${getRatingColor(category.rating || 8)}`}>
                            {category.rating || 8}/10
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Key Observation Highlight */}
                      {category.planetaryInfluence && (
                        <div className="mb-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            🔑 {showHindi ? 'मुख्य अवलोकन' : 'Key Observation'}
                          </span>
                          <p className="text-sm text-foreground mt-1">{category.planetaryInfluence}</p>
                        </div>
                      )}
                      
                      <p className="text-foreground leading-relaxed mb-4">{category.prediction}</p>
                      
                      {category.observedFeatures && category.observedFeatures.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            {showHindi ? 'देखी गई विशेषताएं:' : 'Observed Features:'}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {category.observedFeatures.slice(0, 5).map((feature: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {category.timeline && (
                        <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <span className="text-sm font-medium text-primary">
                            {showHindi ? 'समयरेखा:' : 'Timeline:'}
                          </span>
                          <span className="text-sm text-foreground ml-2">{category.timeline}</span>
                        </div>
                      )}
                      
                      {category.guidance && (
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            💡 {showHindi ? 'मार्गदर्शन:' : 'Guidance:'}
                          </span>
                          <span className="text-sm text-foreground ml-2">{category.guidance}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== LUCKY ELEMENTS ===== */}
        {analysis.luckyElements && (
          <Card id="lucky" className="mb-8 card-sacred overflow-hidden">
            <div className="h-1 bg-gradient-saffron" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-primary" />
                {showHindi ? 'शुभ तत्व' : 'Lucky Elements'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {analysis.luckyElements.colors && analysis.luckyElements.colors.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
                      🎨 {showHindi ? 'रंग' : 'Colors'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.colors.map((color, i) => <Badge key={i} variant="outline">{color}</Badge>)}
                    </div>
                  </div>
                )}
                {analysis.luckyElements.gemstones && analysis.luckyElements.gemstones.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <Gem className="h-4 w-4 text-purple-500" />
                      💎 {showHindi ? 'रत्न' : 'Gemstones'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.gemstones.map((gem, i) => <Badge key={i} variant="outline">{gem}</Badge>)}
                    </div>
                  </div>
                )}
                {analysis.luckyElements.days && analysis.luckyElements.days.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      📅 {showHindi ? 'शुभ दिन' : 'Auspicious Days'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.days.map((day, i) => <Badge key={i} variant="outline">{day}</Badge>)}
                    </div>
                  </div>
                )}
                {analysis.luckyElements.numbers && analysis.luckyElements.numbers.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2">🔢 {showHindi ? 'शुभ अंक' : 'Lucky Numbers'}</div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.numbers.map((num, i) => <Badge key={i} variant="outline">{num}</Badge>)}
                    </div>
                  </div>
                )}
                {analysis.luckyElements.directions && analysis.luckyElements.directions.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <Compass className="h-4 w-4 text-teal-500" />
                      🧭 {showHindi ? 'दिशाएं' : 'Directions'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.directions.map((dir, i) => <Badge key={i} variant="outline">{dir}</Badge>)}
                    </div>
                  </div>
                )}
                {analysis.luckyElements.metals && analysis.luckyElements.metals.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2">⚗️ {showHindi ? 'धातु' : 'Metals'}</div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.metals.map((metal, i) => <Badge key={i} variant="outline">{metal}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== MANTRAS ===== */}
        {analysis.luckyElements?.mantras && analysis.luckyElements.mantras.length > 0 && (
          <Card id="mantras" className="mb-8 bg-gradient-to-r from-orange-500/5 via-card to-orange-500/5 border-2 border-orange-500/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🕉️ {showHindi ? 'अनुशंसित मंत्र' : 'Recommended Mantras'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.luckyElements.mantras.map((mantra, i) => (
                  <div key={i} className="p-4 bg-card/80 rounded-xl border border-border/50">
                    {typeof mantra === 'string' ? (
                      <p className="font-medium">{mantra}</p>
                    ) : (
                      <>
                        {mantra.sanskrit && <p className="text-xl font-bold text-primary mb-1">{mantra.sanskrit}</p>}
                        {mantra.transliteration && <p className="text-sm text-muted-foreground italic mb-2">{mantra.transliteration}</p>}
                        {mantra.meaning && (
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{showHindi ? 'अर्थ:' : 'Meaning:'}</span> {mantra.meaning}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== YOGAS ===== */}
        {analysis.yogas && analysis.yogas.length > 0 && (
          <Card id="yogas" className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {showHindi ? 'विशेष योग' : 'Special Yogas Detected'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.yogas.map((yoga, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                    <span>{yoga}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ===== REMEDIES ===== */}
        {analysis.remedies && analysis.remedies.length > 0 && (
          <Card id="remedies" className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {showHindi ? 'आध्यात्मिक उपाय' : 'Spiritual Remedies'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.remedies.map((remedy, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ===== WARNINGS ===== */}
        {analysis.warnings && analysis.warnings.length > 0 && (
          <Card className="mb-8 border-2 border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                {showHindi ? 'सावधानी अवधि' : 'Caution Periods'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ===== BLESSINGS ===== */}
        {analysis.blessings && (
          <Card id="blessings" className="mb-8 bg-gradient-to-r from-green-500/5 via-card to-green-500/5 border-2 border-green-500/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl animate-sacred-float">🙏</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    {showHindi ? 'अंतिम आशीर्वाद' : 'Final Blessings'}
                  </h3>
                  <p className="text-foreground italic leading-relaxed">{analysis.blessings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== CONTINUE YOUR JOURNEY ===== */}
        <div id="services" className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🚀 {showHindi ? 'अपनी यात्रा जारी रखें' : 'Continue Your Journey'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg" onClick={() => onGenerateHoroscope?.()}>
              <CardContent className="p-4 text-center">
                <Sun className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="font-semibold text-sm">{showHindi ? 'दैनिक राशिफल' : 'Daily Horoscope'}</p>
                <p className="text-xs text-muted-foreground mt-1">Palm-based predictions</p>
                {loadingHoroscope && <Loader2 className="h-4 w-4 animate-spin mx-auto mt-2 text-primary" />}
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg" onClick={() => navigate('/numerology')}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl block mb-2">🔢</span>
                <p className="font-semibold text-sm">{showHindi ? 'अंक ज्योतिष' : 'Numerology'}</p>
                <p className="text-xs text-muted-foreground mt-1">Number-based destiny</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg" onClick={() => navigate('/kundali-match')}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl block mb-2">💕</span>
                <p className="font-semibold text-sm">{showHindi ? 'कुंडली मिलान' : 'Compatibility'}</p>
                <p className="text-xs text-muted-foreground mt-1">Match analysis</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg" onClick={() => navigate('/horoscope')}>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="font-semibold text-sm">{showHindi ? 'राशिफल' : 'Horoscope'}</p>
                <p className="text-xs text-muted-foreground mt-1">Rashi predictions</p>
              </CardContent>
            </Card>
          </div>

          {/* Horoscope Results inline */}
          {horoscope && (
            <Card className="mt-4 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sun className="h-5 w-5 text-orange-500" /> {showHindi ? 'आज का राशिफल' : "Today's Horoscope"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {horoscope.greeting && <p className="italic text-sm text-muted-foreground mb-3">"{horoscope.greeting}"</p>}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-muted/50 p-2 rounded-lg"><p className="text-[10px] text-muted-foreground">Lucky Time</p><p className="font-semibold text-xs">{horoscope.luckyTime || 'N/A'}</p></div>
                  <div className="bg-muted/50 p-2 rounded-lg"><p className="text-[10px] text-muted-foreground">Lucky Color</p><p className="font-semibold text-xs">{horoscope.luckyColor || 'N/A'}</p></div>
                  <div className="bg-muted/50 p-2 rounded-lg"><p className="text-[10px] text-muted-foreground">Lucky Number</p><p className="font-semibold text-xs">{horoscope.luckyNumber || 'N/A'}</p></div>
                </div>
                {horoscope.predictions && Object.entries(horoscope.predictions).map(([key, pred]) => pred && (
                  <div key={key} className="border rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      {key === 'morning' && <Sunrise className="h-4 w-4 text-orange-500" />}
                      {key === 'afternoon' && <Sun className="h-4 w-4 text-yellow-500" />}
                      {key === 'evening' && <Moon className="h-4 w-4 text-indigo-500" />}
                      <h4 className="font-semibold text-sm">{pred.title}</h4>
                    </div>
                    <p className="text-xs">{pred.prediction}</p>
                    <p className="text-xs text-primary mt-1">{pred.advice}</p>
                  </div>
                ))}
                {horoscope.blessings && <div className="text-center p-3 bg-primary/5 rounded-lg"><p className="italic text-xs">🙏 {horoscope.blessings}</p></div>}
              </CardContent>
            </Card>
          )}

          {/* Reading History */}
          {history && history.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> {showHindi ? 'पिछली रीडिंग' : 'Reading History'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{item.palm_type || 'Standard'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                      {onDeleteHistory && (
                        <Button variant="ghost" size="sm" className="h-7" onClick={() => onDeleteHistory(item.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            🔮 <strong>Disclaimer:</strong> This report is generated by BhaktVerse AI based on Vedic palmistry traditions (Samudrika Shastra).
            For spiritual reflection and entertainment only. Consult qualified professionals for important decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PalmReadingReport;
