import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cpu, Sparkles } from 'lucide-react';
import { usePalmAnalysisMode } from '@/hooks/usePalmAnalysisMode';

const PalmAnalysisModeToggle = () => {
  const { isCvGrounded, setMode } = usePalmAnalysisMode();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
      <div className="flex items-start gap-2 text-sm">
        {isCvGrounded ? (
          <Cpu className="h-4 w-4 mt-0.5 text-primary" />
        ) : (
          <Sparkles className="h-4 w-4 mt-0.5 text-primary" />
        )}
        <div>
          <Label htmlFor="palm-mode" className="font-medium cursor-pointer">
            {isCvGrounded ? 'CV-Grounded Analysis' : 'AI-Only Analysis'}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCvGrounded
              ? 'OpenCV detects real palm creases first, then AI interprets them.'
              : 'AI interprets the image directly without computer-vision pre-processing.'}
          </p>
        </div>
      </div>
      <Switch
        id="palm-mode"
        checked={isCvGrounded}
        onCheckedChange={(checked) => setMode(checked ? 'cv-grounded' : 'ai-only')}
      />
    </div>
  );
};

export default PalmAnalysisModeToggle;
