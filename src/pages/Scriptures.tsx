import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { 
  BookOpen, 
  Search, 
  Clock, 
  Star, 
  Headphones, 
  Download, 
  Filter,
  Heart,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Scripture {
  id: string;
  title: string;
  author?: string;
  tradition?: string;
  language: string;
  type: string;
  total_chapters: number;
  difficulty_level: string;
  estimated_reading_time?: number;
  description?: string;
  summary?: string;
  pdf_url?: string;
  audio_url?: string;
  created_at: string;
}

const Scriptures = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTradition, setSelectedTradition] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  useEffect(() => {
    loadScriptures();
  }, []);

  const loadScriptures = async () => {
    try {
      const { data, error } = await supabase
        .from('scriptures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading scriptures:', error);
        return;
      }

      setScriptures(data || []);
      console.log('Loaded scriptures from database:', data?.length || 0);
    } catch (error) {
      console.error('Error loading scriptures:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertSampleScriptures = async () => {
    const sampleScriptures = [
      {
        title: "Bhagavad Gita",
        author: "Vyasa",
        tradition: "Vedanta",
        language: "hi",
        type: "scripture" as const,
        total_chapters: 18,
        difficulty_level: "intermediate" as const,
        estimated_reading_time: 720,
        description: "The eternal dialogue between Prince Arjuna and Lord Krishna on duty, righteousness, and the path to liberation.",
        summary: "A philosophical discourse that addresses the moral and ethical struggles of life through the conversation between Arjuna and Krishna on the battlefield of Kurukshetra."
      },
      {
        title: "Ramcharitmanas",
        author: "Tulsidas",
        tradition: "Vaishnavism",
        language: "hi",
        type: "devotional" as const,
        total_chapters: 7,
        difficulty_level: "beginner" as const,
        estimated_reading_time: 900,
        description: "The life story of Lord Rama told through beautiful poetry and devotional verses.",
        summary: "Tulsidas's masterpiece narrating the divine life of Lord Rama, filled with devotion, dharma, and spiritual wisdom."
      },
      {
        title: "Hanuman Chalisa",
        author: "Tulsidas",
        tradition: "Vaishnavism",
        language: "hi",
        type: "mantra" as const,
        total_chapters: 1,
        difficulty_level: "beginner" as const,
        estimated_reading_time: 15,
        description: "40 verses dedicated to Lord Hanuman, the devotee of Lord Rama.",
        summary: "A powerful devotional hymn praising the qualities and deeds of Hanuman, bringing strength and protection."
      },
      {
        title: "Upanishads",
        author: "Various Sages",
        tradition: "Vedanta",
        language: "hi",
        type: "philosophical" as const,
        total_chapters: 108,
        difficulty_level: "advanced" as const,
        estimated_reading_time: 1200,
        description: "Ancient philosophical texts that form the foundation of Vedantic thought.",
        summary: "Sacred texts exploring the nature of reality, consciousness, and the ultimate truth of existence."
      },
      {
        title: "Vishnu Sahasranama",
        author: "Vyasa",
        tradition: "Vaishnavism",
        language: "hi",
        type: "mantra" as const,
        total_chapters: 1,
        difficulty_level: "intermediate" as const,
        estimated_reading_time: 45,
        description: "1000 names of Lord Vishnu with their profound meanings.",
        summary: "Sacred names of Vishnu that invoke divine blessings and spiritual purification."
      },
      {
        title: "Guru Granth Sahib",
        author: "Guru Nanak & Others",
        tradition: "Sikhism",
        language: "hi",
        type: "scripture" as const,
        total_chapters: 1430,
        difficulty_level: "intermediate" as const,
        estimated_reading_time: 2000,
        description: "The central religious scripture of Sikhism containing hymns and teachings.",
        summary: "Sacred compositions by Sikh Gurus and other saints emphasizing devotion to one God."
      }
    ];

    try {
      const { data, error } = await supabase
        .from('scriptures')
        .insert(sampleScriptures)
        .select();

      if (error) {
        console.error('Error inserting sample scriptures:', error);
      } else {
        setScriptures(data || []);
      }
    } catch (error) {
      console.error('Error inserting sample scriptures:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">📖</div>
          <p className="text-muted-foreground">Loading sacred scriptures...</p>
        </div>
      </div>
    );
  }

  const filteredScriptures = scriptures.filter(scripture => {
    const matchesSearch = scripture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scripture.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scripture.tradition?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTradition = selectedTradition === "all" || scripture.tradition === selectedTradition;
    const matchesDifficulty = selectedDifficulty === "all" || scripture.difficulty_level === selectedDifficulty;
    const matchesLanguage = selectedLanguage === "all" || scripture.language === selectedLanguage;
    
    return matchesSearch && matchesTradition && matchesDifficulty && matchesLanguage;
  });

  const traditions = Array.from(new Set(scriptures.map(s => s.tradition).filter(Boolean)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-success text-white';
      case 'intermediate': return 'bg-warning text-white';
      case 'advanced': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scripture': return '📜';
      case 'devotional': return '🙏';
      case 'mantra': return '📿';
      case 'philosophical': return '🧠';
      default: return '📖';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-background dark:via-primary/5 dark:to-secondary/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Premium Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4 p-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full">
            <div className="text-6xl">📚</div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-gradient">
            Sacred Scripture Library
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in timeless wisdom presented as beautiful, interactive books. 
            <br />Experience ancient knowledge with modern technology.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search scriptures by title, author, or tradition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-background/80 border-orange-200"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedTradition}
                onChange={(e) => setSelectedTradition(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-md bg-white/80 dark:bg-background"
              >
                <option value="all">All Traditions</option>
                {traditions.map(tradition => (
                  <option key={tradition} value={tradition}>{tradition}</option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-md bg-white/80 dark:bg-background"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-md bg-white/80 dark:bg-background"
              >
                <option value="all">🌐 All Languages</option>
                <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                <option value="sanskrit">🕉️ संस्कृत (Sanskrit)</option>
                <option value="english">🇬🇧 English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scriptures Grid */}
        {filteredScriptures.length === 0 ? (
          <Card className="card-sacred">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No Scriptures Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters to find the spiritual texts you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredScriptures.map((scripture) => (
              <Card 
                key={scripture.id}
                className="group relative overflow-hidden bg-gradient-to-br from-white via-orange-50 to-amber-50 dark:from-card dark:via-card-sacred dark:to-card border-2 border-orange-200 dark:border-primary/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-3 cursor-pointer"
                onClick={() => navigate(`/scriptures/${scripture.id}`)}
              >
                {/* Book Spine & Pages Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-orange-900/30 to-transparent" />
                <div className="absolute right-0 top-4 bottom-4 w-1 bg-white/50 dark:bg-white/20 shadow-inner" />
                <div className="absolute right-1 top-6 bottom-6 w-1 bg-white/30 dark:bg-white/10" />
                
                {/* Decorative Corner Bookmark */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-400/30 to-transparent rounded-bl-full" />
                
                <CardHeader className="relative pb-4 pl-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                      {getTypeIcon(scripture.type)}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={`text-xs ${getDifficultyColor(scripture.difficulty_level)}`}>
                        {scripture.difficulty_level}
                      </Badge>
                      <Badge variant="outline" className="bg-white/70 dark:bg-white/10 border-orange-300">
                        <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                        4.{Math.floor(Math.random() * 3) + 7}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl mb-3 text-foreground font-serif leading-tight line-clamp-2">
                    {scripture.title}
                  </CardTitle>
                  
                  <CardDescription className="text-sm font-medium">
                    ✍️ {scripture.author || 'Ancient Sages'} • 
                    {scripture.language === 'hi' ? ' 🇮🇳 हिन्दी' : 
                     scripture.language === 'sanskrit' ? ' 🕉️ संस्कृत' :
                     scripture.language === 'english' ? ' 🇬🇧 English' : 
                     ` ${scripture.language}`}
                  </CardDescription>
                  
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{scripture.total_chapters} Chapters</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{scripture.estimated_reading_time ? `${Math.floor(scripture.estimated_reading_time / 60)}h ${scripture.estimated_reading_time % 60}m` : 'N/A'}</span>
                    </div>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {scripture.language === 'hi' ? '🇮🇳 हिन्दी' : 
                       scripture.language === 'sanskrit' ? '🕉️ संस्कृत' :
                       scripture.language === 'english' ? '🇬🇧 English' : 
                       scripture.language}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="relative pl-10">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {scripture.description || scripture.summary}
                  </p>
                  
                  {/* Reading Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Your Progress</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/scriptures/${scripture.id}`);
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Reading
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Tradition Badge */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Badge variant="outline" className="bg-white/50 dark:bg-white/10 text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {scripture.tradition} Tradition
                    </Badge>
                  </div>
                </CardContent>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default Scriptures;