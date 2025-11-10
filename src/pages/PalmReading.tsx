import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera as CameraPlugin } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import {
  Camera,
  Upload,
  Hand,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Heart,
  Briefcase,
  Activity,
  Users,
  GraduationCap,
  Flame,
  Plane,
  Star,
  Globe
} from 'lucide-react';

interface CategoryPrediction {
  title: string;
  prediction: string;
  palmFeatures: string[];
  timeline: string;
  guidance: string;
  rating: number;
}

interface PalmAnalysis {
  language?: string;
  palmType?: string;
  greeting?: string;
  overallDestiny?: string;
  categories?: {
    career?: CategoryPrediction;
    love?: CategoryPrediction;
    health?: CategoryPrediction;
    family?: CategoryPrediction;
    education?: CategoryPrediction;
    spiritual?: CategoryPrediction;
    travel?: CategoryPrediction;
  };
  specialMarks?: string[];
  luckyElements?: {
    colors?: string[];
    gemstones?: string[];
    days?: string[];
    numbers?: number[];
  };
  remedies?: string[];
  warnings?: string[];
  blessings?: string;
  rawAnalysis?: string;
}

const LANGUAGES = [
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
];

const SCAN_STEPS = [
  { id: 'center', label: 'Center Palm', icon: Hand, description: 'Place palm flat, fingers spread' },
  { id: 'left', label: 'Left Side', icon: Hand, description: 'Tilt hand slightly left' },
  { id: 'right', label: 'Right Side', icon: Hand, description: 'Tilt hand slightly right' },
  { id: 'fingers', label: 'Finger Lines', icon: Hand, description: 'Focus on finger tips' },
];

