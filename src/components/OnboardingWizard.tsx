import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Sparkles, Globe, Heart, Target } from 'lucide-react';

const DEITIES = [
  { id: 'shiva', name: 'Lord Shiva', emoji: '🔱' },
  { id: 'vishnu', name: 'Lord Vishnu', emoji: '🪷' },
  { id: 'krishna', name: 'Lord Krishna', emoji: '🦚' },
  { id: 'rama', name: 'Lord Rama', emoji: '🏹' },
  { id: 'hanuman', name: 'Lord Hanuman', emoji: '🐒' },
  { id: 'ganesh', name: 'Lord Ganesh', emoji: '🐘' },
  { id: 'durga', name: 'Maa Durga', emoji: '🦁' },
  { id: 'lakshmi', name: 'Maa Lakshmi', emoji: '🪷' },
  { id: 'saraswati', name: 'Maa Saraswati', emoji: '📿' },
  { id: 'kali', name: 'Maa Kali', emoji: '⚔️' },
  { id: 'surya', name: 'Surya Dev', emoji: '☀️' },
  { id: 'shani', name: 'Shani Dev', emoji: '🪐' },
];

const LANGUAGES = [
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'en', name: 'English' },
  { code: 'sa', name: 'संस्कृत (Sanskrit)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState('hi');
  const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
  const [goals, setGoals] = useState({ mantras: 108, reading_minutes: 15, meditation_minutes: 10 });

  const toggleDeity = (id: string) => {
    setSelectedDeities(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_language: language,
          favorite_deities: selectedDeities,
          daily_goals: goals,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('🙏 Your spiritual profile is ready!');
      onComplete();
    } catch (err) {
      console.error('Onboarding save error:', err);
      toast.error('Could not save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    {
      title: 'Choose Your Language',
      description: 'Select your preferred language for spiritual content',
      icon: <Globe className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      title: 'Your Favorite Deities',
      description: 'Select the deities you feel most connected to',
      icon: <Heart className="h-6 w-6" />,
      content: (
        <div className="grid grid-cols-3 gap-2">
          {DEITIES.map(d => (
            <button
              key={d.id}
              onClick={() => toggleDeity(d.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-sm ${
                selectedDeities.includes(d.id)
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className="text-xs text-center leading-tight">{d.name}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Set Daily Goals',
      description: 'How much time do you want to dedicate each day?',
      icon: <Target className="h-6 w-6" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mantras per day: {goals.mantras}</label>
            <Slider
              value={[goals.mantras]}
              onValueChange={([v]) => setGoals(p => ({ ...p, mantras: v }))}
              min={11}
              max={1008}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reading (minutes): {goals.reading_minutes}</label>
            <Slider
              value={[goals.reading_minutes]}
              onValueChange={([v]) => setGoals(p => ({ ...p, reading_minutes: v }))}
              min={5}
              max={60}
              step={5}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Meditation (minutes): {goals.meditation_minutes}</label>
            <Slider
              value={[goals.meditation_minutes]}
              onValueChange={([v]) => setGoals(p => ({ ...p, meditation_minutes: v }))}
              min={5}
              max={60}
              step={5}
            />
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
            {currentStep.icon}
          </div>
          <div>
            <Progress value={progress} className="h-1.5 mb-4" />
            <CardTitle className="text-xl">{currentStep.title}</CardTitle>
            <CardDescription>{currentStep.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep.content}
          <div className="flex justify-between pt-2">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onComplete} className="text-muted-foreground">
                Skip
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={saving}>
                {saving ? <Sparkles className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                Begin Journey
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
