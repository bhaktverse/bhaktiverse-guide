import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, Scan } from 'lucide-react';
import { analyzePalmCV, loadOpenCV, type CVResult } from '@/lib/palmCV';
import { detectLandmarksFromImageUrl } from '@/lib/handLandmarksStatic';

interface PalmCVProcessorProps {
  imageUrl: string;
  onLinesDetected?: (result: CVResult) => void;
  /** Optional pre-computed landmarks (e.g. from live camera). */
  landmarksHint?: { x: number; y: number }[] | null;
  /** When false, processing is skipped entirely (AI-only mode). */
  enabled?: boolean;
}

type Status = 'idle' | 'loading-cv' | 'detecting-hand' | 'extracting' | 'done' | 'failed';

const PalmCVProcessor = ({ imageUrl, onLinesDetected, landmarksHint, enabled = true }: PalmCVProcessorProps) => {

type Status = 'idle' | 'loading-cv' | 'detecting-hand' | 'extracting' | 'done' | 'failed';

const PalmCVProcessor = ({ imageUrl, onLinesDetected, landmarksHint }: PalmCVProcessorProps) => {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CVResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!imageUrl || lastUrlRef.current === imageUrl) return;
    lastUrlRef.current = imageUrl;
    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        setResult(null);
        setStatus('loading-cv');
        await loadOpenCV();
        if (cancelled) return;

        let landmarks = landmarksHint ?? null;
        if (!landmarks) {
          setStatus('detecting-hand');
          landmarks = await detectLandmarksFromImageUrl(imageUrl);
          if (cancelled) return;
        }

        setStatus('extracting');
        const cvResult = await analyzePalmCV(imageUrl, landmarks);
        if (cancelled) return;

        setResult(cvResult);
        setStatus('done');
        onLinesDetected?.(cvResult);
      } catch (e) {
        if (cancelled) return;
        console.error('PalmCVProcessor failed:', e);
        setError(e instanceof Error ? e.message : 'CV processing failed');
        setStatus('failed');
      }
    };

    // Defer to idle to avoid blocking AI request
    const w = window as any;
    const schedule = w.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 100));
    schedule(run);

    return () => { cancelled = true; };
  }, [imageUrl, landmarksHint, onLinesDetected]);

  if (status === 'idle') return null;

  if (status === 'failed') {
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <AlertTriangle className="h-3 w-3 text-amber-500" />
        CV unavailable — using AI positions
      </Badge>
    );
  }

  if (status === 'done' && result) {
    const conf = Math.round(result.avgConfidence * 100);
    return (
      <Badge variant="outline" className="gap-1 text-xs bg-success/10 border-success/30">
        <CheckCircle2 className="h-3 w-3 text-success" />
        CV: {result.detectedCount}/5 lines · {conf}% confidence
      </Badge>
    );
  }

  const label =
    status === 'loading-cv' ? 'Loading CV engine…' :
    status === 'detecting-hand' ? 'Detecting hand landmarks…' :
    'Extracting palm creases…';

  return (
    <Badge variant="outline" className="gap-1 text-xs animate-pulse">
      <Loader2 className="h-3 w-3 animate-spin" />
      {label}
    </Badge>
  );
};

export default PalmCVProcessor;
