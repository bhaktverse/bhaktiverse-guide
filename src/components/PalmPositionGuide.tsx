import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertTriangle,
  Sun,
  Hand,
  ZoomIn,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

interface LightingQuality {
  score: number;
  label: string;
  tips: string[];
}

interface PalmPositionGuideProps {
  onQualityCheck?: (quality: LightingQuality) => void;
  showOverlay?: boolean;
}

const PalmPositionGuide = ({ onQualityCheck, showOverlay = true }: PalmPositionGuideProps) => {
  const [lightingQuality, setLightingQuality] = useState<LightingQuality>({
    score: 0,
    label: 'Checking...',
    tips: []
  });

  // Simulated lighting quality check (in real app, would use camera API)
  useEffect(() => {
    const quality: LightingQuality = {
      score: 85,
      label: 'Good Lighting',
      tips: [
        'Face a window or light source',
        'Avoid shadows on your palm',
        'Keep hand steady'
      ]
    };
    setLightingQuality(quality);
    onQualityCheck?.(quality);
  }, [onQualityCheck]);

  const getQualityColor = () => {
    if (lightingQuality.score >= 80) return 'text-success';
    if (lightingQuality.score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getQualityIcon = () => {
    if (lightingQuality.score >= 80) return <CheckCircle2 className="h-4 w-4" />;
    if (lightingQuality.score >= 50) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-background/90 to-muted/50 rounded-2xl border-2 border-primary/30 overflow-hidden">
      {/* Hand positioning guide overlay */}
      {showOverlay && (
        <>
          {/* Palm outline guide */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 400"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Palm outline */}
            <path
              d="M150,380 
                 C90,380 60,320 60,250 
                 L60,180 C60,160 75,145 95,145 L95,85 C95,65 110,55 125,55 C140,55 150,65 150,85 L150,145
                 L150,45 C150,25 165,15 180,15 C195,15 205,25 205,45 L205,145
                 L205,75 C205,55 220,45 235,45 C250,45 260,55 260,75 L260,145
                 L260,110 C260,90 275,80 290,80 C305,80 315,90 315,110 L315,200
                 C315,280 280,380 150,380 Z"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray="10,5"
              opacity="0.6"
              transform="translate(-45, 0) scale(0.95)"
            />
            
            {/* Major palm lines guide */}
            {/* Heart Line */}
            <path
              d="M80,200 Q150,180 220,195"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              strokeDasharray="5,3"
              opacity="0.5"
            />
            <text x="230" y="195" fontSize="10" fill="hsl(var(--destructive))" opacity="0.7">Heart</text>
            
            {/* Head Line */}
            <path
              d="M80,240 Q150,230 200,255"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="5,3"
              opacity="0.5"
            />
            <text x="205" y="255" fontSize="10" fill="hsl(var(--primary))" opacity="0.7">Head</text>
            
            {/* Life Line */}
            <path
              d="M115,180 Q90,280 120,360"
              fill="none"
              stroke="hsl(var(--success))"
              strokeWidth="2"
              strokeDasharray="5,3"
              opacity="0.5"
            />
            <text x="65" y="280" fontSize="10" fill="hsl(var(--success))" opacity="0.7">Life</text>
            
            {/* Center target */}
            <circle
              cx="150"
              cy="260"
              r="30"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="5,3"
              opacity="0.4"
            />
            <circle
              cx="150"
              cy="260"
              r="5"
              fill="hsl(var(--primary))"
              opacity="0.6"
            />
          </svg>

          {/* Instructions overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 space-y-2 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Lighting Quality</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getQualityColor()} border-current gap-1`}
                >
                  {getQualityIcon()}
                  {lightingQuality.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Positioning tips */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 space-y-3 border border-border/50">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Hand className="h-4 w-4 text-primary" />
                Position Guide
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                  Align palm within the dotted outline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                  Spread fingers naturally apart
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                  Keep palm flat, facing camera
                </li>
                <li className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-warning flex-shrink-0" />
                  Use bright, natural lighting
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PalmPositionGuide;
