import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Mail,
  Phone,
  Globe,
  Bell,
  Shield,
  LogOut,
  Save,
  Crown,
  Trophy,
  Sparkles,
  Calendar,
  Activity,
  History,
  Loader2,
  Settings
} from 'lucide-react';

interface ProfileData {
  name: string;
  phone: string;
  preferred_language: string;
  spiritual_level: string;
  notification_preferences: {
    aarti: boolean;
    festivals: boolean;
    reminders: boolean;
  };
}

interface JourneyData {
  level: number;
  experience_points: number;
  mantras_chanted: number;
  reports_generated: number;
  karma_score: number;
}

const LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
];

const SPIRITUAL_LEVELS = [
  { value: 'beginner', label: 'Beginner (शुरुआती)' },
  { value: 'seeker', label: 'Seeker (साधक)' },
  { value: 'devotee', label: 'Devotee (भक्त)' },
  { value: 'sage', label: 'Sage (ऋषि)' },
];

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    phone: '',
    preferred_language: 'hi',
    spiritual_level: 'beginner',
    notification_preferences: {
      aarti: true,
      festivals: true,
      reminders: true
    }
  });
  const [journeyData, setJourneyData] = useState<JourneyData>({
    level: 1,
    experience_points: 0,
    mantras_chanted: 0,
    reports_generated: 0,
    karma_score: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setProfileData({
          name: profile.name || '',
          phone: profile.phone || '',
          preferred_language: profile.preferred_language || 'hi',
          spiritual_level: profile.spiritual_level || 'beginner',
          notification_preferences: (profile.notification_preferences as any) || {
            aarti: true,
            festivals: true,
            reminders: true
          }
        });
      }

      // Load journey
      const { data: journey } = await supabase
        .from('spiritual_journey')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (journey) {
        setJourneyData({
          level: journey.level || 1,
          experience_points: journey.experience_points || 0,
          mantras_chanted: journey.mantras_chanted || 0,
          reports_generated: journey.reports_generated || 0,
          karma_score: journey.karma_score || 0
        });

        // Check premium based on level/XP
        if (journey.level >= 3 || journey.experience_points >= 500) {
          setIsPremium(true);
        }
      }

      // Check admin role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roles?.some(r => r.role === 'admin' || r.role === 'moderator')) {
        setIsAdmin(true);
        setIsPremium(true);
      }

      // Load reading history
      const { data: history } = await supabase
        .from('palm_reading_history')
        .select('id, created_at, palm_type, language')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (history) {
        setReadingHistory(history);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            name: profileData.name,
            phone: profileData.phone,
            preferred_language: profileData.preferred_language,
            spiritual_level: profileData.spiritual_level as any,
            notification_preferences: profileData.notification_preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            name: profileData.name,
            phone: profileData.phone,
            preferred_language: profileData.preferred_language,
            spiritual_level: profileData.spiritual_level as any,
            notification_preferences: profileData.notification_preferences
          });
        
        if (error) throw error;
      }

      toast({
        title: "Profile Updated 🙏",
        description: "Your spiritual profile has been saved.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Could not save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "May your journey continue with blessings. 🙏",
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">🕉️</div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const xpToNextLevel = (journeyData.level * 200);
  const xpProgress = Math.min((journeyData.experience_points % 200) / 200 * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-4xl">
        <Breadcrumbs className="mb-6" />

        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-temple h-24 relative">
            <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-divine">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-temple text-white text-3xl font-bold">
                  {profileData.name.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-16 pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{profileData.name || 'Spiritual Seeker'}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Level {journeyData.level}
                  </Badge>
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your spiritual profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Spiritual Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select
                  value={profileData.preferred_language}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, preferred_language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Spiritual Level</Label>
                <Select
                  value={profileData.spiritual_level}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, spiritual_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPIRITUAL_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </Label>

                <div className="flex items-center justify-between">
                  <Label htmlFor="aarti-notif" className="text-sm font-normal">Aarti Reminders</Label>
                  <Switch
                    id="aarti-notif"
                    checked={profileData.notification_preferences.aarti}
                    onCheckedChange={(checked) => setProfileData(prev => ({
                      ...prev,
                      notification_preferences: { ...prev.notification_preferences, aarti: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="festival-notif" className="text-sm font-normal">Festival Alerts</Label>
                  <Switch
                    id="festival-notif"
                    checked={profileData.notification_preferences.festivals}
                    onCheckedChange={(checked) => setProfileData(prev => ({
                      ...prev,
                      notification_preferences: { ...prev.notification_preferences, festivals: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-notif" className="text-sm font-normal">Daily Reminders</Label>
                  <Switch
                    id="reminder-notif"
                    checked={profileData.notification_preferences.reminders}
                    onCheckedChange={(checked) => setProfileData(prev => ({
                      ...prev,
                      notification_preferences: { ...prev.notification_preferences, reminders: checked }
                    }))}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Spiritual Journey Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Spiritual Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl">
                  <div className="text-4xl font-bold text-amber-500">Level {journeyData.level}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {journeyData.experience_points} / {xpToNextLevel} XP
                  </div>
                  <Progress value={xpProgress} className="mt-2 h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold text-primary">{journeyData.mantras_chanted}</div>
                    <div className="text-xs text-muted-foreground">Mantras Chanted</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold text-secondary">{journeyData.reports_generated}</div>
                    <div className="text-xs text-muted-foreground">Reports Generated</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold text-green-500">{journeyData.karma_score}</div>
                    <div className="text-xs text-muted-foreground">Karma Score</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold text-purple-500">{readingHistory.length}</div>
                    <div className="text-xs text-muted-foreground">Palm Readings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Recent Readings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {readingHistory.length > 0 ? (
                  <div className="space-y-3">
                    {readingHistory.map((reading) => (
                      <div key={reading.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{reading.palm_type || 'Palm Reading'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reading.created_at).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{reading.language?.toUpperCase()}</Badge>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full text-primary mt-2"
                      onClick={() => navigate('/palm-reading')}
                    >
                      View All Readings
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No readings yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate('/palm-reading')}
                    >
                      Get Your First Reading
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Profile;
