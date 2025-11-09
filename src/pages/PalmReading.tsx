import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Brain,
  Activity,
  Star,
  TrendingUp
} from 'lucide-react';

interface PalmAnalysis {
  palmType?: string;
  overallReading?: string;
  lines?: {
    heartLine?: { present: boolean; quality: string; meaning: string; guidance: string };
    headLine?: { present: boolean; quality: string; meaning: string; guidance: string };
    lifeLine?: { present: boolean; quality: string; meaning: string; guidance: string };
    fateLine?: { present: boolean; quality: string; meaning: string; guidance: string };
    sunLine?: { present: boolean; quality: string; meaning: string; guidance: string };
  };
  mounts?: {
    jupiter?: { prominence: string; meaning: string };
    saturn?: { prominence: string; meaning: string };
    apollo?: { prominence: string; meaning: string };
  };
  specialMarks?: string[];
  remedies?: string[];
  lifeGuidance?: string;
  rawAnalysis?: string;
}

const PalmReading = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PalmAnalysis | null>(null);
  const [progress, setProgress] = useState(0);

  const handleCameraCapture = async () => {
    try {
      const image = await CameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Capture Your Palm',
        promptLabelPhoto: 'Take Photo',
        promptLabelPicture: 'Choose from Gallery'
      });

      if (image.dataUrl) {
        setPalmImage(image.dataUrl);
        toast({
          title: "Palm image captured",
          description: "Click 'Analyze Palm' to get your reading",
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera access failed",
        description: "Please upload an image instead",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPalmImage(reader.result as string);
      toast({
        title: "Palm image uploaded",
        description: "Click 'Analyze Palm' to get your reading",
      });
    };
    reader.readAsDataURL(file);
  };

  const analyzePalm = async () => {
    if (!palmImage) {
      toast({
        title: "No image selected",
        description: "Please capture or upload a palm image first",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('palm-reading-analysis', {
        body: { imageData: palmImage }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Palm analysis complete! 🙏",
          description: "Your detailed reading is ready",
        });
      } else {
        throw new Error('No analysis returned');
      }

    } catch (error) {
      clearInterval(progressInterval);
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
          <div className="inline-block mb-4 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full">
            <Hand className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
            Vedic Palm Reading
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover your destiny through ancient palmistry powered by AI vision. 
            <br />Analyze major lines, mounts, and signs for deep insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Image Upload/Capture */}
          <div className="space-y-6">
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <span>Capture Your Palm</span>
                </CardTitle>
                <CardDescription>
                  Take a photo or upload an image of your palm for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!palmImage ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-12 text-center space-y-4">
                    <Hand className="h-20 w-20 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No palm image selected
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={handleCameraCapture} className="gap-2">
                        <Camera className="h-4 w-4" />
                        Take Photo
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
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
                    <div className="relative rounded-xl overflow-hidden shadow-divine">
                      <img 
                        src={palmImage} 
                        alt="Your palm" 
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={analyzePalm}
                        disabled={analyzing}
                        className="flex-1 gap-2 bg-gradient-temple"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Analyze Palm
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => { setPalmImage(null); setAnalysis(null); }}
                      >
                        Clear
                      </Button>
                    </div>
                    
                    {analyzing && (
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-center text-muted-foreground">
                          AI is analyzing your palm... {progress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span>Tips for Best Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✋ Use your dominant hand (right for most people)</p>
                <p>💡 Ensure good lighting - natural light works best</p>
                <p>📸 Keep your palm flat and fingers slightly spread</p>
                <p>🔍 Avoid shadows and ensure clear visibility of lines</p>
                <p>📏 Capture the entire palm from wrist to fingertips</p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Analysis Results */}
          <div className="space-y-6">
            {!analysis && !analyzing && (
              <Card className="card-sacred">
                <CardContent className="text-center py-16">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Upload a palm image to see your detailed reading
                  </p>
                </CardContent>
              </Card>
            )}

            {analysis && (
              <>
                {/* Overall Reading */}
                <Card className="card-sacred border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span>Palm Analysis Complete</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.palmType && (
                      <div>
                        <Badge className="mb-2">{analysis.palmType} Hand</Badge>
                      </div>
                    )}
                    <p className="text-foreground leading-relaxed">
                      {analysis.overallReading || analysis.rawAnalysis?.substring(0, 300)}
                    </p>
                  </CardContent>
                </Card>

                {/* Major Lines */}
                {analysis.lines && (
                  <Card className="card-sacred">
                    <CardHeader>
                      <CardTitle>Major Palm Lines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.lines.heartLine?.present && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            <h4 className="font-semibold">Heart Line</h4>
                            <Badge variant="outline">{analysis.lines.heartLine.quality}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.lines.heartLine.meaning}</p>
                          {analysis.lines.heartLine.guidance && (
                            <p className="text-sm text-primary">💡 {analysis.lines.heartLine.guidance}</p>
                          )}
                        </div>
                      )}

                      {analysis.lines.headLine?.present && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-5 w-5 text-blue-500" />
                            <h4 className="font-semibold">Head Line</h4>
                            <Badge variant="outline">{analysis.lines.headLine.quality}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.lines.headLine.meaning}</p>
                          {analysis.lines.headLine.guidance && (
                            <p className="text-sm text-primary">💡 {analysis.lines.headLine.guidance}</p>
                          )}
                        </div>
                      )}

                      {analysis.lines.lifeLine?.present && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-green-500" />
                            <h4 className="font-semibold">Life Line</h4>
                            <Badge variant="outline">{analysis.lines.lifeLine.quality}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.lines.lifeLine.meaning}</p>
                          {analysis.lines.lifeLine.guidance && (
                            <p className="text-sm text-primary">💡 {analysis.lines.lifeLine.guidance}</p>
                          )}
                        </div>
                      )}

                      {analysis.lines.fateLine?.present && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <h4 className="font-semibold">Fate Line</h4>
                            <Badge variant="outline">{analysis.lines.fateLine.quality}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{analysis.lines.fateLine.meaning}</p>
                          {analysis.lines.fateLine.guidance && (
                            <p className="text-sm text-primary">💡 {analysis.lines.fateLine.guidance}</p>
                          )}
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
                        <Star className="h-5 w-5 text-primary" />
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

                {/* Life Guidance */}
                {analysis.lifeGuidance && (
                  <Card className="card-sacred border-wisdom/30">
                    <CardHeader>
                      <CardTitle>Life Guidance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">{analysis.lifeGuidance}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalmReading;