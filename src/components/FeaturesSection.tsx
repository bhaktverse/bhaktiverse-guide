import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Smartphone
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "AI Saint Conversations",
      description: "Chat directly with AI personalities of great saints like Vivekananda, Kabir, Meera, and others. Get personalized spiritual guidance in their authentic voice and wisdom.",
      gradient: "bg-gradient-temple",
      emoji: "🧘‍♂️"
    },
    {
      icon: BookOpen,
      title: "Sacred Scripture Study",
      description: "Access thousands of holy texts with AI-powered explanations, audio narration, and progress tracking. From Bhagavad Gita to regional spiritual literature.",
      gradient: "bg-gradient-divine",
      emoji: "📚"
    },
    {
      icon: Music,
      title: "Spiritual Audio Library",
      description: "Immerse in mantras, bhajans, and meditation music. Features pronunciation guides, meaning explanations, and personalized playlists for your spiritual journey.",
      gradient: "bg-gradient-saffron",
      emoji: "🎵"
    },
    {
      icon: MapPin,
      title: "Temple & Pilgrimage Guide",
      description: "Discover nearby temples, join live darshan, get real-time aarti schedules, and plan spiritual pilgrimages with detailed guides and community reviews.",
      gradient: "bg-gradient-peace",
      emoji: "🏛️"
    },
    {
      icon: Users,
      title: "Spiritual Community",
      description: "Connect with like-minded devotees, share spiritual experiences, participate in group chanting sessions, and learn from each other's journeys.",
      gradient: "bg-gradient-temple",
      emoji: "👥"
    },
    {
      icon: Trophy,
      title: "Spiritual Progress Tracking",
      description: "Gamify your spiritual practice with achievements, streak tracking, and milestone celebrations. Set daily goals for mantras, meditation, and study.",
      gradient: "bg-gradient-divine",
      emoji: "🏆"
    },
    {
      icon: Mic,
      title: "Voice-Powered Interaction",
      description: "Use voice commands to play mantras, ask spiritual questions, and practice pronunciation. Advanced AI recognizes and corrects Sanskrit chanting.",
      gradient: "bg-gradient-saffron",
      emoji: "🎙️"
    },
    {
      icon: Calendar,
      title: "Festival & Sacred Calendar",
      description: "Never miss important festivals, auspicious dates, or regional celebrations. Get personalized reminders and learn the significance of each occasion.",
      gradient: "bg-gradient-peace",
      emoji: "📅"
    }
  ];

  const additionalFeatures = [
    {
      icon: Heart,
      title: "Donation Tracking",
      emoji: "❤️",
      description: "Blockchain-powered transparent donations to temples"
    },
    {
      icon: Search,
      title: "Semantic Search",
      emoji: "🔍", 
      description: "AI-powered search across all spiritual content"
    },
    {
      icon: Globe,
      title: "Multi-Language",
      emoji: "🌍",
      description: "Sanskrit, Hindi, English, and 15+ regional languages"
    },
    {
      icon: Smartphone,
      title: "Offline Mode",
      emoji: "📱",
      description: "Access spiritual content even without internet"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="text-4xl mb-4 animate-om-pulse">✨</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-temple bg-clip-text text-transparent">
            Complete Spiritual Ecosystem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need for your spiritual journey - from ancient wisdom to modern AI, 
            all in one beautifully crafted platform designed for the modern devotee.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="card-sacred p-8 hover:shadow-divine transition-all duration-500 animate-lotus-bloom group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${feature.gradient} text-primary-foreground shadow-divine group-hover:animate-sacred-float`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {additionalFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className="card-sacred p-6 text-center hover:shadow-lotus transition-all duration-300 animate-lotus-bloom"
              style={{ animationDelay: `${(index + 8) * 0.1}s` }}
            >
              <div className="text-3xl mb-3">{feature.emoji}</div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <feature.icon className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">{feature.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-peace p-12 rounded-3xl shadow-divine">
          <div className="text-4xl mb-4 animate-sacred-float">🚀</div>
          <h3 className="text-3xl font-bold mb-4 bg-gradient-temple bg-clip-text text-transparent">
            Ready to Transform Your Spiritual Journey?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of devotees already experiencing personalized spiritual guidance, 
            authentic saint wisdom, and a supportive community of seekers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-temple text-primary-foreground shadow-divine hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Free Spiritual Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Watch Demo Video
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;