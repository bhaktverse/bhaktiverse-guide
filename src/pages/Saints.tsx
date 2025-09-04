import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageCircle, BookOpen, Users, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Saint {
  id: string;
  name: string;
  tradition: string;
  biography: string;
  key_teachings: string;
  famous_quotes: any;
  image_url: string;
  birth_year: number;
  death_year?: number;
  verified: boolean;
  ai_model_fine_tuned: boolean;
}

const Saints = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [saints, setSaints] = useState<Saint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradition, setSelectedTradition] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    loadSaints();
  }, [user, authLoading, navigate]);

  const loadSaints = async () => {
    try {
      const { data, error } = await supabase
        .from('saints')
        .select('*')
        .order('name');

      if (error) throw error;
      setSaints(data || []);
      
      // Add sample saints if none exist
      if (!data || data.length === 0) {
        await insertSampleSaints();
      }
    } catch (error) {
      console.error('Error loading saints:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertSampleSaints = async () => {
    const sampleSaints = [
      {
        name: 'Swami Vivekananda',
        biography: 'Swami Vivekananda was a Hindu monk and philosopher who introduced Vedanta and Yoga to the Western world.',
        key_teachings: 'Arise, awake, and stop not until the goal is reached. Be strong, be fearless, be practical.',
        famous_quotes: [
          'Arise, awake, and stop not until the goal is reached!',
          'You are the children of God, the sharers of immortal bliss.',
          'Take up one idea. Make that one idea your life.'
        ],
        birth_year: 1863,
        death_year: 1902,
        tradition: 'Vedanta',
        verified: true,
        ai_model_fine_tuned: true
      },
      {
        name: 'Sant Kabir',
        tradition: 'Bhakti',
        biography: 'Kabir was a 15th-century Indian mystic poet and saint, whose writings influenced Hinduism and Islam.',
        key_teachings: 'Unity of all religions, importance of devotion over ritual, direct experience of divine.',
        famous_quotes: [
          'काल करे सो आज कर, आज करे सो अब।',
          'सुनो भाई साधो, सब संसार है सपना।',
          'जहाँ दया तहाँ धर्म है, जहाँ लोभ वहाँ पाप।'
        ],
        birth_year: 1440,
        death_year: 1518,
        verified: true,
        ai_model_fine_tuned: true
      },
      {
        name: 'Meera Bai',
        tradition: 'Krishna Bhakti',
        biography: 'Meera Bai was a 16th-century Hindu mystic poet and devotee of Lord Krishna.',
        key_teachings: 'Devotional love (bhakti) as the path to liberation, surrender to divine will.',
        famous_quotes: [
          'मेरे तो गिरिधर गोपाल, दूसरो न कोई।',
          'जो वादा सो निबाहना पड़ेगा।',
          'हरि आप हरो जन री भीर।'
        ],
        birth_year: 1498,
        death_year: 1547,
        verified: true,
        ai_model_fine_tuned: true
      }
    ];

    try {
      const { error } = await supabase
        .from('saints')
        .insert(sampleSaints);
      
      if (!error) {
        setSaints(sampleSaints as Saint[]);
      }
    } catch (error) {
      console.error('Error inserting sample saints:', error);
    }
  };

  const filteredSaints = saints.filter(saint => {
    const matchesSearch = saint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         saint.tradition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTradition = !selectedTradition || saint.tradition === selectedTradition;
    return matchesSearch && matchesTradition;
  });

  const traditions = Array.from(new Set(saints.map(saint => saint.tradition)));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-temple">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-om-pulse">🕉️</div>
          <p className="text-muted-foreground">Loading spiritual guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-temple">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card-sacred/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent">
                Spiritual Saints & Guides
              </h1>
              <p className="text-muted-foreground mt-1">
                Connect with enlightened masters through AI-powered conversations
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saints, traditions, teachings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/70 border-border/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTradition === '' ? 'default' : 'outline'}
                onClick={() => setSelectedTradition('')}
                size="sm"
              >
                All Traditions
              </Button>
              {traditions.map((tradition) => (
                <Button
                  key={tradition}
                  variant={selectedTradition === tradition ? 'default' : 'outline'}
                  onClick={() => setSelectedTradition(tradition)}
                  size="sm"
                >
                  {tradition}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saints Grid */}
      <div className="container mx-auto px-4 py-6">
        {filteredSaints.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Saints Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSaints.map((saint) => (
              <Card key={saint.id} className="bg-card-sacred/80 backdrop-blur-md border-border/50 hover:shadow-sacred transition-all duration-300 hover:scale-105 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage src={saint.image_url} alt={saint.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {saint.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate">{saint.name}</CardTitle>
                        {saint.verified && (
                          <div className="text-primary">✓</div>
                        )}
                        {saint.ai_model_fine_tuned && (
                          <Sparkles className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{saint.tradition}</Badge>
                        <span>•</span>
                        <span>{saint.birth_year}{saint.death_year ? ` - ${saint.death_year}` : ' - Present'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4 line-clamp-3">
                    {saint.biography}
                  </CardDescription>
                  
                  {saint.famous_quotes && saint.famous_quotes.length > 0 && (
                    <div className="mb-4 p-3 bg-background/50 rounded-lg">
                      <p className="text-sm italic text-muted-foreground">
                        "{saint.famous_quotes[0]}"
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/saints/${saint.id}/chat`)}
                      className="flex-1 bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with {saint.name.split(' ')[0]}
                    </Button>
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>1.2k followers</span>
                    </div>
                    {saint.ai_model_fine_tuned && (
                      <div className="flex items-center gap-1 text-accent">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Enhanced</span>
                      </div>
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

export default Saints;