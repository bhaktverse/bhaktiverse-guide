import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import DetailedCategoryCard from '@/components/DetailedCategoryCard';
import EnhancedPalmVisualization from '@/components/EnhancedPalmVisualization';
import {
  Hand,
  Briefcase,
  Heart,
  Activity,
  Users,
  GraduationCap,
  Flame,
  Plane,
  Star,
  Sparkles,
  Shield,
  AlertTriangle,
  Languages,
  Zap,
  Sun,
  Moon,
  Eye
} from 'lucide-react';

interface CategoryPrediction {
  title: string;
  prediction: string;
  observedFeatures?: string[];
  palmFeatures?: string[];
  planetaryInfluence?: string;
  timeline?: string;
  guidance: string;
  rating: number;
}

interface MountAnalysis {
  strength: string;
  observed?: string;
  meaning: string;
}

interface LineAnalysis {
  observed?: string;
  position?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    curveIntensity?: string;
  };
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
  tatvaExplanation?: string;
  dominantPlanet?: string;
  secondaryPlanet?: string;
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
    marsUpper?: MountAnalysis;
    marsLower?: MountAnalysis;
    moon?: MountAnalysis;
  };
  lineAnalysis?: {
    heartLine?: LineAnalysis;
    headLine?: LineAnalysis;
    lifeLine?: LineAnalysis;
    fateLine?: LineAnalysis;
    sunLine?: LineAnalysis;
  };
  handTypeAnalysis?: {
    classification?: string;
    tatvaElement?: string;
    palmShape?: string;
    fingerToPalmRatio?: string;
    personalityProfile?: string;
    strengths?: string[];
    challenges?: string[];
  };
  secondaryLines?: {
    marriageLines?: { count?: number; depth?: string; position?: string; interpretation?: string };
    childrenLines?: { count?: number; interpretation?: string };
    healthLine?: { present?: boolean; description?: string; interpretation?: string };
    travelLines?: { count?: number; description?: string; interpretation?: string };
    intuitionLine?: { present?: boolean; description?: string; interpretation?: string };
    girdleOfVenus?: { present?: boolean; description?: string; interpretation?: string };
  };
  fingerAnalysis?: {
    thumbFlexibility?: { type?: string; meaning?: string };
    fingerGaps?: { observed?: string; financialControl?: string };
    ringVsIndex?: { dominant?: string; confidenceLevel?: string };
    nailShape?: { type?: string; healthIndicator?: string };
    fingerProportions?: { details?: string; personality?: string };
  };
  lineQualityDetails?: {
    breaks?: string[];
    islands?: string[];
    forks?: string[];
    crosses?: string[];
    chains?: string[];
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
  confidenceScore?: number;
  accuracyNotes?: string;
  blessings?: string;
  rawAnalysis?: string;
}

interface PalmAnalysisResultsProps {
  analysis: PalmAnalysis;
  palmImage?: string;
}

const CATEGORY_CONFIG = {
  career: { 
    icon: Briefcase, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    hindiTitle: 'करियर एवं धन',
    englishTitle: 'Career & Finance'
  },
  love: { 
    icon: Heart, 
    color: 'text-rose-500', 
    bgColor: 'bg-rose-500/10',
    hindiTitle: 'प्रेम एवं रिश्ते',
    englishTitle: 'Love & Relationships'
  },
  health: { 
    icon: Activity, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    hindiTitle: 'स्वास्थ्य एवं शक्ति',
    englishTitle: 'Health & Vitality'
  },
  family: { 
    icon: Users, 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10',
    hindiTitle: 'परिवार एवं संतान',
    englishTitle: 'Family & Children'
  },
  education: { 
    icon: GraduationCap, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    hindiTitle: 'शिक्षा एवं ज्ञान',
    englishTitle: 'Education & Wisdom'
  },
  spiritual: { 
    icon: Flame, 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10',
    hindiTitle: 'आध्यात्मिक विकास',
    englishTitle: 'Spiritual Growth'
  },
  travel: { 
    icon: Plane, 
    color: 'text-cyan-500', 
    bgColor: 'bg-cyan-500/10',
    hindiTitle: 'यात्रा एवं भाग्य',
    englishTitle: 'Travel & Fortune'
  }
};