const PalmReading = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [currentScanStep, setCurrentScanStep] = useState(0);
  const [palmImages, setPalmImages] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PalmAnalysis | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);

  useEffect(() => {
    if (isScanning && palmImages.length > 0) {
      // Simulate scanning animation
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            if (currentScanStep < SCAN_STEPS.length - 1) {
              setCurrentScanStep(currentScanStep + 1);
              setScanProgress(0);
            }
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning, palmImages.length, currentScanStep]);

  const startBiometricScan = () => {
    if (!selectedLanguage) {
      toast({
        title: "Select Language",
        description: "Please select your preferred language first",
        variant: "destructive"
      });
      return;
    }
    setShowLanguageSelector(false);
    setCurrentScanStep(0);
    setPalmImages([]);
  };

  const handleCaptureScanStep = async () => {
    try {
      const image = await CameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: `Capture: ${SCAN_STEPS[currentScanStep].label}`,
        promptLabelPhoto: 'Take Photo',
      });

      if (image.dataUrl) {
        setPalmImages(prev => [...prev, image.dataUrl!]);
        setIsScanning(true);
        
        toast({
          title: `${SCAN_STEPS[currentScanStep].label} captured ✓`,
          description: currentScanStep < SCAN_STEPS.length - 1 
            ? `Next: ${SCAN_STEPS[currentScanStep + 1].label}` 
            : 'All scans complete!',
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera access failed",
        description: "Please try uploading an image instead",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedLanguage) {
      toast({
        title: "Select Language",
        description: "Please select your preferred language first",
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
      
      toast({
        title: "Palm image uploaded",
        description: "Processing biometric scan...",
      });
    };
    reader.readAsDataURL(file);
  };

  const analyzePalm = async () => {
    if (palmImages.length === 0) {
      toast({
        title: "No palm scan",
        description: "Please complete the biometric scan first",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      // Use the primary palm image (center/first image)
      const { data, error } = await supabase.functions.invoke('palm-reading-analysis', {
        body: { 
          imageData: palmImages[0],
          language: selectedLanguage 
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "🙏 Palm Reading Complete",
          description: "Your detailed destiny reading is ready",
        });
      } else {
        throw new Error('No analysis returned');
      }

    } catch (error) {
      console.error('Palm analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze palm. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScan = () => {
    setPalmImages([]);
    setCurrentScanStep(0);
    setScanProgress(0);
    setAnalysis(null);
    setShowLanguageSelector(true);
    setIsScanning(false);
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'career': return Briefcase;
      case 'love': return Heart;
      case 'health': return Activity;
      case 'family': return Users;
      case 'education': return GraduationCap;
      case 'spiritual': return Flame;
      case 'travel': return Plane;
      default: return Star;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🤚</div>
          <p className="text-muted-foreground">Loading palm reading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-peace">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full animate-pulse">
            <Hand className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
            AI Guru Palm Reading
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Advanced biometric palm scanning powered by AI • Accurate Vedic predictions
            <br />
            <Badge variant="outline" className="mt-2">Powered by OpenAI GPT-5 Vision</Badge>
          </p>
        </div>

        {/* Language Selection */}
        {showLanguageSelector && (
          <Card className="max-w-2xl mx-auto mb-8 card-sacred border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>Select Your Language / भाषा चुनें</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred language for the palm reading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full text-lg">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code} className="text-lg">
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Biometric Scanner */}
          <div className="space-y-6">
            {!analysis && (
              <Card className="card-sacred border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-primary" />
                    <span>Biometric Palm Scanner</span>
                  </CardTitle>
                  <CardDescription>
                    Multi-angle scanning for accurate predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {palmImages.length === 0 ? (
                    <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center space-y-4 bg-gradient-to-br from-primary/5 to-secondary/5">
                      <div className="relative">
                        <Hand className="h-24 w-24 mx-auto text-primary animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-32 w-32 border-4 border-primary/20 rounded-full animate-ping" />
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        Ready to scan your destiny
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={startBiometricScan}
                          disabled={!selectedLanguage}
                          className="gap-2 bg-gradient-temple text-lg px-8 py-6"
                        >
                          <Sparkles className="h-5 w-5" />
                          Start Biometric Scan
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={!selectedLanguage}
                          className="gap-2 text-lg px-8 py-6"
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
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Scan Progress */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {SCAN_STEPS.map((step, idx) => {
                              const Icon = step.icon;
                              return (
                                <div key={step.id} className="flex items-center">
                                  <div className={`p-2 rounded-full ${
                                    idx < palmImages.length ? 'bg-success text-success-foreground' :
                                    idx === currentScanStep ? 'bg-primary text-primary-foreground animate-pulse' :
                                    'bg-muted text-muted-foreground'
                                  }`}>
                                    {idx < palmImages.length ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      <Icon className="h-4 w-4" />
                                    )}
                                  </div>
                                  {idx < SCAN_STEPS.length - 1 && (
                                    <div className={`h-0.5 w-8 ${
                                      idx < palmImages.length - 1 ? 'bg-success' : 'bg-muted'
                                    }`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <Badge variant="outline">
                            {palmImages.length}/{SCAN_STEPS.length}
                          </Badge>
                        </div>
                        
                        {isScanning && (
                          <div className="space-y-2">
                            <Progress value={scanProgress} className="h-2" />
                            <p className="text-sm text-center text-primary font-medium animate-pulse">
                              Analyzing biometric data... {scanProgress}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Current Scan Preview */}
                      <div className="relative rounded-xl overflow-hidden shadow-divine border-2 border-primary/30">
                        <img 
                          src={palmImages[palmImages.length - 1]} 
                          alt="Palm scan" 
                          className="w-full h-auto"
                        />
                        {isScanning && (
                          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px]">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="grid grid-cols-3 grid-rows-3 w-full h-full opacity-30">
                                {Array.from({ length: 9 }).map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="border border-primary/50 animate-pulse"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50 animate-scan-line" />
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {palmImages.length < SCAN_STEPS.length && !isScanning && (
                          <Button
                            onClick={handleCaptureScanStep}
                            className="flex-1 gap-2 bg-gradient-temple"
                          >
                            <Camera className="h-4 w-4" />
                            Capture {SCAN_STEPS[currentScanStep].label}
                          </Button>
                        )}
                        
                        {palmImages.length >= 1 && !analyzing && (
                          <Button
                            onClick={analyzePalm}
                            disabled={isScanning}
                            className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                          >
                            {analyzing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Consulting AI Guru...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Get Reading
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline"
                          onClick={resetScan}
                          disabled={isScanning || analyzing}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span>Scanning Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>🤚 Use your dominant hand (right for most people)</p>
                <p>💡 Bright, natural lighting works best</p>
                <p>📸 Keep palm flat with fingers slightly spread</p>
                <p>🎯 Follow on-screen guidance for each angle</p>
                <p>🔍 Ensure all major lines are clearly visible</p>
                <p>⚡ Complete all scan angles for best accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Right: AI Guru Reading Results */}
          <div className="space-y-6">
            {!analysis && !analyzing && (
              <Card className="card-sacred">
                <CardContent className="text-center py-16">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Complete your biometric palm scan to receive<br />your personalized destiny reading from AI Guru
                  </p>
                </CardContent>
              </Card>
            )}

            {analyzing && (
              <Card className="card-sacred border-primary/30">
                <CardContent className="text-center py-16 space-y-4">
                  <div className="relative inline-block">
                    <div className="text-6xl animate-om-pulse">🙏</div>
                    <div className="absolute -inset-4 border-4 border-primary/20 rounded-full animate-ping" />
                  </div>
                  <p className="text-lg font-semibold">AI Guru is reading your palm...</p>
                  <p className="text-sm text-muted-foreground">Analyzing destiny patterns</p>
                </CardContent>
              </Card>
            )}

            {analysis && (
              <>
                {/* AI Guru Greeting */}
                {analysis.greeting && (
                  <Card className="card-sacred border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-secondary/10">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">🧘‍♂️</div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold mb-2">AI Guru speaks:</p>
                          <p className="text-foreground leading-relaxed italic">
                            "{analysis.greeting}"
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Overall Destiny */}
                {analysis.overallDestiny && (
                  <Card className="card-sacred border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-warning" />
                        <span>Your Life Path • {analysis.palmType} Hand</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">{analysis.overallDestiny}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Category-wise Predictions */}
                {analysis.categories && Object.entries(analysis.categories).map(([key, category]) => {
                  if (!category) return null;
                  const Icon = getCategoryIcon(key);
                  return (
                    <Card key={key} className="card-sacred">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <span>{category.title}</span>
                          </CardTitle>
                          <Badge variant="outline" className="text-lg px-3">
                            {category.rating}/10
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-foreground leading-relaxed">{category.prediction}</p>
                        </div>
                        
                        {category.timeline && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm"><strong>Timeline:</strong> {category.timeline}</p>
                          </div>
                        )}
                        
                        {category.palmFeatures && category.palmFeatures.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Palm Indicators:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {category.palmFeatures.map((feature, idx) => (
                                <li key={idx}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {category.guidance && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <p className="text-sm text-primary">
                              <strong>Guidance:</strong> {category.guidance}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Lucky Elements */}
                {analysis.luckyElements && (
                  <Card className="card-sacred bg-gradient-to-br from-warning/10 to-success/10">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-warning" />
                        <span>Your Lucky Elements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {analysis.luckyElements.colors && (
                        <div>
                          <strong>Colors:</strong> {analysis.luckyElements.colors.join(', ')}
                        </div>
                      )}
                      {analysis.luckyElements.gemstones && (
                        <div>
                          <strong>Gemstones:</strong> {analysis.luckyElements.gemstones.join(', ')}
                        </div>
                      )}
                      {analysis.luckyElements.days && (
                        <div>
                          <strong>Days:</strong> {analysis.luckyElements.days.join(', ')}
                        </div>
                      )}
                      {analysis.luckyElements.numbers && (
                        <div>
                          <strong>Numbers:</strong> {analysis.luckyElements.numbers.join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Spiritual Remedies */}
                {analysis.remedies && analysis.remedies.length > 0 && (
                  <Card className="card-sacred bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Flame className="h-5 w-5 text-primary" />
                        <span>Spiritual Remedies</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.remedies.map((remedy, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-primary mt-0.5">🕉️</span>
                            <span className="text-sm">{remedy}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Final Blessings */}
                {analysis.blessings && (
                  <Card className="card-sacred border-2 border-success/30 bg-gradient-to-br from-success/5 to-primary/5">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-3">
                        <div className="text-3xl">🙏</div>
                        <p className="text-foreground leading-relaxed font-medium italic">
                          {analysis.blessings}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Reset Button */}
                <Button 
                  onClick={resetScan}
                  variant="outline"
                  className="w-full"
                >
                  Start New Reading
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(400px); }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PalmReading;
