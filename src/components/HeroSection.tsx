import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, BookOpen, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-peace relative overflow-hidden pt-16">
      {/* Floating Sacred Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl animate-sacred-float opacity-20">🕉️</div>
        <div className="absolute top-32 right-20 text-3xl animate-sacred-float opacity-15" style={{ animationDelay: '1s' }}>🪷</div>
        <div className="absolute bottom-32 left-20 text-3xl animate-sacred-float opacity-20" style={{ animationDelay: '2s' }}>🙏</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-sacred-float opacity-15" style={{ animationDelay: '0.5s' }}>✨</div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Hero Content */}
          <div className="animate-lotus-bloom">
            <div className="text-6xl mb-6 animate-om-pulse">🕉️</div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-temple bg-clip-text text-transparent leading-tight">
              BhaktVerse
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
              Your AI-Powered Spiritual Companion
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with ancient wisdom through modern AI. Chat with saint personalities, 
              explore sacred scriptures, and join a global community of spiritual seekers.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-temple text-primary-foreground shadow-divine hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Begin Sacred Journey
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/10 shadow-lotus transition-all duration-300"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Explore Wisdom
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="card-sacred p-6 text-center animate-lotus-bloom" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl mb-4">🧘‍♂️</div>
              <h3 className="text-lg font-semibold mb-2 text-primary">AI Spiritual Guide</h3>
              <p className="text-muted-foreground text-sm">
                Chat with AI embodying wisdom of saints like Swami Vivekananda, Kabir, and Meera
              </p>
            </Card>

            <Card className="card-sacred p-6 text-center animate-lotus-bloom" style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl mb-4">📿</div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Sacred Practices</h3>
              <p className="text-muted-foreground text-sm">
                Track mantras, meditation, and spiritual progress with gamified achievements
              </p>
            </Card>

            <Card className="card-sacred p-6 text-center animate-lotus-bloom" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl mb-4">🏛️</div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Live Darshan</h3>
              <p className="text-muted-foreground text-sm">
                Connect with temples worldwide, join live aarti, and experience divine presence
              </p>
            </Card>
          </div>

          {/* Community Stats */}
          <div className="mt-16 p-8 bg-card-sacred/50 rounded-2xl shadow-lotus">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Spiritual Seekers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Saint Personalities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">1000+</div>
                <div className="text-sm text-muted-foreground">Sacred Texts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Temples Connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;