import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Mic, MicOff, Volume2, Heart, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

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

const SaintChat = () => {
  const { saintId } = useParams<{ saintId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [saint, setSaint] = useState<Saint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (saintId) {
      loadSaint();
    }
  }, [saintId, user, authLoading, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadSaint = async () => {
    try {
      const { data, error } = await supabase
        .from('saints')
        .select('*')
        .eq('id', saintId)
        .single();

      if (error) throw error;
      setSaint(data);

      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'saint',
        content: `🙏 Namaste! I am ${data.name}. I'm here to share wisdom from my tradition and guide you on your spiritual path. What questions do you have for me today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Error loading saint:', error);
      toast({
        title: "Error",
        description: "Failed to load saint information",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !saint) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Simulate AI response (in production, this would call your AI service)
      const aiResponse = await generateSaintResponse(inputMessage, saint, messages);
      
      const saintMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'saint',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, saintMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response from saint",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSaintResponse = async (message: string, saint: Saint, context: Message[]): Promise<string> => {
    try {
      console.log('Calling saint-chat edge function for:', saint.name);
      
      const { data, error } = await supabase.functions.invoke('saint-chat', {
        body: {
          message,
          saintId: saint.id,
          conversationHistory: context,
          userPreferences: {
            language: 'English' // TODO: Get from user preferences
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      return data.response || "I'm experiencing some difficulty right now. Please try again in a moment.";
      
    } catch (error) {
      console.error('Error calling saint-chat function:', error);
      
      // Fallback responses based on saint
      const fallbackResponses = {
        'Swami Vivekananda': "Arise, awake, and stop not until the goal is reached! Your spiritual journey requires persistence and faith in yourself.",
        'Sant Kabir': "सुनो भाई साधो! The divine light you seek shines within you. Look inward with devotion.",
        'Meera Bai': "मेरे तो गिरिधर गोपाल! In pure devotion to the divine, all questions find their answers."
      };
      
      return fallbackResponses[saint.name as keyof typeof fallbackResponses] || 
             "May the divine guide you on your spiritual path. Please try asking your question again.";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading || !saint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-temple">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-om-pulse">🕉️</div>
          <p className="text-muted-foreground">Loading sacred wisdom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-temple">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card-sacred/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/saints')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={saint.image_url} alt={saint.name} />
              <AvatarFallback className="bg-gradient-primary text-white">
                {saint.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary">{saint.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">{saint.tradition}</Badge>
                <span>•</span>
                <span>{saint.birth_year}{saint.death_year ? ` - ${saint.death_year}` : ' - Present'}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Follow
              </Button>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Teachings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] bg-card-sacred/80 backdrop-blur-md border-border/50">
          {/* Messages */}
          <CardContent className="p-0 h-full flex flex-col">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'saint' && (
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={saint.image_url} alt={saint.name} />
                        <AvatarFallback className="bg-gradient-primary text-white text-sm">
                          {saint.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-primary text-primary-foreground ml-auto'
                            : 'bg-background/70 text-foreground'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-10 w-10 bg-gradient-secondary">
                        <AvatarFallback className="bg-gradient-secondary text-white text-sm">
                          {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-4 justify-start">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={saint.image_url} alt={saint.name} />
                      <AvatarFallback className="bg-gradient-primary text-white text-sm">
                        {saint.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-background/70 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Input Area */}
            <div className="p-4">
              <div className="flex gap-3 items-end">
                <Button
                  variant="outline"
                  size="icon"
                  className={`shrink-0 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask ${saint.name} for spiritual guidance...`}
                    className="bg-background/70 border-border/50 resize-none"
                    disabled={loading}
                  />
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="bg-gradient-primary hover:opacity-90 shrink-0"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Audio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SaintChat;