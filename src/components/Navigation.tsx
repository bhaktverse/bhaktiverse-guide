import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import MobileBottomNav from '@/components/MobileBottomNav';
import { 
  LogOut, 
  User, 
  Home, 
  Users, 
  BookOpen, 
  Calendar,
  Music,
  Settings,
  Compass,
  Building,
  Crown
} from 'lucide-react';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl animate-om-pulse">🕉️</div>
              <span className="text-xl font-bold bg-gradient-temple bg-clip-text text-transparent">
                BhaktVerse
              </span>
            </Link>

            {user ? (
              <>
                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard" className="flex items-center space-x-1 hover:text-primary">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/saints" className="flex items-center space-x-1 hover:text-primary">
                      <Users className="h-4 w-4" />
                      <span>Saints</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/scriptures" className="flex items-center space-x-1 hover:text-primary">
                      <BookOpen className="h-4 w-4" />
                      <span>Scriptures</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/audio-library" className="flex items-center space-x-1 hover:text-primary">
                      <Music className="h-4 w-4" />
                      <span>Audio</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/spiritual-calendar" className="flex items-center space-x-1 hover:text-primary">
                      <Calendar className="h-4 w-4" />
                      <span>Calendar</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/temples" className="flex items-center space-x-1 hover:text-primary">
                      <Building className="h-4 w-4" />
                      <span>Temples</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/premium" className="flex items-center space-x-1 hover:text-secondary text-secondary">
                      <Crown className="h-4 w-4" />
                      <span>Premium</span>
                    </Link>
                  </Button>
                </div>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile" className="hover:text-primary">
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {user && <MobileBottomNav />}
    </>
  );
};

export default Navigation;