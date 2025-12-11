import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-temple bg-clip-text text-transparent">
              Voices of the Spiritual Community
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from devotees who have transformed their spiritual journey with BhaktVerse
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "The AI Saint conversations feel so authentic. It's like having a personal guru available 24/7.",
                name: "Priya Sharma",
                location: "Mumbai",
                avatar: "🙏"
              },
              {
                quote: "Palm reading accuracy amazed me. The detailed predictions aligned perfectly with my life events.",
                name: "Rahul Verma",
                location: "Delhi",
                avatar: "🧘"
              },
              {
                quote: "Finally a platform that combines ancient wisdom with modern technology beautifully.",
                name: "Anita Patel",
                location: "Ahmedabad",
                avatar: "🪷"
              }
            ].map((testimonial) => (
              <div key={testimonial.name} className="card-sacred p-6 rounded-2xl">
                <div className="text-3xl mb-4">{testimonial.avatar}</div>
                <p className="text-foreground italic mb-4">"{testimonial.quote}"</p>
                <div className="text-sm">
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                  <p className="text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl animate-om-pulse">🕉️</div>
                <h3 className="text-2xl font-bold bg-gradient-temple bg-clip-text text-transparent">
                  BhaktVerse
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Connecting souls with ancient wisdom through modern AI technology. 
                Your complete spiritual companion for the digital age.
              </p>
              <div className="flex gap-3">
                <Button 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-temple text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-primary">Spiritual Guidance</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="/saints" className="hover:text-primary transition-colors flex items-center gap-2">🧘‍♂️ Saint Conversations</a></li>
                <li><a href="/scriptures" className="hover:text-primary transition-colors flex items-center gap-2">📚 Scripture Study</a></li>
                <li><a href="/palm-reading" className="hover:text-primary transition-colors flex items-center gap-2">🤚 Palm Reading</a></li>
                <li><a href="/numerology" className="hover:text-primary transition-colors flex items-center gap-2">🔮 Numerology</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-primary">Community</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="/community" className="hover:text-primary transition-colors flex items-center gap-2">👥 Discussion Forums</a></li>
                <li><a href="/temples" className="hover:text-primary transition-colors flex items-center gap-2">🏛️ Temple Connect</a></li>
                <li><a href="/audio-library" className="hover:text-primary transition-colors flex items-center gap-2">🎵 Audio Library</a></li>
                <li><a href="/spiritual-calendar" className="hover:text-primary transition-colors flex items-center gap-2">📅 Spiritual Calendar</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-primary">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="/premium" className="hover:text-primary transition-colors flex items-center gap-2">👑 Premium Plans</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 BhaktVerse. Made with ❤️ for the global spiritual community.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>🌍 Available in 15+ Languages</span>
              <span>📱 Mobile Optimized</span>
              <span>🔒 Secure & Private</span>
            </div>
          </div>
        </div>
      </footer>
      
      <MobileBottomNav />
    </div>
  );
};

export default Index;
