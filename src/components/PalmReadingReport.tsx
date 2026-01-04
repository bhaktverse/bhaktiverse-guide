import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Share2, 
  Star, 
  Sun, 
  Moon, 
  Heart, 
  Brain, 
  Activity, 
  Briefcase,
  Users,
  GraduationCap,
  Flame,
  Plane,
  Gem,
  Calendar,
  Shield,
  AlertTriangle,
  Sparkles,
  Hand,
  Eye,
  Compass
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

interface PalmReadingReportProps {
  analysis: PalmAnalysis;
  palmImage?: string;
  userName?: string;
  onDownloadPDF?: () => void;
  isPremium?: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; color: string }> = {
  career: { icon: <Briefcase className="h-5 w-5" />, gradient: 'from-amber-500 to-orange-500', color: 'text-amber-500' },
  love: { icon: <Heart className="h-5 w-5" />, gradient: 'from-pink-500 to-rose-500', color: 'text-pink-500' },
  health: { icon: <Activity className="h-5 w-5" />, gradient: 'from-green-500 to-emerald-500', color: 'text-green-500' },
  family: { icon: <Users className="h-5 w-5" />, gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-500' },
  education: { icon: <GraduationCap className="h-5 w-5" />, gradient: 'from-purple-500 to-violet-500', color: 'text-purple-500' },
  spiritual: { icon: <Flame className="h-5 w-5" />, gradient: 'from-indigo-500 to-purple-500', color: 'text-indigo-500' },
  travel: { icon: <Plane className="h-5 w-5" />, gradient: 'from-teal-500 to-cyan-500', color: 'text-teal-500' },
};

const LINE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  heartLine: { icon: <Heart className="h-4 w-4" />, color: 'text-pink-500' },
  headLine: { icon: <Brain className="h-4 w-4" />, color: 'text-blue-500' },
  lifeLine: { icon: <Activity className="h-4 w-4" />, color: 'text-green-500' },
  fateLine: { icon: <Star className="h-4 w-4" />, color: 'text-amber-500' },
  sunLine: { icon: <Sun className="h-4 w-4" />, color: 'text-orange-500' },
};

