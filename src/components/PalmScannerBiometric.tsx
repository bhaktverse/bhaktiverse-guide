import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CameraPreviewWithGuide from './CameraPreviewWithGuide';
import PalmScanTutorial from './PalmScanTutorial';
import {
  Camera,
  Upload,
  Hand,
  Sparkles,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Globe,
  User,
  Calendar,
  Clock,
  ChevronDown,
  Fingerprint,
  Scan,
  Zap,
  Eye,
  Target,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserMetadata {
  name?: string;
  dob?: string;
  timeOfBirth?: string;
}

interface PalmScannerProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onScanComplete: (images: string[], metadata: UserMetadata) => void;
  onAnalyze: (images: string[], metadata: UserMetadata) => void;
  analyzing: boolean;
  languages: Array<{ code: string; name: string; flag: string }>;
}

const SCAN_STEPS = [
  { id: 'center', label: 'Center Palm', icon: Hand, description: 'Place palm flat, fingers spread', tip: 'Keep your palm open and relaxed' },
  { id: 'left', label: 'Left Side', icon: Hand, description: 'Tilt hand slightly left', tip: 'Show the left edge of your palm' },
  { id: 'right', label: 'Right Side', icon: Hand, description: 'Tilt hand slightly right', tip: 'Show the right edge of your palm' },
  { id: 'fingers', label: 'Finger Lines', icon: Hand, description: 'Focus on finger tips', tip: 'Spread fingers for clear visibility' },
];

