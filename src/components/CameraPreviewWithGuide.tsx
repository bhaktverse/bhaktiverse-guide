import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X, Hand } from 'lucide-react';
import HandLandmarkDetector from './HandLandmarkDetector';

interface CameraPreviewWithGuideProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  stepLabel?: string;
  stepTip?: string;
  currentStep?: number;
  totalSteps?: number;
  autoAdvance?: boolean;
}

const CameraPreviewWithGuide = ({
  onCapture,
  onClose,
  stepLabel = 'Center Palm',
  stepTip = 'Keep your palm open and relaxed',
}: CameraPreviewWithGuideProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [handDetected, setHandDetected] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadeddata = () => setVideoReady(true);
      }
      setStream(mediaStream);
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions or upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      onCapture(imageData);
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-destructive text-sm">{error}</p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/30">
      <div className="relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-[3/4] object-cover"
        />

        {/* MediaPipe landmark overlay canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: 'cover' }}
        />

        {/* Palm guide overlay - only show when hand NOT detected */}
        {!handDetected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-72 border-2 border-dashed border-primary/60 rounded-2xl flex items-center justify-center">
              <Hand className="h-12 w-12 text-primary/40" />
            </div>
          </div>
        )}

        {/* MediaPipe Hand Detector */}
        <HandLandmarkDetector
          videoElement={videoReady ? videoRef.current : null}
          canvasElement={overlayCanvasRef.current}
          enabled={videoReady}
          onHandDetected={setHandDetected}
        />

        {/* Step label */}
        <div className="absolute top-3 left-0 right-0 text-center pointer-events-none">
          <span className="bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {handDetected ? '✅ Palm detected — Capture when ready' : `${stepLabel} — ${stepTip}`}
          </span>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => { stopCamera(); onClose(); }}
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className={`rounded-full h-14 w-14 transition-all ${
              handDetected
                ? 'bg-green-500 hover:bg-green-600 ring-4 ring-green-300/50'
                : 'bg-primary hover:bg-primary/90'
            }`}
            onClick={handleCapture}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
};

export default CameraPreviewWithGuide;
