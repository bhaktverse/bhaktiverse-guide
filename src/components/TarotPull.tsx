import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, RotateCcw, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MAJOR_ARCANA, type TarotCardData } from '@/data/tarotCards';

interface TarotCard {
  name: string;
  position: string;
  meaning: string;
  advice: string;
  isReversed: boolean;
  cardData?: TarotCardData;
}

interface TarotPullProps {
  palmAnalysis?: {
    palmType?: string;
    dominantPlanet?: string;
    overallDestiny?: string;
  };
  language?: string;
  onPullComplete?: (cards: TarotCard[], interpretation: string) => void;
}

const POSITIONS = [
  { name: "Past", description: "What has shaped your journey", icon: "🕰️" },
  { name: "Present", description: "Your current energy", icon: "⚡" },
  { name: "Future", description: "What lies ahead", icon: "🌟" }
];

const CARD_GRADIENTS: Record<string, string> = {
  Fire: 'from-red-600/90 via-orange-500/80 to-amber-400/70',
  Water: 'from-blue-700/90 via-cyan-500/80 to-teal-400/70',
  Air: 'from-violet-600/90 via-purple-500/80 to-indigo-400/70',
  Earth: 'from-emerald-700/90 via-green-500/80 to-lime-400/70',
};

const TarotPull = ({ palmAnalysis, language = 'en', onPullComplete }: TarotPullProps) => {
  const { toast } = useToast();
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [interpretation, setInterpretation] = useState<string>('');
  const [isPulling, setIsPulling] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const shuffleAndPull = () => {
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    const pulled: TarotCard[] = POSITIONS.map((pos, i) => ({
      name: shuffled[i].name,
      position: pos.name,
      meaning: '',
      advice: '',
      isReversed: Math.random() > 0.7,
      cardData: shuffled[i]
    }));
    return pulled;
  };

  const handlePull = async () => {
    setIsPulling(true);
    setShowCards(false);
    setCards([]);
    setInterpretation('');
    setFlippedCards(new Set());
    setExpandedCard(null);

    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const pulledCards = shuffleAndPull();
    setCards(pulledCards);
    setIsPulling(false);
    setShowCards(true);

    // Auto-flip cards one by one
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setFlippedCards(prev => new Set([...prev, i]));
    }

    await getInterpretation(pulledCards);
  };

  const getInterpretation = async (pulledCards: TarotCard[]) => {
    setIsInterpreting(true);
    try {
      const { data, error } = await supabase.functions.invoke('saint-chat', {
        body: {
          message: `As a Vedic spiritual guide, provide a brief 3-card tarot interpretation (max 150 words):

Cards Drawn:
1. ${pulledCards[0].position}: ${pulledCards[0].name}${pulledCards[0].isReversed ? ' (Reversed)' : ''} - Hindu correlation: ${pulledCards[0].cardData?.hinduCorrelation.concept}
2. ${pulledCards[1].position}: ${pulledCards[1].name}${pulledCards[1].isReversed ? ' (Reversed)' : ''} - Hindu correlation: ${pulledCards[1].cardData?.hinduCorrelation.concept}
3. ${pulledCards[2].position}: ${pulledCards[2].name}${pulledCards[2].isReversed ? ' (Reversed)' : ''} - Hindu correlation: ${pulledCards[2].cardData?.hinduCorrelation.concept}

${palmAnalysis ? `Context from palm reading: ${palmAnalysis.palmType} hand, ${palmAnalysis.dominantPlanet} dominant` : ''}

Provide a cohesive reading with Hindu spiritual context. End with a positive affirmation.
${language === 'hi' ? 'Respond in Hindi/Hinglish.' : 'Respond in English.'}`,
          saintId: 'general',
          sessionId: `tarot-${Date.now()}`
        }
      });

      if (data?.response) {
        setInterpretation(data.response);
        onPullComplete?.(pulledCards, data.response);
      }
    } catch (error) {
      console.error('Tarot interpretation error:', error);
      const fallback = pulledCards.map(c => {
        const d = c.cardData;
        const m = c.isReversed ? d?.meaning.reversed : d?.meaning.upright;
        return `**${c.position} - ${c.name}${c.isReversed ? ' (Reversed)' : ''}**: ${m}`;
      }).join('\n\n');
      setInterpretation(fallback || `Your spread: ${pulledCards.map(c => c.name).join(', ')}. Trust your intuition.`);
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-card/80">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)]" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span className="text-3xl">🔮</span>
              Vedic Tarot Reading
            </CardTitle>
            <CardDescription className="mt-1">
              Ancient Hindu wisdom through tarot archetypes
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            ✨ Free
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Pull Button */}
        {cards.length === 0 && !isPulling && (
          <div className="text-center py-8 space-y-6">
            <div className="text-7xl animate-pulse">🎴</div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Focus your mind, take a deep breath, and pull three cards to reveal your cosmic guidance
            </p>
            <Button
              onClick={handlePull}
              size="lg"
              className="h-14 px-8 text-lg gap-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="h-5 w-5" />
              Pull 3 Cards
            </Button>
          </div>
        )}

        {/* Pulling Animation */}
        {isPulling && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="text-7xl animate-bounce">🎴</div>
              <div className="absolute inset-0 animate-ping opacity-20 text-7xl">🎴</div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse font-medium">
              🕉️ Channeling cosmic energy...
            </p>
          </div>
        )}

        {/* Cards Display */}
        {showCards && cards.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              {cards.map((card, i) => {
                const isFlipped = flippedCards.has(i);
                const isExpanded = expandedCard === i;
                const gradient = CARD_GRADIENTS[card.cardData?.element || 'Air'];
                const keywords = card.isReversed 
                  ? card.cardData?.keywords.reversed 
                  : card.cardData?.keywords.upright;

                return (
                  <div key={i} className="space-y-2">
                    {/* Position Label */}
                    <div className="text-center">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {POSITIONS[i].icon} {card.position}
                      </span>
                    </div>

                    {/* Card */}
                    <div 
                      className="perspective-1000 cursor-pointer"
                      onClick={() => setExpandedCard(isExpanded ? null : i)}
                      style={{ perspective: '1000px' }}
                    >
                      <div 
                        className={`relative transition-all duration-700 transform-style-3d ${
                          isFlipped ? '' : '[transform:rotateY(180deg)]'
                        }`}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Card Front */}
                        <div 
                          className={`relative rounded-xl overflow-hidden border-2 ${
                            card.isReversed ? 'border-amber-500/60' : 'border-primary/40'
                          } shadow-lg hover:shadow-xl transition-shadow`}
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          {/* Card Background */}
                          <div className={`bg-gradient-to-br ${gradient} p-3 sm:p-4 min-h-[180px] sm:min-h-[220px] flex flex-col items-center justify-between`}>
                            {/* Element Badge */}
                            <Badge className="bg-black/30 text-white border-white/20 text-[10px]">
                              {card.cardData?.element}
                            </Badge>

                            {/* Card Symbol */}
                            <div className={`text-5xl sm:text-6xl my-3 ${card.isReversed ? 'rotate-180' : ''} drop-shadow-lg`}>
                              {card.cardData?.imageSymbol || '🃏'}
                            </div>

                            {/* Card Name */}
                            <div className="text-center">
                              <p className="font-bold text-white text-xs sm:text-sm leading-tight drop-shadow">
                                {card.name}
                              </p>
                              {card.isReversed && (
                                <Badge className="mt-1 bg-amber-500/80 text-white text-[10px] border-0">
                                  ↺ Reversed
                                </Badge>
                              )}
                            </div>

                            {/* Roman Numeral */}
                            <div className="absolute top-2 left-2 text-white/40 text-xs font-bold">
                              {card.cardData?.numerology}
                            </div>
                          </div>

                          {/* Deity Correlation */}
                          {card.cardData?.hinduCorrelation.deity && (
                            <div className="bg-background/95 px-3 py-2 text-center border-t border-border/50">
                              <p className="text-[10px] text-muted-foreground font-medium">
                                🙏 {card.cardData.hinduCorrelation.deity}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Card Back (hidden when flipped) */}
                        <div 
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 border-2 border-primary/30 flex items-center justify-center"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <div className="text-center">
                            <div className="text-5xl mb-2">🕉️</div>
                            <p className="text-white/60 text-xs">Revealing...</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    {isFlipped && keywords && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {keywords.slice(0, 2).map((kw, ki) => (
                          <Badge key={ki} variant="outline" className="text-[9px] px-1.5 py-0">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && isFlipped && card.cardData && (
                      <Card className="bg-muted/50 border-primary/20 animate-in slide-in-from-top-2">
                        <CardContent className="p-3 space-y-2 text-xs">
                          <p className="font-medium text-foreground">
                            {card.isReversed ? card.cardData.meaning.reversed : card.cardData.meaning.upright}
                          </p>
                          <div className="bg-primary/10 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground font-medium mb-1">🙏 Hindu Wisdom</p>
                            <p className="text-foreground/80">{card.cardData.hinduCorrelation.concept}</p>
                            {card.cardData.hinduCorrelation.mantra && (
                              <p className="text-primary font-semibold mt-1 text-[11px]">
                                📿 {card.cardData.hinduCorrelation.mantra}
                              </p>
                            )}
                          </div>
                          <p className="italic text-muted-foreground">
                            💡 {card.isReversed ? card.cardData.advice.reversed : card.cardData.advice.upright}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tap to expand hint */}
            <p className="text-center text-xs text-muted-foreground">
              👆 Tap any card for detailed meaning & mantra
            </p>

            {/* AI Interpretation */}
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl p-4 space-y-3 border border-primary/10">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Guru Interpretation
              </h4>
              {isInterpreting ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Channeling divine wisdom...
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-line">{interpretation}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePull}
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Pull Again
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const text = `🔮 My Vedic Tarot Pull:\n${cards.map(c => {
                    const deity = c.cardData?.hinduCorrelation.deity;
                    return `${c.position}: ${c.name}${c.isReversed ? ' (Reversed)' : ''}${deity ? ` • ${deity}` : ''}`;
                  }).join('\n')}\n\nGet your reading at BhaktVerse!`;
                  navigator.share?.({ text }) || navigator.clipboard.writeText(text);
                  toast({ title: "Copied to clipboard!" });
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          🕉️ Tarot readings blend ancient Hindu wisdom with archetypal symbolism for spiritual reflection.
        </p>
      </CardContent>
    </Card>
  );
};

export default TarotPull;
