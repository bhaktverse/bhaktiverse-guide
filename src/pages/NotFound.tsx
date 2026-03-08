import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl animate-om-pulse">🕉️</div>
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-xl text-foreground font-semibold">
            This path does not exist in the spiritual realm
          </p>
          <p className="text-muted-foreground">
            The page you seek has moved beyond this plane. Let us guide you back.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
