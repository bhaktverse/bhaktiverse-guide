import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Calendar, User, Loader2, Star, Heart, Zap, Crown } from "lucide-react";

const Numerology = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("कृपया पहले लॉगिन करें / Please login first");
      navigate("/auth");
      return;
    }

    if (!name || !dob) {
      toast.error("कृपया नाम और जन्मतिथि भरें / Please enter name and date of birth");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('numerology-analysis', {
        body: { name, dob }
      });

      if (error) throw error;

      setReport(data);
      
      if (data.cached) {
        toast.success("✨ पुराना विश्लेषण मिला! +5 XP", {
          description: "आपकी spiritual journey जारी है!"
        });
      } else {
        toast.success("🎉 नया विश्लेषण तैयार! +25 XP", {
          description: "Divine insights unlocked!"
        });
      }
    } catch (error: any) {
      console.error('Numerology analysis error:', error);
      toast.error("विश्लेषण में त्रुटि / Analysis error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-divine">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Hero Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <Badge className="bg-gradient-saffron text-white px-6 py-2 text-lg shadow-divine">
              <Sparkles className="h-5 w-5 mr-2 inline" />
              अंक ज्योतिष / Divine Numerology
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            अपना भविष्य जानें
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your life path, destiny, and divine purpose through ancient numerology wisdom
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/30 shadow-divine">
            <CardHeader className="border-b border-border/50 bg-gradient-saffron/10">
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                अपनी जानकारी दें / Enter Your Details
              </CardTitle>
              <CardDescription>
                आपकी जन्म विवरण से हम आपका पूर्ण विश्लेषण करेंगे
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAnalysis} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    पूरा नाम / Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="जैसे: Harish Vaishnav"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-primary/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    जन्म तिथि / Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="bg-background/50 border-primary/30"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-saffron text-white shadow-divine hover:shadow-divine-lg transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      विश्लेषण हो रहा है...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      ज्योतिष रिपोर्ट प्राप्त करें
                    </>
                  )}
                </Button>
              </form>

              {/* Features */}
              <div className="mt-8 space-y-3 pt-6 border-t border-border/50">
                <h3 className="font-semibold text-sm text-muted-foreground mb-4">आपको मिलेगा:</h3>
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Life Path, Destiny & Soul Number Analysis</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Lucky Colors, Days & Gemstones</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Crown className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Personalized Mantras & Remedies</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          {report ? (
            <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-accent/10 via-background to-primary/10 border-accent/30 shadow-divine overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-saffron/10 rounded-full blur-3xl -z-10" />
              
              <CardHeader className="border-b border-border/50 bg-gradient-temple/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-accent animate-pulse" />
                    आपकी ज्योतिष रिपोर्ट
                  </CardTitle>
                  {report.cached && (
                    <Badge variant="outline" className="bg-primary/10 border-primary/30">
                      Cached +5 XP
                    </Badge>
                  )}
                  {!report.cached && (
                    <Badge className="bg-gradient-saffron text-white shadow-divine">
                      New +25 XP
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {report.name} • {new Date(report.dob).toLocaleDateString('hi-IN')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Numbers Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-lg border border-primary/30">
                    <div className="text-3xl font-bold text-primary">{report.birth_number}</div>
                    <div className="text-sm text-muted-foreground">Birth Number</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-4 rounded-lg border border-accent/30">
                    <div className="text-3xl font-bold text-accent">{report.destiny_number}</div>
                    <div className="text-sm text-muted-foreground">Destiny Number</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-lg border border-primary/30">
                    <div className="text-3xl font-bold text-primary">{report.soul_number}</div>
                    <div className="text-sm text-muted-foreground">Soul Number</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-4 rounded-lg border border-accent/30">
                    <div className="text-3xl font-bold text-accent">{report.expression_number}</div>
                    <div className="text-sm text-muted-foreground">Expression</div>
                  </div>
                </div>

                {/* Lucky Elements */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm text-muted-foreground">Lucky Color</span>
                    <Badge className="bg-gradient-saffron text-white">{report.lucky_color}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm text-muted-foreground">Lucky Day</span>
                    <Badge className="bg-gradient-temple text-white">{report.lucky_day}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm text-muted-foreground">Gemstone</span>
                    <Badge variant="outline" className="border-primary/50">{report.lucky_gemstone}</Badge>
                  </div>
                </div>

                {/* AI Analysis */}
                {report.detailed_analysis && (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Divine Message
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {report.detailed_analysis.greeting}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/divine-dashboard')}
                    >
                      View Complete Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-accent/5 via-background to-primary/5 border-dashed border-2 border-primary/30">
              <CardContent className="flex flex-col items-center justify-center h-full py-16">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-saffron/20 rounded-full flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold">आपका विश्लेषण यहाँ दिखेगा</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    कृपया अपना नाम और जन्मतिथि भरें और "ज्योतिष रिपोर्ट प्राप्त करें" बटन दबाएं
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Numerology;