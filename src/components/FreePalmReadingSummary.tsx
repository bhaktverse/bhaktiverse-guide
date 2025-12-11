import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Lock,
  Crown,
  Star,
  Hand,
  Eye,
  Zap,
  ChevronRight,
  Gift,
  Heart,
  Briefcase,
  Activity
} from 'lucide-react';

interface FreePalmReadingSummaryProps {
  analysis: {
    palmType?: string;
    greeting?: string;
    overallDestiny?: string;
    dominantPlanet?: string;
    categories?: {
      career?: { rating: number; title: string };
      love?: { rating: number; title: string };
      health?: { rating: number; title: string };
    };
    luckyElements?: {
      colors?: string[];
      gemstones?: string[];
    };
  };
  onUpgrade?: () => void;
  showUpgradePrompt?: boolean;
}

const FreePalmReadingSummary = ({ 
  analysis, 
  onUpgrade, 
  showUpgradePrompt = true 
}: FreePalmReadingSummaryProps) => {
  const [showTeaser, setShowTeaser] = useState(true);

  return (
    <div className="space-y-6">
      {/* Free Summary Card */}
      <Card className="card-sacred border-2 border-primary/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Free Palm Summary
                  <Badge variant="secondary" className="text-xs">Preview</Badge>
                </CardTitle>
                <CardDescription>
                  Your complimentary destiny glimpse
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              {analysis.palmType || 'Standard'} Hand
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Greeting */}
          {analysis.greeting && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm italic leading-relaxed">
                "{analysis.greeting}"
              </p>
            </div>
          )}

          {/* Quick Overview */}
          <div className="grid grid-cols-3 gap-4">
            {analysis.categories?.career && (
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Briefcase className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-lg font-bold">{analysis.categories.career.rating}/10</div>
                <div className="text-xs text-muted-foreground">Career</div>
              </div>
            )}
            {analysis.categories?.love && (
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Heart className="h-5 w-5 mx-auto mb-2 text-pink-500" />
                <div className="text-lg font-bold">{analysis.categories.love.rating}/10</div>
                <div className="text-xs text-muted-foreground">Love</div>
              </div>
            )}
            {analysis.categories?.health && (
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Activity className="h-5 w-5 mx-auto mb-2 text-success" />
                <div className="text-lg font-bold">{analysis.categories.health.rating}/10</div>
                <div className="text-xs text-muted-foreground">Health</div>
              </div>
            )}
          </div>

          {/* Destiny Teaser */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              Your Destiny Path
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.overallDestiny 
                ? analysis.overallDestiny.substring(0, 200) + '...'
                : 'Your palm reveals a unique life path with significant potential...'}
            </p>
          </div>

          {/* Lucky Elements Preview */}
          {(analysis.luckyElements?.colors || analysis.luckyElements?.gemstones) && (
            <div className="flex flex-wrap gap-2">
              {analysis.luckyElements.colors?.slice(0, 2).map((color, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  🎨 {color}
                </Badge>
              ))}
              {analysis.luckyElements.gemstones?.slice(0, 1).map((gem, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  💎 {gem}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Locked Features Teaser */}
          {showUpgradePrompt && (
            <div className="space-y-4">
              <h4 className="font-semibold text-muted-foreground">
                🔒 Unlock Full Reading
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Eye, label: "Detailed Line Analysis", locked: true },
                  { icon: Hand, label: "Mount Interpretations", locked: true },
                  { icon: Zap, label: "Timing Predictions", locked: true },
                  { icon: Sparkles, label: "Personal Remedies", locked: true },
                ].map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg opacity-60"
                  >
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <feature.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={onUpgrade} 
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Crown className="h-4 w-4" />
                Get Full Premium Reading
                <ChevronRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Includes 7 category deep-dives, voice narration, PDF report & more
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground px-4">
        🔮 For entertainment and spiritual insight purposes only. 
        Not intended as medical, legal, or financial advice.
      </p>
    </div>
  );
};

export default FreePalmReadingSummary;
