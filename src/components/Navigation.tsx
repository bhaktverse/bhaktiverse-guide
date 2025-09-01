import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, Heart } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Spiritual Guide", href: "#guide" },
    { name: "Saints", href: "#saints" },
    { name: "Scriptures", href: "#scriptures" },
    { name: "Temples", href: "#temples" },
    { name: "Community", href: "#community" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-lotus">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-temple bg-clip-text text-transparent animate-om-pulse">
              🕉️
            </div>
            <h1 className="text-xl font-bold bg-gradient-temple bg-clip-text text-transparent">
              BhaktVerse
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="default" className="bg-gradient-temple text-primary-foreground shadow-divine hover:shadow-glow transition-all duration-300">
              <User className="h-4 w-4 mr-2" />
              Join Sacred Journey
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground/80"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-lotus-bloom">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-foreground/80 hover:text-primary transition-colors duration-300 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <Button variant="outline" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Wisdom
              </Button>
              <Button className="w-full bg-gradient-temple text-primary-foreground shadow-divine">
                <User className="h-4 w-4 mr-2" />
                Join Sacred Journey
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;