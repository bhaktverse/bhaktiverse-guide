import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  Calendar, 
  BookOpen, 
  Heart, 
  Flame, 
  Target, 
  Trophy, 
  Star, 
  Clock, 
  Sparkles,
  Hand,
  Binary,
  Music,
  MapPin,
  Users,
  ArrowRight,
  TrendingUp,
  Zap,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalMantras: number;
  readingMinutes: number;
  meditationMinutes: number;
  dailyGoals: {
    mantras: number;
    reading_minutes: number;
    meditation_minutes: number;
  };
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalMantras: 0,
    readingMinutes: 0,
    meditationMinutes: 0,
    dailyGoals: {
      mantras: 108,
      reading_minutes: 15,
      meditation_minutes: 10
    }
  });
  const [todayQuote, setTodayQuote] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Namaste");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("शुभ प्रभात");
    else if (hour < 17) setGreeting("नमस्ते");
    else setGreeting("शुभ संध्या");
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profile?.streak_data && typeof profile.streak_data === 'object') {
        const streakData = profile.streak_data as any;
        setStats(prevStats => ({
          ...prevStats,
          currentStreak: streakData.current_streak || 0,
          longestStreak: streakData.longest_streak || 0
        }));
      }

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
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🕉️</div>
          <p className="text-muted-foreground">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  const mantrasProgress = Math.min((stats.totalMantras / stats.dailyGoals.mantras) * 100, 100);
  const readingProgress = Math.min((stats.readingMinutes / stats.dailyGoals.reading_minutes) * 100, 100);
  const meditationProgress = Math.min((stats.meditationMinutes / stats.dailyGoals.meditation_minutes) * 100, 100);
  const overallProgress = Math.round((mantrasProgress + readingProgress + meditationProgress) / 3);

  const quickActions = [
    { icon: '🤚', label: 'Palm Reading', path: '/palm-reading', color: 'from-purple-500 to-pink-500' },
    { icon: '🔮', label: 'Numerology', path: '/numerology', color: 'from-blue-500 to-indigo-500' },
    { icon: '🧘‍♂️', label: 'Saints', path: '/saints', color: 'from-orange-500 to-amber-500' },
    { icon: '🙏', label: 'Daily Devotion', path: '/daily-devotion', color: 'from-rose-500 to-red-500' },
    { icon: '🎵', label: 'Audio', path: '/audio-library', color: 'from-green-500 to-emerald-500' },
    { icon: '🏛️', label: 'Temples', path: '/temples', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Welcome Header with Gradient */}
        <div className="relative mb-8 p-6 md:p-8 rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-card" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 shadow-divine border-4 border-primary/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-temple text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  <span className="bg-gradient-temple bg-clip-text text-transparent">{greeting}</span>
                  <span className="text-foreground">, Seeker! 🙏</span>
                </h1>
                <p className="text-muted-foreground mt-1">Continue your spiritual journey with devotion</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lotus">
              <div className="text-center px-4 border-r border-border/50">
                <div className="text-2xl font-bold text-primary">{stats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-secondary">{overallProgress}%</div>
                <div className="text-xs text-muted-foreground">Today's Goal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Inspiration Quote */}
        <Card className="mb-8 bg-gradient-to-r from-card via-card-sacred to-card border-primary/20 shadow-lotus overflow-hidden">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Grid */}
            <Card className="card-sacred">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Jump into your spiritual practices</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/premium')} className="text-primary">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.path}
                      variant="ghost"
                      className="h-auto flex-col gap-2 p-4 hover:shadow-divine transition-all duration-300 hover:-translate-y-1 group"
                      onClick={() => navigate(action.path)}
                    >
                      <div className={`text-2xl group-hover:scale-110 transition-transform`}>{action.icon}</div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Progress */}
            <Card className="card-sacred">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Today's Spiritual Goals
                    </CardTitle>
                    <CardDescription>Track your daily practices</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    {overallProgress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mantras */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Flame className="h-4 w-4 text-orange-500" />
                      </div>
                      Mantras Chanted
                    </span>
                    <span className="text-sm font-semibold">
                      {stats.totalMantras}/{stats.dailyGoals.mantras}
                    </span>
                  </div>
                  <Progress value={mantrasProgress} className="h-3" />
                </div>

                {/* Reading */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                      </div>
                      Scripture Reading
                    </span>
                    <span className="text-sm font-semibold">
                      {stats.readingMinutes}/{stats.dailyGoals.reading_minutes} min
                    </span>
                  </div>
                  <Progress value={readingProgress} className="h-3" />
                </div>

                {/* Meditation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Heart className="h-4 w-4 text-purple-500" />
                      </div>
                      Meditation
                    </span>
                    <span className="text-sm font-semibold">
                      {stats.meditationMinutes}/{stats.dailyGoals.meditation_minutes} min
                    </span>
                  </div>
                  <Progress value={meditationProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Featured Services */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className="group card-sacred cursor-pointer hover:shadow-divine transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => navigate('/palm-reading')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                      <Hand className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">AI Palm Reading</h3>
                      <p className="text-sm text-muted-foreground">Discover your destiny</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="group card-sacred cursor-pointer hover:shadow-divine transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => navigate('/numerology')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                      <Binary className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">Vedic Numerology</h3>
                      <p className="text-sm text-muted-foreground">Know your numbers</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Streak & Achievements */}
            <Card className="card-sacred overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Spiritual Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl">
                  <div className="text-5xl font-bold bg-gradient-temple bg-clip-text text-transparent animate-divine-glow">
                    {stats.currentStreak}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Days Current Streak</p>
                  {stats.currentStreak > 0 && (
                    <Badge className="mt-2 bg-gradient-temple text-white">
                      🔥 Keep it up!
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-xl">
                    <div className="text-xl font-bold text-secondary">{stats.longestStreak}</div>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-xl">
                    <div className="text-xl font-bold text-primary">{Math.floor(stats.totalMantras / 108)}</div>
                    <p className="text-xs text-muted-foreground">Mala Rounds</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { badge: '🔥 Streak Master', time: '7 days ago', color: 'bg-orange-500/10 text-orange-700' },
                  { badge: '📿 Mantra Devotee', time: '12 days ago', color: 'bg-purple-500/10 text-purple-700' },
                  { badge: '📚 Knowledge Seeker', time: '18 days ago', color: 'bg-blue-500/10 text-blue-700' },
                ].map((achievement, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Badge variant="secondary" className={achievement.color}>
                      {achievement.badge}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{achievement.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="card-sacred">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Events
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/spiritual-calendar')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="text-2xl">
                      {event.type === 'festival' ? '🎉' : event.type === 'ekadashi' ? '🌙' : '🕉️'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.date}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming events
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
