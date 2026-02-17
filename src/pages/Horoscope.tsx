import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RASHIS, getRashiByDate, type RashiData } from "@/data/rashiData";
import { 
  Sun, Moon, Star, Calendar, Clock, Sparkles, TrendingUp, 
  Heart, Briefcase, Activity, Shield, ChevronRight, Loader2,
  Sunrise, Sunset, RefreshCw
} from "lucide-react";

interface DailyPrediction {
  overall: string;
  love: { score: number; prediction: string; tip: string };
  career: { score: number; prediction: string; tip: string };
  health: { score: number; prediction: string; tip: string };
  finance: { score: number; prediction: string; tip: string };
  luckyColor: string;
  luckyNumber: number;
  luckyTime: string;
  mantraOfDay: string;
  doToday: string[];
  avoidToday: string[];
  cosmicMessage: string;
}

const Horoscope = () => {
  const navigate = useNavigate();
  const [selectedRashi, setSelectedRashi] = useState<RashiData | null>(null);
  const [prediction, setPrediction] = useState<DailyPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [panchangData, setPanchangData] = useState<any>(null);

  useEffect(() => {
    loadPanchang();
  }, []);

  const loadPanchang = async () => {
    try {
      const { data } = await supabase.functions.invoke('hindu-panchang', {
        body: { 
          date: new Date().toISOString().split('T')[0],
          latitude: 28.6139,
          longitude: 77.2090
        }
      });
      if (data?.panchang) {
        setPanchangData(data.panchang);
      }
    } catch (error) {
      console.error('Panchang load error:', error);
    }
  };

  const generatePrediction = async (rashi: RashiData) => {
    setSelectedRashi(rashi);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('daily-horoscope', {
        body: { 
          rashiName: rashi.name,
          rashiHindi: rashi.hindiName,
          ruler: rashi.ruler,
          element: rashi.element,
          panchang: panchangData
        }
      });

      if (error) throw error;

      if (data?.prediction) {
        setPrediction(data.prediction);
        toast.success(`🌟 ${rashi.hindiName} राशिफल तैयार!`);
      }
    } catch (error) {
      console.error('Horoscope error:', error);
      setPrediction(null);
      toast.error('राशिफल लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'love': return <Heart className="h-5 w-5" />;
      case 'career': return <Briefcase className="h-5 w-5" />;
      case 'health': return <Activity className="h-5 w-5" />;
      case 'finance': return <TrendingUp className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-divine relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-24 relative z-10">
        <Breadcrumbs className="mb-6" />
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-2 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full border border-primary/30 backdrop-blur-xl">
            <Sun className="h-5 w-5 text-primary animate-spin-slow" />
            <span className="font-semibold bg-gradient-temple bg-clip-text text-transparent">
              दैनिक राशिफल 2026
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            आज का राशिफल
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered Vedic astrology predictions based on your Rashi, today's Panchang, and planetary positions
          </p>
        </div>

        {/* Panchang Quick Info */}
        {panchangData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto mb-8">
            <Card className="card-sacred p-3 text-center">
              <div className="text-2xl mb-1">🌙</div>
              <p className="text-xs text-muted-foreground">Tithi</p>
              <p className="text-sm font-semibold">{panchangData.hindu?.tithi || 'Shukla Saptami'}</p>
            </Card>
            <Card className="card-sacred p-3 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <p className="text-xs text-muted-foreground">Nakshatra</p>
              <p className="text-sm font-semibold">{panchangData.hindu?.nakshatra || 'Rohini'}</p>
            </Card>
            <Card className="card-sacred p-3 text-center">
              <div className="text-2xl mb-1">🪐</div>
              <p className="text-xs text-muted-foreground">Yoga</p>
              <p className="text-sm font-semibold">{panchangData.hindu?.yoga || 'Shiva'}</p>
            </Card>
            <Card className="card-sacred p-3 text-center">
              <div className="text-2xl mb-1"><Sunrise className="h-6 w-6 mx-auto text-orange-500" /></div>
              <p className="text-xs text-muted-foreground">Sunrise</p>
              <p className="text-sm font-semibold">{panchangData.timings?.sunrise || '6:12 AM'}</p>
            </Card>
            <Card className="card-sacred p-3 text-center">
              <div className="text-2xl mb-1"><Sunset className="h-6 w-6 mx-auto text-purple-500" /></div>
              <p className="text-xs text-muted-foreground">Sunset</p>
              <p className="text-sm font-semibold">{panchangData.timings?.sunset || '6:45 PM'}</p>
            </Card>
          </div>
        )}

        {/* Rashi Selection Grid */}
        {!selectedRashi && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-6">अपनी राशि चुनें / Select Your Rashi</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {RASHIS.map((rashi) => (
                <Card 
                  key={rashi.id}
                  className="card-sacred cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-divine group"
                  onClick={() => generatePrediction(rashi)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{rashi.symbol}</div>
                    <h3 className="font-bold text-sm">{rashi.hindiName}</h3>
                    <p className="text-xs text-muted-foreground">{rashi.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{rashi.dateRange}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">
              ग्रहों की स्थिति का विश्लेषण हो रहा है...
            </p>
          </div>
        )}

        {/* Error/Retry State */}
        {selectedRashi && !prediction && !loading && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">राशिफल उपलब्ध नहीं</h3>
            <p className="text-muted-foreground mb-6">Could not generate prediction. Please try again.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => generatePrediction(selectedRashi)} className="bg-gradient-temple text-white">
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
              <Button variant="outline" onClick={() => { setSelectedRashi(null); setPrediction(null); }}>
                Change Rashi
              </Button>
            </div>
          </div>
        )}

        {/* Prediction Display */}
        {selectedRashi && prediction && !loading && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Selected Rashi Header */}
            <Card className="card-sacred overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedRashi.symbol}</div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedRashi.hindiName} राशिफल</h2>
                      <p className="text-muted-foreground">{selectedRashi.name} • {new Date().toLocaleDateString('hi-IN')}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {selectedRashi.element}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selectedRashi.ruler} ({selectedRashi.rulerHindi})
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => { setSelectedRashi(null); setPrediction(null); }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Change Rashi
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="daily">दैनिक / Daily</TabsTrigger>
                <TabsTrigger value="detailed">विस्तृत / Detailed</TabsTrigger>
                <TabsTrigger value="remedies">उपाय / Remedies</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-6">
                {/* Overall Prediction */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      आज का संदेश
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">{prediction.overall}</p>
                  </CardContent>
                </Card>

                {/* Category Scores */}
                <div className="grid md:grid-cols-2 gap-4">
                  {(['love', 'career', 'health', 'finance'] as const).map((cat) => {
                    const data = prediction[cat];
                    return (
                      <Card key={cat} className="card-sacred">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center justify-between text-base">
                            <span className="flex items-center gap-2">
                              {getCategoryIcon(cat)}
                              {cat === 'love' ? 'प्रेम' : cat === 'career' ? 'करियर' : cat === 'health' ? 'स्वास्थ्य' : 'धन'}
                            </span>
                            <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                              {data.score}%
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Progress value={data.score} className="h-2 mb-3" />
                          <p className="text-sm text-foreground mb-2">{data.prediction}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {data.tip}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Lucky Elements */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle>शुभ तत्व / Lucky Elements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl mb-1">🎨</div>
                        <p className="text-xs text-muted-foreground">शुभ रंग</p>
                        <p className="font-semibold">{prediction.luckyColor}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl mb-1">🔢</div>
                        <p className="text-xs text-muted-foreground">शुभ अंक</p>
                        <p className="font-semibold">{prediction.luckyNumber}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl mb-1">⏰</div>
                        <p className="text-xs text-muted-foreground">शुभ समय</p>
                        <p className="font-semibold">{prediction.luckyTime}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl mb-1">💎</div>
                        <p className="text-xs text-muted-foreground">रत्न</p>
                        <p className="font-semibold">{selectedRashi.luckyGemstone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
                {/* Do's and Don'ts */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="card-sacred border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-green-500 flex items-center gap-2">
                        ✅ आज क्या करें
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {prediction.doToday.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-green-500 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="card-sacred border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-500 flex items-center gap-2">
                        ❌ आज क्या न करें
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {prediction.avoidToday.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-red-500 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Cosmic Message */}
                <Card className="card-sacred bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🌌</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">ब्रह्मांडीय संदेश</h3>
                        <p className="text-foreground italic">{prediction.cosmicMessage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="remedies" className="space-y-6">
                {/* Daily Mantra */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🙏 आज का मंत्र
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg text-center">
                      <p className="text-xl font-semibold text-primary mb-2">{prediction.mantraOfDay}</p>
                      <p className="text-sm text-muted-foreground">108 बार जप करें / Chant 108 times</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Rashi Deity */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ⛩️ आराध्य देवता
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="text-4xl">🙏</div>
                      <div>
                        <h3 className="font-bold text-lg">{selectedRashi.deity}</h3>
                        <p className="text-muted-foreground text-sm">
                          {selectedRashi.luckyDay} को विशेष पूजा करें
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gemstone Recommendation */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      💎 रत्न सुझाव
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">{selectedRashi.luckyGemstone}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedRashi.ruler} ग्रह को मजबूत करने के लिए यह रत्न धारण करें।
                      </p>
                      <Badge variant="outline">{selectedRashi.luckyDay} को धारण करें</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      <MobileBottomNav />
    </div>
  );
};

export default Horoscope;
