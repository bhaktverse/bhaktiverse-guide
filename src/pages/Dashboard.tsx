import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import { Calendar, BookOpen, Heart, Flame, Target, Trophy, Star, Clock } from "lucide-react";
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
    currentStreak: 7,
    longestStreak: 15,
    totalMantras: 2456,
    readingMinutes: 120,
    meditationMinutes: 85,
    dailyGoals: {
      mantras: 108,
      reading_minutes: 15,
      meditation_minutes: 10
    }
  });
  const [todayQuote, setTodayQuote] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([
    { name: "Maha Shivratri", date: "March 8, 2024", type: "festival" },
    { name: "Hanuman Jayanti", date: "April 23, 2024", type: "celebration" },
    { name: "Ram Navami", date: "April 17, 2024", type: "festival" }
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchTodayQuote = async () => {
      const quotes = [
        "The mind is everything. What you think you become. - Buddha",
        "The best way to find yourself is to lose yourself in the service of others. - Mahatma Gandhi",
        "You are not just the drop in the ocean, but the entire ocean in each drop. - Rumi",
        "The goal of life is to realize the Self. - Ramana Maharshi",
        "Where there is love there is life. - Mahatma Gandhi"
      ];
      setTodayQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    };
    
    fetchTodayQuote();
  }, []);

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

  const mantrasProgress = (stats.totalMantras % stats.dailyGoals.mantras) / stats.dailyGoals.mantras * 100;
  const readingProgress = (stats.readingMinutes % stats.dailyGoals.reading_minutes) / stats.dailyGoals.reading_minutes * 100;
  const meditationProgress = (stats.meditationMinutes % stats.dailyGoals.meditation_minutes) / stats.dailyGoals.meditation_minutes * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-12 w-12 md:h-16 md:w-16 shadow-divine">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg md:text-xl">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent">
                Namaste, Seeker! 🙏
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">Continue your spiritual journey with devotion</p>
            </div>
          </div>
          
          {/* Today's Inspiration */}
          <Card className="card-sacred">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">✨</div>
                <div>
                  <h3 className="font-semibold text-primary mb-2">Today's Spiritual Wisdom</h3>
                  <p className="text-foreground italic">{todayQuote}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20 md:mb-8">
          {/* Left Column - Progress & Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Progress */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Today's Spiritual Goals</span>
                </CardTitle>
                <CardDescription>Track your daily spiritual practices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mantras */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center space-x-2">
                      <Flame className="h-4 w-4 text-primary" />
                      <span>Mantras Chanted</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stats.totalMantras % stats.dailyGoals.mantras}/{stats.dailyGoals.mantras}
                    </span>
                  </div>
                  <Progress value={mantrasProgress} className="h-2" />
                </div>

                {/* Reading */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Scripture Reading</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stats.readingMinutes % stats.dailyGoals.reading_minutes}/{stats.dailyGoals.reading_minutes} min
                    </span>
                  </div>
                  <Progress value={readingProgress} className="h-2" />
                </div>

                {/* Meditation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span>Meditation</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stats.meditationMinutes % stats.dailyGoals.meditation_minutes}/{stats.dailyGoals.meditation_minutes} min
                    </span>
                  </div>
                  <Progress value={meditationProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Continue Your Practice</CardTitle>
                <CardDescription>Quick access to your spiritual activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-16 md:h-20 flex-col space-y-1 md:space-y-2 hover:shadow-divine transition-all text-xs"
                    onClick={() => navigate('/saints')}
                  >
                    <div className="text-lg md:text-2xl">🧘‍♀️</div>
                    <span>Chat with Saints</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-16 md:h-20 flex-col space-y-1 md:space-y-2 hover:shadow-divine transition-all text-xs"
                    onClick={() => navigate('/scriptures')}
                  >
                    <div className="text-lg md:text-2xl">📖</div>
                    <span>Read Scriptures</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-16 md:h-20 flex-col space-y-1 md:space-y-2 hover:shadow-divine transition-all text-xs"
                    onClick={() => navigate('/audio-library')}
                  >
                    <div className="text-lg md:text-2xl">🎵</div>
                    <span>Listen to Mantras</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-16 md:h-20 flex-col space-y-1 md:space-y-2 hover:shadow-divine transition-all text-xs"
                    onClick={() => navigate('/temples')}
                  >
                    <div className="text-lg md:text-2xl">🏛️</div>
                    <span>Find Temples</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Events */}
          <div className="space-y-6">
            {/* Streak Stats */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Spiritual Streaks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary animate-divine-glow">
                    {stats.currentStreak}
                  </div>
                  <p className="text-sm text-muted-foreground">Days Current Streak</p>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-secondary">
                      {stats.longestStreak}
                    </div>
                    <p className="text-xs text-muted-foreground">Longest</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-accent">
                      {Math.floor(stats.totalMantras / 108)}
                    </div>
                    <p className="text-xs text-muted-foreground">Mala Rounds</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-gradient-saffron text-primary-foreground">
                    🔥 Streak Master
                  </Badge>
                  <span className="text-sm text-muted-foreground">7 days ago</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-primary text-primary">
                    📿 Mantra Devotee
                  </Badge>
                  <span className="text-sm text-muted-foreground">12 days ago</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-secondary text-secondary">
                    📚 Knowledge Seeker
                  </Badge>
                  <span className="text-sm text-muted-foreground">18 days ago</span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                    <div className="text-2xl">
                      {event.type === 'festival' ? '🎉' : '🕉️'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.date}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;