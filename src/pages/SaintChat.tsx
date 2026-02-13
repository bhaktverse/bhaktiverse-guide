import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Mic, MicOff, Volume2, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MobileBottomNav from '@/components/MobileBottomNav';

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
  personality_traits: any;
}

interface Message {
  id: string;
  role: 'user' | 'saint';
  content: string;
  timestamp: Date;
}

const STARTER_QUESTIONS = [
  "What is the path to inner peace?",
  "How can I overcome fear and doubt?",
  "What is the meaning of dharma?",
  "How should I deal with difficult relationships?",
  "What is the importance of meditation?",
];

const SaintChat = () => {
  const { saintId } = useParams<{ saintId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [saint, setSaint] = useState<Saint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showTeachings, setShowTeachings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (saintId) loadSaint();
  }, [saintId, user, authLoading]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  const loadSaint = async () => {
    try {
      const { data, error } = await supabase.from('saints').select('*').eq('id', saintId).single();
      if (error) throw error;
      setSaint(data);
      setMessages([{
        id: 'welcome',
        role: 'saint',
        content: `🙏 Namaste! I am ${data.name}. I'm here to share wisdom from the ${data.tradition} tradition. What guidance do you seek today?`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error loading saint:', error);
      setLoadError(true);
      toast({ title: "Error", description: "Failed to load saint info", variant: "destructive" });
    }
  };

  const sendMessage = async (text?: string) => {
    const msgText = text || inputMessage.trim();
    if (!msgText || !saint) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('saint-chat', {
        body: {
          message: msgText,
          saintId: saint.id,
          conversationHistory: messages.slice(-6),
          userPreferences: { language: 'English' }
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'saint',
        content: data?.response || "I'm experiencing some difficulty right now. Please try again.",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({ 
        title: "Response failed", 
        description: "Could not get a response. Try again.",
        variant: "destructive",
        action: <Button size="sm" variant="outline" onClick={() => sendMessage(msgText)}>Retry</Button>
      });
      // Add fallback
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'saint',
        content: `🙏 I'm having trouble connecting right now. Please try again in a moment. In the meantime, reflect on this: "${saint.famous_quotes?.[0] || 'The divine light within you guides all paths.'}"`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (authLoading || (!saint && !loadError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🕉️</div>
          <p className="text-muted-foreground">Loading sacred wisdom...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="font-semibold mb-2">Could not load saint</h3>
            <p className="text-muted-foreground text-sm mb-4">Please try again or go back to saints.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/saints')}>Back to Saints</Button>
              <Button onClick={() => { setLoadError(false); loadSaint(); }}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!saint) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/saints')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={saint.image_url} alt={saint.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {saint.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold truncate">{saint.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px] px-1.5">{saint.tradition}</Badge>
                <span>{saint.birth_year}{saint.death_year ? ` - ${saint.death_year}` : ''}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTeachings(!showTeachings)}
              className="gap-1"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Teachings</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'saint' && (
                    <Avatar className="h-8 w-8 ring-1 ring-primary/20 flex-shrink-0">
                      <AvatarImage src={saint.image_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {saint.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 ring-1 ring-primary/20 flex-shrink-0">
                    <AvatarImage src={saint.image_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {saint.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Starter Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">💡 Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {STARTER_QUESTIONS.map((q, i) => (
                  <Button key={i} variant="outline" size="sm" className="text-xs h-auto py-1.5 px-3" onClick={() => sendMessage(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/50 p-4 pb-20 md:pb-4">
            <div className="flex gap-2 items-end">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask ${saint.name} for guidance...`}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={() => sendMessage()} disabled={!inputMessage.trim() || loading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Teachings Sidebar */}
        {showTeachings && (
          <div className="hidden md:block w-80 border-l border-border/50 bg-muted/30 overflow-y-auto p-4 space-y-4">
            <h3 className="font-semibold text-sm">📖 Teachings of {saint.name}</h3>
            {saint.key_teachings && (
              <div className="bg-card rounded-lg p-3 text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">Key Teachings</p>
                <p className="text-foreground/90 leading-relaxed">{saint.key_teachings}</p>
              </div>
            )}
            {saint.famous_quotes && Array.isArray(saint.famous_quotes) && saint.famous_quotes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Famous Quotes</p>
                {saint.famous_quotes.map((q: string, i: number) => (
                  <div key={i} className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="text-xs italic">"{q}"</p>
                  </div>
                ))}
              </div>
            )}
            {saint.biography && (
              <div className="bg-card rounded-lg p-3 text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">Biography</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{saint.biography}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default SaintChat;
