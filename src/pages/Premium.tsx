import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  Zap,
  Music,
  BookOpen,
  MessageSquare,
  Video,
  Download,
  Users,
  Star,
  Infinity
} from "lucide-react";

const Premium = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const currentFeatures = [
    {
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      title: "AI Saint Conversations",
      description: "Chat with spiritual masters powered by advanced AI",
      available: true
    },
    {
      icon: <BookOpen className="h-5 w-5 text-primary" />,
      title: "Sacred Scripture Library",
      description: "Access to complete scriptures with translations",
      available: true
    },
    {
      icon: <Music className="h-5 w-5 text-primary" />,
      title: "Audio Library",
      description: "Mantras, bhajans, and spiritual music",
      available: true
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: "Community Features",
      description: "Connect with fellow spiritual seekers",
      available: true
    }
  ];

  const comingSoonFeatures = [
    {
      icon: <Video className="h-5 w-5 text-secondary" />,
      title: "Live Darshan Streaming",
      description: "Watch live temple rituals from anywhere in the world",
      premium: true
    },
    {
      icon: <Download className="h-5 w-5 text-secondary" />,
      title: "Offline Content Access",
      description: "Download scriptures and audio for offline spiritual practice",
      premium: true
    },
    {
      icon: <Sparkles className="h-5 w-5 text-secondary" />,
      title: "Personalized AI Guru",
      description: "Your own dedicated spiritual guide with personalized teachings",
      premium: true
    },
    {
      icon: <Infinity className="h-5 w-5 text-secondary" />,
      title: "Unlimited AI Conversations",
      description: "No limits on saint chats and spiritual guidance",
      premium: true
    },
    {
      icon: <Star className="h-5 w-5 text-secondary" />,
      title: "Exclusive Content",
      description: "Rare teachings, advanced practices, and special events",
      premium: true
    },
    {
      icon: <Zap className="h-5 w-5 text-secondary" />,
      title: "Ad-Free Experience",
      description: "Pure spiritual journey without any distractions",
      premium: true
    }
  ];

  const premiumPlans = [
    {
      name: "Seeker",
      price: "Free",
      period: "Forever",
      description: "Perfect for beginning your spiritual journey",
      features: [
        "Basic AI conversations (10/day)",
        "Scripture reading",
        "Audio library access",
        "Community posts"
      ],
      current: true
    },
    {
      name: "Devotee",
      price: "$4.99",
      period: "/month",
      description: "For dedicated spiritual practitioners",
      features: [
        "Unlimited AI conversations",
        "Download scriptures & audio",
        "Live darshan streaming",
        "Ad-free experience",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Sage",
      price: "$19.99",
      period: "/month",
      description: "Complete spiritual enlightenment package",
      features: [
        "All Devotee features",
        "Personal AI Guru",
        "Exclusive advanced teachings",
        "Private spiritual groups",
        "Family plan (5 members)",
        "Early access to new features"
      ]
    }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">👑</div>
          <p className="text-muted-foreground">Loading premium features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peace">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 pb-24 md:pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <Crown className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-temple bg-clip-text text-transparent">
            Elevate Your Spiritual Journey
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock advanced features and deepen your connection with the divine. 
            Experience unlimited spiritual guidance and exclusive content.
          </p>
        </div>

        {/* Current Features - Live Now */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Badge className="bg-gradient-saffron text-primary-foreground text-lg px-6 py-2 mb-4">
              ✨ Live Now - Available to Everyone
            </Badge>
            <h2 className="text-3xl font-bold text-foreground">
              What's Working Today
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentFeatures.map((feature, index) => (
              <Card key={index} className="card-sacred hover:shadow-divine transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      {feature.icon}
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Premium Features */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Badge className="bg-gradient-gold text-primary-foreground text-lg px-6 py-2 mb-4">
              🚀 Coming Soon - Premium Features
            </Badge>
            <h2 className="text-3xl font-bold text-foreground">
              Future Enhancements
            </h2>
            <p className="text-muted-foreground mt-2">
              Powerful features in development for your spiritual growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <Card key={index} className="card-sacred border-secondary/30 hover:border-secondary hover:shadow-glow transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-secondary/10 rounded-full">
                      {feature.icon}
                    </div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      {feature.premium && (
                        <Crown className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                      Coming Soon
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Path
            </h2>
            <p className="text-muted-foreground">
              Select the plan that resonates with your spiritual journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {premiumPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`card-sacred relative ${
                  plan.popular ? 'border-primary shadow-divine scale-105' : ''
                } ${plan.current ? 'border-green-500/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-saffron text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    {plan.name}
                  </CardTitle>
                  <div className="text-center pt-4">
                    <span className="text-4xl font-bold text-primary">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-center pt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular ? 'bg-gradient-saffron hover:opacity-90' : ''
                    }`}
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : plan.price === 'Free' ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="card-sacred bg-gradient-temple/10 border-primary/30">
            <CardContent className="py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Transform Your Spiritual Practice?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of devotees who have elevated their spiritual journey with BhaktVerse Premium. 
                Experience unlimited divine guidance and exclusive features.
              </p>
              <Button size="lg" className="bg-gradient-saffron hover:opacity-90">
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default Premium;
