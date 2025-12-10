import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Shield,
  Hand,
  Star,
  AlertTriangle,
  CheckCircle,
  LucideIcon
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

interface DetailedCategoryCardProps {
  categoryKey: string;
  category: CategoryPrediction;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  hindiTitle: string;
  englishTitle: string;
  language: 'hi' | 'en';
}

const DetailedCategoryCard = ({
  categoryKey,
  category,
  icon: Icon,
  color,
  bgColor,
  hindiTitle,
  englishTitle,
  language
}: DetailedCategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isHindi = language === 'hi';

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (rating >= 6) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    if (rating >= 4) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    return 'text-red-500 bg-red-500/10 border-red-500/30';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 8) return isHindi ? 'उत्कृष्ट' : 'Excellent';
    if (rating >= 6) return isHindi ? 'अच्छा' : 'Good';
    if (rating >= 4) return isHindi ? 'सामान्य' : 'Average';
    return isHindi ? 'सुधार आवश्यक' : 'Needs Improvement';
  };

  // Format prediction text into paragraphs
  const formatPrediction = (text: string) => {
    if (!text) return [];
    
    // Split by numbered points or double newlines
    const paragraphs = text.split(/(?:\d+\.\s*|\n\n|(?<=।)\s+)/).filter(p => p.trim());
    return paragraphs;
  };

  const predictionParagraphs = formatPrediction(category.prediction);
  const wordCount = category.prediction?.split(/\s+/).length || 0;

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg border-2 ${isExpanded ? 'border-primary/40 shadow-primary/10' : 'border-transparent'}`}
    >
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${bgColor} shadow-sm`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <span className="block text-base">
                {isHindi ? hindiTitle : englishTitle}
              </span>
              {isHindi && (
                <span className="text-xs text-muted-foreground">{englishTitle}</span>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Rating Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getRatingColor(category.rating)}`}>
              <span className="font-bold text-lg">{category.rating}</span>
              <span className="text-xs">/10</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar & Rating Label */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{getRatingLabel(category.rating)}</span>
            <span>{wordCount} {isHindi ? 'शब्द' : 'words'}</span>
          </div>
          <Progress 
            value={category.rating * 10} 
            className="h-2"
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-5 pt-0">
          {/* Main Prediction - Detailed Analysis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Star className={`h-4 w-4 ${color}`} />
              <span>{isHindi ? 'विस्तृत विश्लेषण' : 'Detailed Analysis'}</span>
            </div>
            
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4 pr-4">
                {predictionParagraphs.map((paragraph, idx) => (
                  <div key={idx} className="relative">
                    {idx > 0 && <Separator className="mb-4" />}
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${bgColor} flex items-center justify-center text-xs font-bold ${color}`}>
                        {idx + 1}
                      </div>
                      <p className="text-foreground leading-relaxed flex-1">
                        {paragraph.trim()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Observed Features */}
          {category.observedFeatures && category.observedFeatures.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Hand className={`h-4 w-4 ${color}`} />
                <span>{isHindi ? 'देखे गए संकेत' : 'Observed Features'}</span>
              </div>
              <div className="grid gap-2">
                {category.observedFeatures.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Palm Features Tags */}
          {category.palmFeatures && category.palmFeatures.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Hand className="h-4 w-4 text-primary" />
                <span>{isHindi ? 'हस्त संकेतक' : 'Palm Indicators'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.palmFeatures.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Planetary Influence */}
          {category.planetaryInfluence && (
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-purple-600 dark:text-purple-400 mb-1">
                    {isHindi ? 'ग्रह प्रभाव' : 'Planetary Influence'}
                  </p>
                  <p className="text-sm leading-relaxed">{category.planetaryInfluence}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {category.timeline && (
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-1">
                    {isHindi ? 'समय सीमा' : 'Timeline'}
                  </p>
                  <p className="text-sm leading-relaxed">{category.timeline}</p>
                </div>
              </div>
            </div>
          )}

          {/* Guidance */}
          {category.guidance && (
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-green-600 dark:text-green-400 mb-1">
                    {isHindi ? 'मार्गदर्शन एवं उपाय' : 'Guidance & Remedies'}
                  </p>
                  <p className="text-sm leading-relaxed">{category.guidance}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DetailedCategoryCard;
