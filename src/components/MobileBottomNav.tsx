import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Home, 
  Music, 
  Calendar,
  Crown,
  Hand,
  Compass,
  BookOpen,
  Building,
  Menu,
  Sun,
  User,
  LogOut,
  Star,
  Heart,
  MessageCircle,
  Search
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MobileSearchOverlay from '@/components/MobileSearchOverlay';
import { useAuth } from '@/hooks/useAuth';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Different nav items for authenticated vs visitor
  const primaryNavItems = user
    ? [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Search, label: 'Search', path: '__search__' },
        { icon: Hand, label: 'Palm', path: '/palm-reading' },
        { icon: Music, label: 'Audio', path: '/audio-library' },
        { icon: Menu, label: 'More', path: null },
      ]
    : [
        { icon: Home, label: 'Home', path: '/' },
        { icon: BookOpen, label: 'Explore', path: '/saints' },
        { icon: Music, label: 'Audio', path: '/audio-library' },
        { icon: MessageCircle, label: 'Community', path: '/community' },
        { icon: Menu, label: 'More', path: null },
      ];

  // Secondary nav items (in More sheet)
  const secondaryNavItems = user
    ? [
        { icon: Heart, label: 'Favorites', path: '/favorites' },
        { icon: Calendar, label: 'Spiritual Calendar', path: '/spiritual-calendar' },
        { icon: BookOpen, label: 'Scriptures', path: '/scriptures' },
        { icon: User, label: 'Saints', path: '/saints' },
        { icon: Building, label: 'Temples', path: '/temples' },
        { icon: Sun, label: 'Daily Devotion', path: '/daily-devotion' },
        { icon: Star, label: 'Horoscope', path: '/horoscope' },
        { icon: Heart, label: 'Kundali Match', path: '/kundali-match' },
        { icon: Compass, label: 'Numerology', path: '/numerology' },
        { icon: MessageCircle, label: 'Community', path: '/community' },
        { icon: Crown, label: 'Premium', path: '/premium' },
        { icon: User, label: 'Profile', path: '/profile' },
      ]
    : [
        { icon: BookOpen, label: 'Scriptures', path: '/scriptures' },
        { icon: Building, label: 'Temples', path: '/temples' },
        { icon: Hand, label: 'Palm Reading', path: '/palm-reading' },
        { icon: Star, label: 'Horoscope', path: '/horoscope' },
        { icon: Compass, label: 'Numerology', path: '/numerology' },
        { icon: Heart, label: 'Kundali Match', path: '/kundali-match' },
        { icon: Calendar, label: 'Calendar', path: '/spiritual-calendar' },
        { icon: Crown, label: 'Premium', path: '/premium' },
      ];

  const handleNavClick = (path: string | null) => {
    if (path === null) {
      setMoreOpen(true);
    } else if (path === '__search__') {
      setSearchOpen(true);
    } else {
      navigate(path);
      setMoreOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged Out — May your journey continue with blessings. 🙏");
      setMoreOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 border-t border-border/50 backdrop-blur-md safe-area-inset-bottom">
        <div className="flex justify-around items-center py-2 px-2">
          {primaryNavItems.map(({ icon: Icon, label, path }) => (
            path === null ? (
              <Sheet key="more-sheet" open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center gap-0.5 h-12 min-w-[48px] py-1.5 px-3 text-muted-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{label}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-xl">
                  <SheetHeader>
                    <SheetTitle className="text-center">🕉️ More Options</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-4 gap-3 py-4">
                    {secondaryNavItems.map(({ icon: SecIcon, label: secLabel, path: secPath }) => (
                      <Button
                        key={secPath}
                        variant="ghost"
                        className={`flex flex-col items-center gap-1 h-auto py-3 ${
                          location.pathname === secPath ? 'text-primary bg-primary/10' : ''
                        }`}
                        onClick={() => handleNavClick(secPath)}
                      >
                        <SecIcon className="h-5 w-5" />
                        <span className="text-[10px] font-medium text-center leading-tight">{secLabel}</span>
                      </Button>
                    ))}
                  </div>
                  {user && (
                    <>
                      <Separator />
                      <div className="py-3">
                        <Button
                          variant="ghost"
                          className="w-full flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </>
                  )}
                  {!user && (
                    <>
                      <Separator />
                      <div className="py-3">
                        <Button
                          className="w-full bg-gradient-temple text-white"
                          onClick={() => { navigate('/auth'); setMoreOpen(false); }}
                        >
                          Get Started — Join BhaktVerse
                        </Button>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>
            ) : (
              <Button
                key={label}
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(path)}
                className={`flex flex-col items-center gap-0.5 h-12 min-w-[48px] py-1.5 px-3 ${
                  path === '__search__'
                    ? 'text-muted-foreground'
                    : location.pathname === path 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Button>
            )
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;