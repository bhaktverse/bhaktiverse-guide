import { useEffect, useState, lazy, Suspense } from "react";
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ScrollToTop from "@/components/ScrollToTop";
import { 
  Calendar, 
  BookOpen, 
  Heart, 
  Flame, 
  Target, 
  Trophy, 
  Star, 
  Sparkles,
  Hand,
  Binary,
  Music,
  MapPin,
  Users,
  ArrowRight,
  Zap,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  Gift,
  Crown,
  Scroll,
  Play,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import OnboardingWizard from "@/components/OnboardingWizard";

interface DailyDevotion {
  id: string;
  deity: string;
  color: string | null;
  mantra: string | null;
  planet: string;
  day_of_week: number;
  benefits: string | null;
}

interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalMantras: number;
  readingMinutes: number;
  meditationMinutes: number;
  level: number;
  xp: number;
  dailyGoals: {
    mantras: number;
    reading_minutes: number;
    meditation_minutes: number;
  };
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalMantras: 0,
    readingMinutes: 0,
    meditationMinutes: 0,
    level: 1,
    xp: 0,
    dailyGoals: {
      mantras: 108,
      reading_minutes: 15,
      meditation_minutes: 10
    }
  });
  const [todayQuote, setTodayQuote] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [bhaktiShorts, setBhaktiShorts] = useState<any[]>([]);
  const [greeting, setGreeting] = useState({ text: "Namaste", icon: "🙏" });
  const [userName, setUserName] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [todayDevotion, setTodayDevotion] = useState<DailyDevotion | null>(null);
  const [sadhanaLoading, setSadhanaLoading] = useState<string | null>(null);
  const [lastPalmReadingDate, setLastPalmReadingDate] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [aiCreditsUsed, setAiCreditsUsed] = useState(0);
  const [continueItems, setContinueItems] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({ text: "शुभ प्रभात", icon: "🌅" });
    } else if (hour < 17) {
      setGreeting({ text: "नमस्ते", icon: "🙏" });
    } else {
      setGreeting({ text: "शुभ संध्या", icon: "🌆" });
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsDataLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // All independent queries in a single Promise.all
      const [profileRes, journeyRes, activitiesRes, usageRes, lastPalmRes, eventsRes, shortsRes, devotionRes, quoteRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle(),
        supabase.from('spiritual_journey').select('*').eq('user_id', user?.id).maybeSingle(),
        supabase.from('user_activities').select('*').eq('user_id', user?.id).gte('created_at', today),
        supabase.from('user_api_usage').select('call_count').eq('user_id', user?.id).eq('usage_date', today),
        supabase.from('palm_reading_history').select('created_at').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('calendar_events').select('*').gte('date', today).order('date', { ascending: true }).limit(3),
        supabase.from('bhakti_shorts').select('*').eq('approved', true).eq('featured', true).order('created_at', { ascending: false }).limit(6),
        supabase.from('daily_devotions').select('*').eq('day_of_week', new Date().getDay()).maybeSingle(),
        supabase.from('spiritual_content').select('content, title').eq('category', 'teaching').limit(20),
      ]);

      // Process profile
      try {
        const profile = profileRes.data;
        if (profile) {
          setUserName(profile.name || user?.email?.split('@')[0] || 'Seeker');
          setUserAvatarUrl(profile.avatar_url || null);
          const deities = profile.favorite_deities as any[];
          if (!deities || deities.length === 0) setShowOnboarding(true);
          if (profile.streak_data && typeof profile.streak_data === 'object') {
            const streakData = profile.streak_data as any;
            setStats(prev => ({ ...prev, currentStreak: streakData.current_streak || 0, longestStreak: streakData.longest_streak || 0 }));
          }
        } else {
          setUserName(user?.email?.split('@')[0] || 'Seeker');
          setShowOnboarding(true);
        }
      } catch (e) { console.error('Profile processing failed:', e); }

      // Process journey
      try {
        if (journeyRes.data) {
          setStats(prev => ({ ...prev, level: journeyRes.data.level || 1, xp: journeyRes.data.experience_points || 0 }));
        }
      } catch (e) { console.error('Journey processing failed:', e); }

      // Process activities
      try {
        if (activitiesRes.data) {
          const activities = activitiesRes.data;
          const todayMantras = activities.filter(a => a.activity_type === 'mantra_chant').reduce((sum, a) => sum + ((a.activity_data as any)?.count || 0), 0);
          const todayReading = activities.filter(a => a.activity_type === 'scripture_read').reduce((sum, a) => sum + ((a.activity_data as any)?.minutes || 0), 0);
          const todayMeditation = activities.filter(a => a.activity_type === 'meditation').reduce((sum, a) => sum + ((a.activity_data as any)?.minutes || 0), 0);
          setStats(prev => ({ ...prev, totalMantras: todayMantras, readingMinutes: todayReading, meditationMinutes: todayMeditation }));
        }
      } catch (e) { console.error('Activities processing failed:', e); }

      // Process usage
      try {
        if (usageRes.data) {
          setAiCreditsUsed(usageRes.data.reduce((sum, row) => sum + row.call_count, 0));
        }
      } catch (e) { console.error('Usage processing failed:', e); }

      // Process palm
      try {
        if (lastPalmRes.data?.created_at) setLastPalmReadingDate(lastPalmRes.data.created_at);
      } catch (e) { console.error('Palm processing failed:', e); }

      // Process events
      try {
        if (eventsRes.data) {
          setUpcomingEvents(eventsRes.data.map(event => ({
            name: event.title,
            date: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            type: event.event_type
          })));
        }
      } catch (e) { console.error('Events processing failed:', e); }

      // Process shorts
      try {
        if (shortsRes.data) setBhaktiShorts(shortsRes.data);
      } catch (e) { console.error('Shorts processing failed:', e); }

      // Process devotion
      try {
        if (devotionRes.data) setTodayDevotion(devotionRes.data as DailyDevotion);
      } catch (e) { console.error('Devotion processing failed:', e); }

      // Process quote
      try {
        const quoteData = quoteRes.data;
        if (quoteData && quoteData.length > 0) {
          const randomQuote = quoteData[new Date().getDate() % quoteData.length];
          setTodayQuote(randomQuote.title ? `${randomQuote.content} — ${randomQuote.title}` : randomQuote.content);
        } else {
          const fallbackQuotes = [
            "The mind is everything. What you think you become. — Buddha",
            "The best way to find yourself is to lose yourself in service. — Gandhi",
            "Truth is one, paths are many. — Hindu Proverb",
          ];
          setTodayQuote(fallbackQuotes[new Date().getDate() % fallbackQuotes.length]);
        }
      } catch (e) { console.error('Quote processing failed:', e); }

      // Batch 3: Continue Your Journey items (depends on user, has nested queries)
      const items: any[] = [];
      
      const [chatSessionsRes, scriptureProgressRes] = await Promise.all([
        supabase.from('ai_chat_sessions').select('id, context_data, last_activity').eq('user_id', user?.id).eq('session_type', 'saint_specific').order('last_activity', { ascending: false }).limit(2),
        supabase.from('user_progress').select('content_id, progress_percentage, last_accessed').eq('user_id', user?.id).eq('content_type', 'scripture').eq('completed', false).order('last_accessed', { ascending: false }).limit(1),
      ]);

      // Process chat sessions — gather saint IDs and batch-fetch
      if (chatSessionsRes.data) {
        const saintIds = chatSessionsRes.data
          .map(s => (s.context_data as any)?.saint_id)
          .filter(Boolean);
        
        if (saintIds.length > 0) {
          const { data: saints } = await supabase
            .from('saints')
            .select('id, name')
            .in('id', saintIds);
          
          const saintMap = new Map(saints?.map(s => [s.id, s.name]) || []);
          
          for (const session of chatSessionsRes.data) {
            const saintId = (session.context_data as any)?.saint_id;
            const saintName = saintMap.get(saintId);
            if (saintName) {
              const diff = Math.floor((Date.now() - new Date(session.last_activity || '').getTime()) / 60000);
              const timeAgo = diff < 60 ? `${diff}m ago` : diff < 1440 ? `${Math.floor(diff / 60)}h ago` : `${Math.floor(diff / 1440)}d ago`;
              items.push({ icon: '🧘', title: `Chat with ${saintName}`, subtitle: timeAgo, path: `/saints/${saintId}/chat` });
            }
          }
        }
      }

      // Process scripture progress
      if (scriptureProgressRes.data && scriptureProgressRes.data.length > 0) {
        const sp = scriptureProgressRes.data[0];
        const { data: scripture } = await supabase.from('scriptures').select('title').eq('id', sp.content_id).maybeSingle();
        if (scripture) {
          items.push({ icon: '📖', title: scripture.title, subtitle: `${sp.progress_percentage}% done`, path: `/scriptures/${sp.content_id}` });
        }
      }

      setContinueItems(items.slice(0, 3));
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setTodayQuote("Peace comes from within. Do not seek it without. — Buddha");
    } finally {
      setIsDataLoading(false);
      setTimeout(() => setAnimateIn(true), 100);
    }
  };

  if (authLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-7xl">
          <Breadcrumbs className="mb-6" />
          <DashboardSkeleton />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
  }

  const mantrasProgress = Math.min((stats.totalMantras / stats.dailyGoals.mantras) * 100, 100);
  const readingProgress = Math.min((stats.readingMinutes / stats.dailyGoals.reading_minutes) * 100, 100);
  const meditationProgress = Math.min((stats.meditationMinutes / stats.dailyGoals.meditation_minutes) * 100, 100);
  const overallProgress = Math.round((mantrasProgress + readingProgress + meditationProgress) / 3);

  // Featured services - main actions
  const mainServices = [
    { 
      icon: Hand, 
      emoji: '🤚',
      label: 'AI Palm Reading', 
      description: 'Get personalized destiny insights from AI Guru',
      path: '/palm-reading', 
      gradient: 'from-purple-500 to-pink-500',
      featured: true,
      badge: 'Most Popular'
    },
    { 
      icon: Binary, 
      emoji: '🔮',
      label: 'Vedic Numerology', 
      description: 'Discover your life path through sacred numbers',
      path: '/numerology', 
      gradient: 'from-blue-500 to-indigo-500',
      featured: true,
      badge: 'New'
    },
  ];

  // Quick action grid
  const quickActions = [
    { emoji: '❤️', label: 'Favorites', path: '/favorites', description: 'Saved items' },
    { emoji: '🧘‍♂️', label: 'Saints', path: '/saints', description: 'Chat with saints' },
    { emoji: '🙏', label: 'Daily Puja', path: '/daily-devotion', description: 'Today\'s rituals' },
    { emoji: '🎵', label: 'Mantras', path: '/audio-library', description: 'Listen & chant' },
    { emoji: '🏛️', label: 'Temples', path: '/temples', description: 'Find nearby' },
    { emoji: '📖', label: 'Scriptures', path: '/scriptures', description: 'Read & learn' },
    { emoji: '📅', label: 'Calendar', path: '/spiritual-calendar', description: 'Festivals' },
    { emoji: '🌟', label: 'Horoscope', path: '/horoscope', description: 'Daily prediction' },
    { emoji: '💑', label: 'Kundali', path: '/kundali-match', description: 'Match making' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Animated Content Wrapper */}
        <div className={`space-y-5 sm:space-y-8 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Welcome Header */}
        <div className="relative p-3 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/50 shadow-divine overflow-hidden animate-fade-in">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 shadow-divine border-2 sm:border-4 border-primary/20 ring-2 sm:ring-4 ring-primary/10 flex-shrink-0">
                <AvatarImage src={userAvatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-temple text-white text-2xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
               <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">
                  <span className="text-xl sm:text-3xl mr-1 sm:mr-2">{greeting.icon}</span>
                  <span className="bg-gradient-temple bg-clip-text text-transparent">{greeting.text}</span>
                  <span className="text-foreground">, {userName}!</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Level {stats.level}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10 border-secondary/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {stats.xp} XP
                  </Badge>
                  <Badge variant="outline" className={`${aiCreditsUsed >= 18 ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-primary/10 border-primary/30'}`}>
                    <Zap className="h-3 w-3 mr-1" />
                    AI: {aiCreditsUsed}/20
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Card */}
            <div className="flex items-center gap-4 sm:gap-6 bg-card/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-lotus border border-border/50 w-full md:w-auto">
              <div className="text-center flex-1 md:flex-none px-2 sm:px-4 border-r border-border/50">
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.currentStreak}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Day Streak 🔥</div>
              </div>
              <div className="text-center flex-1 md:flex-none px-2 sm:px-4">
                <div className="text-xl sm:text-2xl font-bold text-secondary">{overallProgress}%</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Today's Goal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Sadhana Widget */}
        {todayDevotion && (
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-card via-card to-primary/5">
            <div className="h-1 bg-gradient-temple" />
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-temple flex items-center justify-center text-2xl sm:text-3xl shadow-divine flex-shrink-0">
                    🙏
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg flex flex-wrap items-center gap-1 sm:gap-2">
                      <Flame className="h-5 w-5 text-primary" />
                      Daily Sadhana
                      {stats.currentStreak > 0 && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                          🔥 {stats.currentStreak} Day Streak
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Today's Deity: <span className="font-semibold text-foreground">{todayDevotion.deity}</span>
                      {todayDevotion.color && (
                        <> • Color: <span className="font-semibold" style={{ color: todayDevotion.color === 'Red' ? '#ef4444' : todayDevotion.color === 'Yellow' ? '#eab308' : todayDevotion.color === 'Green' ? '#22c55e' : todayDevotion.color === 'White' ? '#94a3b8' : todayDevotion.color === 'Orange' ? '#f97316' : todayDevotion.color === 'Blue' ? '#3b82f6' : todayDevotion.color === 'Black' ? '#64748b' : 'inherit' }}>{todayDevotion.color}</span></>
                      )}
                    </p>
                    {todayDevotion.mantra && (
                      <p className="text-xs text-primary font-medium mt-1 italic">🕉️ {todayDevotion.mantra}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {[
                    { label: 'Chant 108', type: 'mantra_chant' as const, data: { count: 108, mantra: todayDevotion.mantra || 'Om' }, points: 10, icon: '📿' },
                    { label: 'Read 15 min', type: 'scripture_read' as const, data: { minutes: 15 }, points: 15, icon: '📖' },
                    { label: 'Meditate', type: 'meditation' as const, data: { minutes: 10 }, points: 10, icon: '🧘' },
                  ].map((action) => (
                    <Button
                      key={action.type}
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0 sm:min-w-[80px] sm:flex-none gap-1 text-[10px] sm:text-xs h-9 hover:bg-primary/10 hover:border-primary/30"
                      disabled={sadhanaLoading === action.type}
                      onClick={async () => {
                        if (!user) return;
                        setSadhanaLoading(action.type);
                        try {
                          await supabase.from('user_activities').insert({
                            user_id: user.id,
                            activity_type: action.type,
                            activity_data: action.data,
                            points_earned: action.points,
                            streak_contribution: true,
                          });
                          // Update local stats
                          setStats(prev => ({
                            ...prev,
                            totalMantras: action.type === 'mantra_chant' ? prev.totalMantras + 108 : prev.totalMantras,
                            readingMinutes: action.type === 'scripture_read' ? prev.readingMinutes + 15 : prev.readingMinutes,
                            meditationMinutes: action.type === 'meditation' ? prev.meditationMinutes + 10 : prev.meditationMinutes,
                          }));
                        } catch (e) {
                          console.error('Sadhana action error:', e);
                        } finally {
                          setSadhanaLoading(null);
                        }
                      }}
                    >
                      {sadhanaLoading === action.type ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>{action.icon}</span>}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Your Journey */}
        {continueItems.length > 0 && (
          <Card className="card-sacred">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Continue Your Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                {continueItems.map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="flex-shrink-0 h-auto py-2.5 px-3 sm:py-3 sm:px-4 gap-2 sm:gap-3 hover:shadow-divine transition-all hover:-translate-y-0.5 snap-start"
                    onClick={() => navigate(item.path)}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
            
            {/* Featured Services - Palm Reading & Numerology */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {mainServices.map((service) => (
                <Card 
                  key={service.path}
                  className="group cursor-pointer hover:shadow-divine transition-all duration-300 hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-primary/30 relative"
                  onClick={() => navigate(service.path)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardContent className="p-4 sm:p-6 relative z-10">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <service.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors">{service.label}</h3>
                          {service.badge && (
                            <Badge className={`text-xs ${service.badge === 'Most Popular' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-green-500/20 text-green-600'}`}>
                              {service.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        <Button size="sm" variant="ghost" className="gap-1 p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent">
                          Get Reading <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <Card className="card-sacred">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.path}
                      variant="ghost"
                      className="h-auto flex-col gap-1.5 sm:gap-2 p-2 sm:p-4 hover:shadow-divine transition-all duration-300 hover:-translate-y-1 group rounded-xl min-w-0"
                      onClick={() => navigate(action.path)}
                    >
                      <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{action.emoji}</div>
                      <span className="text-[10px] sm:text-xs font-semibold text-foreground truncate w-full text-center">{action.label}</span>
                      <span className="text-[10px] text-muted-foreground hidden md:block">{action.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bhakti Shorts */}
            {bhaktiShorts.length > 0 && (
              <Card className="card-sacred">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-primary" />
                      Bhakti Shorts 🎬
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border -mx-1 px-1">
                    {bhaktiShorts.map((short) => {
                      const extractVideoId = (url: string) => {
                        const match = url.match(/(?:shorts\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                        return match ? match[1] : null;
                      };
                      const videoId = extractVideoId(short.video_url);
                      const thumbnail = short.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

                      return (
                        <a
                          key={short.id}
                          href={short.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-28 sm:w-36 group cursor-pointer"
                        >
                          <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-sm group-hover:shadow-divine transition-all duration-300 group-hover:-translate-y-1">
                            <AspectRatio ratio={9 / 16}>
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt={short.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">🎬</div>
                              )}
                            </AspectRatio>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                              <p className="text-white text-xs font-medium line-clamp-2">{short.title}</p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-primary/90 rounded-full p-2">
                                <Play className="h-5 w-5 text-primary-foreground fill-current" />
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="card-sacred">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Today's Spiritual Goals
                  </CardTitle>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    {overallProgress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Mantras */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2 min-w-0">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10 flex-shrink-0">
                        <Flame className="h-4 w-4 text-orange-500" />
                      </div>
                      <span className="truncate">Mantras Chanted</span>
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {stats.totalMantras}/{stats.dailyGoals.mantras}
                    </span>
                  </div>
                  <Progress value={mantrasProgress} className="h-2" />
                </div>

                {/* Reading */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2 min-w-0">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="truncate">Scripture Reading</span>
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {stats.readingMinutes}/{stats.dailyGoals.reading_minutes} min
                    </span>
                  </div>
                  <Progress value={readingProgress} className="h-2" />
                </div>

                {/* Meditation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2 min-w-0">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                        <Heart className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="truncate">Meditation</span>
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {stats.meditationMinutes}/{stats.dailyGoals.meditation_minutes} min
                    </span>
                  </div>
                  <Progress value={meditationProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Today's Wisdom Quote */}
            <Card className="bg-gradient-to-r from-card via-card-sacred to-card border-primary/20 shadow-lotus overflow-hidden">
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 text-6xl sm:text-8xl opacity-5 -mt-4 -mr-4">✨</div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 text-2xl sm:text-3xl animate-sacred-float">📿</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Today's Spiritual Wisdom
                    </h3>
                    <p className="text-foreground italic text-sm sm:text-base md:text-lg leading-relaxed break-words">{todayQuote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            {/* Progress & Events side by side on small-medium, stacked on mobile and lg */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
            {/* Streak & Level Card */}
            <Card className="card-sacred overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl">
                  <div className="text-4xl font-bold text-amber-500">{stats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold text-primary">{stats.level}</div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold text-secondary">{stats.xp}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
                
                <div className="text-center pt-2">
                  <div className="text-sm text-muted-foreground mb-1">Longest Streak</div>
                  <div className="font-semibold">{stats.longestStreak} days</div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.name}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full text-primary"
                      onClick={() => navigate('/spiritual-calendar')}
                    >
                      View Calendar <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No upcoming events</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="mt-2 text-primary"
                      onClick={() => navigate('/spiritual-calendar')}
                    >
                      Explore Calendar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </div> {/* End Progress & Events grid */}

            {/* Palm Re-scan Reminder */}
            {lastPalmReadingDate && (() => {
              const daysSince = Math.floor((Date.now() - new Date(lastPalmReadingDate).getTime()) / (1000 * 60 * 60 * 24));
              if (daysSince < 90) return null;
              const monthsSince = Math.floor(daysSince / 30);
              return (
                <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-secondary/5 overflow-hidden">
                  <div className="h-1 bg-gradient-temple" />
                  <CardContent className="p-5 text-center">
                    <div className="text-4xl mb-3">🤚</div>
                    <h3 className="font-bold text-base mb-1">Time for a Re-scan!</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Your last palm reading was <span className="font-semibold text-foreground">{monthsSince} months ago</span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Compare how your spiritual growth is reflected in your palm lines
                    </p>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => navigate('/palm-reading')}
                    >
                      <Hand className="h-4 w-4" />
                      Re-scan & Compare
                    </Button>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Premium CTA */}
            <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-pink-500/10 border-amber-500/30">
              <CardContent className="p-4 sm:p-5 text-center">
                <Crown className="h-10 w-10 mx-auto mb-3 text-amber-500" />
                <h3 className="font-bold text-lg mb-1">Unlock Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get detailed readings, PDF reports, and exclusive features
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => navigate('/premium')}
                >
                  Upgrade Now <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div> {/* End animated wrapper */}
      </div>

      <ScrollToTop />
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
