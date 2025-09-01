import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      
      {/* Footer */}
      <footer className="bg-card-sacred border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="text-2xl animate-om-pulse">🕉️</div>
                <h3 className="text-lg font-bold bg-gradient-temple bg-clip-text text-transparent">
                  BhaktVerse
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Connecting souls with ancient wisdom through modern AI technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-primary">Spiritual Guidance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Saint Conversations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Scripture Study</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mantra Practice</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Meditation Guide</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-primary">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Discussion Forums</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Spiritual Groups</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Live Events</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Temple Connect</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-primary">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 BhaktVerse. Made with ❤️ for the global spiritual community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
