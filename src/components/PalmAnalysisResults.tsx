import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Globe,
  Sparkles,
  Gem,
  Calendar,
  Moon,
  Sun,
  Zap,
  Shield,
  AlertTriangle,
  ChevronRight,
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
  const [displayLanguage, setDisplayLanguage] = useState<'hi' | 'en'>('hi');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  const toggleLanguage = () => {
    setDisplayLanguage(prev => prev === 'hi' ? 'en' : 'hi');
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500 bg-green-500/10';
    if (rating >= 6) return 'text-yellow-500 bg-yellow-500/10';
    if (rating >= 4) return 'text-orange-500 bg-orange-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength?.toLowerCase()) {
      case 'strong': return <Zap className="h-4 w-4 text-green-500" />;
      case 'moderate': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'weak': return <Moon className="h-4 w-4 text-gray-400" />;
      default: return <Star className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Toggle & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
            <Badge variant="secondary" className="gap-1">
              <Hand className="h-3 w-3" />
              {analysis.palmType}
            </Badge>
          )}
          
          {analysis.dominantPlanet && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {analysis.dominantPlanet}
            </Badge>
          )}
          
          {analysis.nakshatra && (
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              {analysis.nakshatra}
            </Badge>
          )}
        </div>
      </div>

      {/* AI Guru Greeting Card */}
      {analysis.greeting && (
        <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
                  🧘‍♂️
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">
                    {displayLanguage === 'hi' ? 'गुरु जी का संदेश' : 'Guru Ji Speaks'}
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
        <Card className="card-sacred">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <span>
                {displayLanguage === 'hi' ? 'आपका जीवन पथ' : 'Your Life Path'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">{analysis.overallDestiny}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Analysis Sections */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            {displayLanguage === 'hi' ? 'भविष्यवाणी' : 'Predictions'}
          </TabsTrigger>
          <TabsTrigger value="lines" className="text-xs sm:text-sm">
            {displayLanguage === 'hi' ? 'रेखाएं' : 'Lines'}
          </TabsTrigger>
          <TabsTrigger value="mounts" className="text-xs sm:text-sm">
            {displayLanguage === 'hi' ? 'पर्वत' : 'Mounts'}
          </TabsTrigger>
          <TabsTrigger value="remedies" className="text-xs sm:text-sm">
            {displayLanguage === 'hi' ? 'उपाय' : 'Remedies'}
          </TabsTrigger>
        </TabsList>

        {/* Category Predictions Tab */}
        <TabsContent value="overview" className="space-y-4">
          {analysis.categories && Object.entries(analysis.categories).map(([key, category]) => {
            if (!category) return null;
            const config = CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG];
            if (!config) return null;
            
            const Icon = config.icon;
            const isExpanded = expandedCategory === key;

            return (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${isExpanded ? 'ring-2 ring-primary/50' : ''}`}
                onClick={() => setExpandedCategory(isExpanded ? null : key)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <span className="block">
                          {displayLanguage === 'hi' ? config.hindiTitle : config.englishTitle}
                        </span>
                        {displayLanguage === 'hi' && (
                          <span className="text-xs text-muted-foreground">{config.englishTitle}</span>
                        )}
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full font-bold ${getRatingColor(category.rating)}`}>
                        {category.rating}/10
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <Progress 
                    value={category.rating * 10} 
                    className="h-2 mt-2"
                  />
                </CardHeader>

                <CardContent className={`space-y-4 transition-all ${isExpanded ? 'block' : 'hidden'}`}>
                  {/* Main Prediction */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground leading-relaxed">{category.prediction}</p>
                  </div>

                  {/* Planetary Influence */}
                  {category.planetaryInfluence && (
                    <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                          {displayLanguage === 'hi' ? 'ग्रह प्रभाव' : 'Planetary Influence'}
                        </p>
                        <p className="text-sm">{category.planetaryInfluence}</p>
                      </div>
                    </div>
                  )}

                  {/* Palm Features */}
                  {category.palmFeatures && category.palmFeatures.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Hand className="h-4 w-4" />
                        {displayLanguage === 'hi' ? 'हस्त संकेतक' : 'Palm Indicators'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.palmFeatures.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {category.timeline && (
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                          {displayLanguage === 'hi' ? 'समय सीमा' : 'Timeline'}
                        </p>
                        <p className="text-sm">{category.timeline}</p>
                      </div>
                    </div>
                  )}

                  {/* Guidance */}
                  {category.guidance && (
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-green-600 dark:text-green-400">
                          {displayLanguage === 'hi' ? 'मार्गदर्शन' : 'Guidance'}
                        </p>
                        <p className="text-sm">{category.guidance}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Lines Analysis Tab */}
        <TabsContent value="lines" className="space-y-4">
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                {displayLanguage === 'hi' ? 'रेखा विश्लेषण' : 'Line Analysis'}
              </CardTitle>
              <CardDescription>
                {displayLanguage === 'hi' 
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
                  <div key={key} className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <span className="font-semibold">
                        {displayLanguage === 'hi' ? config.hindi : config.english}
                      </span>
                      {displayLanguage === 'hi' && (
                        <span className="text-xs text-muted-foreground">({config.english})</span>
                      )}
                    </div>
                    
                    {line.type && (
                      <Badge variant="outline">{line.type}</Badge>
                    )}
                    
                    <p className="text-sm text-muted-foreground">{line.meaning}</p>
                    
                    {line.loveStyle && (
                      <p className="text-sm"><strong>{displayLanguage === 'hi' ? 'प्रेम शैली:' : 'Love Style:'}</strong> {line.loveStyle}</p>
                    )}
                    {line.thinkingStyle && (
                      <p className="text-sm"><strong>{displayLanguage === 'hi' ? 'सोच शैली:' : 'Thinking Style:'}</strong> {line.thinkingStyle}</p>
                    )}
                    {line.vitality && (
                      <p className="text-sm"><strong>{displayLanguage === 'hi' ? 'जीवन शक्ति:' : 'Vitality:'}</strong> {line.vitality}</p>
                    )}
                  </div>
                );
              })}

              {(!analysis.lineAnalysis || Object.keys(analysis.lineAnalysis).length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {displayLanguage === 'hi' 
                    ? 'रेखा विश्लेषण उपलब्ध नहीं है' 
                    : 'Line analysis not available'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mounts Analysis Tab */}
        <TabsContent value="mounts" className="space-y-4">
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {displayLanguage === 'hi' ? 'पर्वत विश्लेषण' : 'Mount Analysis'}
              </CardTitle>
              <CardDescription>
                {displayLanguage === 'hi' 
                  ? 'ग्रहों के पर्वत और उनका प्रभाव' 
                  : 'Planetary mounts and their influence'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.mountAnalysis && Object.entries(analysis.mountAnalysis).map(([key, mount]) => {
                  if (!mount) return null;
                  const config = MOUNT_CONFIG[key as keyof typeof MOUNT_CONFIG];
                  if (!config) return null;

                  return (
                    <div key={key} className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl ${config.color}`}>{config.symbol}</span>
                          <div>
                            <span className="font-semibold">
                              {displayLanguage === 'hi' ? config.planet : config.english}
                            </span>
                            {displayLanguage === 'hi' && (
                              <span className="text-xs text-muted-foreground block">{config.english}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStrengthIcon(mount.strength)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {mount.strength}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{mount.meaning}</p>
                    </div>
                  );
                })}
              </div>

              {(!analysis.mountAnalysis || Object.keys(analysis.mountAnalysis).length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {displayLanguage === 'hi' 
                    ? 'पर्वत विश्लेषण उपलब्ध नहीं है' 
                    : 'Mount analysis not available'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Special Marks */}
          {analysis.specialMarks && analysis.specialMarks.length > 0 && (
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  {displayLanguage === 'hi' ? 'विशेष चिन्ह' : 'Special Marks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.specialMarks.map((mark, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-warning/10 rounded-lg">
                      <span className="text-warning">✦</span>
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
            <Card className="card-sacred bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  {displayLanguage === 'hi' ? 'शुभ तत्व' : 'Lucky Elements'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {analysis.luckyElements.colors && analysis.luckyElements.colors.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">
                      🎨 {displayLanguage === 'hi' ? 'रंग' : 'Colors'}
                    </p>
                    <p className="text-sm">{analysis.luckyElements.colors.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.gemstones && analysis.luckyElements.gemstones.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">
                      💎 {displayLanguage === 'hi' ? 'रत्न' : 'Gemstones'}
                    </p>
                    <p className="text-sm">{analysis.luckyElements.gemstones.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.days && analysis.luckyElements.days.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">
                      📅 {displayLanguage === 'hi' ? 'दिन' : 'Days'}
                    </p>
                    <p className="text-sm">{analysis.luckyElements.days.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.numbers && analysis.luckyElements.numbers.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">
                      🔢 {displayLanguage === 'hi' ? 'अंक' : 'Numbers'}
                    </p>
                    <p className="text-sm">{analysis.luckyElements.numbers.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.mantras && analysis.luckyElements.mantras.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg col-span-2">
                    <p className="font-semibold text-sm mb-1">
                      🕉️ {displayLanguage === 'hi' ? 'मंत्र' : 'Mantras'}
                    </p>
                    <p className="text-sm">{analysis.luckyElements.mantras.join(' | ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.metals && analysis.luckyElements.metals.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">
                      ⚙️ {displayLanguage === 'hi' ? 'धातु' : 'Metals'}
                    </p>
                    <p className="text-sm">{analysis.luckyElements.metals.join(', ')}</p>
                  </div>
                )}
                
                {analysis.luckyElements.directions && analysis.luckyElements.directions.length > 0 && (
                  <div className="p-3 bg-background/60 rounded-lg">
                    <p className="font-semibold text-sm mb-1">
                      🧭 {displayLanguage === 'hi' ? 'दिशाएं' : 'Directions'}
                    </p>
                    <p className="text-sm">{analysis.luckyElements.directions.join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Yogas */}
          {analysis.yogas && analysis.yogas.length > 0 && (
            <Card className="card-sacred bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {displayLanguage === 'hi' ? 'विशेष योग' : 'Special Yogas'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.yogas.map((yoga, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                      <span className="text-purple-500">☯</span>
                      <span className="text-sm">{yoga}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spiritual Remedies */}
          {analysis.remedies && analysis.remedies.length > 0 && (
            <Card className="card-sacred bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  {displayLanguage === 'hi' ? 'आध्यात्मिक उपाय' : 'Spiritual Remedies'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.remedies.map((remedy, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                      <span className="text-green-500">🕉️</span>
                      <span className="text-sm">{remedy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {analysis.warnings && analysis.warnings.length > 0 && (
            <Card className="card-sacred border-destructive/30 bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {displayLanguage === 'hi' ? 'सावधानियां' : 'Cautions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                      <span className="text-destructive">⚠️</span>
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
                  {displayLanguage === 'hi' ? 'गुरु जी का आशीर्वाद' : 'Guru Ji Blessings'}
                </h3>
                <p className="text-foreground leading-relaxed font-medium italic text-lg max-w-2xl mx-auto">
                  "{analysis.blessings}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Analysis Fallback */}
      {analysis.rawAnalysis && !analysis.categories && (
        <Card className="card-sacred">
          <CardHeader>
            <CardTitle>{displayLanguage === 'hi' ? 'विश्लेषण' : 'Analysis'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{analysis.rawAnalysis}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
