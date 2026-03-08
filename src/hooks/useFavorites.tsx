import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Favorite {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
}

export const useFavorites = (contentType?: string) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFavorites((data as Favorite[]) || []);
    } catch (err) {
      console.error('Load favorites error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, contentType]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorited = useCallback(
    (contentId: string) => favorites.some(f => f.content_id === contentId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (contentId: string, type: string) => {
      if (!user) {
        toast.error('Please login to save favorites');
        return;
      }

      const existing = favorites.find(f => f.content_id === contentId && f.content_type === type);

      if (existing) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existing.id);

        if (error) {
          toast.error('Could not remove favorite');
          return;
        }
        setFavorites(prev => prev.filter(f => f.id !== existing.id));
        toast.success('Removed from favorites');
      } else {
        const { data, error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, content_type: type, content_id: contentId })
          .select()
          .single();

        if (error) {
          toast.error('Could not add favorite');
          return;
        }
        setFavorites(prev => [data as Favorite, ...prev]);
        toast.success('Added to favorites ❤️');
      }
    },
    [user, favorites]
  );

  return { favorites, loading, isFavorited, toggleFavorite, refresh: loadFavorites };
};
