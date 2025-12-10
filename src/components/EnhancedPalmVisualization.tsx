import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, Hand, Info, Sparkles } from 'lucide-react';

interface LinePosition {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curveIntensity?: string;
}

interface LineAnalysis {
  observed?: string;
  position?: LinePosition;
  type?: string;
  meaning?: string;
}

interface PalmLine {
  id: string;
  name: string;
  nameHi: string;
  color: string;
  description: string;
  descriptionHi: string;
  visible: boolean;
  position?: LinePosition;
  analysis?: LineAnalysis;
}

interface Mount {
  id: string;
  name: string;
  nameHi: string;
  x: number;
  y: number;
  description: string;
  planet: string;
  strength?: string;
}

interface EnhancedPalmVisualizationProps {
  imageUrl: string;
  palmType?: string;
  lineAnalysis?: {
    heartLine?: LineAnalysis;
    headLine?: LineAnalysis;
    lifeLine?: LineAnalysis;
    fateLine?: LineAnalysis;
    sunLine?: LineAnalysis;
  };
  mountAnalysis?: Record<string, { strength?: string; observed?: string; meaning?: string }>;
  language?: 'hi' | 'en';
}

const DEFAULT_LINES: PalmLine[] = [
  { 
    id: 'heart', 
    name: 'Heart Line', 
    nameHi: 'हृदय रेखा',
    color: '#ef4444', 
    description: 'Emotions, love, relationships',
    descriptionHi: 'भावनाएं, प्रेम, रिश्ते',
    visible: true,
    position: { startX: 85, startY: 25, endX: 15, endY: 28, curveIntensity: 'moderate' }
  },
  { 
    id: 'head', 
    name: 'Head Line', 
    nameHi: 'मस्तिष्क रेखा',
    color: '#3b82f6', 
    description: 'Intellect, decision making',
    descriptionHi: 'बुद्धि, निर्णय क्षमता',
    visible: true,
    position: { startX: 15, startY: 35, endX: 75, endY: 45, curveIntensity: 'slight' }
  },
  { 
    id: 'life', 
    name: 'Life Line', 
    nameHi: 'जीवन रेखा',
    color: '#22c55e', 
    description: 'Vitality, life journey',
    descriptionHi: 'जीवन शक्ति, जीवन यात्रा',
    visible: true,
    position: { startX: 22, startY: 28, endX: 25, endY: 85, curveIntensity: 'wide' }
  },
  { 
    id: 'fate', 
    name: 'Fate Line', 
    nameHi: 'भाग्य रेखा',
    color: '#a855f7', 
    description: 'Career, destiny path',
    descriptionHi: 'करियर, भाग्य मार्ग',
    visible: true,
    position: { startX: 48, startY: 85, endX: 42, endY: 22, curveIntensity: 'straight' }
  },
  { 
    id: 'sun', 
    name: 'Sun Line', 
    nameHi: 'सूर्य रेखा',
    color: '#f59e0b', 
    description: 'Success, fame, creativity',
    descriptionHi: 'सफलता, प्रसिद्धि, रचनात्मकता',
    visible: true,
    position: { startX: 58, startY: 55, endX: 52, endY: 22, curveIntensity: 'straight' }
  },
  { 
    id: 'marriage', 
    name: 'Marriage Lines', 
    nameHi: 'विवाह रेखा',
    color: '#ec4899', 
    description: 'Relationships, partnerships',
    descriptionHi: 'विवाह, साझेदारी',
    visible: false,
    position: { startX: 82, startY: 22, endX: 90, endY: 22 }
  },
  { 
    id: 'health', 
    name: 'Health Line', 
    nameHi: 'स्वास्थ्य रेखा',
    color: '#14b8a6', 
    description: 'Physical wellbeing',
    descriptionHi: 'शारीरिक स्वास्थ्य',
    visible: false,
    position: { startX: 25, startY: 75, endX: 72, endY: 35 }
  },
];

