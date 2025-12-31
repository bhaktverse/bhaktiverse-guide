import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Loader2
} from 'lucide-react';

interface LinePosition {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curveIntensity: string;
}

interface DetectedLine {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  position: LinePosition;
  confidence: number;
}

interface AILineDetectionOverlayProps {
  imageUrl: string;
  lineAnalysis?: {
    heartLine?: { position?: LinePosition; rating?: number };
    headLine?: { position?: LinePosition; rating?: number };
    lifeLine?: { position?: LinePosition; rating?: number };
    fateLine?: { position?: LinePosition; rating?: number };
    sunLine?: { position?: LinePosition; rating?: number };
  };
  isAnalyzing?: boolean;
  onAnalyzeRequest?: () => void;
}

const DEFAULT_LINES: DetectedLine[] = [
  {
    id: 'heart',
    name: 'Heart Line (Hridaya Rekha)',
    color: '#ef4444',
    visible: true,
    position: { startX: 85, startY: 25, endX: 15, endY: 28, curveIntensity: 'moderate' },
    confidence: 0
  },
  {
    id: 'head',
    name: 'Head Line (Mastishka Rekha)',
    color: '#3b82f6',
    visible: true,
    position: { startX: 15, startY: 35, endX: 75, endY: 45, curveIntensity: 'slight' },
    confidence: 0
  },
  {
    id: 'life',
    name: 'Life Line (Jeevan Rekha)',
    color: '#22c55e',
    visible: true,
    position: { startX: 22, startY: 28, endX: 25, endY: 85, curveIntensity: 'wide' },
    confidence: 0
  },
  {
    id: 'fate',
    name: 'Fate Line (Bhagya Rekha)',
    color: '#a855f7',
    visible: true,
    position: { startX: 48, startY: 85, endX: 42, endY: 22, curveIntensity: 'straight' },
    confidence: 0
  },
  {
    id: 'sun',
    name: 'Sun Line (Surya Rekha)',
    color: '#f59e0b',
    visible: true,
    position: { startX: 58, startY: 55, endX: 52, endY: 22, curveIntensity: 'straight' },
    confidence: 0
  }
];