const PalmReadingReport: React.FC<PalmReadingReportProps> = ({
  analysis,
  palmImage,
  userName = 'Seeker',
  onDownloadPDF,
  isPremium = false
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Report Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border-b border-border/50">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full -ml-32 -mb-32" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Palm Image */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/50 shadow-divine overflow-hidden bg-card">
                {palmImage ? (
                  <img src={palmImage} alt="Palm" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Hand className="h-16 w-16 text-primary/50" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 shadow-lg">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            
            {/* Report Title */}
            <div className="text-center md:text-left flex-1">
              <div className="text-4xl mb-2">🕉️</div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-2">
                AI Guru Palm Reading Report
              </h1>
              <p className="text-muted-foreground mb-3">
                Comprehensive Vedic Analysis for <span className="text-primary font-semibold">{userName}</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline" className="bg-primary/10 border-primary/30">
                  <Sun className="h-3 w-3 mr-1" />
                  {analysis.palmType || 'Analyzed'}
                </Badge>
                <Badge variant="outline" className="bg-secondary/10 border-secondary/30">
                  <Star className="h-3 w-3 mr-1" />
                  {analysis.dominantPlanet || 'Multiple Planets'}
                </Badge>
                {analysis.nakshatra && (
                  <Badge variant="outline" className="bg-accent/10 border-accent/30">
                    <Moon className="h-3 w-3 mr-1" />
                    {analysis.nakshatra}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Scores */}
            <div className="flex gap-4">
              <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-divine">
                <div className="text-3xl font-bold text-primary">{analysis.overallScore || 8.0}</div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
                <div className="text-xs text-muted-foreground">/10</div>
              </div>
              <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-divine">
                <div className="text-3xl font-bold text-secondary">{analysis.confidenceScore || 85}%</div>
                <div className="text-xs text-muted-foreground">Confidence</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {isPremium ? (
            <Button onClick={onDownloadPDF} className="bg-gradient-to-r from-primary to-secondary gap-2">
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
          ) : (
            <Button variant="outline" onClick={() => window.location.href = '/premium'} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Upgrade to Download PDF
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Report
          </Button>
        </div>

        {/* AI Guru Greeting */}
        {analysis.greeting && (
          <Card className="mb-8 bg-gradient-to-r from-primary/5 via-card to-secondary/5 border-primary/20 shadow-divine">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🙏</div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">AI Guru's Blessing</h3>
                  <p className="text-muted-foreground italic leading-relaxed">{analysis.greeting}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Destiny */}
        {analysis.overallDestiny && (
          <Card className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Your Life Path & Destiny
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{analysis.overallDestiny}</p>
            </CardContent>
          </Card>
        )}

        {/* Line Analysis Section */}
        {analysis.lineAnalysis && (
          <Card className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                Palm Line Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.lineAnalysis).map(([key, line]) => {
                  if (!line) return null;
                  const config = LINE_CONFIG[key] || { icon: <Star className="h-4 w-4" />, color: 'text-gray-500' };
                  const lineNames: Record<string, string> = {
                    heartLine: 'Heart Line',
                    headLine: 'Head Line',
                    lifeLine: 'Life Line',
                    fateLine: 'Fate Line',
                    sunLine: 'Sun Line'
                  };
                  
                  return (
                    <div key={key} className="p-4 bg-card/50 rounded-xl border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={config.color}>{config.icon}</div>
                          <span className="font-semibold">{lineNames[key] || key}</span>
                        </div>
                        {line.rating && (
                          <Badge variant="outline" className={getRatingColor(line.rating)}>
                            {line.rating}/10
                          </Badge>
                        )}
                      </div>
                      {line.observed && (
                        <p className="text-sm text-muted-foreground mb-2">{line.observed}</p>
                      )}
                      {line.meaning && (
                        <p className="text-sm text-foreground">{line.meaning}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mount Analysis */}
        {analysis.mountAnalysis && (
          <Card className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                Mount Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(analysis.mountAnalysis).map(([key, mount]) => {
                  if (!mount) return null;
                  const mountNames: Record<string, string> = {
                    jupiter: 'Jupiter',
                    saturn: 'Saturn',
                    apollo: 'Apollo/Sun',
                    mercury: 'Mercury',
                    venus: 'Venus',
                    mars: 'Mars',
                    moon: 'Moon'
                  };
                  
                  return (
                    <div key={key} className="p-3 bg-card/50 rounded-lg border border-border/50 text-center">
                      <div className="font-semibold text-sm mb-1">{mountNames[key] || key}</div>
                      <Badge 
                        variant="outline" 
                        className={
                          mount.strength === 'strong' ? 'bg-green-500/10 text-green-500' :
                          mount.strength === 'moderate' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-gray-500/10 text-gray-500'
                        }
                      >
                        {mount.strength || 'Moderate'}
                      </Badge>
                      {mount.meaning && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{mount.meaning}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Predictions */}
        {analysis.categories && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Detailed Life Predictions
            </h2>
            <div className="grid gap-6">
              {Object.entries(analysis.categories).map(([key, category]) => {
                if (!category) return null;
                const config = CATEGORY_CONFIG[key] || { 
                  icon: <Star className="h-5 w-5" />, 
                  gradient: 'from-gray-500 to-gray-600',
                  color: 'text-gray-500'
                };
                
                return (
                  <Card key={key} className="overflow-hidden card-sacred">
                    <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} text-white`}>
                            {config.icon}
                          </div>
                          {category.title || key}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Progress value={category.rating ? category.rating * 10 : 80} className="w-20 h-2" />
                          <Badge variant="outline" className={getRatingColor(category.rating || 8)}>
                            {category.rating || 8}/10
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed mb-4">{category.prediction}</p>
                      
                      {category.observedFeatures && category.observedFeatures.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Observed Features: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {category.observedFeatures.slice(0, 5).map((feature: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {category.timeline && (
                        <div className="mb-3 p-3 bg-primary/5 rounded-lg">
                          <span className="text-sm font-medium text-primary">Timeline: </span>
                          <span className="text-sm text-foreground">{category.timeline}</span>
                        </div>
                      )}
                      
                      {category.guidance && (
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">💡 Guidance: </span>
                          <span className="text-sm text-foreground">{category.guidance}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Lucky Elements */}
        {analysis.luckyElements && (
          <Card className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-primary" />
                Lucky Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.luckyElements.colors && analysis.luckyElements.colors.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
                      Colors
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.colors.map((color, i) => (
                        <Badge key={i} variant="outline">{color}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.luckyElements.gemstones && analysis.luckyElements.gemstones.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <Gem className="h-4 w-4 text-purple-500" />
                      Gemstones
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.gemstones.map((gem, i) => (
                        <Badge key={i} variant="outline">{gem}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.luckyElements.days && analysis.luckyElements.days.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Auspicious Days
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.days.map((day, i) => (
                        <Badge key={i} variant="outline">{day}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.luckyElements.numbers && analysis.luckyElements.numbers.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2">🔢 Lucky Numbers</div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.numbers.map((num, i) => (
                        <Badge key={i} variant="outline">{num}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.luckyElements.directions && analysis.luckyElements.directions.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <Compass className="h-4 w-4 text-teal-500" />
                      Directions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.directions.map((dir, i) => (
                        <Badge key={i} variant="outline">{dir}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.luckyElements.metals && analysis.luckyElements.metals.length > 0 && (
                  <div className="p-4 bg-card/50 rounded-xl border border-border/50">
                    <div className="font-semibold mb-2">⚗️ Metals</div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.luckyElements.metals.map((metal, i) => (
                        <Badge key={i} variant="outline">{metal}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mantras */}
        {analysis.luckyElements?.mantras && analysis.luckyElements.mantras.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-orange-500/5 via-card to-orange-500/5 border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🕉️ Recommended Mantras
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
                        {mantra.sanskrit && (
                          <p className="text-lg font-bold text-primary mb-1">{mantra.sanskrit}</p>
                        )}
                        {mantra.transliteration && (
                          <p className="text-sm text-muted-foreground italic mb-2">{mantra.transliteration}</p>
                        )}
                        {mantra.meaning && (
                          <p className="text-sm text-foreground">Meaning: {mantra.meaning}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Yogas */}
        {analysis.yogas && analysis.yogas.length > 0 && (
          <Card className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Special Yogas Detected
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

        {/* Remedies */}
        {analysis.remedies && analysis.remedies.length > 0 && (
          <Card className="mb-8 card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Spiritual Remedies
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

        {/* Warnings */}
        {analysis.warnings && analysis.warnings.length > 0 && (
          <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Caution Periods
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

        {/* Final Blessings */}
        {analysis.blessings && (
          <Card className="mb-8 bg-gradient-to-r from-green-500/5 via-card to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🙏</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Final Blessings</h3>
                  <p className="text-foreground italic leading-relaxed">{analysis.blessings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 pt-8">
          {isPremium ? (
            <Button onClick={onDownloadPDF} size="lg" className="bg-gradient-to-r from-primary to-secondary gap-2">
              <Download className="h-5 w-5" />
              Download Full PDF Report
            </Button>
          ) : (
            <Button size="lg" onClick={() => window.location.href = '/premium'} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Upgrade for PDF Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PalmReadingReport;
