import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Zap, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  points_reward: number;
  deity_focus: string | null;
  difficulty: string | null;
  icon: string | null;
  target_count: number | null;
}

const DailyChallengeWidget = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("daily_challenges")
        .select("*")
        .order("points_reward", { ascending: false });
      setChallenges((data as Challenge[]) || []);

      if (user) {
        const { data: completions } = await supabase
          .from("user_challenge_completions")
          .select("challenge_id")
          .eq("user_id", user.id);
        setCompletedIds(new Set((completions || []).map((c) => c.challenge_id)));
      }
      setLoading(false);
    };
    fetchChallenges();
  }, [user]);

  const handleComplete = async (challengeId: string, points: number) => {
    if (!user) {
      toast.error("Please sign in to complete challenges");
      return;
    }

    const { error } = await supabase.from("user_challenge_completions").insert({
      user_id: user.id,
      challenge_id: challengeId,
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("You've already completed this challenge!");
      } else {
        toast.error("Failed to mark challenge complete");
      }
      return;
    }

    // Award XP
    await supabase
      .from("spiritual_journey")
      .update({ experience_points: (await supabase.from("spiritual_journey").select("experience_points").eq("user_id", user.id).single()).data?.experience_points || 0 + points })
      .eq("user_id", user.id);

    setCompletedIds((prev) => new Set([...prev, challengeId]));
    toast.success(`+${points} XP earned! 🙏`);
  };

  const completedCount = challenges.filter((c) => completedIds.has(c.id)).length;
  const progress = challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card className="card-sacred">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Daily Progress</span>
            </div>
            <span className="text-xs text-muted-foreground">{completedCount}/{challenges.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Challenge Cards */}
      <div className="space-y-3">
        {challenges.map((c) => {
          const isCompleted = completedIds.has(c.id);
          return (
            <Card key={c.id} className={`card-sacred transition-all ${isCompleted ? "opacity-70" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isCompleted ? "bg-green-500/10" : "bg-primary/10"}`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <span>{c.icon || "🙏"}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${isCompleted ? "line-through text-muted-foreground" : ""}`}>{c.title}</p>
                      <Badge variant="outline" className="text-[10px]">+{c.points_reward} XP</Badge>
                      {c.deity_focus && <Badge variant="secondary" className="text-[10px]">{c.deity_focus}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                  {!isCompleted && user && (
                    <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => handleComplete(c.id, c.points_reward)}>
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyChallengeWidget;
