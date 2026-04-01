import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Gift, Users, Check } from "lucide-react";
import { toast } from "sonner";

const ReferralCard = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchReferrals = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setReferralCode(data[0].referral_code);
        setReferrals(data);
      } else {
        // Generate a referral code
        const code = `BHAKT-${user.id.slice(0, 6).toUpperCase()}`;
        setReferralCode(code);
        await supabase.from("referrals").insert({
          referrer_id: user.id,
          referral_code: code,
          status: "pending",
        });
      }
      setLoading(false);
    };
    fetchReferrals();
  }, [user]);

  const handleCopy = () => {
    const url = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <Card className="card-sacred">
        <CardContent className="p-6 text-center">
          <Gift className="h-10 w-10 mx-auto text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Sign in to get your referral code and earn rewards!</p>
        </CardContent>
      </Card>
    );
  }

  const completedReferrals = referrals.filter((r) => r.status === "completed").length;
  const totalPoints = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

  return (
    <div className="space-y-4">
      <Card className="card-sacred">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" /> Invite & Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share your referral link with friends. Earn <strong>50 XP</strong> for each friend who joins BhaktVerse!
          </p>

          <div className="flex gap-2">
            <Input value={`${window.location.origin}?ref=${referralCode}`} readOnly className="text-xs" />
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 rounded-xl bg-primary/5">
              <p className="text-lg font-bold text-primary">{referrals.length}</p>
              <p className="text-[10px] text-muted-foreground">Invites Sent</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-green-500/5">
              <p className="text-lg font-bold text-green-600">{completedReferrals}</p>
              <p className="text-[10px] text-muted-foreground">Joined</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-500/5">
              <p className="text-lg font-bold text-amber-600">{totalPoints}</p>
              <p className="text-[10px] text-muted-foreground">XP Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      {referrals.length > 1 && (
        <Card className="card-sacred">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Referral History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {referrals.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div>
                  <p className="text-xs font-medium">{r.referral_code}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={r.status === "completed" ? "default" : "secondary"} className="text-[10px] capitalize">
                  {r.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralCard;
