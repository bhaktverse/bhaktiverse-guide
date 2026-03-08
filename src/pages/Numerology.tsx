import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sparkles, Calendar, User, Loader2, Star, Heart, Zap, Crown, 
  Brain, Target, Compass, Gem, Palette, Sun, TrendingUp, 
  ChevronRight, CheckCircle2, Database, Sparkle, Gift, Globe, History, ChevronDown
} from "lucide-react";

// i18n labels
const i18n = {
  hi: {
    pageTitle: 'अंक ज्योतिष विशेषज्ञ',
    pageSubtitle: 'अपना भविष्य जानें',
    pageSubtitleEn: 'Discover Your Divine Destiny',
    pageDesc: 'प्राचीन वैदिक अंक ज्योतिष ज्ञान के माध्यम से अपने जीवन के रहस्यों को जानें',
    yourInfo: 'आपकी जानकारी',
    yourInfoDesc: 'अपना पूर्ण नाम और जन्मतिथि दें और पाएं विस्तृत विश्लेषण',
    fullName: 'पूरा नाम / Full Name',
    namePlaceholder: 'जैसे: Harish Vaishnav',
    nameHint: 'अपना पूर्ण नाम अंग्रेजी में लिखें',
    dob: 'जन्म तिथि / Date of Birth',
    dobHint: 'आपकी सही जन्मतिथि आवश्यक है',
    analyze: 'ज्योतिष रिपोर्ट प्राप्त करें',
    analyzing: 'विश्लेषण हो रहा है...',
    youllGet: 'आपको मिलेगा / You\'ll Get:',
    features: [
      'जीवन पथ, भाग्यांक और आत्मा अंक विश्लेषण',
      'अभिव्यक्ति और व्यक्तित्व अंक अंतर्दृष्टि',
      'शुभ रत्न और क्रिस्टल सुझाव',
      'शुभ रंग और दिन',
      'व्यक्तिगत मंत्र और उपाय',
      'करियर और जीवन पथ मार्गदर्शन'
    ],
    reportTitle: 'आपकी ज्योतिष रिपोर्ट',
    overview: 'सारांश',
    numbers: 'अंक',
    remedies: 'उपाय',
    birthNum: 'जन्मांक',
    destinyNum: 'भाग्यांक',
    soulNum: 'आत्मा अंक',
    expressionNum: 'अभिव्यक्ति अंक',
    divineMessage: 'दिव्य संदेश',
    detailedAnalysis: 'विस्तृत विश्लेषण',
    personalYear: 'व्यक्तिगत वर्ष पूर्वानुमान',
    cosmicBlueprint: 'आपका 2026 का ब्रह्मांडीय खाका',
    monthlyGrid: 'मासिक ऊर्जा ग्रिड - 2026',
    luckyColor: 'शुभ रंग',
    luckyDay: 'शुभ दिन',
    luckyGemstone: 'शुभ रत्न',
    birthNumDesc: 'आपकी जन्म तिथि आपके स्वाभाविक गुणों और प्रवृत्तियों को परिभाषित करती है',
    destinyNumDesc: 'आपके जीवन का उद्देश्य और आपका अनुसरण करने योग्य मार्ग',
    soulNumDesc: 'आपकी आंतरिक इच्छाएं और जो वास्तव में आपको प्रेरित करता है',
    expressionNumDesc: 'आप कैसे अभिव्यक्त करते हैं और दुनिया के साथ कैसे जुड़ते हैं',
    specialRemedies: 'आपके लिए विशेष उपाय',
    remediesDesc: 'सकारात्मक ऊर्जा के लिए इन सुझावों का पालन करें',
    mantraRec: 'मंत्र सुझाव',
    mantraDesc: 'दिव्य आशीर्वाद के लिए इस मंत्र को 108 बार जपें',
    gemstone: 'रत्न',
    gemstoneDesc: 'अधिकतम लाभ के लिए इस रत्न को सुझाए गए दिन पहनें',
    colorLabel: 'शुभ रंग',
    colorDesc: 'समृद्धि के लिए इस रंग को अपने जीवन में शामिल करें',
    dayLabel: 'शुभ दिन',
    dayDesc: 'महत्वपूर्ण निर्णयों और नई शुरुआत के लिए सबसे अच्छा दिन',
    aiRemedies: 'AI उपाय',
    waitingTitle: 'आपका विश्लेषण यहाँ दिखेगा',
    waitingDesc: 'कृपया बायीं ओर अपना नाम और जन्मतिथि भरें',
    language: 'भाषा',
    loginFirst: 'कृपया पहले लॉगिन करें',
    fillDetails: 'कृपया नाम और जन्मतिथि भरें',
    cachedReport: 'पुराना विश्लेषण मिला! +5 XP',
    freshReport: 'नया विश्लेषण तैयार! +25 XP',
    analysisError: 'विश्लेषण में त्रुटि',
    viewDashboard: 'डैशबोर्ड में पूर्ण विश्लेषण देखें',
    lifePathTitle: '🔮 जीवन पथ विश्लेषण',
    personalityTitle: '✨ व्यक्तित्व विश्लेषण',
    strengthsTitle: '💪 शक्तियाँ',
    challengesTitle: '⚡ चुनौतियाँ',
    careerTitle: '💼 करियर मार्गदर्शन',
    relationshipsTitle: '❤️ रिश्ते',
    spiritualTitle: '🙏 आध्यात्मिक मार्ग',
  },
  en: {
    pageTitle: 'Divine Numerology Expert',
    pageSubtitle: 'Discover Your Destiny',
    pageSubtitleEn: '',
    pageDesc: 'Unlock the secrets of your life through ancient Vedic numerology wisdom combined with AI-powered insights',
    yourInfo: 'Your Information',
    yourInfoDesc: 'Enter your full name and date of birth for a detailed analysis',
    fullName: 'Full Name',
    namePlaceholder: 'e.g. Harish Vaishnav',
    nameHint: 'Enter your full name in English',
    dob: 'Date of Birth',
    dobHint: 'Your exact date of birth is required',
    analyze: 'Get Numerology Report',
    analyzing: 'Analyzing...',
    youllGet: "You'll Get:",
    features: [
      'Life Path, Destiny & Soul Number Analysis',
      'Expression & Personality Number Insights',
      'Lucky Gemstones & Crystal Recommendations',
      'Auspicious Colors & Days for Success',
      'Personalized Mantras & Remedies',
      'Career & Life Path Guidance'
    ],
    reportTitle: 'Your Numerology Report',
    overview: 'Overview',
    numbers: 'Numbers',
    remedies: 'Remedies',
    birthNum: 'Birth Number',
    destinyNum: 'Destiny Number',
    soulNum: 'Soul Number',
    expressionNum: 'Expression',
    divineMessage: 'Divine Message',
    detailedAnalysis: 'Detailed Analysis',
    personalYear: 'Personal Year Forecast',
    cosmicBlueprint: 'Your cosmic energy blueprint for 2026',
    monthlyGrid: 'Monthly Energy Grid - 2026',
    luckyColor: 'Lucky Color',
    luckyDay: 'Lucky Day',
    luckyGemstone: 'Lucky Gemstone',
    birthNumDesc: 'Your birth date defines your natural traits and tendencies',
    destinyNumDesc: 'Your life purpose and the path you are meant to follow',
    soulNumDesc: 'Your inner desires and what truly motivates you',
    expressionNumDesc: 'How you express yourself and interact with the world',
    specialRemedies: 'Special Remedies for You',
    remediesDesc: 'Follow these recommendations for positive energy',
    mantraRec: 'Mantra Recommendation',
    mantraDesc: 'Chant this mantra 108 times daily for divine blessings',
    gemstone: 'Gemstone',
    gemstoneDesc: 'Wear this gemstone on the recommended day for maximum benefits',
    colorLabel: 'Lucky Color',
    colorDesc: 'Incorporate this color in your daily life for prosperity',
    dayLabel: 'Auspicious Day',
    dayDesc: 'Best day for important decisions and new beginnings',
    aiRemedies: 'AI Remedies',
    waitingTitle: 'Your Analysis Will Appear Here',
    waitingDesc: 'Fill your details on the left to get your divine analysis',
    language: 'Language',
    loginFirst: 'Please login first',
    fillDetails: 'Please enter name and date of birth',
    cachedReport: 'Cached report found! +5 XP',
    freshReport: 'Fresh analysis ready! +25 XP',
    analysisError: 'Analysis error. Please try again.',
    viewDashboard: 'View Complete Analysis in Dashboard',
    lifePathTitle: '🔮 Life Path Analysis',
    personalityTitle: '✨ Personality Analysis',
    strengthsTitle: '💪 Strengths',
    challengesTitle: '⚡ Challenges',
    careerTitle: '💼 Career Guidance',
    relationshipsTitle: '❤️ Relationships',
    spiritualTitle: '🙏 Spiritual Path',
  }
};

