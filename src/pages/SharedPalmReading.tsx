import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Hand, Star, Copy, Check, Share2 } from 'lucide-react';

const SharedPalmReading = () => {
  const { readingId } = useParams<{ readingId: string }>();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!readingId) return;
    fetchReading();
  }, [readingId]);

  // Dynamic OG meta tags
  useEffect(() => {
    if (!reading) return;
    const analysis = reading.analysis;
    const score = analysis?.overallScore ? `Score: ${analysis.overallScore}/10` : '';
    const title = `🤚 Palm Reading ${score} | BhaktVerse`;
    const description = analysis?.overallDestiny
      ? analysis.overallDestiny.substring(0, 155) + '...'
      : 'AI-powered palm reading analysis on BhaktVerse - your spiritual companion.';

    document.title = title;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const pageUrl = window.location.href;

    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:type', 'article');
    setMeta('og:url', pageUrl);
    setMeta('og:image', 'https://bhaktverse.lovable.app/og-palm-reading.jpg');
    setMeta('og:site_name', 'BhaktVerse');

    setMetaName('twitter:card', 'summary');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);

    return () => {
      document.title = 'BhaktVerse - AI Spiritual Platform';
    };
  }, [reading]);

  const fetchReading = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-shared-reading?id=${readingId}`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          },
        }
      );

      if (!response.ok) {
        setError('Reading not found or has been removed.');
        return;
      }

      const result = await response.json();
      if (result.reading) {
        setReading(result.reading);
      } else {
        setError('Reading not found.');
      }
    } catch (err) {
      console.error('Error fetching shared reading:', err);
      setError('Failed to load reading.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: '🔗 Link Copied!', description: 'Share this link with friends and family.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the URL manually.', variant: 'destructive' });
    }
  };

  const shareReading = async () => {
    const analysis = reading?.analysis;
    const shareData = {
      title: 'My Palm Reading | BhaktVerse',
      text: analysis?.overallDestiny?.substring(0, 100) || 'Check out my AI palm reading!',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading palm reading...</p>
        </div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Hand className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Reading Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'This reading may have been removed.'}</p>
          <Button onClick={() => navigate('/palm-reading')}>Get Your Own Reading</Button>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const analysis = reading.analysis;
  const createdAt = new Date(reading.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs className="mb-4" />
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-4xl">
        {/* Header */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🤚</div>
            <CardTitle className="text-2xl">Shared Palm Reading</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary">{reading.palm_type || 'Palm Analysis'}</Badge>
              <Badge variant="outline">{createdAt}</Badge>
            </div>
            {analysis?.overallScore && (
              <div className="flex items-center justify-center gap-1 mt-3">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="text-lg font-semibold">{analysis.overallScore}/10</span>
              </div>
            )}
            {/* Share buttons */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button variant="outline" size="sm" onClick={shareReading} className="gap-1.5">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Overall Destiny */}
        {analysis?.overallDestiny && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">{analysis.overallDestiny}</p>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        {analysis?.categories && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">Life Predictions</h2>
            {Object.entries(analysis.categories).map(([key, cat]: [string, any]) => (
              cat && (
                <Card key={key} className="border-border/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{cat.title || key}</h3>
                      {cat.rating && <Badge variant="outline">{cat.rating}/10</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{cat.prediction}</p>
                    {cat.guidance && (
                      <p className="text-xs text-primary italic">💡 {cat.guidance}</p>
                    )}
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}

        {/* Lucky Elements */}
        {analysis?.luckyElements && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Lucky Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {analysis.luckyElements.colors?.length > 0 && (
                  <div><span className="font-medium">Colors:</span> {analysis.luckyElements.colors.join(', ')}</div>
                )}
                {analysis.luckyElements.gemstones?.length > 0 && (
                  <div><span className="font-medium">Gemstones:</span> {analysis.luckyElements.gemstones.join(', ')}</div>
                )}
                {analysis.luckyElements.numbers?.length > 0 && (
                  <div><span className="font-medium">Numbers:</span> {analysis.luckyElements.numbers.join(', ')}</div>
                )}
                {analysis.luckyElements.days?.length > 0 && (
                  <div><span className="font-medium">Days:</span> {analysis.luckyElements.days.join(', ')}</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blessings */}
        {analysis?.blessings && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <p className="text-primary font-medium italic">🙏 {analysis.blessings}</p>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center mt-8">
          <Button size="lg" onClick={() => navigate('/palm-reading')} className="gap-2">
            <Hand className="h-5 w-5" />
            Get Your Own Palm Reading
          </Button>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default SharedPalmReading;
