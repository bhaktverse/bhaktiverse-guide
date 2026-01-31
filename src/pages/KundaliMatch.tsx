import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { RASHIS, calculateGunMilan, type RashiData, type GunMilanResult } from "@/data/rashiData";
import { 
  Heart, Users, Star, Loader2, CheckCircle2, AlertCircle,
  Sparkles, ChevronRight, Crown, Shield, RefreshCw
} from "lucide-react";

interface PartnerDetails {
  name: string;
  dob: string;
  timeOfBirth: string;
  rashi: RashiData | null;
}

const KundaliMatch = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [partner1, setPartner1] = useState<PartnerDetails>({
    name: '', dob: '', timeOfBirth: '', rashi: null
  });
  const [partner2, setPartner2] = useState<PartnerDetails>({
    name: '', dob: '', timeOfBirth: '', rashi: null
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GunMilanResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const calculateRashi = (dob: string): RashiData | null => {
    if (!dob) return null;
    const date = new Date(dob);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified rashi calculation
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return RASHIS[0];
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return RASHIS[1];
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return RASHIS[2];
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return RASHIS[3];
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return RASHIS[4];
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return RASHIS[5];
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return RASHIS[6];
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return RASHIS[7];
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return RASHIS[8];
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return RASHIS[9];
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return RASHIS[10];
    return RASHIS[11];
  };

  const handleDobChange = (partner: 'partner1' | 'partner2', dob: string) => {
    const rashi = calculateRashi(dob);
    if (partner === 'partner1') {
      setPartner1(prev => ({ ...prev, dob, rashi }));
    } else {
      setPartner2(prev => ({ ...prev, dob, rashi }));
    }
  };

  const performMatching = async () => {
    if (!session) {
      toast.error("कृपया पहले लॉगिन करें / Please login first");
      navigate("/auth");
      return;
    }

    if (!partner1.name || !partner1.dob || !partner2.name || !partner2.dob) {
      toast.error("कृपया दोनों की जानकारी भरें / Please fill details for both partners");
      return;
    }

    if (!partner1.rashi || !partner2.rashi) {
      toast.error("राशि की गणना नहीं हो सकी / Could not calculate Rashi");
      return;
    }

    setLoading(true);
    setResult(null);
    setAiAnalysis('');

    try {
      // Call edge function for detailed analysis
      const { data, error } = await supabase.functions.invoke('kundali-match', {
        body: {
          partner1: {
            name: partner1.name,
            dob: partner1.dob,
            timeOfBirth: partner1.timeOfBirth,
            rashi: partner1.rashi.name,
            rashiHindi: partner1.rashi.hindiName
          },
          partner2: {
            name: partner2.name,
            dob: partner2.dob,
            timeOfBirth: partner2.timeOfBirth,
            rashi: partner2.rashi.name,
            rashiHindi: partner2.rashi.hindiName
          }
        }
      });

      if (error) throw error;

      if (data?.gunMilan) {
        setResult(data.gunMilan);
        setAiAnalysis(data.analysis || '');
        toast.success("🎉 कुंडली मिलान पूर्ण! / Kundali Match Complete!");
      } else {
        // Fallback to local calculation
        const gunMilan = calculateGunMilan(partner1.rashi, partner2.rashi);
        setResult(gunMilan);
      }
    } catch (error) {
      console.error('Kundali match error:', error);
      // Fallback to local calculation
      const gunMilan = calculateGunMilan(partner1.rashi!, partner2.rashi!);
      setResult(gunMilan);
      toast.success("कुंडली मिलान पूर्ण!");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (points: number, max: number) => {
    const percentage = (points / max) * 100;
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getVerdictColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500/10 border-green-500/50 text-green-600';
    if (percentage >= 60) return 'bg-amber-500/10 border-amber-500/50 text-amber-600';
    if (percentage >= 50) return 'bg-orange-500/10 border-orange-500/50 text-orange-600';
    return 'bg-red-500/10 border-red-500/50 text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-divine relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-2 bg-gradient-to-r from-pink-500/20 via-red-500/20 to-pink-500/20 rounded-full border border-pink-500/30 backdrop-blur-xl">
            <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
            <span className="font-semibold text-pink-600">वैदिक कुंडली मिलान</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Kundali Matching
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            36-point Ashta Koot Gun Milan system for marriage compatibility analysis
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Input Form */}
          {!result && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Partner 1 */}
              <Card className="card-sacred border-pink-500/30">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 to-red-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-500" />
                    वर की जानकारी / Groom's Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name1">नाम / Name</Label>
                    <Input
                      id="name1"
                      placeholder="वर का नाम"
                      value={partner1.name}
                      onChange={(e) => setPartner1(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob1">जन्म तिथि / Date of Birth</Label>
                    <Input
                      id="dob1"
                      type="date"
                      value={partner1.dob}
                      onChange={(e) => handleDobChange('partner1', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tob1">जन्म समय / Time of Birth (Optional)</Label>
                    <Input
                      id="tob1"
                      type="time"
                      value={partner1.timeOfBirth}
                      onChange={(e) => setPartner1(prev => ({ ...prev, timeOfBirth: e.target.value }))}
                    />
                  </div>
                  {partner1.rashi && (
                    <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                      <div className="text-3xl">{partner1.rashi.symbol}</div>
                      <div>
                        <p className="font-semibold">{partner1.rashi.hindiName}</p>
                        <p className="text-sm text-muted-foreground">{partner1.rashi.name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Partner 2 */}
              <Card className="card-sacred border-red-500/30">
                <CardHeader className="bg-gradient-to-r from-red-500/10 to-pink-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-500" />
                    वधू की जानकारी / Bride's Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name2">नाम / Name</Label>
                    <Input
                      id="name2"
                      placeholder="वधू का नाम"
                      value={partner2.name}
                      onChange={(e) => setPartner2(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob2">जन्म तिथि / Date of Birth</Label>
                    <Input
                      id="dob2"
                      type="date"
                      value={partner2.dob}
                      onChange={(e) => handleDobChange('partner2', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tob2">जन्म समय / Time of Birth (Optional)</Label>
                    <Input
                      id="tob2"
                      type="time"
                      value={partner2.timeOfBirth}
                      onChange={(e) => setPartner2(prev => ({ ...prev, timeOfBirth: e.target.value }))}
                    />
                  </div>
                  {partner2.rashi && (
                    <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                      <div className="text-3xl">{partner2.rashi.symbol}</div>
                      <div>
                        <p className="font-semibold">{partner2.rashi.hindiName}</p>
                        <p className="text-sm text-muted-foreground">{partner2.rashi.name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Match Button */}
          {!result && (
            <div className="text-center mt-8">
              <Button
                onClick={performMatching}
                disabled={loading || !partner1.name || !partner1.dob || !partner2.name || !partner2.dob}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-6 text-lg shadow-divine hover:shadow-divine-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    कुंडली मिलान हो रहा है...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    कुंडली मिलान करें
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Score Overview */}
              <Card className="card-sacred overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500/10 via-red-500/10 to-pink-500/10 p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      {/* Partner 1 */}
                      <div className="text-center">
                        <div className="text-4xl mb-1">{partner1.rashi?.symbol}</div>
                        <p className="font-semibold">{partner1.name}</p>
                        <p className="text-xs text-muted-foreground">{partner1.rashi?.hindiName}</p>
                      </div>
                      
                      {/* Heart Connection */}
                      <div className="flex items-center">
                        <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
                      </div>
                      
                      {/* Partner 2 */}
                      <div className="text-center">
                        <div className="text-4xl mb-1">{partner2.rashi?.symbol}</div>
                        <p className="font-semibold">{partner2.name}</p>
                        <p className="text-xs text-muted-foreground">{partner2.rashi?.hindiName}</p>
                      </div>
                    </div>
                    
                    {/* Total Score */}
                    <div className="text-center">
                      <div className="relative">
                        <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                          {result.total}
                        </div>
                        <div className="text-xl text-muted-foreground">/ 36</div>
                      </div>
                      <p className="text-lg font-semibold mt-1">{result.percentage}% Match</p>
                    </div>
                  </div>
                </div>
                
                {/* Verdict */}
                <div className="p-4">
                  <div className={`p-4 rounded-lg border ${getVerdictColor(result.percentage)}`}>
                    <div className="flex items-center gap-3">
                      {result.percentage >= 60 ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <AlertCircle className="h-6 w-6" />
                      )}
                      <div>
                        <h3 className="font-bold">{result.verdict}</h3>
                        <p className="text-sm">{result.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Gun Milan Details */}
              <Card className="card-sacred">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    अष्टकूट गुण मिलान / Ashta Koot Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of 8 compatibility factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { key: 'varna', name: 'वर्ण (Varna)', ...result.varna },
                      { key: 'vashya', name: 'वश्य (Vashya)', ...result.vashya },
                      { key: 'tara', name: 'तारा (Tara)', ...result.tara },
                      { key: 'yoni', name: 'योनि (Yoni)', ...result.yoni },
                      { key: 'maitri', name: 'मैत्री (Maitri)', ...result.maitri },
                      { key: 'gana', name: 'गण (Gana)', ...result.gana },
                      { key: 'bhakoot', name: 'भकूट (Bhakoot)', ...result.bhakoot },
                      { key: 'nadi', name: 'नाडी (Nadi)', ...result.nadi }
                    ].map((item) => (
                      <div key={item.key} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                          <div className={`text-xl font-bold ${getScoreColor(item.points, item.max)}`}>
                            {item.points}/{item.max}
                          </div>
                        </div>
                        <Progress 
                          value={(item.points / item.max) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              {aiAnalysis && (
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI गुरु की सलाह
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">{aiAnalysis}</p>
                  </CardContent>
                </Card>
              )}

              {/* New Match Button */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setAiAnalysis('');
                    setPartner1({ name: '', dob: '', timeOfBirth: '', rashi: null });
                    setPartner2({ name: '', dob: '', timeOfBirth: '', rashi: null });
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  नया मिलान करें / New Match
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
};

export default KundaliMatch;