const MOUNT_CONFIG = {
  jupiter: { planet: 'बृहस्पति', english: 'Jupiter', symbol: '♃', color: 'text-yellow-500' },
  saturn: { planet: 'शनि', english: 'Saturn', symbol: '♄', color: 'text-gray-500' },
  apollo: { planet: 'सूर्य', english: 'Sun/Apollo', symbol: '☉', color: 'text-orange-500' },
  mercury: { planet: 'बुध', english: 'Mercury', symbol: '☿', color: 'text-green-500' },
  venus: { planet: 'शुक्र', english: 'Venus', symbol: '♀', color: 'text-pink-500' },
  mars: { planet: 'मंगल', english: 'Mars', symbol: '♂', color: 'text-red-500' },
  moon: { planet: 'चंद्र', english: 'Moon', symbol: '☽', color: 'text-blue-300' }
};

const LINE_CONFIG = {
  heartLine: { hindi: 'हृदय रेखा', english: 'Heart Line', icon: Heart, color: 'text-rose-500' },
  headLine: { hindi: 'मस्तिष्क रेखा', english: 'Head Line', icon: GraduationCap, color: 'text-purple-500' },
  lifeLine: { hindi: 'जीवन रेखा', english: 'Life Line', icon: Activity, color: 'text-green-500' },
  fateLine: { hindi: 'भाग्य रेखा', english: 'Fate Line', icon: Star, color: 'text-yellow-500' },
  sunLine: { hindi: 'सूर्य रेखा', english: 'Sun Line', icon: Sun, color: 'text-orange-500' }
};

