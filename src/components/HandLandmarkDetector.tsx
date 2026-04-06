import { useEffect, useRef, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hand, CheckCircle2, AlertCircle } from 'lucide-react';

interface HandLandmarkDetectorProps {
  videoElement: HTMLVideoElement | null;
  canvasElement: HTMLCanvasElement | null;
  enabled: boolean;
  onHandDetected?: (detected: boolean) => void;
}

// MediaPipe hand landmark indices for palm lines
const PALM_LINE_CONNECTIONS = [
  // Wrist to fingers base (palm outline)
  [0, 1], [0, 5], [0, 17],
  // Finger connections
  [1, 2], [2, 3], [3, 4],       // Thumb
  [5, 6], [6, 7], [7, 8],       // Index
  [9, 10], [10, 11], [11, 12],  // Middle
  [13, 14], [14, 15], [15, 16], // Ring
  [17, 18], [18, 19], [19, 20], // Pinky
  // Palm base connections
  [5, 9], [9, 13], [13, 17],
];

// Approximate palm line overlays based on landmarks
const HEART_LINE_POINTS = [5, 9, 13, 17]; // Below fingers
const HEAD_LINE_POINTS = [5, 9, 13]; // Middle palm
const LIFE_LINE_POINTS = [1, 2, 0]; // Around thumb base

const HandLandmarkDetector = ({
  videoElement,
  canvasElement,
  enabled,
  onHandDetected,
}: HandLandmarkDetectorProps) => {
  const [handDetected, setHandDetected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handsRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const lastDetectionRef = useRef(false);

  const drawLandmarks = useCallback(
    (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      // Draw skeleton connections
      ctx.strokeStyle = 'rgba(255, 153, 51, 0.6)';
      ctx.lineWidth = 2;
      for (const [i, j] of PALM_LINE_CONNECTIONS) {
        const a = landmarks[i];
        const b = landmarks[j];
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }

      // Draw approximate Heart Line (pink)
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      HEART_LINE_POINTS.forEach((idx, i) => {
        const p = landmarks[idx];
        const y = p.y * height + 15; // Slightly below finger base
        if (i === 0) ctx.moveTo(p.x * width, y);
        else ctx.lineTo(p.x * width, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw approximate Head Line (blue)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      HEAD_LINE_POINTS.forEach((idx, i) => {
        const p = landmarks[idx];
        const midY = (p.y * height + landmarks[0].y * height) / 2;
        if (i === 0) ctx.moveTo(p.x * width, midY);
        else ctx.lineTo(p.x * width, midY);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw approximate Life Line (green arc)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 3]);
      const thumb = landmarks[1];
      const wrist = landmarks[0];
      const index = landmarks[5];
      ctx.beginPath();
      ctx.moveTo(
        (thumb.x * width + index.x * width) / 2,
        (thumb.y * height + index.y * height) / 2
      );
      ctx.quadraticCurveTo(
        thumb.x * width - 20,
        (thumb.y * height + wrist.y * height) / 2,
        wrist.x * width,
        wrist.y * height
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw landmark points
      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        const x = lm.x * width;
        const y = lm.y * height;

        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 5 : 3, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? 'rgba(255, 102, 0, 0.9)' : 'rgba(255, 153, 51, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Label palm lines
      const labelFont = '11px sans-serif';
      ctx.font = labelFont;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 3;

      const heartMid = landmarks[9];
      ctx.strokeText('Heart', heartMid.x * width - 15, heartMid.y * height + 10);
      ctx.fillStyle = 'rgba(236, 72, 153, 1)';
      ctx.fillText('Heart', heartMid.x * width - 15, heartMid.y * height + 10);

      const headMid = landmarks[9];
      const headY = (headMid.y * height + landmarks[0].y * height) / 2;
      ctx.strokeText('Head', headMid.x * width - 10, headY - 5);
      ctx.fillStyle = 'rgba(59, 130, 246, 1)';
      ctx.fillText('Head', headMid.x * width - 10, headY - 5);

      ctx.strokeText('Life', thumb.x * width - 25, (thumb.y * height + wrist.y * height) / 2);
      ctx.fillStyle = 'rgba(34, 197, 94, 1)';
      ctx.fillText('Life', thumb.x * width - 25, (thumb.y * height + wrist.y * height) / 2);
    },
    []
  );

  useEffect(() => {
    if (!enabled || !videoElement || !canvasElement) return;

    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const { Hands } = await import('@mediapipe/hands');

        const hands = new Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          if (cancelled) return;

          const canvas = canvasElement;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = videoElement.videoWidth || 640;
          canvas.height = videoElement.videoHeight || 480;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            drawLandmarks(ctx, landmarks, canvas.width, canvas.height);

            if (!lastDetectionRef.current) {
              setHandDetected(true);
              lastDetectionRef.current = true;
              onHandDetected?.(true);
            }
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (lastDetectionRef.current) {
              setHandDetected(false);
              lastDetectionRef.current = false;
              onHandDetected?.(false);
            }
          }
        });

        handsRef.current = hands;
        setLoading(false);

        // Start detection loop
        const detect = async () => {
          if (cancelled || !handsRef.current) return;
          if (videoElement.readyState >= 2) {
            try {
              await handsRef.current.send({ image: videoElement });
            } catch {
              // Frame send failed, continue
            }
          }
          animationRef.current = requestAnimationFrame(detect);
        };

        // Wait for video to be ready
        if (videoElement.readyState >= 2) {
          detect();
        } else {
          videoElement.addEventListener('loadeddata', () => detect(), { once: true });
        }
      } catch (err) {
        console.error('MediaPipe init error:', err);
        setError('Hand detection unavailable');
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (handsRef.current) {
        try { handsRef.current.close(); } catch {}
      }
    };
  }, [enabled, videoElement, canvasElement, drawLandmarks, onHandDetected]);

  if (!enabled) return null;

  return (
    <div className="absolute top-3 right-3 z-10">
      {loading ? (
        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm animate-pulse">
          <Hand className="h-3 w-3 mr-1" /> Loading AI...
        </Badge>
      ) : error ? (
        <Badge variant="destructive" className="bg-destructive/80 backdrop-blur-sm">
          <AlertCircle className="h-3 w-3 mr-1" /> {error}
        </Badge>
      ) : handDetected ? (
        <Badge className="bg-green-500/80 backdrop-blur-sm text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Palm Detected
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm animate-pulse">
          <Hand className="h-3 w-3 mr-1" /> Show your palm...
        </Badge>
      )}
    </div>
  );
};

export default HandLandmarkDetector;
