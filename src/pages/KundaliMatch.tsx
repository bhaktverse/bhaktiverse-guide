import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { RASHIS, calculateGunMilan, type RashiData, type GunMilanResult } from "@/data/rashiData";
import { 
  Heart, Users, Star, Loader2, CheckCircle2, AlertCircle,
  Sparkles, ChevronRight, ChevronDown, Crown, Shield, RefreshCw, History, Calendar
} from "lucide-react";

interface PartnerDetails {
  name: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  rashi: RashiData | null;
}

interface HistoryEntry {
  id: string;
  partner1_name: string;
  partner1_rashi: string | null;
  partner2_name: string;
  partner2_rashi: string | null;
  total_score: number | null;
  percentage: number | null;
  ai_analysis: string | null;
  created_at: string | null;
}

const KundaliMatch = () => {
  usePageTitle('Kundali Matching');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [partner1, setPartner1] = useState<PartnerDetails>({
    name: '', dob: '', timeOfBirth: '', placeOfBirth: '', rashi: null
  });
  const [partner2, setPartner2] = useState<PartnerDetails>({
    name: '', dob: '', timeOfBirth: '', placeOfBirth: '', rashi: null
  });
  const [usedFallback, setUsedFallback] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GunMilanResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [pastMatches, setPastMatches] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.id) loadPastMatches();
  }, [user?.id]);

  const loadPastMatches = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('kundali_match_history')
      .select('id, partner1_name, partner1_rashi, partner2_name, partner2_rashi, total_score, percentage, ai_analysis, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setPastMatches(data);
  };

  const calculateRashi = (dob: string): RashiData | null => {
    if (!dob) return null;
    const date = new Date(dob);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
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
    if (!user) {
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
    setUsedFallback(false);

    try {
      const { data, error } = await supabase.functions.invoke('kundali-match', {
        body: {
          partner1: {
            name: partner1.name,
            dob: partner1.dob,
            timeOfBirth: partner1.timeOfBirth,
            placeOfBirth: partner1.placeOfBirth,
            rashi: partner1.rashi.name,
            rashiHindi: partner1.rashi.hindiName
          },
          partner2: {
            name: partner2.name,
            dob: partner2.dob,
            timeOfBirth: partner2.timeOfBirth,
            placeOfBirth: partner2.placeOfBirth,
            rashi: partner2.rashi.name,
            rashiHindi: partner2.rashi.hindiName
          }
        }
      });

      if (error) throw error;

      if (data?.gunMilan) {
        setResult(data.gunMilan);
        const hasAI = !!data.analysis;
        if (hasAI) {
          setAiAnalysis(data.analysis);
          toast.success("🎉 कुंडली मिलान पूर्ण! AI विश्लेषण सहित");
        } else {
          setUsedFallback(true);
          toast.success("कुंडली मिलान पूर्ण! (बेसिक गणना)");
        }
        saveToHistory(data.gunMilan, hasAI ? data.analysis : null);
      } else {
        const gunMilan = calculateGunMilan(partner1.rashi, partner2.rashi);
        setResult(gunMilan);
        setUsedFallback(true);
        toast.info("बेसिक गुण मिलान गणना दिखाई जा रही है।");
        saveToHistory(gunMilan, null);
      }
    } catch (error: any) {
      console.error('Kundali match error:', error);
      const statusCode = error?.status || error?.code;
      if (statusCode === 429 || error?.message?.includes('429')) {
        toast.error("Daily limit reached! Upgrade to Premium for unlimited access.", {
          action: { label: 'Upgrade', onClick: () => navigate('/premium') }
        });
      } else {
        const gunMilan = calculateGunMilan(partner1.rashi!, partner2.rashi!);
        setResult(gunMilan);
        setUsedFallback(true);
        toast.info("⚠️ AI अनुपलब्ध — बेसिक गुण मिलान गणना दिखाई जा रही है।");
        saveToHistory(gunMilan, null);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (gunMilan: GunMilanResult, analysis: string | null) => {
    if (!user?.id || !partner1.rashi || !partner2.rashi) return;
    try {
      await supabase.from('kundali_match_history').insert({
        user_id: user.id,
        partner1_name: partner1.name,
        partner1_dob: partner1.dob,
        partner1_rashi: partner1.rashi.name,
        partner1_place: partner1.placeOfBirth || null,
        partner1_tob: partner1.timeOfBirth || null,
        partner2_name: partner2.name,
        partner2_dob: partner2.dob,
        partner2_rashi: partner2.rashi.name,
        partner2_place: partner2.placeOfBirth || null,
        partner2_tob: partner2.timeOfBirth || null,
        total_score: gunMilan.total,
        percentage: gunMilan.percentage,
        gun_milan_data: gunMilan as any,
        ai_analysis: analysis,
      });
      loadPastMatches();
    } catch (err) {
      console.error('Error saving kundali history:', err);
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
    <div className="min-h-screen bg-gradient-divine relative overflow-hidden animate-fade-in">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-24 relative z-10">
        <Breadcrumbs className="mb-6" />
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-2 bg-gradient-to-r from-pink-500/20 via-red-500/20 to-pink-500/20 rounded-full border border-pink-500/30 backdrop-blur-xl">
            <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
            <span className="font-semibold text-pink-600 dark:text-pink-400">वैदिक कुंडली मिलान</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Kundali Matching
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            36-point Ashta Koot Gun Milan system for marriage compatibility analysis
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Input Form — show when no result, or as compact summary when result exists */}
          {!result ? (
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
                    <Input id="name1" placeholder="वर का नाम" value={partner1.name} onChange={(e) => setPartner1(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob1">जन्म तिथि / Date of Birth</Label>
                    <Input id="dob1" type="date" value={partner1.dob} onChange={(e) => handleDobChange('partner1', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tob1">जन्म समय / Time of Birth (Optional)</Label>
                    <Input id="tob1" type="time" value={partner1.timeOfBirth} onChange={(e) => setPartner1(prev => ({ ...prev, timeOfBirth: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pob1">जन्म स्थान / Place of Birth</Label>
                    <Input id="pob1" placeholder="जैसे: जयपुर, राजस्थान" value={partner1.placeOfBirth} onChange={(e) => setPartner1(prev => ({ ...prev, placeOfBirth: e.target.value }))} />
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
                    <Input id="name2" placeholder="वधू का नाम" value={partner2.name} onChange={(e) => setPartner2(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob2">जन्म तिथि / Date of Birth</Label>
                    <Input id="dob2" type="date" value={partner2.dob} onChange={(e) => handleDobChange('partner2', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tob2">जन्म समय / Time of Birth (Optional)</Label>
                    <Input id="tob2" type="time" value={partner2.timeOfBirth} onChange={(e) => setPartner2(prev => ({ ...prev, timeOfBirth: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pob2">जन्म स्थान / Place of Birth</Label>
                    <Input id="pob2" placeholder="जैसे: दिल्ली" value={partner2.placeOfBirth} onChange={(e) => setPartner2(prev => ({ ...prev, placeOfBirth: e.target.value }))} />
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
          ) : (
            /* Compact Input Summary when results are shown */
            <Card className="card-sacred mb-6 border-pink-500/20">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{partner1.rashi?.symbol}</span>
                      <div>
                        <p className="font-semibold text-sm">{partner1.name}</p>
                        <p className="text-xs text-muted-foreground">{partner1.rashi?.hindiName}{partner1.placeOfBirth ? ` • ${partner1.placeOfBirth}` : ''}</p>
                      </div>
                    </div>
                    <Heart className="h-5 w-5 text-pink-500" />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{partner2.rashi?.symbol}</span>
                      <div>
                        <p className="font-semibold text-sm">{partner2.name}</p>
                        <p className="text-xs text-muted-foreground">{partner2.rashi?.hindiName}{partner2.placeOfBirth ? ` • ${partner2.placeOfBirth}` : ''}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setResult(null);
                    setAiAnalysis('');
                    setUsedFallback(false);
                  }}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Edit Details
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl animate-om-pulse">🕉️</div>
                    <span className="text-sm">कुंडली मिलान हो रहा है...</span>
                  </div>
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
                      <div className="text-center">
                        <div className="text-4xl mb-1">{partner1.rashi?.symbol}</div>
                        <p className="font-semibold">{partner1.name}</p>
                        <p className="text-xs text-muted-foreground">{partner1.rashi?.hindiName}</p>
                      </div>
                      <Heart className="h-8 w-8 text-pink-500 animate-pulse" />
                      <div className="text-center">
                        <div className="text-4xl mb-1">{partner2.rashi?.symbol}</div>
                        <p className="font-semibold">{partner2.name}</p>
                        <p className="text-xs text-muted-foreground">{partner2.rashi?.hindiName}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                        {result.total}
                      </div>
                      <div className="text-xl text-muted-foreground">/ 36</div>
                      <p className="text-lg font-semibold mt-1">{result.percentage}% Match</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className={`p-4 rounded-lg border ${getVerdictColor(result.percentage)}`}>
                    <div className="flex items-center gap-3">
                      {result.percentage >= 60 ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
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
                  <CardDescription>Detailed breakdown of 8 compatibility factors</CardDescription>
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
                        <Progress value={(item.points / item.max) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {usedFallback && !aiAnalysis && (
                <Card className="card-sacred border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      AI विश्लेषण अनुपलब्ध है। बेसिक गुण मिलान गणना दिखाई जा रही है। विस्तृत विश्लेषण के लिए पुनः प्रयास करें।
                    </p>
                  </CardContent>
                </Card>
              )}

              {aiAnalysis && (
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI गुरु की सलाह
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-line">{aiAnalysis}</p>
                  </CardContent>
                </Card>
              )}

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setAiAnalysis('');
                    setPartner1({ name: '', dob: '', timeOfBirth: '', placeOfBirth: '', rashi: null });
                    setPartner2({ name: '', dob: '', timeOfBirth: '', placeOfBirth: '', rashi: null });
                    setUsedFallback(false);
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  नया मिलान करें / New Match
                </Button>
              </div>
            </div>
          )}

          {/* Past Matches History */}
          {pastMatches.length > 0 && (
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="mt-10">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    पिछले मिलान / Past Matches ({pastMatches.length})
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                {pastMatches.map((match) => (
                  <Card key={match.id} className="card-sacred">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-sm">{match.partner1_name}</p>
                            <p className="text-xs text-muted-foreground">{match.partner1_rashi}</p>
                          </div>
                          <Heart className="h-4 w-4 text-pink-500" />
                          <div>
                            <p className="font-semibold text-sm">{match.partner2_name}</p>
                            <p className="text-xs text-muted-foreground">{match.partner2_rashi}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${match.percentage && match.percentage >= 60 ? 'text-green-500' : 'text-amber-500'}`}>
                            {match.total_score}/36
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {match.created_at ? new Date(match.created_at).toLocaleDateString('hi-IN') : ''}
                          </p>
                        </div>
                      </div>
                      {match.ai_analysis && (
                        <p className="text-xs text-muted-foreground mt-3 line-clamp-2 border-t border-border/50 pt-2">
                          {match.ai_analysis}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
};

export default KundaliMatch;