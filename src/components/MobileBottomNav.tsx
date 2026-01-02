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
  Users,
  Building,
  Menu,
  Sun
} from 'lucide-react';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  // Primary nav items (always visible)
  const primaryNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Hand, label: 'Palm', path: '/palm-reading' },
    { icon: Compass, label: 'Astro', path: '/numerology' },
    { icon: Music, label: 'Audio', path: '/audio-library' },
    { icon: Menu, label: 'More', path: null }, // Opens sheet
  ];

  // Secondary nav items (in More sheet)
  const secondaryNavItems = [
    { icon: Calendar, label: 'Spiritual Calendar', path: '/spiritual-calendar' },
    { icon: BookOpen, label: 'Scriptures', path: '/scriptures' },
    { icon: Users, label: 'Saints', path: '/saints' },
    { icon: Building, label: 'Temples', path: '/temples' },
    { icon: Sun, label: 'Daily Devotion', path: '/daily-devotion' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Crown, label: 'Premium', path: '/premium' },
  ];

  const handleNavClick = (path: string | null) => {
    if (path === null) {
      setMoreOpen(true);
    } else {
      navigate(path);
      setMoreOpen(false);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 border-t border-border/50 backdrop-blur-md safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2 px-2">
        {primaryNavItems.map(({ icon: Icon, label, path }) => (
          path === null ? (
            <Sheet key="more-sheet" open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center space-y-1 p-2 text-muted-foreground min-w-[60px]"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl pb-8">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-center">More Options</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-4">
                  {secondaryNavItems.map(({ icon: SecIcon, label: secLabel, path: secPath }) => (
                    <Button
                      key={secPath}
                      variant="ghost"
                      onClick={() => handleNavClick(secPath)}
                      className={`flex flex-col items-center space-y-2 p-4 h-auto ${
                        location.pathname === secPath 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <SecIcon className="h-6 w-6" />
                      <span className="text-xs font-medium text-center">{secLabel}</span>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick(path)}
              className={`flex flex-col items-center space-y-1 p-2 min-w-[60px] ${
                location.pathname === path 
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
  );
};

export default MobileBottomNav;