export default function PalmAnalysisResults({ analysis, palmImage }: PalmAnalysisResultsProps) {
  const [displayLanguage, setDisplayLanguage] = useState<'hi' | 'en'>((analysis.language as 'hi' | 'en') || 'hi');
  const [activeSection, setActiveSection] = useState('predictions');
  const [showVisualization, setShowVisualization] = useState(false);

  const toggleLanguage = () => {
    setDisplayLanguage(prev => prev === 'hi' ? 'en' : 'hi');
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength?.toLowerCase()) {
      case 'strong': return <Zap className="h-4 w-4 text-green-500" />;
      case 'moderate': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'weak': return <Moon className="h-4 w-4 text-gray-400" />;
      default: return <Star className="h-4 w-4 text-primary" />;
    }
  };

  const isHindi = displayLanguage === 'hi';

  // Calculate overall score from categories
  const categoryRatings = analysis.categories 
    ? Object.values(analysis.categories).filter(c => c).map(c => c?.rating || 0)
    : [];
  const overallScore = categoryRatings.length > 0 
    ? Math.round(categoryRatings.reduce((a, b) => a + b, 0) / categoryRatings.length * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Language Toggle & Quick Stats Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/10 rounded-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Languages className="h-4 w-4" />
            {displayLanguage === 'hi' ? 'English' : 'हिंदी'}
          </Button>
          
          {analysis.palmType && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              <Hand className="h-3 w-3" />
              {analysis.palmType}
            </Badge>
          )}
          
          {analysis.dominantPlanet && (
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Sparkles className="h-3 w-3" />
              {analysis.dominantPlanet}
            </Badge>
          )}
          
          {analysis.nakshatra && (
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Star className="h-3 w-3" />
              {analysis.nakshatra}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Overall Score */}
          {overallScore > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-medium">{isHindi ? 'समग्र स्कोर' : 'Overall'}</span>
              <span className="text-xl font-bold text-primary">{overallScore}</span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          )}

          {/* Confidence Score */}
          {analysis.confidenceScore && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {analysis.confidenceScore}% {isHindi ? 'विश्वास' : 'Confidence'}
            </Badge>
          )}

          {/* Visualization Toggle */}
          {palmImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVisualization(!showVisualization)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showVisualization 
                ? (isHindi ? 'छिपाएं' : 'Hide') 
                : (isHindi ? 'रेखा दृश्य' : 'Line View')}
            </Button>
          )}
        </div>
      </div>

      {/* Palm Line Visualization */}
      {showVisualization && palmImage && (
        <EnhancedPalmVisualization
          imageUrl={palmImage}
          palmType={analysis.palmType}
          lineAnalysis={analysis.lineAnalysis}
          mountAnalysis={analysis.mountAnalysis}
          language={displayLanguage}
        />
      )}

      {/* AI Guru Greeting Card */}
      {analysis.greeting && (
        <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
                  🧘‍♂️
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">
                    {isHindi ? 'गुरु जी का संदेश' : 'Guru Ji Speaks'}
                  </h3>
                  <Badge variant="outline" className="text-xs">AI Guru</Badge>
                </div>
                <p className="text-foreground leading-relaxed italic text-lg">
                  "{analysis.greeting}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Destiny Card */}
      {analysis.overallDestiny && (
        <Card className="bg-gradient-to-br from-background via-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <span>{isHindi ? 'आपका जीवन पथ' : 'Your Life Path'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">{analysis.overallDestiny}</p>
            
            {analysis.tatvaExplanation && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>{isHindi ? 'तत्व विश्लेषण:' : 'Element Analysis:'}</strong> {analysis.tatvaExplanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Analysis Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-4 h-auto gap-1">
          <TabsTrigger value="predictions" className="text-xs py-2">
            {isHindi ? 'भविष्यवाणी' : 'Predictions'}
          </TabsTrigger>
          <TabsTrigger value="lines" className="text-xs py-2">
            {isHindi ? 'रेखाएं' : 'Lines'}
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs py-2">
            {isHindi ? 'उन्नत' : 'Advanced'}
          </TabsTrigger>
          <TabsTrigger value="fingers" className="text-xs py-2">
            {isHindi ? 'उंगलियां' : 'Fingers'}
          </TabsTrigger>
          <TabsTrigger value="mounts" className="text-xs py-2">
            {isHindi ? 'पर्वत' : 'Mounts'}
          </TabsTrigger>
          <TabsTrigger value="remedies" className="text-xs py-2">
            {isHindi ? 'उपाय' : 'Remedies'}
          </TabsTrigger>
        </TabsList>

        {/* Category Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {analysis.categories && Object.entries(analysis.categories).map(([key, category]) => {
            if (!category) return null;
            const config = CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG];
            if (!config) return null;

            return (
              <DetailedCategoryCard
                key={key}
                categoryKey={key}
                category={category}
                icon={config.icon}
                color={config.color}
                bgColor={config.bgColor}
                hindiTitle={config.hindiTitle}
                englishTitle={config.englishTitle}
                language={displayLanguage}
              />
            );
          })}

          {(!analysis.categories || Object.keys(analysis.categories).length === 0) && analysis.rawAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>{isHindi ? 'विश्लेषण' : 'Analysis'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <p className="whitespace-pre-wrap leading-relaxed">{analysis.rawAnalysis}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Lines Analysis Tab */}
        <TabsContent value="lines" className="space-y-4">
          <Card className="bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                {isHindi ? 'रेखा विश्लेषण' : 'Line Analysis'}
              </CardTitle>
              <CardDescription>
                {isHindi 
                  ? 'आपके हाथ की प्रमुख रेखाओं का विस्तृत विश्लेषण' 
                  : 'Detailed analysis of major lines on your palm'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.lineAnalysis && Object.entries(analysis.lineAnalysis).map(([key, line]) => {
                if (!line) return null;
                const config = LINE_CONFIG[key as keyof typeof LINE_CONFIG];
                if (!config) return null;

                const Icon = config.icon;

                return (
                  <div key={key} className="p-4 bg-muted/30 rounded-xl space-y-3 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-background ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold">
                            {isHindi ? config.hindi : config.english}
                          </span>
                          {isHindi && (
                            <span className="text-xs text-muted-foreground ml-2">({config.english})</span>
                          )}
                        </div>
                      </div>
                      {line.type && (
                        <Badge variant="outline" className="text-xs">{line.type}</Badge>
                      )}
                    </div>
                    
                    {/* Observed details */}
                    {line.observed && (
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-sm font-medium mb-1 text-primary">
                          {isHindi ? 'देखे गए विवरण:' : 'Observed Details:'}
                        </p>
                        <p className="text-sm text-foreground">{line.observed}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">{line.meaning}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {line.loveStyle && (
                        <div className="p-2 bg-background/50 rounded">
                          <strong className="text-rose-500">{isHindi ? 'प्रेम शैली:' : 'Love Style:'}</strong>
                          <p className="text-xs mt-1">{line.loveStyle}</p>
                        </div>
                      )}
                      {line.thinkingStyle && (
                        <div className="p-2 bg-background/50 rounded">
                          <strong className="text-purple-500">{isHindi ? 'सोच शैली:' : 'Thinking:'}</strong>
                          <p className="text-xs mt-1">{line.thinkingStyle}</p>
                        </div>
                      )}
                      {line.vitality && (
                        <div className="p-2 bg-background/50 rounded">
                          <strong className="text-green-500">{isHindi ? 'जीवन शक्ति:' : 'Vitality:'}</strong>
                          <p className="text-xs mt-1">{line.vitality}</p>
                        </div>
                      )}
                      {line.destinyPath && (
                        <div className="p-2 bg-background/50 rounded">
                          <strong className="text-yellow-500">{isHindi ? 'भाग्य पथ:' : 'Destiny:'}</strong>
                          <p className="text-xs mt-1">{line.destinyPath}</p>
                        </div>
                      )}
                      {line.successPath && (
                        <div className="p-2 bg-background/50 rounded">
                          <strong className="text-orange-500">{isHindi ? 'सफलता पथ:' : 'Success:'}</strong>
                          <p className="text-xs mt-1">{line.successPath}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!analysis.lineAnalysis || Object.keys(analysis.lineAnalysis).length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {isHindi ? 'रेखा विश्लेषण उपलब्ध नहीं है' : 'Line analysis not available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab - Secondary Lines + Line Quality */}
        <TabsContent value="advanced" className="space-y-4">
          {/* Hand Type */}
          {analysis.handTypeAnalysis && (
            <Card className="bg-gradient-to-br from-background to-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hand className="h-5 w-5 text-primary" />
                  {isHindi ? 'हस्त प्रकार' : 'Hand Type Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">
                    {analysis.handTypeAnalysis.classification === 'Earth' ? '🌍' :
                     analysis.handTypeAnalysis.classification === 'Air' ? '💨' :
                     analysis.handTypeAnalysis.classification === 'Water' ? '💧' :
                     analysis.handTypeAnalysis.classification === 'Fire' ? '🔥' : '🖐️'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{analysis.handTypeAnalysis.classification} {isHindi ? 'हस्त' : 'Hand'}</h3>
                    <p className="text-sm text-muted-foreground">{isHindi ? 'तत्व' : 'Tatva'}: {analysis.handTypeAnalysis.tatvaElement} • {isHindi ? 'आकार' : 'Shape'}: {analysis.handTypeAnalysis.palmShape}</p>
                  </div>
                </div>
                {analysis.handTypeAnalysis.personalityProfile && <p className="text-sm leading-relaxed mb-3">{analysis.handTypeAnalysis.personalityProfile}</p>}
                <div className="grid grid-cols-2 gap-3">
                  {analysis.handTypeAnalysis.strengths && (
                    <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                      <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">{isHindi ? 'ताकत' : 'Strengths'}</h4>
                      {analysis.handTypeAnalysis.strengths.map((s, i) => <p key={i} className="text-xs">✓ {s}</p>)}
                    </div>
                  )}
                  {analysis.handTypeAnalysis.challenges && (
                    <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">{isHindi ? 'चुनौतियाँ' : 'Challenges'}</h4>
                      {analysis.handTypeAnalysis.challenges.map((c, i) => <p key={i} className="text-xs">! {c}</p>)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secondary Lines */}
          {analysis.secondaryLines && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  {isHindi ? 'द्वितीयक रेखाएं' : 'Secondary Lines'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analysis.secondaryLines).map(([key, line]) => {
                  if (!line) return null;
                  const names: Record<string, { hi: string; en: string }> = {
                    marriageLines: { hi: 'विवाह रेखा', en: 'Marriage Lines' },
                    childrenLines: { hi: 'संतान रेखा', en: 'Children Lines' },
                    healthLine: { hi: 'स्वास्थ्य रेखा', en: 'Health Line' },
                    travelLines: { hi: 'यात्रा रेखा', en: 'Travel Lines' },
                    intuitionLine: { hi: 'अंतर्ज्ञान रेखा', en: 'Intuition Line' },
                    girdleOfVenus: { hi: 'शुक्र मेखला', en: 'Girdle of Venus' },
                  };
                  const n = names[key] || { hi: key, en: key };
                  return (
                    <div key={key} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{isHindi ? n.hi : n.en}</span>
                        {'count' in line && <Badge variant="outline" className="text-xs">{(line as any).count}</Badge>}
                        {'present' in line && <Badge variant="outline" className={`text-xs ${(line as any).present ? 'bg-green-500/10 text-green-500' : ''}`}>{(line as any).present ? '✓' : '✗'}</Badge>}
                      </div>
                      {(line as any).interpretation && <p className="text-sm text-muted-foreground">{(line as any).interpretation}</p>}
                      {(line as any).description && <p className="text-xs text-muted-foreground mt-1">{(line as any).description}</p>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Line Quality Details */}
          {analysis.lineQualityDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔬 {isHindi ? 'रेखा गुणवत्ता' : 'Line Quality Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['breaks', 'islands', 'forks', 'crosses', 'chains'] as const).map(type => {
                  const items = analysis.lineQualityDetails?.[type];
                  if (!items || items.length === 0) return null;
                  const labels: Record<string, { hi: string; en: string; emoji: string }> = {
                    breaks: { hi: 'टूट', en: 'Breaks', emoji: '⚡' },
                    islands: { hi: 'द्वीप', en: 'Islands', emoji: '🏝️' },
                    forks: { hi: 'कांटे', en: 'Forks', emoji: '🍴' },
                    crosses: { hi: 'क्रॉस', en: 'Crosses', emoji: '✚' },
                    chains: { hi: 'श्रृंखला', en: 'Chains', emoji: '🔗' },
                  };
                  const l = labels[type];
                  return (
                    <div key={type} className="p-3 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">{l.emoji} {isHindi ? l.hi : l.en}</h4>
                      {items.map((item, i) => <p key={i} className="text-sm text-muted-foreground">• {item}</p>)}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Finger & Nail Analysis Tab */}
        <TabsContent value="fingers" className="space-y-4">
          {analysis.fingerAnalysis && (
            <Card className="bg-gradient-to-br from-background to-cyan-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👆 {isHindi ? 'अंगुली एवं नख विश्लेषण' : 'Finger & Nail Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.fingerAnalysis.thumbFlexibility && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">👍 {isHindi ? 'अंगूठे का लचीलापन' : 'Thumb Flexibility'}</h4>
                      <Badge variant="secondary" className="mb-1">{analysis.fingerAnalysis.thumbFlexibility.type}</Badge>
                      <p className="text-sm text-muted-foreground">{analysis.fingerAnalysis.thumbFlexibility.meaning}</p>
                    </div>
                  )}
                  {analysis.fingerAnalysis.fingerGaps && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">🤚 {isHindi ? 'उंगलियों की दूरी' : 'Finger Gaps'}</h4>
                      <p className="text-xs text-muted-foreground">{analysis.fingerAnalysis.fingerGaps.observed}</p>
                      <p className="text-sm mt-1">{analysis.fingerAnalysis.fingerGaps.financialControl}</p>
                    </div>
                  )}
                  {analysis.fingerAnalysis.ringVsIndex && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">💪 {isHindi ? 'अनामिका vs तर्जनी' : 'Ring vs Index'}</h4>
                      <Badge variant="secondary" className="mb-1">{analysis.fingerAnalysis.ringVsIndex.dominant}</Badge>
                      <p className="text-sm text-muted-foreground">{analysis.fingerAnalysis.ringVsIndex.confidenceLevel}</p>
                    </div>
                  )}
                  {analysis.fingerAnalysis.nailShape && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">💅 {isHindi ? 'नख आकार' : 'Nail Shape'}</h4>
                      <Badge variant="secondary" className="mb-1">{analysis.fingerAnalysis.nailShape.type}</Badge>
                      <p className="text-sm text-muted-foreground">{analysis.fingerAnalysis.nailShape.healthIndicator}</p>
                    </div>
                  )}
                  {analysis.fingerAnalysis.fingerProportions && (
                    <div className="p-3 bg-muted/30 rounded-lg sm:col-span-2">
                      <h4 className="font-semibold text-sm mb-1">📏 {isHindi ? 'उंगली अनुपात' : 'Finger Proportions'}</h4>
                      <p className="text-xs text-muted-foreground">{analysis.fingerAnalysis.fingerProportions.details}</p>
                      <p className="text-sm mt-1">{analysis.fingerAnalysis.fingerProportions.personality}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {!analysis.fingerAnalysis && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>{isHindi ? 'उंगली विश्लेषण उपलब्ध नहीं है। पुनः स्कैन करें।' : 'Finger analysis not available. Try re-scanning.'}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mounts Analysis Tab */}
        <TabsContent value="mounts" className="space-y-4">
          <Card className="bg-gradient-to-br from-background to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {isHindi ? 'पर्वत विश्लेषण' : 'Mount Analysis'}
              </CardTitle>
              <CardDescription>
                {isHindi ? 'ग्रहों के पर्वत और उनका प्रभाव' : 'Planetary mounts and their influence'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.mountAnalysis && Object.entries(analysis.mountAnalysis).map(([key, mount]) => {
                  if (!mount) return null;
                  const config = MOUNT_CONFIG[key as keyof typeof MOUNT_CONFIG];
                  if (!config) return null;

                  return (
                    <div key={key} className="p-4 bg-muted/30 rounded-xl space-y-2 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl ${config.color}`}>{config.symbol}</span>
                          <div>
                            <span className="font-semibold">
                              {isHindi ? config.planet : config.english}
                            </span>
                            {isHindi && (
                              <span className="text-xs text-muted-foreground block">{config.english}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStrengthIcon(mount.strength)}
                          <Badge 
                            variant="outline" 
                            className={`text-xs capitalize ${
                              mount.strength === 'strong' ? 'border-green-500 text-green-500' :
                              mount.strength === 'weak' ? 'border-red-500 text-red-500' :
                              'border-yellow-500 text-yellow-500'
                            }`}
                          >
                            {mount.strength}
                          </Badge>
                        </div>
                      </div>
                      {mount.observed && (
                        <p className="text-xs text-primary bg-primary/5 p-2 rounded">{mount.observed}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{mount.meaning}</p>
                    </div>
                  );
                })}
              </div>

              {(!analysis.mountAnalysis || Object.keys(analysis.mountAnalysis).length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {isHindi ? 'पर्वत विश्लेषण उपलब्ध नहीं है' : 'Mount analysis not available'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Special Marks */}
          {analysis.specialMarks && analysis.specialMarks.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  {isHindi ? 'विशेष चिन्ह' : 'Special Marks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.specialMarks.map((mark, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                      <span className="text-warning text-lg">✦</span>
                      <span className="text-sm">{mark}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Remedies & Lucky Elements Tab */}
        <TabsContent value="remedies" className="space-y-4">
          {/* Lucky Elements */}
          {analysis.luckyElements && (
            <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  {isHindi ? 'शुभ तत्व' : 'Lucky Elements'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {analysis.luckyElements.colors && analysis.luckyElements.colors.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">🎨 {isHindi ? 'रंग' : 'Colors'}</p>
                    <p className="text-sm">{analysis.luckyElements.colors.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.gemstones && analysis.luckyElements.gemstones.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg col-span-2 md:col-span-1">
                    <p className="font-semibold text-sm mb-1">💎 {isHindi ? 'रत्न' : 'Gemstones'}</p>
                    <p className="text-sm">{analysis.luckyElements.gemstones.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.days && analysis.luckyElements.days.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">📅 {isHindi ? 'दिन' : 'Days'}</p>
                    <p className="text-sm">{analysis.luckyElements.days.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.numbers && analysis.luckyElements.numbers.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">🔢 {isHindi ? 'अंक' : 'Numbers'}</p>
                    <p className="text-sm">{analysis.luckyElements.numbers.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.mantras && analysis.luckyElements.mantras.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg col-span-2">
                    <p className="font-semibold text-sm mb-1">🕉️ {isHindi ? 'मंत्र' : 'Mantras'}</p>
                    <div className="space-y-1">
                      {analysis.luckyElements.mantras.map((mantra, idx) => (
                        <p key={idx} className="text-sm font-medium text-primary">{mantra}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.luckyElements.metals && analysis.luckyElements.metals.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">⚙️ {isHindi ? 'धातु' : 'Metals'}</p>
                    <p className="text-sm">{analysis.luckyElements.metals.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.directions && analysis.luckyElements.directions.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">🧭 {isHindi ? 'दिशाएं' : 'Directions'}</p>
                    <p className="text-sm">{analysis.luckyElements.directions.join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Yogas */}
          {analysis.yogas && analysis.yogas.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {isHindi ? 'विशेष योग' : 'Special Yogas'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.yogas.map((yoga, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                      <span className="text-purple-500 text-lg">☯</span>
                      <span className="text-sm">{yoga}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spiritual Remedies */}
          {analysis.remedies && analysis.remedies.length > 0 && (
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  {isHindi ? 'आध्यात्मिक उपाय' : 'Spiritual Remedies'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.remedies.map((remedy, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                      <span className="text-green-500 text-lg">🕉️</span>
                      <span className="text-sm">{remedy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {analysis.warnings && analysis.warnings.length > 0 && (
            <Card className="border-destructive/30 bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {isHindi ? 'सावधानियां' : 'Cautions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                      <span className="text-destructive text-lg">⚠️</span>
                      <span className="text-sm">{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Final Blessings */}
      {analysis.blessings && (
        <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 rounded-full bg-green-500/10">
                <span className="text-4xl">🙏</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  {isHindi ? 'गुरु जी का आशीर्वाद' : 'Guru Ji Blessings'}
                </h3>
                <p className="text-foreground leading-relaxed font-medium italic text-lg max-w-2xl mx-auto">
                  "{analysis.blessings}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accuracy Notes */}
      {analysis.accuracyNotes && (
        <div className="text-center text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p>{analysis.accuracyNotes}</p>
        </div>
      )}
    </div>
  );
}
