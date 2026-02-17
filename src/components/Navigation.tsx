import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import MobileBottomNav from '@/components/MobileBottomNav';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  Home, 
  ChevronDown,
  Crown,
  Hand,
  Compass,
  Star,
  Heart,
  BookOpen,
  Music,
  Building,
  Users,
  Calendar,
  Sun,
  MessageCircle
} from 'lucide-react';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (paths: string[]) => paths.some(p => location.pathname === p);

  const navLinkClass = (path: string) =>
    `flex items-center space-x-1 hover:text-primary transition-colors ${isActive(path) ? 'text-primary font-semibold' : ''}`;

  const groupTriggerClass = (paths: string[]) =>
    `flex items-center space-x-1 hover:text-primary transition-colors ${isGroupActive(paths) ? 'text-primary font-semibold' : ''}`;

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
                <div className="hidden md:flex items-center space-x-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>

                  {/* Services Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className={groupTriggerClass(['/palm-reading', '/numerology', '/horoscope', '/kundali-match'])}>
                        <Compass className="h-4 w-4" />
                        <span>Services</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/palm-reading')} className="cursor-pointer">
                        <Hand className="h-4 w-4 mr-2" /> Palm Reading
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/numerology')} className="cursor-pointer">
                        <Compass className="h-4 w-4 mr-2" /> Numerology
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/horoscope')} className="cursor-pointer">
                        <Star className="h-4 w-4 mr-2" /> Daily Horoscope
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/kundali-match')} className="cursor-pointer">
                        <Heart className="h-4 w-4 mr-2" /> Kundali Match
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Explore Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className={groupTriggerClass(['/saints', '/scriptures', '/temples', '/audio-library'])}>
                        <BookOpen className="h-4 w-4" />
                        <span>Explore</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/saints')} className="cursor-pointer">
                        <Users className="h-4 w-4 mr-2" /> Saints
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/scriptures')} className="cursor-pointer">
                        <BookOpen className="h-4 w-4 mr-2" /> Scriptures
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/temples')} className="cursor-pointer">
                        <Building className="h-4 w-4 mr-2" /> Temples
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/audio-library')} className="cursor-pointer">
                        <Music className="h-4 w-4 mr-2" /> Audio Library
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* More Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className={groupTriggerClass(['/spiritual-calendar', '/community', '/daily-devotion'])}>
                        <Calendar className="h-4 w-4" />
                        <span>More</span>
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/spiritual-calendar')} className="cursor-pointer">
                        <Calendar className="h-4 w-4 mr-2" /> Spiritual Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/community')} className="cursor-pointer">
                        <MessageCircle className="h-4 w-4 mr-2" /> Community
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/daily-devotion')} className="cursor-pointer">
                        <Sun className="h-4 w-4 mr-2" /> Daily Devotion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/premium" className={`flex items-center space-x-1 text-secondary hover:text-secondary ${isActive('/premium') ? 'font-semibold' : ''}`}>
                      <Crown className="h-4 w-4" />
                      <span>Premium</span>
                    </Link>
                  </Button>
                </div>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile" className={`hover:text-primary ${isActive('/profile') ? 'text-primary' : ''}`}>
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