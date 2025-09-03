import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { BookOpen, Search, Clock, Star, Headphones, Download, Filter } from "lucide-react";
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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadScriptures();
    }
  }, [user]);

  const loadScriptures = async () => {
    try {
      const { data, error } = await supabase
        .from('scriptures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading scriptures:', error);
        // Insert sample data if empty
        await insertSampleScriptures();
        return;
      }

      if (!data || data.length === 0) {
        await insertSampleScriptures();
      } else {
        setScriptures(data);
      }
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

  if (authLoading || loading) {
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
    
    return matchesSearch && matchesTradition && matchesDifficulty;
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            Sacred Scriptures 📖
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore timeless wisdom from ancient texts and modern spiritual teachings. 
            Read, listen, and absorb the profound knowledge of the ages.
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
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedTradition}
                onChange={(e) => setSelectedTradition(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Traditions</option>
                {traditions.map(tradition => (
                  <option key={tradition} value={tradition}>{tradition}</option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScriptures.map((scripture) => (
              <Card key={scripture.id} className="card-sacred group cursor-pointer" onClick={() => navigate(`/scriptures/${scripture.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">{getTypeIcon(scripture.type)}</div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {scripture.title}
                        </CardTitle>
                        {scripture.author && (
                          <CardDescription>by {scripture.author}</CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {scripture.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {scripture.tradition && (
                      <Badge variant="outline" className="text-xs">
                        {scripture.tradition}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getDifficultyColor(scripture.difficulty_level)}`}>
                      {scripture.difficulty_level.charAt(0).toUpperCase() + scripture.difficulty_level.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {scripture.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{scripture.total_chapters} chapters</span>
                      </span>
                      {scripture.estimated_reading_time && (
                        <span className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(scripture.estimated_reading_time / 60)}h {scripture.estimated_reading_time % 60}m</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Reading Progress (Mock) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.floor(Math.random() * 100)}%</span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 100)} className="h-1" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/scriptures/${scripture.id}`);
                    }}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Read
                    </Button>
                    
                    {scripture.audio_url && (
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        // Handle audio playback
                      }}>
                        <Headphones className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {scripture.pdf_url && (
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        // Handle PDF download
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scriptures;