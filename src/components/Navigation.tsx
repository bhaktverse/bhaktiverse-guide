import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Users, BookOpen, Headphones, Calendar, MessageSquare, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Saints', href: '/saints', icon: Users },
    { name: 'Scriptures', href: '#scriptures', icon: BookOpen },
    { name: 'Audio Library', href: '#audio', icon: Headphones },
    { name: 'Calendar', href: '#calendar', icon: Calendar },
    { name: 'Community', href: '#community', icon: MessageSquare },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-lotus">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-2xl animate-om-pulse">🕉️</div>
            <h1 className="text-xl font-bold bg-gradient-temple bg-clip-text text-transparent">
              BhaktVerse
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => navigate(item.href)}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.name}</span>
              </Button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || user.email} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {user.user_metadata?.name?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.user_metadata?.name || 'Spiritual Seeker'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-300"
                  onClick={() => navigate('/auth')}
                >
                  Join Community
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground/80"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card-sacred/95 backdrop-blur-md rounded-lg mt-2 mb-4 border border-border/50 shadow-sacred animate-fade-in">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => {
                  navigate(item.href);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-6 py-4 text-muted-foreground hover:text-primary hover:bg-background/50 transition-all duration-200 w-full justify-start"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            ))}

          <div className="px-6 py-6 border-t border-border/50">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || user.email} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {user.user_metadata?.name?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.user_metadata?.name || 'Spiritual Seeker'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mb-2" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 mb-4"
                  onClick={() => navigate('/auth')}
                >
                  Join Community
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </>
            )}
          </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;