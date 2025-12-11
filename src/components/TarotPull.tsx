import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, RotateCcw, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TarotCard {
  name: string;
  position: string;
  meaning: string;
  advice: string;
  isReversed: boolean;
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

// Major Arcana deck
const TAROT_DECK = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World",
  // Minor Arcana selection
  "Ace of Wands", "Two of Wands", "Three of Wands", "Ten of Wands",
  "Ace of Cups", "Two of Cups", "Three of Cups", "Ten of Cups",
  "Ace of Swords", "Two of Swords", "Three of Swords", "Ten of Swords",
  "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Ten of Pentacles"
];

const POSITIONS = [
  { name: "Past", description: "What has shaped your journey" },
  { name: "Present", description: "Your current energy and situation" },
  { name: "Future", description: "What lies ahead on your path" }
];

const TarotPull = ({ palmAnalysis, language = 'en', onPullComplete }: TarotPullProps) => {
  const { toast } = useToast();
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [interpretation, setInterpretation] = useState<string>('');
  const [isPulling, setIsPulling] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const shuffleAndPull = () => {
    // Shuffle deck using Fisher-Yates
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    
    // Pull 3 cards with random reversal
    const pulled: TarotCard[] = POSITIONS.map((pos, i) => ({
      name: shuffled[i],
      position: pos.name,
      meaning: '',
      advice: '',
      isReversed: Math.random() > 0.7 // 30% chance of reversal
    }));
    
    return pulled;
  };

  const handlePull = async () => {
    setIsPulling(true);
    setShowCards(false);
    setCards([]);
    setInterpretation('');

    // Animate card pull
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pulledCards = shuffleAndPull();
    setCards(pulledCards);
    setIsPulling(false);
    setShowCards(true);

    // Get AI interpretation
    await getInterpretation(pulledCards);
  };

  const getInterpretation = async (pulledCards: TarotCard[]) => {
    setIsInterpreting(true);

    try {
      const { data, error } = await supabase.functions.invoke('saint-chat', {
        body: {
          message: `As a Vedic spiritual guide, provide a brief 3-card tarot interpretation (max 150 words):

Cards Drawn:
1. ${pulledCards[0].position}: ${pulledCards[0].name}${pulledCards[0].isReversed ? ' (Reversed)' : ''}
2. ${pulledCards[1].position}: ${pulledCards[1].name}${pulledCards[1].isReversed ? ' (Reversed)' : ''}
3. ${pulledCards[2].position}: ${pulledCards[2].name}${pulledCards[2].isReversed ? ' (Reversed)' : ''}

${palmAnalysis ? `Context from palm reading: ${palmAnalysis.palmType} hand, ${palmAnalysis.dominantPlanet} dominant` : ''}

Provide a cohesive reading that:
1. Briefly explains each card's significance in its position (1-2 sentences each)
2. Gives ONE actionable suggestion
3. Ends with a positive affirmation

Keep the tone warm and encouraging. ${language === 'hi' ? 'Respond in Hindi/Hinglish.' : 'Respond in English.'}`,
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
      // Fallback interpretation
      setInterpretation(`Your three-card spread reveals: ${pulledCards.map(c => c.name).join(', ')}. This combination suggests a journey of transformation. Trust your intuition and stay open to new possibilities.`);
    } finally {
      setIsInterpreting(false);
    }
  };

  const getCardEmoji = (cardName: string) => {
    if (cardName.includes('Wands')) return '🔥';
    if (cardName.includes('Cups')) return '💧';
    if (cardName.includes('Swords')) return '⚔️';
    if (cardName.includes('Pentacles')) return '🪙';
    if (cardName.includes('Sun')) return '☀️';
    if (cardName.includes('Moon')) return '🌙';
    if (cardName.includes('Star')) return '⭐';
    if (cardName.includes('Fool')) return '🎭';
    if (cardName.includes('Lovers')) return '❤️';
    if (cardName.includes('Death')) return '🦋';
    if (cardName.includes('Tower')) return '⚡';
    if (cardName.includes('Wheel')) return '🎡';
    return '🃏';
  };

  return (
    <Card className="card-sacred overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              3-Card Tarot Pull
            </CardTitle>
            <CardDescription>
              Complement your palm reading with tarot guidance
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            Free Add-on
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Pull Button */}
        {cards.length === 0 && !isPulling && (
          <Button
            onClick={handlePull}
            className="w-full h-16 text-lg gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="h-5 w-5" />
            Pull 3 Cards from the Deck
          </Button>
        )}

        {/* Pulling Animation */}
        {isPulling && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-6xl animate-bounce">🎴</div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Shuffling the cosmic deck...
            </p>
          </div>
        )}

        {/* Cards Display */}
        {showCards && cards.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {cards.map((card, i) => (
                <div 
                  key={i}
                  className={`
                    relative p-4 rounded-xl border-2 text-center
                    ${card.isReversed ? 'bg-muted/50 border-amber-500/50' : 'bg-gradient-to-b from-primary/10 to-secondary/10 border-primary/30'}
                    transform transition-all duration-500
                    ${showCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                  `}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  {/* Position */}
                  <Badge variant="outline" className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">
                    {card.position}
                  </Badge>
                  
                  {/* Card face */}
                  <div className={`py-4 ${card.isReversed ? 'rotate-180' : ''}`}>
                    <div className="text-4xl mb-2">{getCardEmoji(card.name)}</div>
                  </div>
                  
                  {/* Card name */}
                  <p className="font-semibold text-sm leading-tight">
                    {card.name}
                  </p>
                  
                  {card.isReversed && (
                    <Badge variant="outline" className="mt-2 text-xs text-amber-600 border-amber-500">
                      Reversed
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Interpretation */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Reading Interpretation
              </h4>
              {isInterpreting ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Channeling cosmic wisdom...
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{interpretation}</p>
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
                  const text = `🔮 My Tarot Pull:\n${cards.map(c => `${c.position}: ${c.name}`).join('\n')}\n\nGet your reading at BhaktVerse!`;
                  navigator.share?.({ text }) || navigator.clipboard.writeText(text);
                  toast({ title: "Copied to clipboard!" });
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground">
          Tarot readings are for entertainment and spiritual reflection only.
        </p>
      </CardContent>
    </Card>
  );
};

export default TarotPull;
