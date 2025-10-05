import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Zap, Star, Crown, Sparkles, TrendingUp, Calendar, BookOpen } from "lucide-react";

const DivineDashboard = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    loadDashboard();
  }, [session, navigate]);

  const loadDashboard = async () => {
    try {
      // Load spiritual journey
      const { data: journeyData } = await supabase
        .from('spiritual_journey')
        .select('*')
        .eq('user_id', session!.user.id)
        .single();

      if (journeyData) {
        setJourney(journeyData);
      }

      // Load numerology reports
      const { data: reportsData } = await supabase
        .from('numerology_reports')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });

      if (reportsData) {
        setReports(reportsData);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error("डैशबोर्ड लोड करने में त्रुटि");
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!journey) return 0;
    const currentLevelXP = (journey.level - 1) * 100;
    const nextLevelXP = journey.level * 100;
    const progressInLevel = journey.experience_points - currentLevelXP;
    return (progressInLevel / 100) * 100;
  };

  const getLevelTitle = (level: number) => {
    if (level < 5) return "Spiritual Seeker";
    if (level < 10) return "Devoted Practitioner";
    if (level < 20) return "Spiritual Guide";
    return "Enlightened Master";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-divine flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-divine">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Hero Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="bg-gradient-saffron text-white px-6 py-2 text-lg shadow-divine mb-4">
            <Crown className="h-5 w-5 mr-2 inline" />
            Divine Dashboard
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            आपकी आध्यात्मिक यात्रा
          </h1>
          <p className="text-lg text-muted-foreground">
            Your spiritual progress and divine insights
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-3xl font-bold text-primary">{journey?.level || 1}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getLevelTitle(journey?.level || 1)}</p>
                </div>
                <Trophy className="h-12 w-12 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-3xl font-bold text-accent">{journey?.experience_points || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">XP Points</p>
                </div>
                <Zap className="h-12 w-12 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reports</p>
                  <p className="text-3xl font-bold text-primary">{journey?.reports_generated || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Generated</p>
                </div>
                <BookOpen className="h-12 w-12 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Karma Score</p>
                  <p className="text-3xl font-bold text-accent">{journey?.karma_score || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Points</p>
                </div>
                <Star className="h-12 w-12 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 shadow-divine mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Level Progress
            </CardTitle>
            <CardDescription>
              {100 - Math.floor(getLevelProgress())} XP needed for Level {(journey?.level || 1) + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getLevelProgress()} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Level {journey?.level || 1}</span>
              <span>{journey?.experience_points || 0} XP</span>
              <span>Level {(journey?.level || 1) + 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Reports History */}
        <Card className="card-sacred backdrop-blur-xl bg-gradient-to-br from-accent/5 via-background to-primary/5 border-accent/20 shadow-divine">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Your Numerology Reports
            </CardTitle>
            <CardDescription>
              All your divine insights and analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No reports yet. Generate your first numerology report!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.dob).toLocaleDateString('hi-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-gradient-saffron text-white mb-2">
                          Numbers: {report.destiny_number}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="text-xs">{report.lucky_color}</Badge>
                      <Badge variant="outline" className="text-xs">{report.lucky_day}</Badge>
                      <Badge variant="outline" className="text-xs">{report.lucky_gemstone}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default DivineDashboard;