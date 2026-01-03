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
  HelpCircle,
  ImagePlus,
  X
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
  const [palmImages, setPalmImages] = useState<string[]>([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [imageSource, setImageSource] = useState<'none' | 'upload' | 'camera'>('none');
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasSeenTutorial = localStorage.getItem('palmScanTutorialSeen');
    return !hasSeenTutorial;
  });
  
  // User metadata (optional)
  const [userMetadata, setUserMetadata] = useState<UserMetadata>({
    name: '',
    dob: '',
    timeOfBirth: ''
  });

  // Handle file upload - ONLY uploads, does NOT auto-scan
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
      const imageData = reader.result as string;
      setPalmImages([imageData]);
      setShowLanguageSelector(false);
      setImageSource('upload');
      
      toast({
        title: "✓ Image Uploaded",
        description: "Click 'Start Analysis' to get your palm reading",
      });
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start biometric camera scan
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
    setPalmImages([]);
    setShowCameraPreview(true);
    setImageSource('camera');
  };

  // Handle camera capture
  const handleCameraCapture = (imageData: string) => {
    setPalmImages([imageData]);
    setShowCameraPreview(false);
    setShowLanguageSelector(false);
    setImageSource('camera');
    
    toast({
      title: "✓ Palm Captured",
      description: "Click 'Start Analysis' to get your divine reading",
    });
  };

  const handleCameraClose = () => {
    setShowCameraPreview(false);
    if (palmImages.length === 0) {
      setShowLanguageSelector(true);
      setImageSource('none');
    }
  };

  const resetScan = () => {
    setPalmImages([]);
    setShowLanguageSelector(true);
    setShowCameraPreview(false);
    setImageSource('none');
    setUserMetadata({ name: '', dob: '', timeOfBirth: '' });
  };

  // Start analysis - ONLY when user clicks this button
  const handleStartAnalysis = () => {
    if (palmImages.length === 0) {
      toast({
        title: "No Image",
        description: "Please upload or capture a palm image first",
        variant: "destructive"
      });
      return;
    }
    
    // Notify parent to start analysis
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
          stepLabel="Center Palm"
          stepTip="Keep your palm open and relaxed"
          currentStep={0}
          totalSteps={1}
          autoAdvance={false}
        />
      )}

      {/* Language Selection */}
      {showLanguageSelector && !showCameraPreview && palmImages.length === 0 && (
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

      {/* Main Scanner Card */}
      {!showCameraPreview && (
        <Card className="card-sacred border-2 border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                <span>AI Palm Reading</span>
              </div>
              <div className="flex items-center gap-2">
                {palmImages.length > 0 && (
                  <Badge variant="outline" className="bg-success/10 border-success/30 text-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Image Ready
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTutorial(true)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              Powered by AI Vision with Vedic Samudrika Shastra
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative space-y-6">
            {/* No image yet - show upload/scan options */}
            {palmImages.length === 0 && (
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 md:p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
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
                  <h3 className="text-xl font-bold text-foreground">Ready to Read Your Destiny</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose how you want to provide your palm image
                  </p>
                </div>
                
                {/* Two clear options: Scan vs Upload */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                  <Button 
                    onClick={startBiometricScan}
                    disabled={!selectedLanguage}
                    size="lg"
                    className="flex-1 gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-6 py-6 shadow-lg"
                  >
                    <Camera className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Use Camera</div>
                      <div className="text-xs opacity-80">Take a live photo</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!selectedLanguage}
                    size="lg"
                    className="flex-1 gap-3 text-lg px-6 py-6 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Upload Image</div>
                      <div className="text-xs text-muted-foreground">From gallery/files</div>
                    </div>
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!selectedLanguage && (
                  <p className="text-sm text-amber-500 mt-2">
                    ⚠️ Please select a language above first
                  </p>
                )}

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
            )}

            {/* Image uploaded/captured - show preview and analyze button */}
            {palmImages.length > 0 && (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary/30 bg-black/5">
                  <img 
                    src={palmImages[0]} 
                    alt="Palm scan" 
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                  
                  {/* Source badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {imageSource === 'upload' ? (
                        <><Upload className="h-3 w-3 mr-1" /> Uploaded</>
                      ) : (
                        <><Camera className="h-3 w-3 mr-1" /> Captured</>
                      )}
                    </Badge>
                  </div>
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8"
                    onClick={resetScan}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* User metadata input */}
                <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground text-sm">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Add personal details for personalized reading
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name2">Name</Label>
                        <Input
                          id="name2"
                          placeholder="Your name"
                          value={userMetadata.name}
                          onChange={(e) => setUserMetadata(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob2">Date of Birth</Label>
                        <Input
                          id="dob2"
                          type="date"
                          value={userMetadata.dob}
                          onChange={(e) => setUserMetadata(prev => ({ ...prev, dob: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tob2">Time of Birth</Label>
                        <Input
                          id="tob2"
                          type="time"
                          value={userMetadata.timeOfBirth}
                          onChange={(e) => setUserMetadata(prev => ({ ...prev, timeOfBirth: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={analyzing}
                    className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-lg py-6"
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
                        Start Analysis
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzing}
                    size="lg"
                    className="border-2"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={resetScan}
                    disabled={analyzing}
                    size="lg"
                    className="border-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Tips */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>🔍 For best results, ensure your palm lines are clearly visible</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PalmScannerBiometric;
