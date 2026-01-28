import { useEffect, useState } from "react";
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
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [greeting, setGreeting] = useState({ text: "Namaste", icon: "🙏" });
  const [userName, setUserName] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

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
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profile) {
        setUserName(profile.name || user?.email?.split('@')[0] || 'Seeker');
        
        if (profile.streak_data && typeof profile.streak_data === 'object') {
          const streakData = profile.streak_data as any;
          setStats(prevStats => ({
            ...prevStats,
            currentStreak: streakData.current_streak || 0,
            longestStreak: streakData.longest_streak || 0
          }));
        }
      } else {
        setUserName(user?.email?.split('@')[0] || 'Seeker');
      }

      // Load spiritual journey
      const { data: journey } = await supabase
        .from('spiritual_journey')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (journey) {
        setStats(prev => ({
          ...prev,
          level: journey.level || 1,
          xp: journey.experience_points || 0
        }));
      }

      // Load today's activities
      const today = new Date().toISOString().split('T')[0];
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today);

      if (activities) {
        const todayMantras = activities
          .filter(a => a.activity_type === 'mantra_chant')
          .reduce((sum, a) => sum + ((a.activity_data as any)?.count || 0), 0);

        const todayReading = activities
          .filter(a => a.activity_type === 'scripture_read')
          .reduce((sum, a) => sum + ((a.activity_data as any)?.minutes || 0), 0);

        const todayMeditation = activities
          .filter(a => a.activity_type === 'meditation')
          .reduce((sum, a) => sum + ((a.activity_data as any)?.minutes || 0), 0);

        setStats(prev => ({
          ...prev,
          totalMantras: todayMantras,
          readingMinutes: todayReading,
          meditationMinutes: todayMeditation
        }));
      }

      // Load upcoming events
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      if (events) {
        setUpcomingEvents(events.map(event => ({
          name: event.title,
          date: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          type: event.event_type
        })));
      }

      // Set daily quote
      const quotes = [
        "The mind is everything. What you think you become. — Buddha",
        "The best way to find yourself is to lose yourself in service. — Gandhi", 
        "You are not the drop in the ocean, but the ocean in a drop. — Rumi",
        "The goal of life is to realize the Self. — Ramana Maharshi",
        "Where there is love there is life. — Mahatma Gandhi",
        "Truth is one, paths are many. — Hindu Proverb",
        "Be the change you wish to see in the world. — Gandhi"
      ];
      setTodayQuote(quotes[new Date().getDate() % quotes.length]);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setTodayQuote("Peace comes from within. Do not seek it without. — Buddha");
    } finally {
      setIsDataLoading(false);
      // Trigger entrance animations after data loads
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
    { emoji: '🧘‍♂️', label: 'Saints', path: '/saints', description: 'Chat with saints' },
    { emoji: '🙏', label: 'Daily Puja', path: '/daily-devotion', description: 'Today\'s rituals' },
    { emoji: '🎵', label: 'Mantras', path: '/audio-library', description: 'Listen & chant' },
    { emoji: '🏛️', label: 'Temples', path: '/temples', description: 'Find nearby' },
    { emoji: '📖', label: 'Scriptures', path: '/scriptures', description: 'Read & learn' },
    { emoji: '📅', label: 'Calendar', path: '/spiritual-calendar', description: 'Festivals' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Animated Content Wrapper */}
        <div className={`space-y-8 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Welcome Header */}
        <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/50 shadow-divine overflow-hidden animate-fade-in">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full -ml-24 -mb-24 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 shadow-divine border-4 border-primary/20 ring-4 ring-primary/10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-temple text-white text-2xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  <span className="text-3xl mr-2">{greeting.icon}</span>
                  <span className="bg-gradient-temple bg-clip-text text-transparent">{greeting.text}</span>
                  <span className="text-foreground">, {userName}!</span>
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Level {stats.level}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10 border-secondary/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {stats.xp} XP
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Card */}
            <div className="flex items-center gap-6 bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lotus border border-border/50">
              <div className="text-center px-4 border-r border-border/50">
                <div className="text-2xl font-bold text-primary">{stats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak 🔥</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-secondary">{overallProgress}%</div>
                <div className="text-xs text-muted-foreground">Today's Goal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Featured Services - Palm Reading & Numerology */}
            <div className="grid md:grid-cols-2 gap-4">
              {mainServices.map((service) => (
                <Card 
                  key={service.path}
                  className="group cursor-pointer hover:shadow-divine transition-all duration-300 hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-primary/30 relative"
                  onClick={() => navigate(service.path)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <service.icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{service.label}</h3>
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
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.path}
                      variant="ghost"
                      className="h-auto flex-col gap-2 p-4 hover:shadow-divine transition-all duration-300 hover:-translate-y-1 group rounded-xl"
                      onClick={() => navigate(action.path)}
                    >
                      <div className="text-3xl group-hover:scale-110 transition-transform">{action.emoji}</div>
                      <span className="text-xs font-semibold text-foreground">{action.label}</span>
                      <span className="text-[10px] text-muted-foreground hidden md:block">{action.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Goals */}
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
                    <span className="font-medium flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Flame className="h-4 w-4 text-orange-500" />
                      </div>
                      Mantras Chanted
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
                    <span className="font-medium flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                      </div>
                      Scripture Reading
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
                    <span className="font-medium flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Heart className="h-4 w-4 text-purple-500" />
                      </div>
                      Meditation
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
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 text-8xl opacity-5 -mt-4 -mr-4">✨</div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-3xl animate-sacred-float">📿</div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Today's Spiritual Wisdom
                    </h3>
                    <p className="text-foreground italic text-lg leading-relaxed">{todayQuote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
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

            {/* Premium CTA */}
            <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-pink-500/10 border-amber-500/30">
              <CardContent className="p-5 text-center">
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

      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
