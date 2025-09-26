import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  BookOpen, 
  Music, 
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Users, label: 'Saints', path: '/saints' },
    { icon: BookOpen, label: 'Scriptures', path: '/scriptures' },
    { icon: Music, label: 'Audio', path: '/audio-library' },
    { icon: MoreHorizontal, label: 'Community', path: '/community' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 backdrop-blur-md">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            onClick={() => navigate(path)}
            className={`flex flex-col items-center space-y-1 p-2 ${
              location.pathname === path 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;