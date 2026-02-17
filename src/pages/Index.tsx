import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);

  useEffect(() => {
    loadFeaturedPosts();
  }, []);

  const loadFeaturedPosts = async () => {
    try {
      const { data } = await supabase
        .from('community_posts')
        .select('*')
        .eq('featured', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setFeaturedPosts(data);
    } catch (e) {
      console.error('Error loading featured posts:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      
      {/* Community Voices Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-temple bg-clip-text text-transparent">
              Voices of the Spiritual Community
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {featuredPosts.length > 0 
                ? "Featured posts from our vibrant spiritual community"
                : "Join our growing community of spiritual seekers worldwide"
              }
            </p>
          </div>
          
          {featuredPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredPosts.map((post) => (
                <div key={post.id} className="card-sacred p-6 rounded-2xl">
                  <div className="text-3xl mb-4">🙏</div>
                  <p className="text-foreground italic mb-4 line-clamp-4">"{post.content}"</p>
                  <div className="text-sm">
                    <p className="text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { emoji: '🧘‍♂️', text: 'AI-powered saint conversations for personalized guidance' },
                { emoji: '🤚', text: 'Accurate palm reading with detailed life predictions' },
                { emoji: '📚', text: 'Ancient wisdom meets modern technology beautifully' },
              ].map((item, i) => (
                <div key={i} className="card-sacred p-6 rounded-2xl text-center">
                  <div className="text-3xl mb-4">{item.emoji}</div>
                  <p className="text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          )}
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
                  onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  className="bg-gradient-temple text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {user ? 'Go to Dashboard' : 'Get Started'}
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
                <li><a href="/horoscope" className="hover:text-primary transition-colors flex items-center gap-2">🌟 Daily Horoscope</a></li>
                <li><a href="/kundali-match" className="hover:text-primary transition-colors flex items-center gap-2">💑 Kundali Match</a></li>
                <li><a href="/daily-devotion" className="hover:text-primary transition-colors flex items-center gap-2">🙏 Daily Devotion</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 BhaktVerse. Made with ❤️ for the global spiritual community.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>🌍 Multi-Language Support</span>
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