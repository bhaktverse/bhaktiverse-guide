import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageCircle, BookOpen, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';

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
  const { user } = useAuth();
  const [saints, setSaints] = useState<Saint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradition, setSelectedTradition] = useState<string>('');

  useEffect(() => { loadSaints(); }, []);

  const loadSaints = async () => {
    try {
      const { data, error } = await supabase.from('saints').select('*').order('name');
      if (error) throw error;
      setSaints(data || []);
    } catch (error) {
      console.error('Error loading saints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSaints = saints.filter(saint => {
    const matchesSearch = saint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (saint.tradition || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTradition = !selectedTradition || saint.tradition === selectedTradition;
    return matchesSearch && matchesTradition;
  });

  const traditions = Array.from(new Set(saints.map(saint => saint.tradition).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🕉️</div>
          <p className="text-muted-foreground">Loading spiritual guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Breadcrumbs className="mb-6" />
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Divine Saints & Gurus ✨
              </h1>
              <p className="text-muted-foreground">
                Chat with AI-powered spiritual guides for personalized wisdom
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saints, traditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={!selectedTradition ? 'default' : 'outline'} onClick={() => setSelectedTradition('')} size="sm">
                All
              </Button>
              {traditions.map((t) => (
                <Button key={t} variant={selectedTradition === t ? 'default' : 'outline'} onClick={() => setSelectedTradition(t)} size="sm">
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Saints Grid */}
        {filteredSaints.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Saints Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSaints.map((saint) => (
              <Card key={saint.id} className="group overflow-hidden border border-border/50 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                      <AvatarImage src={saint.image_url} alt={saint.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                        {saint.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate">{saint.name}</CardTitle>
                        {saint.verified && <span className="text-primary text-sm">✓</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{saint.tradition}</Badge>
                        <span>{saint.birth_year}{saint.death_year ? ` - ${saint.death_year}` : ''}</span>
                      </div>
                    </div>
                    {saint.ai_model_fine_tuned && (
                      <Badge className="bg-accent text-white text-[10px]">
                        <Sparkles className="h-3 w-3 mr-1" />AI
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{saint.biography}</p>
                  
                  {saint.key_teachings && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">📖 Key Teachings</p>
                      <p className="text-xs line-clamp-2">{saint.key_teachings}</p>
                    </div>
                  )}

                  {saint.famous_quotes && Array.isArray(saint.famous_quotes) && saint.famous_quotes.length > 0 && (
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <p className="text-xs italic text-muted-foreground line-clamp-2">
                        "{saint.famous_quotes[0]}"
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => navigate(`/saints/${saint.id}/chat`)}
                    className="w-full gap-2"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Guru
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default Saints;
