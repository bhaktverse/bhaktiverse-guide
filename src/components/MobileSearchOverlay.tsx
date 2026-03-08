import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, BookOpen, Building, Music, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'saint' | 'scripture' | 'temple' | 'audio';
  path: string;
}

const typeConfig = {
  saint: { icon: Users, label: 'Saint', color: 'text-primary' },
  scripture: { icon: BookOpen, label: 'Scripture', color: 'text-secondary' },
  temple: { icon: Building, label: 'Temple', color: 'text-accent-foreground' },
  audio: { icon: Music, label: 'Audio', color: 'text-muted-foreground' },
};

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const MobileSearchOverlay = ({ open, onClose }: MobileSearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchTerm = `%${query}%`;
        const [saints, scriptures, temples, audio] = await Promise.all([
          supabase.from('saints').select('id, name, tradition').ilike('name', searchTerm).limit(3),
          supabase.from('scriptures').select('id, title, author').ilike('title', searchTerm).limit(3),
          supabase.from('temples').select('id, name, primary_deity').ilike('name', searchTerm).limit(3),
          supabase.from('audio_library').select('id, title, artist').ilike('title', searchTerm).limit(3),
        ]);

        const mapped: SearchResult[] = [
          ...(saints.data || []).map(s => ({ id: s.id, title: s.name, subtitle: s.tradition || undefined, type: 'saint' as const, path: '/saints' })),
          ...(scriptures.data || []).map(s => ({ id: s.id, title: s.title, subtitle: s.author || undefined, type: 'scripture' as const, path: `/scriptures/${s.id}` })),
          ...(temples.data || []).map(t => ({ id: t.id, title: t.name, subtitle: t.primary_deity || undefined, type: 'temple' as const, path: `/temples/${t.id}` })),
          ...(audio.data || []).map(a => ({ id: a.id, title: a.title, subtitle: a.artist || undefined, type: 'audio' as const, path: '/audio-library' })),
        ];
        setResults(mapped);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onClose();
    navigate(result.path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      {/* Search Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search saints, scriptures, temples..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : query.length < 2 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Type at least 2 characters to search
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No results found for "{query}"
          </div>
        ) : (
          results.map((result) => {
            const config = typeConfig[result.type];
            const Icon = config.icon;
            return (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
              >
                <div className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {config.label}{result.subtitle ? ` · ${result.subtitle}` : ''}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileSearchOverlay;
