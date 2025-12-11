import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  BookOpen, 
  Music, 
  MapPin, 
  Users, 
  Trophy,
  Mic,
  Calendar,
  Heart,
  Search,
  Globe,
  Smartphone,
  ArrowRight,
  Sparkles,
  Hand,
  Binary
} from "lucide-react";

const FeaturesSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageCircle,
      title: "AI Saint Conversations",
      description: "Chat with AI personalities of great saints. Get personalized spiritual guidance in their authentic voice and wisdom.",
      gradient: "from-orange-500 to-amber-500",
      emoji: "🧘‍♂️",
      link: "/saints"
    },
    {
      icon: Hand,
      title: "AI Palm Reading",
      description: "Advanced biometric palm scanning with AI analysis. Get detailed predictions for career, love, health, and spiritual growth.",
      gradient: "from-purple-500 to-pink-500",
      emoji: "🤚",
      link: "/palm-reading",
      isNew: true
    },
    {
      icon: Binary,
      title: "Vedic Numerology",
      description: "Discover your life path, destiny, and soul numbers. Get AI-powered insights with personalized mantras and remedies.",
      gradient: "from-blue-500 to-indigo-500",
      emoji: "🔮",
      link: "/numerology",
      isNew: true
    },
    {
      icon: BookOpen,
      title: "Sacred Scripture Study",
      description: "Access holy texts with AI-powered explanations and audio narration. From Bhagavad Gita to regional spiritual literature.",
      gradient: "from-emerald-500 to-teal-500",
      emoji: "📚",
      link: "/scriptures"
    },
    {
      icon: Music,
      title: "Spiritual Audio Library",
      description: "Immerse in mantras, bhajans, and meditation music. Features pronunciation guides and personalized playlists.",
      gradient: "from-rose-500 to-orange-500",
      emoji: "🎵",
      link: "/audio-library"
    },
    {
      icon: MapPin,
      title: "Temple & Pilgrimage Guide",
      description: "Discover temples, join live darshan, get real-time aarti schedules, and plan spiritual pilgrimages.",
      gradient: "from-cyan-500 to-blue-500",
      emoji: "🏛️",
      link: "/temples"
    },
    {
      icon: Users,
      title: "Spiritual Community",
      description: "Connect with devotees, share experiences, participate in group chanting, and learn from each other.",
      gradient: "from-violet-500 to-purple-500",
      emoji: "👥",
      link: "/community"
    },
    {
      icon: Calendar,
      title: "Festival & Sacred Calendar",
      description: "Never miss festivals, auspicious dates, or celebrations. Get personalized reminders and significance guides.",
      gradient: "from-amber-500 to-yellow-500",
      emoji: "📅",
      link: "/spiritual-calendar"
    }
  ];

  const quickFeatures = [
    { icon: Heart, title: "Daily Devotion", emoji: "🙏", description: "Personalized daily rituals", link: "/daily-devotion" },
    { icon: Search, title: "AI Search", emoji: "🔍", description: "Search across all content" },
    { icon: Globe, title: "Multi-Language", emoji: "🌍", description: "15+ regional languages" },
    { icon: Smartphone, title: "Offline Mode", emoji: "📱", description: "Access without internet" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 px-4 py-2 border-primary/30 bg-primary/5">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            Complete Spiritual Ecosystem
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-temple bg-clip-text text-transparent">Everything You Need</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From ancient wisdom to modern AI — all beautifully crafted for the modern devotee's spiritual journey.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group relative card-sacred p-8 hover:shadow-divine-lg transition-all duration-500 hover:-translate-y-1 overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => feature.link && navigate(feature.link)}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="flex items-start gap-5 relative z-10">
                <div className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                    <span className="text-2xl group-hover:scale-110 transition-transform">{feature.emoji}</span>
                    {feature.isNew && (
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">NEW</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    Explore <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {quickFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group card-sacred p-6 text-center hover:shadow-lotus transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${(index + 8) * 0.1}s` }}
              onClick={() => feature.link && navigate(feature.link)}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.emoji}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <feature.icon className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">{feature.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative text-center p-12 md:p-16 rounded-3xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10" />
          <div className="absolute inset-0 backdrop-blur-sm border border-primary/20 rounded-3xl" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-5xl mb-6 animate-sacred-float">🚀</div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-temple bg-clip-text text-transparent">
                Ready to Transform Your Spiritual Journey?
              </span>
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of devotees experiencing personalized spiritual guidance, 
              authentic saint wisdom, and a supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-temple text-white shadow-divine hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 px-8"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Free Journey
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/premium')}
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Explore Premium
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
