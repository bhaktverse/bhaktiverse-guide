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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sparkles, Calendar, User, Loader2, Star, Heart, Zap, Crown, 
  Brain, Target, Compass, Gem, Palette, Sun, TrendingUp, 
  ChevronRight, CheckCircle2, Database, Sparkle, Gift
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-divine relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-saffron/5 rounded-full blur-3xl" />
      </div>

      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-20 relative z-10">
        {/* Premium Hero Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6 px-8 py-3 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full border border-primary/30 backdrop-blur-xl shadow-divine">
            <Sparkle className="h-6 w-6 text-primary animate-spin-slow" />
            <span className="text-lg font-semibold bg-gradient-temple bg-clip-text text-transparent">
              अंक ज्योतिष विशेषज्ञ / Divine Numerology Expert
            </span>
            <Crown className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-6 drop-shadow-xl">
            अपना भविष्य जानें
            <span className="block text-3xl md:text-5xl mt-3 opacity-90">Discover Your Divine Destiny</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unlock the secrets of your life through ancient Vedic numerology wisdom combined with AI-powered insights
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Premium Input Form - 2 columns */}
          <Card className="lg:col-span-2 card-sacred backdrop-blur-2xl bg-gradient-to-br from-background/95 via-primary/5 to-accent/5 border-primary/30 shadow-divine-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-saffron/10 rounded-full blur-3xl -z-10" />
            
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 pb-8">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-saffron rounded-lg shadow-divine">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  आपकी जानकारी
                </CardTitle>
                <Badge className="bg-gradient-temple text-white shadow-divine animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
              <CardDescription className="text-base">
                अपना पूर्ण नाम और जन्मतिथि दें और पाएं विस्तृत विश्लेषण
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <form onSubmit={handleAnalysis} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="flex items-center gap-2 text-base font-semibold">
                    <Star className="h-4 w-4 text-primary" />
                    पूरा नाम / Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="जैसे: Harish Vaishnav"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-primary/30 h-12 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    अपना पूर्ण नाम अंग्रेजी में लिखें
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dob" className="flex items-center gap-2 text-base font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    जन्म तिथि / Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="bg-background/50 border-primary/30 h-12 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    आपकी सही जन्मतिथि आवश्यक है
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-saffron text-white text-lg font-semibold shadow-divine hover:shadow-divine-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      विश्लेषण हो रहा है...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-6 w-6" />
                      ज्योतिष रिपोर्ट प्राप्त करें
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-8" />

              {/* Premium Features List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  आपको मिलेगा / You'll Get:
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Brain, text: "Life Path, Destiny & Soul Number Analysis", color: "text-primary" },
                    { icon: Target, text: "Expression & Personality Number Insights", color: "text-accent" },
                    { icon: Gem, text: "Lucky Gemstones & Crystal Recommendations", color: "text-primary" },
                    { icon: Palette, text: "Auspicious Colors & Days for Success", color: "text-accent" },
                    { icon: Sun, text: "Personalized Mantras & Remedies", color: "text-primary" },
                    { icon: TrendingUp, text: "Career & Life Path Guidance", color: "text-accent" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-background/50 to-background/30 rounded-lg border border-border/50 hover:border-primary/30 transition-all group">
                      <feature.icon className={`h-5 w-5 ${feature.color} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                      <span className="text-sm leading-relaxed">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-around text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-xs text-muted-foreground">Reports Generated</div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div>
                    <div className="text-2xl font-bold text-accent">4.9★</div>
                    <div className="text-xs text-muted-foreground">User Rating</div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div>
                    <div className="text-2xl font-bold text-primary">AI</div>
                    <div className="text-xs text-muted-foreground">Powered</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Results Display - 3 columns */}
          {report ? (
            <Card className="lg:col-span-3 card-sacred backdrop-blur-2xl bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 border-accent/30 shadow-divine-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-temple/10 rounded-full blur-3xl -z-10" />
              
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 pb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-saffron rounded-xl shadow-divine">
                      <Sparkles className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">आपकी ज्योतिष रिपोर्ट</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {report.name} • {new Date(report.dob).toLocaleDateString('hi-IN', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {report.cached ? (
                      <Badge variant="outline" className="bg-primary/10 border-primary/50 px-4 py-2 text-sm">
                        <Database className="h-4 w-4 mr-2" />
                        Cached Report +5 XP
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-saffron text-white shadow-divine px-4 py-2 text-sm">
                        <Sparkle className="h-4 w-4 mr-2" />
                        Fresh Analysis +25 XP
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-12 bg-background/50 backdrop-blur mb-8">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-saffron data-[state=active]:text-white">
                      <Compass className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="numbers" className="data-[state=active]:bg-gradient-temple data-[state=active]:text-white">
                      <Star className="h-4 w-4 mr-2" />
                      Numbers
                    </TabsTrigger>
                    <TabsTrigger value="remedies" className="data-[state=active]:bg-gradient-saffron data-[state=active]:text-white">
                      <Heart className="h-4 w-4 mr-2" />
                      Remedies
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 animate-fade-in">
                    {/* Core Numbers Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Birth Number', value: report.birth_number, icon: Calendar, gradient: 'from-primary/20 to-primary/5', border: 'border-primary/30' },
                        { label: 'Destiny Number', value: report.destiny_number, icon: Compass, gradient: 'from-accent/20 to-accent/5', border: 'border-accent/30' },
                        { label: 'Soul Number', value: report.soul_number, icon: Heart, gradient: 'from-primary/20 to-primary/5', border: 'border-primary/30' },
                        { label: 'Expression', value: report.expression_number, icon: Star, gradient: 'from-accent/20 to-accent/5', border: 'border-accent/30' }
                      ].map((item, idx) => (
                        <Card key={idx} className={`bg-gradient-to-br ${item.gradient} border ${item.border} hover:scale-105 transition-transform duration-300 group`}>
                          <CardContent className="pt-6 pb-4 text-center">
                            <item.icon className="h-6 w-6 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                            <div className="text-4xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-2">{item.value}</div>
                            <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Divine Message */}
                    {report.detailed_analysis && (
                      <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 shadow-divine overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-saffron/5 animate-pulse" />
                        <CardContent className="pt-6 pb-6 relative">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-saffron rounded-lg shadow-divine flex-shrink-0">
                              <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg mb-3 text-primary">दिव्य संदेश / Divine Message</h4>
                              <p className="text-base leading-relaxed text-foreground/90">
                                {report.detailed_analysis.greeting}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Lucky Elements */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { label: 'Lucky Color', value: report.lucky_color, icon: Palette, gradient: 'from-primary/10 to-accent/10' },
                        { label: 'Lucky Day', value: report.lucky_day, icon: Sun, gradient: 'from-accent/10 to-primary/10' },
                        { label: 'Lucky Gemstone', value: report.lucky_gemstone, icon: Gem, gradient: 'from-primary/10 to-accent/10' }
                      ].map((item, idx) => (
                        <Card key={idx} className={`bg-gradient-to-br ${item.gradient} border-primary/20 hover:border-primary/50 transition-all group`}>
                          <CardContent className="pt-6 pb-4">
                            <div className="flex items-center justify-between mb-3">
                              <item.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                              <Badge className="bg-gradient-temple text-white text-xs">{item.label}</Badge>
                            </div>
                            <div className="text-xl font-bold text-primary">{item.value}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Numbers Tab */}
                  <TabsContent value="numbers" className="space-y-6 animate-fade-in">
                    <div className="space-y-4">
                      {[
                        { 
                          number: report.birth_number, 
                          title: 'Birth Number (जन्मांक)', 
                          description: 'Your birth date defines your natural traits and tendencies',
                          icon: Calendar,
                          color: 'text-primary'
                        },
                        { 
                          number: report.destiny_number, 
                          title: 'Destiny Number (भाग्यांक)', 
                          description: 'Your life purpose and the path you are meant to follow',
                          icon: Compass,
                          color: 'text-accent'
                        },
                        { 
                          number: report.soul_number, 
                          title: 'Soul Number (आत्मा अंक)', 
                          description: 'Your inner desires and what truly motivates you',
                          icon: Heart,
                          color: 'text-primary'
                        },
                        { 
                          number: report.expression_number, 
                          title: 'Expression Number (अभिव्यक्ति अंक)', 
                          description: 'How you express yourself and interact with the world',
                          icon: Star,
                          color: 'text-accent'
                        }
                      ].map((item, idx) => (
                        <Card key={idx} className="bg-gradient-to-r from-background/50 to-background/30 border-border/50 hover:border-primary/30 transition-all group">
                          <CardContent className="pt-6 pb-6">
                            <div className="flex items-start gap-4">
                              <div className="p-4 bg-gradient-saffron/10 rounded-xl border border-primary/20 flex-shrink-0">
                                <item.icon className={`h-8 w-8 ${item.color}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-bold text-xl">{item.title}</h4>
                                  <Badge className="text-2xl font-bold px-3 py-1">{item.number}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Remedies Tab */}
                  <TabsContent value="remedies" className="space-y-6 animate-fade-in">
                    <Card className="bg-gradient-to-br from-accent/10 via-background to-primary/10 border-accent/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-6 w-6 text-accent" />
                          आपके लिए विशेष उपाय / Special Remedies for You
                        </CardTitle>
                        <CardDescription>Follow these recommendations for positive energy</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { 
                            title: 'Mantra Recommendation', 
                            value: report.lucky_mantra || 'Om Namah Shivaya',
                            icon: Sparkles,
                            description: 'Chant this mantra 108 times daily for divine blessings'
                          },
                          { 
                            title: 'Gemstone', 
                            value: report.lucky_gemstone,
                            icon: Gem,
                            description: 'Wear this gemstone on the recommended day for maximum benefits'
                          },
                          { 
                            title: 'Lucky Color', 
                            value: report.lucky_color,
                            icon: Palette,
                            description: 'Incorporate this color in your daily life for prosperity'
                          },
                          { 
                            title: 'Auspicious Day', 
                            value: report.lucky_day,
                            icon: Calendar,
                            description: 'Best day for important decisions and new beginnings'
                          }
                        ].map((remedy, idx) => (
                          <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-accent/30 transition-all">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-temple/20 rounded-lg">
                                <remedy.icon className="h-5 w-5 text-accent" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold mb-1">{remedy.title}</div>
                                <div className="text-lg text-primary font-medium mb-2">{remedy.value}</div>
                                <p className="text-sm text-muted-foreground">{remedy.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-14 border-primary/30 hover:bg-gradient-saffron hover:text-white hover:border-transparent transition-all"
                      onClick={() => navigate('/divine-dashboard')}
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      View Complete Analysis in Dashboard
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-3 card-sacred backdrop-blur-2xl bg-gradient-to-br from-accent/5 via-background to-primary/5 border-dashed border-2 border-primary/30 hover:border-primary/50 transition-all">
              <CardContent className="flex flex-col items-center justify-center h-full py-24">
                <div className="text-center space-y-6 max-w-md">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-saffron/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-32 h-32 bg-gradient-saffron/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                      <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-temple bg-clip-text text-transparent">
                      आपका विश्लेषण यहाँ दिखेगा
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      कृपया बायीं ओर अपना नाम और जन्मतिथि भरें<br />
                      Fill your details on the left to get your divine analysis
                    </p>
                  </div>
                  <div className="pt-4">
                    <Badge variant="outline" className="px-4 py-2">
                      <Zap className="h-4 w-4 mr-2" />
                      Instant AI Analysis
                    </Badge>
                  </div>
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