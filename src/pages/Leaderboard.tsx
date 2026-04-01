import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumbs from "@/components/Breadcrumbs";
import AchievementBadges from "@/components/AchievementBadges";
import DailyChallengeWidget from "@/components/DailyChallengeWidget";
import ReferralCard from "@/components/ReferralCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Flame, Star, Medal, Crown, Zap } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url: string | null;
  experience_points: number;
  level: number;
  mantras_chanted: number;
  karma_score: number;
}

const LEVEL_TITLES = ["", "Spiritual Seeker", "Devoted Practitioner", "Rising Yogi", "Temple Guardian", "Mantra Master", "Scripture Scholar", "Karma Warrior", "Dharma Protector", "Enlightened Guide", "Sage"];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const Leaderboard = () => {
  usePageTitle("Leaderboard & Achievements");
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myJourney, setMyJourney] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch top users by XP
      const { data: journeys } = await supabase
        .from("spiritual_journey")
        .select("user_id, experience_points, level, mantras_chanted, karma_score")
        .order("experience_points", { ascending: false })
        .limit(20);

      if (journeys && journeys.length > 0) {
        const userIds = journeys.map((j) => j.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
        const entries: LeaderboardEntry[] = journeys.map((j) => ({
          ...j,
          name: profileMap.get(j.user_id)?.name || "Spiritual Seeker",
          avatar_url: profileMap.get(j.user_id)?.avatar_url || null,
        }));
        setLeaderboard(entries);
      }

      // Fetch own journey
      if (user) {
        const { data: mine } = await supabase
          .from("spiritual_journey")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setMyJourney(mine);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const myRank = leaderboard.findIndex((e) => e.user_id === user?.id) + 1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-6xl">
        <Breadcrumbs className="mb-6" />

        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Spiritual Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Track your spiritual journey & earn badges</p>
          </div>
        </div>

        {/* My Stats Card */}
        {user && myJourney && (
          <Card className="card-sacred mb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl text-primary-foreground font-bold">
                      {myJourney.level || 1}
                    </div>
                    {myRank > 0 && myRank <= 3 && (
                      <div className="absolute -top-1 -right-1">{getRankIcon(myRank)}</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Your Rank: {myRank > 0 ? `#${myRank}` : "Unranked"}</p>
                    <p className="text-xs text-muted-foreground">{LEVEL_TITLES[Math.min(myJourney.level || 1, 10)]}</p>
                  </div>
                </div>
                <div className="flex gap-4 ml-auto flex-wrap">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{myJourney.experience_points || 0}</p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{myJourney.mantras_chanted || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Mantras</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{myJourney.karma_score || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Karma</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">
              <Trophy className="h-3.5 w-3.5 mr-1" /> Rankings
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-xs sm:text-sm">
              <Star className="h-3.5 w-3.5 mr-1" /> Badges
            </TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs sm:text-sm">
              <Zap className="h-3.5 w-3.5 mr-1" /> Challenges
            </TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs sm:text-sm">
              <Flame className="h-3.5 w-3.5 mr-1" /> Refer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card className="card-sacred">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Devotees This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((entry, i) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        entry.user_id === user?.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                      } ${i < 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : ""}`}
                    >
                      <div className="w-8 flex justify-center">{getRankIcon(i + 1)}</div>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-sm">{entry.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.name}
                          {entry.user_id === user?.id && <Badge variant="secondary" className="ml-2 text-[10px]">You</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">Level {entry.level || 1} · {LEVEL_TITLES[Math.min(entry.level || 1, 10)]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{entry.experience_points || 0}</p>
                        <p className="text-[10px] text-muted-foreground">XP</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🙏</div>
                    <p className="text-sm text-muted-foreground">Start your spiritual journey to appear on the leaderboard!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <AchievementBadges />
          </TabsContent>

          <TabsContent value="challenges">
            <DailyChallengeWidget />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralCard />
          </TabsContent>
        </Tabs>
      </div>
      <ScrollToTop />
      <MobileBottomNav />
    </div>
  );
};

export default Leaderboard;
