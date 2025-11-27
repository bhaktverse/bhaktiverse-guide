import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface PalmLine {
  id: string;
  name: string;
  color: string;
  description: string;
  visible: boolean;
}

interface PalmLineVisualizationProps {
  imageUrl: string;
  palmType?: string;
}

const PALM_LINES: PalmLine[] = [
  { id: 'heart', name: 'Heart Line', color: '#ef4444', description: 'Emotions, love, relationships', visible: true },
  { id: 'head', name: 'Head Line', color: '#3b82f6', description: 'Intellect, decision making', visible: true },
  { id: 'life', name: 'Life Line', color: '#22c55e', description: 'Vitality, life journey', visible: true },
  { id: 'fate', name: 'Fate Line', color: '#a855f7', description: 'Career, destiny path', visible: true },
  { id: 'sun', name: 'Sun Line', color: '#f59e0b', description: 'Success, fame, creativity', visible: true },
  { id: 'marriage', name: 'Marriage Lines', color: '#ec4899', description: 'Relationships, partnerships', visible: false },
  { id: 'health', name: 'Health Line', color: '#14b8a6', description: 'Physical wellbeing', visible: false },
];

const MOUNTS = [
  { id: 'jupiter', name: 'Mount of Jupiter', x: 15, y: 25, description: 'Ambition, leadership' },
  { id: 'saturn', name: 'Mount of Saturn', x: 35, y: 20, description: 'Wisdom, responsibility' },
  { id: 'apollo', name: 'Mount of Apollo', x: 55, y: 22, description: 'Creativity, success' },
  { id: 'mercury', name: 'Mount of Mercury', x: 75, y: 28, description: 'Communication, business' },
  { id: 'venus', name: 'Mount of Venus', x: 20, y: 70, description: 'Love, passion' },
  { id: 'moon', name: 'Mount of Moon', x: 80, y: 70, description: 'Imagination, intuition' },
  { id: 'mars', name: 'Mount of Mars', x: 50, y: 50, description: 'Courage, aggression' },
];

const PalmLineVisualization = ({ imageUrl, palmType }: PalmLineVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<PalmLine[]>(PALM_LINES);
  const [showMounts, setShowMounts] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw base image
      ctx.drawImage(img, 0, 0);
      
      // Apply visualization overlay
      drawPalmLines(ctx, canvas.width, canvas.height);
      
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl, lines, showMounts, showLabels, zoom]);

  const drawPalmLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.globalAlpha = 0.8;
    
    // Draw palm lines
    lines.forEach(line => {
      if (!line.visible) return;
      
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = line.color;
      ctx.shadowBlur = 5;
      
      ctx.beginPath();
      
      switch (line.id) {
        case 'heart':
          // Heart line - curves across top of palm
          ctx.moveTo(width * 0.85, height * 0.25);
          ctx.bezierCurveTo(
            width * 0.6, height * 0.18,
            width * 0.4, height * 0.22,
            width * 0.15, height * 0.28
          );
          break;
        case 'head':
          // Head line - middle of palm
          ctx.moveTo(width * 0.15, height * 0.35);
          ctx.bezierCurveTo(
            width * 0.35, height * 0.38,
            width * 0.55, height * 0.42,
            width * 0.75, height * 0.45
          );
          break;
        case 'life':
          // Life line - curves around thumb
          ctx.moveTo(width * 0.22, height * 0.28);
          ctx.bezierCurveTo(
            width * 0.15, height * 0.45,
            width * 0.18, height * 0.65,
            width * 0.25, height * 0.85
          );
          break;
        case 'fate':
          // Fate line - vertical through center
          ctx.moveTo(width * 0.48, height * 0.85);
          ctx.bezierCurveTo(
            width * 0.46, height * 0.6,
            width * 0.44, height * 0.4,
            width * 0.42, height * 0.22
          );
          break;
        case 'sun':
          // Sun line - parallel to fate line
          ctx.moveTo(width * 0.58, height * 0.55);
          ctx.bezierCurveTo(
            width * 0.56, height * 0.4,
            width * 0.54, height * 0.3,
            width * 0.52, height * 0.22
          );
          break;
        case 'marriage':
          // Marriage lines - small horizontal lines
          ctx.moveTo(width * 0.82, height * 0.22);
          ctx.lineTo(width * 0.9, height * 0.22);
          ctx.moveTo(width * 0.82, height * 0.25);
          ctx.lineTo(width * 0.88, height * 0.25);
          break;
        case 'health':
          // Health line - diagonal
          ctx.moveTo(width * 0.25, height * 0.75);
          ctx.bezierCurveTo(
            width * 0.45, height * 0.6,
            width * 0.6, height * 0.45,
            width * 0.72, height * 0.35
          );
          break;
      }
      
      ctx.stroke();
      
      // Draw labels
      if (showLabels) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = line.color;
        
        const labelPos = getLabelPosition(line.id, width, height);
        
        // Draw background for label
        const textWidth = ctx.measureText(line.name).width;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(labelPos.x - 2, labelPos.y - 12, textWidth + 4, 16);
        
        ctx.fillStyle = line.color;
        ctx.fillText(line.name, labelPos.x, labelPos.y);
      }
    });

    // Draw mounts
    if (showMounts) {
      ctx.globalAlpha = 0.6;
      MOUNTS.forEach(mount => {
        const x = (mount.x / 100) * width;
        const y = (mount.y / 100) * height;
        
        // Draw mount circle
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw mount label
        if (showLabels) {
          ctx.globalAlpha = 1;
          ctx.font = '10px Arial';
          ctx.fillStyle = '#ffd700';
          ctx.textAlign = 'center';
          ctx.fillText(mount.name.replace('Mount of ', ''), x, y + 25);
        }
      });
    }
    
    ctx.globalAlpha = 1;
  };

  const getLabelPosition = (lineId: string, width: number, height: number) => {
    const positions: Record<string, { x: number; y: number }> = {
      heart: { x: width * 0.85, y: height * 0.2 },
      head: { x: width * 0.75, y: height * 0.38 },
      life: { x: width * 0.08, y: height * 0.55 },
      fate: { x: width * 0.5, y: height * 0.6 },
      sun: { x: width * 0.62, y: height * 0.4 },
      marriage: { x: width * 0.85, y: height * 0.18 },
      health: { x: width * 0.65, y: height * 0.35 },
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
    setLines(PALM_LINES);
    setShowMounts(true);
    setShowLabels(true);
  };

  return (
    <Card className="card-sacred">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>Palm Line Visualization</span>
          </div>
          {palmType && <Badge variant="outline">{palmType} Hand</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="mounts" checked={showMounts} onCheckedChange={setShowMounts} />
              <Label htmlFor="mounts" className="text-sm">Mounts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="labels" className="text-sm">Labels</Label>
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
              className="transition-all"
            >
              {line.visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {line.name}
            </Button>
          ))}
        </div>

        {/* Selected Line Info */}
        {selectedLine && (
          <div className="bg-muted/50 rounded-lg p-3 animate-fade-in">
            <p className="text-sm">
              <strong>{lines.find(l => l.id === selectedLine)?.name}:</strong>{' '}
              {lines.find(l => l.id === selectedLine)?.description}
            </p>
          </div>
        )}

        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border-2 border-primary/20 bg-black/5"
          style={{ maxHeight: '500px', overflow: 'auto' }}
        >
          <canvas 
            ref={canvasRef}
            className="w-full h-auto transition-transform"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Loading visualization...</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {lines.filter(l => l.visible).map(line => (
            <div key={line.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
              <span>{line.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PalmLineVisualization;
