import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Zap, 
  Hand,
  Sun,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraPreviewWithGuideProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  stepLabel: string;
  stepTip: string;
}

const CameraPreviewWithGuide = ({ 
  onCapture, 
  onClose, 
  stepLabel, 
  stepTip 
}: CameraPreviewWithGuideProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lightingQuality, setLightingQuality] = useState<'poor' | 'fair' | 'good'>('fair');
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Initialize camera
  const initCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setHasPermission(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Camera access error:', error);
      setHasPermission(false);
      setIsLoading(false);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access in your browser settings",
        variant: "destructive"
      });
    }
  }, [facingMode, toast]);

  useEffect(() => {
    initCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initCamera]);

  // Simulate lighting and hand detection analysis
  useEffect(() => {
    if (!videoRef.current || !hasPermission) return;

    const analyzeFrame = () => {
      if (!canvasRef.current || !videoRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 100;
      canvas.height = 75;
      ctx.drawImage(videoRef.current, 0, 0, 100, 75);
      
      const imageData = ctx.getImageData(0, 0, 100, 75);
      const data = imageData.data;
      
      // Calculate average brightness
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4);
      
      // Determine lighting quality
      if (avgBrightness < 50) {
        setLightingQuality('poor');
      } else if (avgBrightness < 100) {
        setLightingQuality('fair');
      } else {
        setLightingQuality('good');
      }
      
      // Simulate hand detection (based on skin-tone color presence in center)
      const centerX = 40;
      const centerY = 30;
      const centerIdx = (centerY * 100 + centerX) * 4;
      const r = data[centerIdx];
      const g = data[centerIdx + 1];
      const b = data[centerIdx + 2];
      
      // Simple skin tone detection heuristic
      const isSkinTone = r > 60 && g > 40 && b > 20 && 
                         r > g && g > b && 
                         Math.abs(r - g) > 15;
      setIsHandDetected(isSkinTone);
    };

    const intervalId = setInterval(analyzeFrame, 500);
    return () => clearInterval(intervalId);
  }, [hasPermission]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Stop the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    onCapture(imageData);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const getLightingColor = () => {
    switch (lightingQuality) {
      case 'good': return 'text-success';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-destructive';
    }
  };

  const getLightingBg = () => {
    switch (lightingQuality) {
      case 'good': return 'bg-success/20 border-success/50';
      case 'fair': return 'bg-warning/20 border-warning/50';
      case 'poor': return 'bg-destructive/20 border-destructive/50';
    }
  };

  if (hasPermission === false) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
          <h3 className="text-xl font-semibold">Camera Access Required</h3>
          <p className="text-muted-foreground">
            Please allow camera access to scan your palm. You can also upload an image instead.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={initCamera} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/30">
      <CardContent className="p-0 relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">{stepLabel}</h3>
              <p className="text-white/70 text-sm">{stepTip}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-[3/4] bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center space-y-3">
                <Camera className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <p className="text-muted-foreground">Starting camera...</p>
              </div>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          
          {/* Palm Position Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Center guide - palm outline */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`
                w-[70%] h-[80%] border-4 rounded-3xl transition-colors duration-300
                ${isHandDetected ? 'border-success' : 'border-white/50'}
              `}>
                {/* Palm shape guide */}
                <svg 
                  viewBox="0 0 200 250" 
                  className="w-full h-full opacity-30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {/* Palm outline */}
                  <path 
                    d="M100 20 L60 50 L40 90 L30 140 L40 200 L70 230 L130 230 L160 200 L170 140 L160 90 L140 50 Z"
                    className="text-white"
                  />
                  {/* Major lines hint */}
                  <path d="M50 120 Q100 100 150 120" className="text-white/50" strokeDasharray="5,5" />
                  <path d="M60 150 Q100 140 140 150" className="text-white/50" strokeDasharray="5,5" />
                  <path d="M80 180 Q100 200 100 230" className="text-white/50" strokeDasharray="5,5" />
                </svg>
              </div>
            </div>

            {/* Corner brackets */}
            <div className="absolute top-16 left-4 w-12 h-12 border-l-4 border-t-4 border-white/70 rounded-tl-lg" />
            <div className="absolute top-16 right-4 w-12 h-12 border-r-4 border-t-4 border-white/70 rounded-tr-lg" />
            <div className="absolute bottom-24 left-4 w-12 h-12 border-l-4 border-b-4 border-white/70 rounded-bl-lg" />
            <div className="absolute bottom-24 right-4 w-12 h-12 border-r-4 border-b-4 border-white/70 rounded-br-lg" />

            {/* Scanning line animation */}
            <div 
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-vertical"
            />
          </div>

          {/* Status Indicators */}
          <div className="absolute bottom-24 left-0 right-0 px-4 space-y-2">
            {/* Lighting indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getLightingBg()}`}>
              <Sun className={`h-4 w-4 ${getLightingColor()}`} />
              <span className={`text-xs font-medium ${getLightingColor()}`}>
                Lighting: {lightingQuality.charAt(0).toUpperCase() + lightingQuality.slice(1)}
              </span>
              {lightingQuality === 'good' && <CheckCircle2 className="h-4 w-4 text-success ml-auto" />}
            </div>
            
            {/* Hand detection indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
              isHandDetected ? 'bg-success/20 border-success/50' : 'bg-muted/50 border-muted'
            }`}>
              <Hand className={`h-4 w-4 ${isHandDetected ? 'text-success' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-medium ${isHandDetected ? 'text-success' : 'text-muted-foreground'}`}>
                {isHandDetected ? 'Palm Detected ✓' : 'Position your palm in the frame'}
              </span>
            </div>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-12 w-12"
              onClick={switchCamera}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={capturePhoto}
              disabled={lightingQuality === 'poor'}
              className={`
                h-16 w-16 rounded-full p-0 
                ${isHandDetected && lightingQuality === 'good'
                  ? 'bg-success hover:bg-success/90 ring-4 ring-success/30' 
                  : 'bg-primary hover:bg-primary/90'
                }
              `}
            >
              <Camera className="h-8 w-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-12 w-12"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {lightingQuality === 'poor' && (
            <p className="text-center text-destructive text-xs mt-2">
              ⚠️ Please improve lighting for better results
            </p>
          )}
        </div>
      </CardContent>

      <style>{`
        @keyframes scan-vertical {
          0% { top: 15%; }
          50% { top: 75%; }
          100% { top: 15%; }
        }
        .animate-scan-vertical {
          animation: scan-vertical 2s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
};

export default CameraPreviewWithGuide;
