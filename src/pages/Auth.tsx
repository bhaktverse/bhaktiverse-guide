import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Get the intended destination from state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Reliable redirect function with visual feedback
  const performRedirect = (showToast = true) => {
    setRedirecting(true);
    if (showToast) {
      toast({
        title: "🙏 Welcome!",
        description: "Redirecting to your spiritual dashboard...",
      });
    }
    // Use setTimeout to ensure state updates render before redirect
    setTimeout(() => {
      window.location.replace('/dashboard');
    }, 500);
  };

  useEffect(() => {
    let isMounted = true;
    let redirectTimeout: NodeJS.Timeout;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        performRedirect(true);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Already logged in, redirect silently
        performRedirect(false);
      }
    });
    
    // Check existing session AFTER setting up listener
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          console.log('Existing session found, redirecting...');
          performRedirect(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        if (isMounted && !redirecting) {
          setCheckingSession(false);
        }
      }
    };
    
    checkUser();

    return () => {
      isMounted = false;
      if (redirectTimeout) clearTimeout(redirectTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: formData.name
          }
        }
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        toast({
          title: "Registration Successful! 🕉️",
          description: "Please check your email to confirm your account.",
        });
        setLoading(false);
      } else if (data?.session) {
        // Auto-login successful - redirect will be handled by onAuthStateChange
        setRedirecting(true);
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data?.session) {
        // Redirect will be handled by onAuthStateChange
        setRedirecting(true);
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-temple">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="text-7xl animate-om-pulse">🕉️</div>
            <CheckCircle2 className="h-8 w-8 text-green-500 absolute -bottom-2 -right-2 animate-scale-in" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Welcome to BhaktVerse!</h2>
          <p className="text-muted-foreground">Preparing your spiritual dashboard...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-temple">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🕉️</div>
          <p className="text-muted-foreground">Loading...</p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-temple p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-om-pulse">🕉️</div>
          <h1 className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-2">
            BhaktVerse
          </h1>
          <p className="text-muted-foreground">
            Begin your sacred digital journey
          </p>
        </div>

        <Card className="bg-card-sacred/80 backdrop-blur-md border-border/50 shadow-divine">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-primary">
              Spiritual Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Join our community of spiritual seekers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Join Us
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="bg-background/70"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-background/70"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-temple hover:opacity-90 transition-all duration-300 shadow-glow"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enter Sacred Space
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Spiritual Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your name"
                      required
                      className="bg-background/70"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="bg-background/70"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="bg-background/70"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-background/70"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-temple hover:opacity-90 transition-all duration-300 shadow-glow"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Begin Spiritual Journey
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-muted-foreground text-sm">
          <p>By joining, you become part of a global spiritual community</p>
          <p className="mt-2">🙏 Namaste 🕉️</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
