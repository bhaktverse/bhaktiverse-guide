import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbStats, setDbStats] = useState({ saints: 0, temples: 0, scriptures: 0, audio: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [saintsRes, templesRes, scripturesRes, audioRes] = await Promise.all([
        supabase.from('saints').select('id', { count: 'exact', head: true }),
        supabase.from('temples').select('id', { count: 'exact', head: true }),
        supabase.from('scriptures').select('id', { count: 'exact', head: true }),
        supabase.from('audio_library').select('id', { count: 'exact', head: true }),
      ]);
      setDbStats({
        saints: saintsRes.count || 0,
        temples: templesRes.count || 0,
        scriptures: scripturesRes.count || 0,
        audio: audioRes.count || 0,
      });
    } catch (e) {
      console.error('Stats load error:', e);
    }
  };

  const statsDisplay = [
    { value: `${dbStats.saints}+`, label: 'Saint Personalities', icon: '🧘' },
    { value: `${dbStats.scriptures}+`, label: 'Sacred Texts', icon: '📚' },
    { value: `${dbStats.temples}+`, label: 'Temples Connected', icon: '🏛️' },
    { value: `${dbStats.audio}+`, label: 'Audio Tracks', icon: '🎵' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      
      {/* Sacred Geometric Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
                            radial-gradient(circle at 75% 75%, hsl(var(--secondary)) 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Sacred Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] text-6xl animate-sacred-float opacity-10">🕉️</div>
        <div className="absolute top-40 right-[15%] text-4xl animate-sacred-float opacity-10" style={{ animationDelay: '1s' }}>🪷</div>
        <div className="absolute bottom-40 left-[15%] text-5xl animate-sacred-float opacity-10" style={{ animationDelay: '2s' }}>✨</div>
        <div className="absolute bottom-32 right-[10%] text-4xl animate-sacred-float opacity-10" style={{ animationDelay: '0.5s' }}>🙏</div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-in mb-6">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5">
              <Sparkles className="h-4 w-4 mr-2 text-primary animate-pulse" />
              AI-Powered Spiritual Platform
              <Zap className="h-4 w-4 ml-2 text-secondary" />
            </Badge>
          </div>

          {/* Main Hero Content */}
          <div className="animate-lotus-bloom">
            <div className="relative inline-block mb-8">
              <div className="text-7xl md:text-8xl animate-om-pulse">🕉️</div>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl -z-10" />
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-temple bg-clip-text text-transparent">Bhakt</span>
              <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">Verse</span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-4 font-light">
              Your AI-Powered Spiritual Companion
            </p>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Connect with ancient wisdom through modern AI. Chat with saint personalities, 
              explore sacred scriptures, discover your numerology, and join a global community of spiritual seekers.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="group bg-gradient-temple text-white shadow-divine hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 px-8 py-6 text-lg"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                {user ? 'Go to Dashboard' : 'Begin Sacred Journey'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/saints')}
                className="group border-2 border-primary/30 hover:border-primary hover:bg-primary/5 px-8 py-6 text-lg transition-all duration-300"
              >
                <BookOpen className="h-5 w-5 mr-2 group-hover:text-primary transition-colors" />
                Explore Wisdom
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { emoji: '🧘‍♂️', title: 'AI Spiritual Guide', desc: 'Chat with AI embodying wisdom of saints like Swami Vivekananda, Kabir, and Meera', delay: '0.2s' },
              { emoji: '🤚', title: 'Palm & Numerology', desc: 'Discover your destiny with AI-powered palm reading and numerology analysis', delay: '0.4s' },
              { emoji: '🏛️', title: 'Live Darshan', desc: 'Connect with temples worldwide, join live aarti, and experience divine presence', delay: '0.6s' },
            ].map((feature) => (
              <Card 
                key={feature.title}
                className="group card-sacred p-6 text-center hover:shadow-divine-lg transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm bg-card/80" 
                style={{ animationDelay: feature.delay }}
              >
                <div className="relative mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{feature.emoji}</div>
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>

          {/* Trust Stats - Dynamic from DB */}
          <div className="mt-16 p-8 bg-gradient-to-r from-card via-card-sacred to-card rounded-3xl shadow-lotus border border-border/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {statsDisplay.map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;