import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star, Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  badge_icon: string | null;
  category: string | null;
  rarity: string | null;
  points_required: number | null;
}

const RARITY_COLORS: Record<string, string> = {
  common: "bg-muted text-muted-foreground border-border",
  rare: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  legendary: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const RARITY_GLOW: Record<string, string> = {
  common: "",
  rare: "shadow-blue-500/10",
  epic: "shadow-purple-500/10 shadow-lg",
  legendary: "shadow-amber-500/20 shadow-xl ring-1 ring-amber-500/20",
};

const AchievementBadges = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      const { data: allAch } = await supabase.from("achievements").select("*").order("points_required", { ascending: true });
      setAchievements(allAch || []);

      if (user) {
        const { data: earned } = await supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id);
        setEarnedIds(new Set((earned || []).map((e) => e.achievement_id)));
      }
      setLoading(false);
    };
    fetchAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  const earned = achievements.filter((a) => earnedIds.has(a.id));
  const locked = achievements.filter((a) => !earnedIds.has(a.id));

  return (
    <div className="space-y-4">
      {earned.length > 0 && (
        <Card className="card-sacred">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" /> Earned Badges ({earned.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {earned.map((a) => (
                <div
                  key={a.id}
                  className={`relative p-4 rounded-xl border text-center transition-all hover:scale-105 ${RARITY_COLORS[a.rarity || "common"]} ${RARITY_GLOW[a.rarity || "common"]}`}
                >
                  <div className="text-3xl mb-2">{a.badge_icon || "🏆"}</div>
                  <p className="text-xs font-semibold truncate">{a.name}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] capitalize">{a.rarity || "common"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="card-sacred">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" /> Locked Badges ({locked.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locked.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">You've earned all badges! 🎉</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {locked.map((a) => (
                <div key={a.id} className="relative p-4 rounded-xl border border-dashed border-muted-foreground/20 text-center opacity-60">
                  <div className="text-3xl mb-2 grayscale">{a.badge_icon || "🔒"}</div>
                  <p className="text-xs font-semibold truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{a.points_required || 0} pts needed</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementBadges;
