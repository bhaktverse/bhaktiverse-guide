import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sun, Moon, Sparkles, Heart, BookOpen, Play, RefreshCw, AlertTriangle } from "lucide-react";

const DailyDevotion = () => {
  usePageTitle('Daily Devotion & Puja');
  const [devotion, setDevotion] = useState<any>(null);
  const [mantra, setMantra] = useState<any>(null);
  const [panchang, setPanchang] = useState<any>(null);
  const [personalizedMessage, setPersonalizedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadDailyDevotion();
  }, []);

  const loadFromDatabase = async () => {
    try {
      const dayOfWeek = new Date().getDay();
      const { data: dbDevotion } = await supabase
        .from('daily_devotions')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .maybeSingle();

      if (dbDevotion) {
        setDevotion(dbDevotion);
        setError(false);
      }

      const { data: dbMantra } = await supabase
        .from('mantras_library')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (dbMantra) setMantra(dbMantra);
    } catch (e) {
      console.error('DB fallback also failed:', e);
    }
  };

  const loadDailyDevotion = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('daily-divine-recommendation');

      if (fnError) throw fnError;

      setDevotion(data.devotion);
      setMantra(data.mantra);
      setPanchang(data.panchang);
      setPersonalizedMessage(data.personalizedMessage);
    } catch (err) {
      console.error('Error loading daily devotion:', err);
      setError(true);
      // Fallback to direct DB query
      await loadFromDatabase();
    } finally {
      setLoading(false);
    }
  };

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-divine flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading today's divine guidance...</p>
        </div>
      </div>
    );
  }

  // Full error state with no data at all
  if (error && !devotion) {
    return (
      <div className="min-h-screen bg-gradient-divine">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-24 flex items-center justify-center">
          <Card className="card-sacred max-w-md w-full">
            <CardContent className="text-center py-12 space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold">Unable to Load Today's Devotion</h3>
              <p className="text-sm text-muted-foreground">
                The divine guidance service is temporarily unavailable. Please try again.
              </p>
              <Button onClick={loadDailyDevotion} className="bg-gradient-saffron text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-divine">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-24">
        <Breadcrumbs className="mb-6" />

        {/* Error banner when using DB fallback */}
        {error && devotion && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center justify-between">
            <p className="text-sm text-destructive">Showing offline data. Panchang unavailable.</p>
            <Button size="sm" variant="outline" onClick={loadDailyDevotion}>
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="bg-gradient-saffron text-white px-6 py-2 text-lg shadow-divine mb-4">
            <Sun className="h-5 w-5 mr-2 inline" />
            आज का देव दर्शन
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            {getDayName()}'s Divine Guidance
          </h1>
          <p className="text-lg text-muted-foreground">
            Today's planetary devotion and spiritual practices
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Devotion Card */}
          <Card className="lg:col-span-2 card-sacred backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/30 shadow-divine">
            <CardHeader className="border-b border-border/50 bg-gradient-saffron/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  🙏 {devotion?.deity}
                </CardTitle>
                <Badge className="bg-gradient-temple text-white">
                  {devotion?.planet}
                </Badge>
              </div>
              <CardDescription>
                आज {getDayName()} है - {devotion?.deity} का दिन
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Personalized Message */}
              {personalizedMessage && (
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border border-primary/30">
                  <p className="text-sm leading-relaxed">{personalizedMessage}</p>
                </div>
              )}

              {/* Color and Fast */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">आज का रंग</div>
                  <div className="font-semibold text-lg">{devotion?.color}</div>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <div className="text-sm text-muted-foreground mb-2">व्रत</div>
                  <div className="font-semibold text-sm">{devotion?.fast_recommendation}</div>
                </div>
              </div>

              {/* Mantra */}
              {mantra && (
                <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-6 rounded-lg border border-accent/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      आज का मंत्र
                    </h3>
                    <Badge variant="outline">{mantra.repetitions}x</Badge>
                  </div>
                  <p className="text-lg font-medium mb-2 text-primary">{mantra.mantra}</p>
                  <p className="text-sm text-muted-foreground mb-4">{mantra.meaning}</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-gradient-saffron text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Listen & Chant
                    </Button>
                    <span className="text-xs text-muted-foreground">Best time: {mantra.best_time}</span>
                  </div>
                </div>
              )}

              {/* Puja Items */}
              {devotion?.puja_items && devotion.puja_items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    पूजा सामग्री
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {devotion.puja_items.map((item: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-background/50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" />
                  लाभ / Benefits
                </h3>
                <p className="text-sm">{devotion?.benefits}</p>
              </div>
            </CardContent>
          </Card>

          {/* Panchang Sidebar */}
          <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-accent/10 via-background to-primary/10 border-accent/30 shadow-divine">
            <CardHeader className="border-b border-border/50 bg-gradient-temple/10">
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-accent" />
                आज का पंचांग
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('hi-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {panchang ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Tithi</span>
                      <span className="font-medium">{panchang.tithi}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Nakshatra</span>
                      <span className="font-medium">{panchang.nakshatra}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Yoga</span>
                      <span className="font-medium">{panchang.yoga}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">🌅 Sunrise</span>
                      <span className="text-sm font-medium">{panchang.sunrise}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">🌇 Sunset</span>
                      <span className="text-sm font-medium">{panchang.sunset}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">🌙 Moonrise</span>
                      <span className="text-sm font-medium">{panchang.moonrise}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="bg-destructive/10 border border-destructive/30 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-destructive mb-1">⚠️ Rahu Kaal</div>
                      <div className="text-sm">{panchang.rahu_kaal}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-saffron/10 border border-primary/30 p-3 rounded-lg">
                    <div className="text-sm font-semibold text-primary mb-1">✨ Shubh Muhurat</div>
                    <div className="text-sm">{panchang.auspicious_time}</div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Moon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Panchang data unavailable</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default DailyDevotion;