const AILineDetectionOverlay = ({
  imageUrl,
  lineAnalysis,
  isAnalyzing = false,
  onAnalyzeRequest
}: AILineDetectionOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<DetectedLine[]>(DEFAULT_LINES);
  const [showLabels, setShowLabels] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [lineOpacity, setLineOpacity] = useState([0.8]);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  // Update lines when analysis data comes in
  useEffect(() => {
    if (lineAnalysis) {
      setLines(prev => prev.map(line => {
        const analysisKey = `${line.id}Line` as keyof typeof lineAnalysis;
        const analysis = lineAnalysis[analysisKey];
        
        if (analysis?.position) {
          return {
            ...line,
            position: analysis.position,
            confidence: (analysis.rating || 5) / 10
          };
        }
        return line;
      }));
    }
  }, [lineAnalysis]);

  // Draw the palm with detected lines overlay
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image aspect ratio
      const maxWidth = container.clientWidth;
      const aspectRatio = img.height / img.width;
      canvas.width = maxWidth;
      canvas.height = maxWidth * aspectRatio;

      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Apply zoom
      const zoomOffsetX = (canvas.width * (zoom - 1)) / 2;
      const zoomOffsetY = (canvas.height * (zoom - 1)) / 2;
      ctx.translate(-zoomOffsetX, -zoomOffsetY);
      ctx.scale(zoom, zoom);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw palm lines
      lines.forEach(line => {
        if (!line.visible) return;

        const startX = (line.position.startX / 100) * canvas.width;
        const startY = (line.position.startY / 100) * canvas.height;
        const endX = (line.position.endX / 100) * canvas.width;
        const endY = (line.position.endY / 100) * canvas.height;

        // Line glow effect
        ctx.save();
        ctx.globalAlpha = lineOpacity[0] * 0.3;
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.filter = 'blur(6px)';

        ctx.beginPath();
        drawCurvedLine(ctx, startX, startY, endX, endY, line.position.curveIntensity, line.id);
        ctx.stroke();
        ctx.restore();

        // Main line
        ctx.save();
        ctx.globalAlpha = lineOpacity[0];
        ctx.strokeStyle = line.color;
        ctx.lineWidth = selectedLine === line.id ? 6 : 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = line.color;
        ctx.shadowBlur = selectedLine === line.id ? 15 : 8;

        ctx.beginPath();
        drawCurvedLine(ctx, startX, startY, endX, endY, line.position.curveIntensity, line.id);
        ctx.stroke();
        ctx.restore();

        // Draw labels
        if (showLabels) {
          const labelX = (startX + endX) / 2;
          const labelY = line.id === 'life' ? startY - 15 : (startY + endY) / 2 - 20;
          
          // Label background
          ctx.save();
          ctx.globalAlpha = 0.9;
          const labelText = line.name.split(' ')[0];
          ctx.font = 'bold 11px system-ui';
          const metrics = ctx.measureText(labelText);
          const padding = 6;
          
          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.beginPath();
          ctx.roundRect(
            labelX - metrics.width / 2 - padding,
            labelY - 8,
            metrics.width + padding * 2,
            16,
            4
          );
          ctx.fill();

          // Label text
          ctx.fillStyle = line.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, labelX, labelY);
          ctx.restore();

          // Confidence indicator
          if (showConfidence && line.confidence > 0) {
            ctx.save();
            ctx.globalAlpha = 0.9;
            const confText = `${Math.round(line.confidence * 100)}%`;
            ctx.font = '10px system-ui';
            ctx.fillStyle = line.confidence >= 0.7 ? '#22c55e' : line.confidence >= 0.5 ? '#f59e0b' : '#ef4444';
            ctx.textAlign = 'center';
            ctx.fillText(confText, labelX, labelY + 14);
            ctx.restore();
          }
        }
      });

      ctx.restore();
      setImageLoaded(true);
    };

    img.src = imageUrl;
  }, [imageUrl, lines, lineOpacity, zoom, showLabels, showConfidence, selectedLine]);

  // Draw curved line based on intensity and line type
  const drawCurvedLine = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    intensity: string,
    lineId: string
  ) => {
    ctx.moveTo(startX, startY);

    if (lineId === 'life') {
      // Life line - curved arc from thumb side
      const controlX = startX - (endX - startX) * 0.8;
      const controlY = (startY + endY) / 2;
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    } else if (lineId === 'heart' || lineId === 'head') {
      // Horizontal lines with curve
      const curveAmount = intensity === 'moderate' ? 0.15 : intensity === 'slight' ? 0.08 : 0;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 - (endY - startY) * curveAmount * 2;
      
      const cp1x = startX + (midX - startX) * 0.5;
      const cp1y = startY + (curveAmount * (endY - startY));
      const cp2x = midX + (endX - midX) * 0.5;
      const cp2y = endY - (curveAmount * (endY - startY));
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    } else {
      // Straight lines (fate, sun)
      ctx.lineTo(endX, endY);
    }
  };

  useEffect(() => {
    drawVisualization();
  }, [drawVisualization]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => drawVisualization();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawVisualization]);

  const toggleLine = (id: string) => {
    setLines(prev => prev.map(line =>
      line.id === id ? { ...line, visible: !line.visible } : line
    ));
  };

  const resetView = () => {
    setZoom(1);
    setLineOpacity([0.8]);
    setShowLabels(true);
    setShowConfidence(true);
    setSelectedLine(null);
    setLines(prev => prev.map(line => ({ ...line, visible: true })));
  };

  const hasAnalysisData = lineAnalysis && Object.keys(lineAnalysis).length > 0;

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Line Detection
          </div>
          {isAnalyzing && (
            <Badge variant="outline" className="animate-pulse">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Analyzing...
            </Badge>
          )}
          {hasAnalysisData && (
            <Badge variant="default" className="bg-success">
              Lines Detected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={showLabels}
                onCheckedChange={setShowLabels}
                id="labels"
              />
              <label htmlFor="labels" className="text-sm">Labels</label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showConfidence}
                onCheckedChange={setShowConfidence}
                id="confidence"
              />
              <label htmlFor="confidence" className="text-sm">Confidence</label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(prev => Math.max(1, prev - 0.25))}
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(prev => Math.min(2, prev + 0.25))}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Opacity slider */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-16">Opacity</span>
          <Slider
            value={lineOpacity}
            onValueChange={setLineOpacity}
            min={0.2}
            max={1}
            step={0.1}
            className="flex-1"
          />
        </div>

        {/* Line toggles */}
        <div className="flex flex-wrap gap-2">
          {lines.map(line => (
            <Button
              key={line.id}
              variant={line.visible ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine(line.id)}
              onMouseEnter={() => setSelectedLine(line.id)}
              onMouseLeave={() => setSelectedLine(null)}
              className="gap-1 text-xs"
              style={{
                backgroundColor: line.visible ? line.color : undefined,
                borderColor: line.color,
                color: line.visible ? 'white' : line.color
              }}
            >
              {line.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {line.name.split(' ')[0]}
            </Button>
          ))}
        </div>

        {/* Canvas visualization */}
        <div
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border border-border bg-black/5"
          style={{ maxHeight: '500px' }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {lines.filter(l => l.visible).map(line => (
            <div key={line.id} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span className="truncate">{line.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Analyze button if no data */}
        {!hasAnalysisData && !isAnalyzing && onAnalyzeRequest && (
          <Button
            onClick={onAnalyzeRequest}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Sparkles className="h-4 w-4" />
            Analyze Palm Lines with AI
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AILineDetectionOverlay;
