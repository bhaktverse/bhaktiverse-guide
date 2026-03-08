import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Users, BookOpen, Building, Music, Trash2, Loader2 } from 'lucide-react';

interface FavoriteItem {
  id: string;
  content_id: string;
  content_type: string;
  created_at: string;
  details?: { title: string; subtitle?: string; image?: string };
}

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, loading: favsLoading, toggleFavorite } = useFavorites();
  const [enriched, setEnriched] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favsLoading) return;
    enrichFavorites();
  }, [favorites, favsLoading]);

  const enrichFavorites = async () => {
    setLoading(true);
    const items: FavoriteItem[] = [];

    // Group by type
    const grouped: Record<string, string[]> = {};
    favorites.forEach(f => {
      if (!grouped[f.content_type]) grouped[f.content_type] = [];
      grouped[f.content_type].push(f.content_id);
    });

    // Fetch details per type
    const detailsMap: Record<string, { title: string; subtitle?: string; image?: string }> = {};

    const promises: Promise<void>[] = [];

    if (grouped['saint']?.length) {
      promises.push(
        supabase.from('saints').select('id, name, tradition, image_url').in('id', grouped['saint']).then(({ data }) => {
          data?.forEach(s => { detailsMap[s.id] = { title: s.name, subtitle: s.tradition || undefined, image: s.image_url || undefined }; });
        })
      );
    }
    if (grouped['scripture']?.length) {
      promises.push(
        supabase.from('scriptures').select('id, title, author').in('id', grouped['scripture']).then(({ data }) => {
          data?.forEach(s => { detailsMap[s.id] = { title: s.title, subtitle: s.author || undefined }; });
        })
      );
    }
    if (grouped['temple']?.length) {
      promises.push(
        supabase.from('temples').select('id, name, primary_deity').in('id', grouped['temple']).then(({ data }) => {
          data?.forEach(t => { detailsMap[t.id] = { title: t.name, subtitle: t.primary_deity || undefined }; });
        })
      );
    }
    if (grouped['audio']?.length) {
      promises.push(
        supabase.from('audio_library').select('id, title, artist').in('id', grouped['audio']).then(({ data }) => {
          data?.forEach(a => { detailsMap[a.id] = { title: a.title, subtitle: a.artist || undefined }; });
        })
      );
    }

    await Promise.all(promises);

    favorites.forEach(f => {
      items.push({
        ...f,
        details: detailsMap[f.content_id] || { title: 'Unknown' },
      });
    });

    setEnriched(items);
    setLoading(false);
  };

  const typeConfig: Record<string, { icon: typeof Users; label: string; color: string; path: (id: string) => string }> = {
    saint: { icon: Users, label: 'Saints', color: 'text-primary', path: () => '/saints' },
    scripture: { icon: BookOpen, label: 'Scriptures', color: 'text-secondary', path: (id) => `/scriptures/${id}` },
    temple: { icon: Building, label: 'Temples', color: 'text-accent-foreground', path: (id) => `/temples/${id}` },
    audio: { icon: Music, label: 'Audio', color: 'text-muted-foreground', path: () => '/audio-library' },
  };

  const types = ['all', 'saint', 'scripture', 'temple', 'audio'];

  const renderItems = (type: string) => {
    const items = type === 'all' ? enriched : enriched.filter(i => i.content_type === type);
    
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No favorites yet in this category</p>
          <p className="text-xs mt-1">Start exploring and heart the content you love!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map(item => {
          const config = typeConfig[item.content_type];
          const Icon = config?.icon || Heart;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
              onClick={() => {
                if (config) navigate(config.path(item.content_id));
              }}
            >
              {item.details?.image ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.details.image} />
                  <AvatarFallback><Icon className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              ) : (
                <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${config?.color || ''}`} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.details?.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {config?.label}{item.details?.subtitle ? ` · ${item.details.subtitle}` : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.content_id, item.content_type);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-8 max-w-3xl">
        <Breadcrumbs className="mb-6" />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Favorites ❤️
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {enriched.length} saved items across your spiritual journey
          </p>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            {types.map(t => (
              <TabsTrigger key={t} value={t} className="text-xs capitalize">
                {t === 'all' ? `All (${enriched.length})` : `${typeConfig[t]?.label || t} (${enriched.filter(i => i.content_type === t).length})`}
              </TabsTrigger>
            ))}
          </TabsList>
          {types.map(t => (
            <TabsContent key={t} value={t}>
              <Card>
                <CardContent className="p-4">
                  {renderItems(t)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Favorites;