const BiometricScanAnimation = ({ progress, step }: { progress: number; step: number }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20">
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            className="border border-primary/30"
            style={{ 
              animation: `pulse 2s infinite`,
              animationDelay: `${i * 50}ms`
            }}
          />
        ))}
      </div>
      
      {/* Scanning beam */}
      <div 
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
        style={{ 
          top: `${progress}%`,
          boxShadow: '0 0 20px var(--primary), 0 0 40px var(--primary)',
          transition: 'top 0.1s linear'
        }}
      />
      
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary" />
      
      {/* Detection points */}
      {progress > 20 && (
        <div className="absolute top-[25%] left-[30%] w-3 h-3 rounded-full bg-success animate-ping" />
      )}
      {progress > 40 && (
        <div className="absolute top-[45%] left-[50%] w-3 h-3 rounded-full bg-success animate-ping" />
      )}
      {progress > 60 && (
        <div className="absolute top-[60%] left-[40%] w-3 h-3 rounded-full bg-success animate-ping" />
      )}
      {progress > 80 && (
        <div className="absolute top-[35%] left-[65%] w-3 h-3 rounded-full bg-success animate-ping" />
      )}
      
      {/* Status indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 px-4 py-2 rounded-full border border-primary/50">
        <Fingerprint className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-xs font-mono text-primary">{progress}% ANALYZED</span>
      </div>
    </div>
  );
};

const PalmScannerBiometric = ({
  selectedLanguage,
  onLanguageChange,
  onScanComplete,
  onAnalyze,
  analyzing,
  languages
}: PalmScannerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const [currentScanStep, setCurrentScanStep] = useState(0);
  const [palmImages, setPalmImages] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [scanPhase, setScanPhase] = useState<'idle' | 'capturing' | 'processing' | 'analyzing'>('idle');
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if user has seen tutorial before
    const hasSeenTutorial = localStorage.getItem('palmScanTutorialSeen');
    return !hasSeenTutorial;
  });
  
  // User metadata (optional)
  const [userMetadata, setUserMetadata] = useState<UserMetadata>({
    name: '',
    dob: '',
    timeOfBirth: ''
  });

  // Biometric scan animation and auto-advance to next capture
  useEffect(() => {
    if (isScanning && palmImages.length > 0) {
      setScanPhase('processing');
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            
            const currentImageIndex = palmImages.length - 1;
            
            toast({
              title: `✓ ${SCAN_STEPS[currentImageIndex].label} captured`,
              description: currentImageIndex < SCAN_STEPS.length - 1 
                ? `Proceeding to ${SCAN_STEPS[currentImageIndex + 1].label}...` 
                : '🎯 All scans complete! Ready for analysis',
            });
            
            // Auto-advance to next capture step
            if (currentImageIndex < SCAN_STEPS.length - 1) {
              setCurrentScanStep(currentImageIndex + 1);
              setScanProgress(0);
              setScanPhase('idle');
              
              // Auto-open camera for next step after a brief delay
              setTimeout(() => {
                setShowCameraPreview(true);
                setScanPhase('capturing');
              }, 800);
            } else {
              // All captures complete
              setScanPhase('idle');
              onScanComplete(palmImages, userMetadata);
            }
            return 100;
          }
          return prev + 2;
        });
      }, 25);
      return () => clearInterval(interval);
    }
  }, [isScanning, palmImages.length, currentScanStep, toast, onScanComplete, userMetadata]);

  const handleCaptureStep = () => {
    setShowCameraPreview(true);
    setScanPhase('capturing');
  };

  const handleCameraCapture = (imageData: string) => {
    setPalmImages(prev => [...prev, imageData]);
    setShowCameraPreview(false);
    setShowLanguageSelector(false);
    setIsScanning(true);
    setScanProgress(0);
    setScanPhase('processing');
  };

  const handleCameraClose = () => {
    setShowCameraPreview(false);
    setScanPhase('idle');
    if (palmImages.length === 0) {
      setShowLanguageSelector(true);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedLanguage) {
      toast({
        title: "Select Language",
        description: "Please choose your preferred language first",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPalmImages([reader.result as string]);
      setShowLanguageSelector(false);
      setIsScanning(true);
      setScanProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const startBiometricScan = () => {
    if (!selectedLanguage) {
      toast({
        title: "Select Language",
        description: "Please choose your preferred language first",
        variant: "destructive"
      });
      return;
    }
    setShowLanguageSelector(false);
    setCurrentScanStep(0);
    setPalmImages([]);
    setScanProgress(0);
    setShowCameraPreview(true);
    setScanPhase('capturing');
  };

  const resetScan = () => {
    setPalmImages([]);
    setCurrentScanStep(0);
    setScanProgress(0);
    setShowLanguageSelector(true);
    setShowCameraPreview(false);
    setIsScanning(false);
    setScanPhase('idle');
    setUserMetadata({ name: '', dob: '', timeOfBirth: '' });
  };

  const handleAnalyze = () => {
    if (palmImages.length === 0) {
      toast({
        title: "No palm scan",
        description: "Please capture or upload a palm image first",
        variant: "destructive"
      });
      return;
    }
    onAnalyze(palmImages, userMetadata);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('palmScanTutorialSeen', 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('palmScanTutorialSeen', 'true');
    setShowTutorial(false);
  };

  return (
    <div className="space-y-6">
      {/* Tutorial Overlay for First-Time Users */}
      {showTutorial && (
        <PalmScanTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* Camera Preview with Guide */}
      {showCameraPreview && (
        <CameraPreviewWithGuide
          onCapture={handleCameraCapture}
          onClose={handleCameraClose}
          stepLabel={SCAN_STEPS[currentScanStep].label}
          stepTip={SCAN_STEPS[currentScanStep].tip}
          currentStep={currentScanStep}
          totalSteps={SCAN_STEPS.length}
          autoAdvance={true}
        />
      )}

      {/* Language Selection */}
      {showLanguageSelector && !showCameraPreview && (
        <Card className="card-sacred border-2 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>Select Language / भाषा चुनें</span>
            </CardTitle>
            <CardDescription>
              AI Guru will speak to you in your chosen language
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <Select value={selectedLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-full text-lg h-14 border-2 border-primary/30">
                <SelectValue placeholder="Choose your language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code} className="text-lg py-3">
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Optional User Details */}
            <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Optional: Add personal details for enhanced reading
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Name (Optional)
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={userMetadata.name}
                      onChange={(e) => setUserMetadata(prev => ({ ...prev, name: e.target.value }))}
                      className="border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Date of Birth (Optional)
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={userMetadata.dob}
                      onChange={(e) => setUserMetadata(prev => ({ ...prev, dob: e.target.value }))}
                      className="border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tob" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Time of Birth (Optional)
                    </Label>
                    <Input
                      id="tob"
                      type="time"
                      value={userMetadata.timeOfBirth}
                      onChange={(e) => setUserMetadata(prev => ({ ...prev, timeOfBirth: e.target.value }))}
                      className="border-primary/30"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Adding DOB and birth time enables more accurate planetary correlations
                </p>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      {/* Biometric Scanner */}
      {!showCameraPreview && (
      <Card className="card-sacred border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              <span>Biometric Palm Scanner</span>
            </div>
            {palmImages.length > 0 && (
              <Badge variant="outline" className="bg-primary/10 border-primary/30">
                {palmImages.length}/{SCAN_STEPS.length} Scans
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              Advanced multi-angle scanning with ML line detection
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="text-muted-foreground hover:text-primary"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Tutorial
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {palmImages.length === 0 ? (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 md:p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_var(--primary),_transparent_70%)] animate-pulse" />
              </div>
              
              <div className="relative">
                <div className="relative inline-block">
                  <Hand className="h-24 w-24 mx-auto text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 border-4 border-primary/20 rounded-full animate-ping" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full">
                    <Scan className="h-5 w-5" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Ready to Scan Your Destiny</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our AI-powered scanner analyzes palm lines, mounts, and special marks using Vedic Samudrika Shastra
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={startBiometricScan}
                  disabled={!selectedLanguage}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6 shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Start Biometric Scan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedLanguage}
                  size="lg"
                  className="gap-2 text-lg px-8 py-6 border-2 border-primary/30 hover:border-primary/50"
                >
                  <Upload className="h-5 w-5" />
                  Upload Image
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Line Detection</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Mount Analysis</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>AI Powered</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scan Steps Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                  {SCAN_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isComplete = idx < palmImages.length;
                    const isCurrent = idx === currentScanStep && palmImages.length <= idx;
                    const isActive = idx === palmImages.length - 1 && isScanning;
                    
                    return (
                      <div key={step.id} className="flex items-center flex-shrink-0">
                        <div className={`
                          relative p-2 rounded-full transition-all duration-300
                          ${isComplete ? 'bg-success text-success-foreground scale-100' :
                            isActive ? 'bg-primary text-primary-foreground scale-110 animate-pulse' :
                            isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' :
                            'bg-muted text-muted-foreground'
                          }
                        `}>
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                          {isActive && (
                            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
                          )}
                        </div>
                        {idx < SCAN_STEPS.length - 1 && (
                          <div className={`h-0.5 w-6 md:w-10 mx-1 transition-colors ${
                            idx < palmImages.length - 1 ? 'bg-success' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Current step info */}
                {currentScanStep < SCAN_STEPS.length && !isScanning && palmImages.length < SCAN_STEPS.length && (
                  <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm font-medium text-primary">
                      Next: {SCAN_STEPS[currentScanStep].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {SCAN_STEPS[currentScanStep].tip}
                    </p>
                  </div>
                )}
                
                {/* Scanning progress */}
                {isScanning && (
                  <div className="space-y-2">
                    <Progress value={scanProgress} className="h-3" />
                    <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing biometric data... {Math.round(scanProgress)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Palm Image Preview */}
              <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary/30 bg-black/5">
                <img 
                  src={palmImages[palmImages.length - 1]} 
                  alt="Palm scan" 
                  className="w-full h-auto max-h-[400px] object-contain"
                />
                {isScanning && <BiometricScanAnimation progress={scanProgress} step={currentScanStep} />}
              </div>

              {/* Captured Images Thumbnails */}
              {palmImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {palmImages.map((img, idx) => (
                    <div 
                      key={idx}
                      className={`
                        flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer
                        ${idx === palmImages.length - 1 ? 'border-primary ring-2 ring-primary/30' : 'border-muted'}
                      `}
                    >
                      <img src={img} alt={`Scan ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {palmImages.length < SCAN_STEPS.length && !isScanning && (
                  <Button
                    onClick={handleCaptureStep}
                    className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                    size="lg"
                  >
                    <Camera className="h-5 w-5" />
                    Capture {SCAN_STEPS[currentScanStep].label}
                  </Button>
                )}
                
                {palmImages.length >= 1 && !isScanning && (
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    size="lg"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        AI Guru Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Get Divine Reading
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={resetScan}
                  disabled={isScanning || analyzing}
                  size="lg"
                  className="border-2"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>

              {/* Quick upload option */}
              {palmImages.length < SCAN_STEPS.length && !isScanning && (
                <Button
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Or upload additional images
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default PalmScannerBiometric;