const DEFAULT_MOUNTS: Mount[] = [
  { id: 'jupiter', name: 'Jupiter', nameHi: 'बृहस्पति', x: 18, y: 22, description: 'Ambition, leadership', planet: '♃' },
  { id: 'saturn', name: 'Saturn', nameHi: 'शनि', x: 38, y: 18, description: 'Wisdom, responsibility', planet: '♄' },
  { id: 'apollo', name: 'Apollo', nameHi: 'सूर्य', x: 55, y: 20, description: 'Creativity, success', planet: '☉' },
  { id: 'mercury', name: 'Mercury', nameHi: 'बुध', x: 72, y: 25, description: 'Communication, business', planet: '☿' },
  { id: 'venus', name: 'Venus', nameHi: 'शुक्र', x: 22, y: 72, description: 'Love, passion', planet: '♀' },
  { id: 'moon', name: 'Moon', nameHi: 'चंद्र', x: 78, y: 72, description: 'Imagination, intuition', planet: '☽' },
  { id: 'mars', name: 'Mars', nameHi: 'मंगल', x: 50, y: 50, description: 'Courage, energy', planet: '♂' },
];

const EnhancedPalmVisualization = ({ 
  imageUrl, 
  palmType, 
  lineAnalysis, 
  mountAnalysis,
  language = 'en' 
}: EnhancedPalmVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<PalmLine[]>(DEFAULT_LINES);
  const [mounts] = useState<Mount[]>(DEFAULT_MOUNTS);
  const [showMounts, setShowMounts] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [lineOpacity, setLineOpacity] = useState(80);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [hoveredMount, setHoveredMount] = useState<string | null>(null);

  // Update lines with analysis data
  useEffect(() => {
    if (lineAnalysis) {
      setLines(prev => prev.map(line => {
        const analysisKey = `${line.id}Line` as keyof typeof lineAnalysis;
        const analysis = lineAnalysis[analysisKey];
        if (analysis?.position) {
          return { ...line, position: analysis.position, analysis };
        }
        return { ...line, analysis };
      }));
    }
  }, [lineAnalysis]);

  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw base image
      ctx.drawImage(img, 0, 0);
      
      // Apply semi-transparent overlay for better line visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw palm lines
      drawPalmLines(ctx, canvas.width, canvas.height);
      
      // Draw mounts
      if (showMounts) {
        drawMounts(ctx, canvas.width, canvas.height);
      }
      
      setImageLoaded(true);
    };
    img.onerror = () => {
      // If image fails to load, draw placeholder with lines
      canvas.width = 400;
      canvas.height = 500;
      ctx.fillStyle = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw hand outline placeholder
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(200, 300, 120, 180, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      drawPalmLines(ctx, canvas.width, canvas.height);
      if (showMounts) {
        drawMounts(ctx, canvas.width, canvas.height);
      }
      
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl, lines, showMounts, showLabels, lineOpacity, mountAnalysis]);

  useEffect(() => {
    drawVisualization();
  }, [drawVisualization]);

  const drawPalmLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.globalAlpha = lineOpacity / 100;
    
    lines.forEach(line => {
      if (!line.visible || !line.position) return;
      
      const pos = line.position;
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Glow effect
      ctx.shadowColor = line.color;
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.beginPath();
      
      const startX = (pos.startX / 100) * width;
      const startY = (pos.startY / 100) * height;
      const endX = (pos.endX / 100) * width;
      const endY = (pos.endY / 100) * height;
      
      // Draw curved line based on line type
      switch (line.id) {
        case 'heart':
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            width * 0.6, height * 0.18,
            width * 0.4, height * 0.22,
            endX, endY
          );
          break;
        case 'head':
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            width * 0.35, height * 0.38,
            width * 0.55, height * 0.42,
            endX, endY
          );
          break;
        case 'life':
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            width * 0.12, height * 0.45,
            width * 0.15, height * 0.65,
            endX, endY
          );
          break;
        case 'fate':
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            width * 0.46, height * 0.6,
            width * 0.44, height * 0.4,
            endX, endY
          );
          break;
        case 'sun':
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            width * 0.56, height * 0.4,
            width * 0.54, height * 0.3,
            endX, endY
          );
          break;
        case 'marriage':
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.moveTo(width * 0.82, height * 0.25);
          ctx.lineTo(width * 0.88, height * 0.25);
          break;
        case 'health':
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            width * 0.45, height * 0.6,
            width * 0.6, height * 0.45,
            endX, endY
          );
          break;
        default:
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
      }
      
      ctx.stroke();
      
      // Draw labels
      if (showLabels) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        const labelPos = getLabelPosition(line.id, width, height);
        const label = language === 'hi' ? line.nameHi : line.name;
        
        // Background pill for label
        ctx.font = 'bold 11px system-ui';
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.beginPath();
        ctx.roundRect(labelPos.x - 4, labelPos.y - 12, textWidth + 8, 18, 4);
        ctx.fill();
        
        // Label text
        ctx.fillStyle = line.color;
        ctx.fillText(label, labelPos.x, labelPos.y);
        
        // Confidence indicator
        if (showConfidence && line.analysis) {
          const confidenceX = labelPos.x + textWidth + 12;
          ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
          ctx.beginPath();
          ctx.arc(confidenceX, labelPos.y - 5, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.globalAlpha = lineOpacity / 100;
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  const drawMounts = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.globalAlpha = 0.7;
    
    mounts.forEach(mount => {
      const x = (mount.x / 100) * width;
      const y = (mount.y / 100) * height;
      
      // Get mount strength from analysis
      const mountData = mountAnalysis?.[mount.id];
      const strength = mountData?.strength || 'moderate';
      
      // Color based on strength
      let fillColor = 'rgba(255, 215, 0, 0.25)';
      let strokeColor = 'rgba(255, 215, 0, 0.8)';
      
      if (strength === 'strong') {
        fillColor = 'rgba(34, 197, 94, 0.3)';
        strokeColor = 'rgba(34, 197, 94, 0.9)';
      } else if (strength === 'weak') {
        fillColor = 'rgba(239, 68, 68, 0.2)';
        strokeColor = 'rgba(239, 68, 68, 0.7)';
      }
      
      // Draw mount circle
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw planet symbol
      ctx.globalAlpha = 1;
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mount.planet, x, y);
      
      // Draw label below
      if (showLabels) {
        const label = language === 'hi' ? mount.nameHi : mount.name;
        ctx.font = '10px system-ui';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(label, x, y + 28);
      }
      
      ctx.globalAlpha = 0.7;
    });
    
    ctx.globalAlpha = 1;
  };

  const getLabelPosition = (lineId: string, width: number, height: number) => {
    const positions: Record<string, { x: number; y: number }> = {
      heart: { x: width * 0.83, y: height * 0.18 },
      head: { x: width * 0.73, y: height * 0.38 },
      life: { x: width * 0.06, y: height * 0.55 },
      fate: { x: width * 0.5, y: height * 0.62 },
      sun: { x: width * 0.6, y: height * 0.42 },
      marriage: { x: width * 0.83, y: height * 0.16 },
      health: { x: width * 0.63, y: height * 0.32 },
    };
    return positions[lineId] || { x: width * 0.5, y: height * 0.5 };
  };

  const toggleLine = (lineId: string) => {
    setLines(prev => prev.map(line => 
      line.id === lineId ? { ...line, visible: !line.visible } : line
    ));
  };

  const resetView = () => {
    setZoom(1);
    setLineOpacity(80);
    setLines(DEFAULT_LINES.map(l => ({ ...l, visible: true })));
    setShowMounts(true);
    setShowLabels(true);
  };

  const isHindi = language === 'hi';

  return (
    <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Hand className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">{isHindi ? 'हस्त रेखा विज़ुअलाइज़ेशन' : 'Palm Line Visualization'}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {isHindi ? 'रेखाओं और पर्वतों का विस्तृत दृश्य' : 'Interactive view of lines & mounts'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {palmType && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {palmType}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls Row */}
        <div className="flex flex-wrap gap-4 items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="mounts" checked={showMounts} onCheckedChange={setShowMounts} />
              <Label htmlFor="mounts" className="text-sm">{isHindi ? 'पर्वत' : 'Mounts'}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="labels" className="text-sm">{isHindi ? 'लेबल' : 'Labels'}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="confidence" checked={showConfidence} onCheckedChange={setShowConfidence} />
              <Label htmlFor="confidence" className="text-sm">{isHindi ? 'विश्वास' : 'Confidence'}</Label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-4 px-3">
          <Label className="text-sm whitespace-nowrap">{isHindi ? 'रेखा तीव्रता' : 'Line Opacity'}</Label>
          <Slider 
            value={[lineOpacity]} 
            onValueChange={(v) => setLineOpacity(v[0])} 
            max={100} 
            min={20}
            step={5}
            className="flex-1"
          />
          <span className="text-sm w-10 text-right">{lineOpacity}%</span>
        </div>

        {/* Line Toggles */}
        <div className="flex flex-wrap gap-2">
          {lines.map(line => (
            <Button
              key={line.id}
              variant={line.visible ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine(line.id)}
              onMouseEnter={() => setSelectedLine(line.id)}
              onMouseLeave={() => setSelectedLine(null)}
              style={{ 
                backgroundColor: line.visible ? line.color : 'transparent',
                borderColor: line.color,
                color: line.visible ? 'white' : line.color
              }}
              className="transition-all text-xs"
            >
              {line.visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {isHindi ? line.nameHi : line.name}
            </Button>
          ))}
        </div>

        {/* Selected Line Info */}
        {selectedLine && (
          <div className="bg-primary/5 rounded-lg p-3 animate-fade-in border border-primary/20">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">
                  {isHindi 
                    ? lines.find(l => l.id === selectedLine)?.nameHi 
                    : lines.find(l => l.id === selectedLine)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isHindi 
                    ? lines.find(l => l.id === selectedLine)?.descriptionHi 
                    : lines.find(l => l.id === selectedLine)?.description}
                </p>
                {lines.find(l => l.id === selectedLine)?.analysis?.observed && (
                  <p className="text-xs mt-1 text-primary">
                    {lines.find(l => l.id === selectedLine)?.analysis?.observed}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-gray-900 to-gray-800"
          style={{ maxHeight: '550px', overflow: 'auto' }}
        >
          <canvas 
            ref={canvasRef}
            className="w-full h-auto transition-transform"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  {isHindi ? 'विज़ुअलाइज़ेशन लोड हो रहा है...' : 'Loading visualization...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
          {lines.filter(l => l.visible).map(line => (
            <div key={line.id} className="flex items-center gap-2 text-xs">
              <div 
                className="w-4 h-1 rounded-full" 
                style={{ backgroundColor: line.color, boxShadow: `0 0 6px ${line.color}` }} 
              />
              <span>{isHindi ? line.nameHi : line.name}</span>
            </div>
          ))}
        </div>

        {/* Mount Strength Legend */}
        {showMounts && (
          <div className="flex flex-wrap gap-4 text-xs p-3 bg-muted/20 rounded-lg">
            <span className="font-medium">{isHindi ? 'पर्वत शक्ति:' : 'Mount Strength:'}</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500" />
              <span>{isHindi ? 'मजबूत' : 'Strong'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500" />
              <span>{isHindi ? 'मध्यम' : 'Moderate'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500" />
              <span>{isHindi ? 'कमजोर' : 'Weak'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPalmVisualization;