const Numerology = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const t = i18n[lang];

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error(t.loginFirst);
      navigate("/auth");
      return;
    }

    if (!name || !dob) {
      toast.error(t.fillDetails);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('numerology-analysis', {
        body: { name, dob, language: lang }
      });

      if (error) throw error;

      setReport(data);
      
      // Auto-scroll to results on mobile
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      
      if (data.cached) {
        toast.success(`✨ ${t.cachedReport}`);
      } else {
        toast.success(`🎉 ${t.freshReport}`);
      }
    } catch (error: any) {
      console.error('Numerology analysis error:', error);
      toast.error(t.analysisError);
    } finally {
      setLoading(false);
    }
  };

  // Parse detailed_analysis safely
  const getAnalysis = () => {
    if (!report) return null;
    if (report.detailed_analysis && typeof report.detailed_analysis === 'object') {
      return report.detailed_analysis;
    }
    // Try parsing report_text as JSON (old format)
    try {
      if (report.report_text) return JSON.parse(report.report_text);
    } catch {}
    return null;
  };

  const analysis = report ? getAnalysis() : null;

  // Format report_text for display - if it's JSON string, render structured; otherwise show as-is
  const getFormattedReportText = () => {
    if (!report?.report_text) return null;
    // If it starts with { it's likely raw JSON — don't show
    if (report.report_text.trim().startsWith('{')) return null;
    return report.report_text;
  };

  const formattedReportText = report ? getFormattedReportText() : null;

  return (
    <div className="min-h-screen bg-gradient-divine relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-20 relative z-10">
        <Breadcrumbs className="mb-6" />

        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={lang} onValueChange={(v) => setLang(v as 'hi' | 'en')}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hi">🇮🇳 हिन्दी</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6 px-8 py-3 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full border border-primary/30 backdrop-blur-xl shadow-divine">
            <Sparkle className="h-6 w-6 text-primary animate-spin-slow" />
            <span className="text-lg font-semibold bg-gradient-temple bg-clip-text text-transparent">
              {t.pageTitle}
            </span>
            <Crown className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            {t.pageSubtitle}
            {t.pageSubtitleEn && <span className="block text-2xl md:text-4xl mt-2 opacity-90">{t.pageSubtitleEn}</span>}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.pageDesc}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Input Form - 2 columns */}
          <Card className="lg:col-span-2 card-sacred backdrop-blur-2xl bg-gradient-to-br from-background/95 via-primary/5 to-accent/5 border-primary/30 shadow-divine-lg overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 pb-8">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-saffron rounded-lg shadow-divine">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {t.yourInfo}
                </CardTitle>
                <Badge className="bg-gradient-temple text-white shadow-divine animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              </div>
              <CardDescription className="text-sm">{t.yourInfoDesc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <form onSubmit={handleAnalysis} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold">
                    <Star className="h-4 w-4 text-primary" />
                    {t.fullName}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-primary/30 h-11 text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t.nameHint}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t.dob}
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="bg-background/50 border-primary/30 h-11 text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t.dobHint}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-saffron text-white text-base font-semibold shadow-divine hover:shadow-divine-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t.analyze}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-3">
                <h3 className="font-semibold text-xs text-muted-foreground flex items-center gap-2">
                  <Gift className="h-3 w-3" />
                  {t.youllGet}
                </h3>
                <div className="space-y-2">
                  {t.features.map((feature, idx) => {
                    const icons = [Brain, Target, Gem, Palette, Sun, TrendingUp];
                    const Icon = icons[idx];
                    return (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-gradient-to-r from-background/50 to-background/30 rounded-lg border border-border/50">
                        <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-xs leading-relaxed">{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Display - 3 columns */}
          {report ? (
            <Card ref={resultsRef} className="lg:col-span-3 card-sacred backdrop-blur-2xl bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 border-accent/30 shadow-divine-lg overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 pb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-saffron rounded-xl shadow-divine">
                      <Sparkles className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{t.reportTitle}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {report.name} • {new Date(report.dob).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  {report.cached ? (
                    <Badge variant="outline" className="bg-primary/10 border-primary/50 px-3 py-1.5 text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      Cached +5 XP
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-saffron text-white shadow-divine px-3 py-1.5 text-xs">
                      <Sparkle className="h-3 w-3 mr-1" />
                      Fresh +25 XP
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-11 bg-background/50 backdrop-blur mb-6">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-saffron data-[state=active]:text-white text-sm">
                      <Compass className="h-4 w-4 mr-1.5" />
                      {t.overview}
                    </TabsTrigger>
                    <TabsTrigger value="numbers" className="data-[state=active]:bg-gradient-temple data-[state=active]:text-white text-sm">
                      <Star className="h-4 w-4 mr-1.5" />
                      {t.numbers}
                    </TabsTrigger>
                    <TabsTrigger value="remedies" className="data-[state=active]:bg-gradient-saffron data-[state=active]:text-white text-sm">
                      <Heart className="h-4 w-4 mr-1.5" />
                      {t.remedies}
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-5 animate-fade-in">
                    {/* Core Numbers Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: t.birthNum, value: report.birth_number, icon: Calendar, gradient: 'from-primary/20 to-primary/5', border: 'border-primary/30' },
                        { label: t.destinyNum, value: report.destiny_number, icon: Compass, gradient: 'from-accent/20 to-accent/5', border: 'border-accent/30' },
                        { label: t.soulNum, value: report.soul_number, icon: Heart, gradient: 'from-primary/20 to-primary/5', border: 'border-primary/30' },
                        { label: t.expressionNum, value: report.expression_number, icon: Star, gradient: 'from-accent/20 to-accent/5', border: 'border-accent/30' }
                      ].map((item, idx) => (
                        <Card key={idx} className={`bg-gradient-to-br ${item.gradient} border ${item.border} hover:scale-105 transition-transform duration-300`}>
                          <CardContent className="pt-5 pb-3 text-center">
                            <item.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <div className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-1">{item.value}</div>
                            <div className="text-[10px] text-muted-foreground font-medium">{item.label}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Divine Message */}
                    {analysis?.greeting && (
                      <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 shadow-divine">
                        <CardContent className="pt-5 pb-5">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gradient-saffron rounded-lg shadow-divine flex-shrink-0">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-base mb-2 text-primary">{t.divineMessage}</h4>
                              <p className="text-sm leading-relaxed text-foreground/90">{analysis.greeting}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Structured Detailed Analysis */}
                    {analysis && (
                      <Card className="bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 border-accent/30 shadow-divine">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Brain className="h-5 w-5 text-accent" />
                            {t.detailedAnalysis}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          {/* Life Path */}
                          {analysis.life_path && (
                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-sm text-primary">{t.lifePathTitle}</h5>
                              <p className="text-sm leading-relaxed text-foreground/85">{analysis.life_path}</p>
                            </div>
                          )}
                          
                          {/* Personality */}
                          {analysis.personality && (
                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-sm text-primary">{t.personalityTitle}</h5>
                              <p className="text-sm leading-relaxed text-foreground/85">{analysis.personality}</p>
                            </div>
                          )}

                          {/* Strengths */}
                          {analysis.strengths?.length > 0 && (
                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-sm text-primary">{t.strengthsTitle}</h5>
                              <ul className="space-y-1">
                                {analysis.strengths.map((s: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Challenges */}
                          {analysis.challenges?.length > 0 && (
                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-sm text-primary">{t.challengesTitle}</h5>
                              <ul className="space-y-1">
                                {analysis.challenges.map((c: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                                    <Zap className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Career */}
                          {analysis.career && (
                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-sm text-primary">{t.careerTitle}</h5>
                              <p className="text-sm leading-relaxed text-foreground/85">{analysis.career}</p>
                            </div>
                          )}

                          {/* Relationships */}
                          {analysis.relationships && (
                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-sm text-primary">{t.relationshipsTitle}</h5>
                              <p className="text-sm leading-relaxed text-foreground/85">{analysis.relationships}</p>
                            </div>
                          )}

                          {/* Spiritual Path */}
                          {analysis.spiritual_path && (
                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-sm text-primary">{t.spiritualTitle}</h5>
                              <p className="text-sm leading-relaxed text-foreground/85">{analysis.spiritual_path}</p>
                            </div>
                          )}

                          {/* Divine Message */}
                          {analysis.divine_message && (
                            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                              <p className="text-sm leading-relaxed text-foreground/90 italic">
                                🙏 {analysis.divine_message}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Fallback: show report_text if it's readable text (not JSON) */}
                    {!analysis && formattedReportText && (
                      <Card className="bg-gradient-to-br from-background/95 via-accent/5 to-primary/5 border-accent/30 shadow-divine">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Brain className="h-5 w-5 text-accent" />
                            {t.detailedAnalysis}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line break-words">
                            {formattedReportText}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* 2026 Personal Year */}
                    {report.dob && (() => {
                      const dobDate = new Date(report.dob);
                      const birthDay = dobDate.getDate();
                      const birthMonth = dobDate.getMonth() + 1;
                      let personalYear = birthDay + birthMonth + 2 + 0 + 2 + 6;
                      while (personalYear > 9 && personalYear !== 11 && personalYear !== 22) {
                        personalYear = String(personalYear).split('').reduce((s, d) => s + Number(d), 0);
                      }
                      const personalYearMeanings: Record<number, string> = {
                        1: lang === 'hi' ? 'नई शुरुआत, नेतृत्व। नए उद्यम शुरू करने का उत्कृष्ट वर्ष।' : 'New beginnings, leadership. An excellent year to launch new ventures.',
                        2: lang === 'hi' ? 'साझेदारी, धैर्य, कूटनीति। रिश्तों पर ध्यान दें।' : 'Partnerships, patience, diplomacy. Focus on relationships.',
                        3: lang === 'hi' ? 'रचनात्मकता, आत्म-अभिव्यक्ति, आनंद का वर्ष।' : 'Creativity, self-expression, joy. A year of artistic growth.',
                        4: lang === 'hi' ? 'नींव बनाना, कड़ी मेहनत, अनुशासन।' : 'Foundation building, hard work, discipline.',
                        5: lang === 'hi' ? 'परिवर्तन, स्वतंत्रता, रोमांच। रोमांचक बदलाव।' : 'Change, freedom, adventure. Exciting transitions.',
                        6: lang === 'hi' ? 'घर, परिवार, जिम्मेदारी। पारिवारिक सामंजस्य।' : 'Home, family, responsibility. Domestic harmony.',
                        7: lang === 'hi' ? 'आध्यात्मिकता, आत्मनिरीक्षण, ज्ञान।' : 'Spirituality, introspection, wisdom.',
                        8: lang === 'hi' ? 'समृद्धि, शक्ति, उपलब्धि का वर्ष।' : 'Abundance, power, achievement.',
                        9: lang === 'hi' ? 'पूर्णता, मुक्ति। चक्र समाप्त करें।' : 'Completion, release, humanitarianism.',
                        11: lang === 'hi' ? 'आध्यात्मिक जागृति। मास्टर नंबर वर्ष।' : 'Spiritual awakening. Master number year.',
                        22: lang === 'hi' ? 'मास्टर बिल्डर। कुछ स्थायी बनाएं।' : 'Master builder. Build something lasting.',
                      };
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const monthEnergies = months.map((m, i) => ({ month: m, energy: (personalYear + (i + 1)) % 9 || 9 }));

                      return (
                        <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/30 shadow-divine">
                          <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <TrendingUp className="h-5 w-5 text-primary" />
                              2026 {t.personalYear}
                            </CardTitle>
                            <CardDescription className="text-xs">{t.cosmicBlueprint}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-5 space-y-5">
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                              <div className="text-4xl font-bold bg-gradient-temple bg-clip-text text-transparent">{personalYear}</div>
                              <div>
                                <div className="font-semibold text-primary text-sm">Personal Year {personalYear}</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {personalYearMeanings[personalYear] || 'A transformative year of growth.'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-xs text-muted-foreground uppercase tracking-wider">{t.monthlyGrid}</h4>
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {monthEnergies.map((me) => (
                                  <div key={me.month} className="text-center p-2 bg-card/80 rounded-lg border border-border/50 hover:border-primary/30 transition-all">
                                    <div className="text-[10px] text-muted-foreground font-medium">{me.month}</div>
                                    <div className={`text-lg font-bold mt-0.5 ${me.energy >= 7 ? 'text-green-500' : me.energy >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
                                      {me.energy}
                                    </div>
                                    <div className="h-1 mt-0.5 rounded-full bg-muted overflow-hidden">
                                      <div className={`h-full rounded-full ${me.energy >= 7 ? 'bg-green-500' : me.energy >= 4 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(me.energy / 9) * 100}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Lucky Elements */}
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        { label: t.luckyColor, value: report.lucky_color, icon: Palette },
                        { label: t.luckyDay, value: report.lucky_day, icon: Sun },
                        { label: t.luckyGemstone, value: report.lucky_gemstone, icon: Gem }
                      ].map((item, idx) => (
                        <Card key={idx} className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:border-primary/50 transition-all">
                          <CardContent className="pt-5 pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <item.icon className="h-4 w-4 text-primary" />
                              <Badge className="bg-gradient-temple text-white text-[10px]">{item.label}</Badge>
                            </div>
                            <div className="text-lg font-bold text-primary">{item.value}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Numbers Tab */}
                  <TabsContent value="numbers" className="space-y-4 animate-fade-in">
                    <div className="space-y-3">
                      {[
                        { number: report.birth_number, title: t.birthNum, description: t.birthNumDesc, icon: Calendar, color: 'text-primary' },
                        { number: report.destiny_number, title: t.destinyNum, description: t.destinyNumDesc, icon: Compass, color: 'text-accent' },
                        { number: report.soul_number, title: t.soulNum, description: t.soulNumDesc, icon: Heart, color: 'text-primary' },
                        { number: report.expression_number, title: t.expressionNum, description: t.expressionNumDesc, icon: Star, color: 'text-accent' }
                      ].map((item, idx) => (
                        <Card key={idx} className="bg-gradient-to-r from-background/50 to-background/30 border-border/50 hover:border-primary/30 transition-all">
                          <CardContent className="pt-5 pb-5">
                            <div className="flex items-start gap-3">
                              <div className="p-3 bg-gradient-saffron/10 rounded-xl border border-primary/20 flex-shrink-0">
                                <item.icon className={`h-7 w-7 ${item.color}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h4 className="font-bold text-lg">{item.title}</h4>
                                  <Badge className="text-xl font-bold px-2.5 py-0.5">{item.number}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                
                                {/* Show analysis-specific info for this number */}
                                {analysis && (
                                  <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                      {idx === 0 && analysis.personality && analysis.personality.substring(0, 200) + '...'}
                                      {idx === 1 && analysis.life_path && analysis.life_path.substring(0, 200) + '...'}
                                      {idx === 2 && analysis.spiritual_path && analysis.spiritual_path.substring(0, 200) + '...'}
                                      {idx === 3 && analysis.career && analysis.career.substring(0, 200) + '...'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Personality Number */}
                    {report.personality_number && (
                      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
                        <CardContent className="pt-5 pb-5">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-temple/10 rounded-xl border border-accent/20">
                              <Crown className="h-7 w-7 text-accent" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg">{lang === 'hi' ? 'व्यक्तित्व अंक' : 'Personality Number'}</h4>
                                <Badge className="text-xl font-bold px-2.5 py-0.5">{report.personality_number}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {lang === 'hi' ? 'आप दूसरों को कैसे दिखाई देते हैं' : 'How others perceive you'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Remedies Tab */}
                  <TabsContent value="remedies" className="space-y-5 animate-fade-in">
                    <Card className="bg-gradient-to-br from-accent/10 via-background to-primary/10 border-accent/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Heart className="h-5 w-5 text-accent" />
                          {t.specialRemedies}
                        </CardTitle>
                        <CardDescription className="text-sm">{t.remediesDesc}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { title: t.mantraRec, value: report.lucky_mantra || 'Om Namah Shivaya', icon: Sparkles, description: t.mantraDesc },
                          { title: t.gemstone, value: report.lucky_gemstone, icon: Gem, description: t.gemstoneDesc },
                          { title: t.colorLabel, value: report.lucky_color, icon: Palette, description: t.colorDesc },
                          { title: t.dayLabel, value: report.lucky_day, icon: Calendar, description: t.dayDesc }
                        ].map((remedy, idx) => (
                          <div key={idx} className="p-3 bg-background/50 rounded-lg border border-border/50 hover:border-accent/30 transition-all">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-temple/20 rounded-lg">
                                <remedy.icon className="h-4 w-4 text-accent" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm mb-0.5">{remedy.title}</div>
                                <div className="text-base text-primary font-medium mb-1">{remedy.value}</div>
                                <p className="text-xs text-muted-foreground">{remedy.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* AI Remedies from analysis */}
                    {analysis?.remedies?.length > 0 && (
                      <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Brain className="h-5 w-5 text-primary" />
                            {t.aiRemedies}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {analysis.remedies.map((remedy: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                              <div className="w-6 h-6 bg-gradient-saffron rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-foreground/85 leading-relaxed">{remedy}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Also show array remedies from report.remedies if it's different from analysis.remedies */}
                    {!analysis?.remedies?.length && Array.isArray(report.remedies) && report.remedies.length > 0 && (
                      <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Brain className="h-5 w-5 text-primary" />
                            {t.aiRemedies}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {report.remedies.map((remedy: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                              <div className="w-6 h-6 bg-gradient-saffron rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-foreground/85 leading-relaxed">{remedy}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-12 border-primary/30 hover:bg-gradient-saffron hover:text-white hover:border-transparent transition-all"
                      onClick={() => navigate('/dashboard')}
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      {t.viewDashboard}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-3 card-sacred backdrop-blur-2xl bg-gradient-to-br from-accent/5 via-background to-primary/5 border-dashed border-2 border-primary/30 hover:border-primary/50 transition-all">
              <CardContent className="flex flex-col items-center justify-center h-full py-20">
                <div className="text-center space-y-5 max-w-md">
                  <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 bg-gradient-saffron/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-28 h-28 bg-gradient-saffron/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                      <Sparkles className="h-14 w-14 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-temple bg-clip-text text-transparent">
                      {t.waitingTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.waitingDesc}
                    </p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1.5">
                    <Zap className="h-3 w-3 mr-1" />
                    Instant AI Analysis
                  </Badge>
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
