import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAdmin(null); // never carry a previous identity's result
    if (!user) return;
    let cancelled = false;
    const checkAdmin = async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (cancelled) return;
      const ok = !error && !!data;
      if (!ok) toast.error("Access denied. Admin privileges required.");
      setIsAdmin(ok);
    };
    checkAdmin();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (authLoading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">🕉️</div>
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user || isAdmin === false) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default AdminRoute;
