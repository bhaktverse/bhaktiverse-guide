import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, BookOpen, Building, Music, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'saint' | 'scripture' | 'temple' | 'audio';
  icon: typeof Users;
  path: string;
}

const typeConfig = {
  saint: { icon: Users, label: 'Saint', color: 'text-primary' },
  scripture: { icon: BookOpen, label: 'Scripture', color: 'text-secondary' },
  temple: { icon: Building, label: 'Temple', color: 'text-accent-foreground' },
  audio: { icon: Music, label: 'Audio', color: 'text-muted-foreground' },
};

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

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
          ...(saints.data || []).map(s => ({
            id: s.id, title: s.name, subtitle: s.tradition || undefined,
            type: 'saint' as const, icon: Users, path: `/saints`,
          })),
          ...(scriptures.data || []).map(s => ({
            id: s.id, title: s.title, subtitle: s.author || undefined,
            type: 'scripture' as const, icon: BookOpen, path: `/scriptures/${s.id}`,
          })),
          ...(temples.data || []).map(t => ({
            id: t.id, title: t.name, subtitle: t.primary_deity || undefined,
            type: 'temple' as const, icon: Building, path: `/temples/${t.id}`,
          })),
          ...(audio.data || []).map(a => ({
            id: a.id, title: a.title, subtitle: a.artist || undefined,
            type: 'audio' as const, icon: Music, path: `/audio-library`,
          })),
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
    setOpen(false);
    setQuery('');
    navigate(result.path);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search saints, scriptures, temples..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="pl-9 pr-8 h-9 w-56 lg:w-72 bg-muted/50 border-border"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {open && (query.length >= 2) && (
        <div className="absolute top-full mt-1 w-80 lg:w-96 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {config.label}{result.subtitle ? ` · ${result.subtitle}` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
