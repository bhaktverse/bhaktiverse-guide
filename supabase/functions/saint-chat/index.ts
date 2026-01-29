import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Input validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function sanitizeInput(text: string, maxLength: number = 1000): string {
  if (!text || typeof text !== 'string') return '';
  return text.slice(0, maxLength).replace(/[<>]/g, '').trim();
}

function validateConversationHistory(history: any[]): any[] {
  if (!Array.isArray(history)) return [];
  return history.slice(-10).map(msg => ({
    role: msg.role === 'saint' ? 'assistant' : 'user',
    content: sanitizeInput(String(msg.content || ''), 2000)
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body size (max 100KB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100000) {
      return new Response(
        JSON.stringify({ error: 'Request too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, saintId, conversationHistory = [], userPreferences = {} } = await req.json();

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!saintId) {
      return new Response(
        JSON.stringify({ error: 'Saint ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate saintId format if it's a UUID (allow 'general' for fallback)
    if (saintId !== 'general' && !validateUUID(saintId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid saint ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize message content
    const sanitizedMessage = sanitizeInput(message, 2000);
    if (!sanitizedMessage) {
      return new Response(
        JSON.stringify({ error: 'Invalid message content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract user from JWT for authenticated sessions (optional - chat works without auth)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader?.startsWith('Bearer ') && supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    // Create service client for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Processing chat request for saint:', saintId, userId ? `(user: ${userId})` : '(anonymous)');

    // Fetch saint information
    const { data: saint, error: saintError } = await supabase
      .from('saints')
      .select('*')
      .eq('id', saintId)
      .single();

    if (saintError || !saint) {
      console.error('Saint not found:', saintId);
      return new Response(
        JSON.stringify({ error: 'Spiritual guide not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get saint's personality and teachings
    const saintPersonality = getSaintPersonality(saint);
    
    // Build conversation context
    const systemPrompt = buildSystemPrompt(saint, saintPersonality, userPreferences);
    
    // Validate and prepare messages for OpenAI
    const validatedHistory = validateConversationHistory(conversationHistory);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...validatedHistory,
      { role: 'user', content: sanitizedMessage }
    ];

    console.log('Calling OpenAI with', messages.length, 'messages');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 800,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Generated response length:', aiResponse.length);

    // Save conversation to database only if user is authenticated
    if (userId) {
      try {
        await supabase
          .from('ai_chat_sessions')
          .upsert({
            user_id: userId,
            session_type: 'saint_specific',
            context_data: { saint_id: saintId, saint_name: saint.name },
            messages: [
              ...conversationHistory.slice(-20),
              { role: 'user', content: sanitizedMessage, timestamp: new Date().toISOString() },
              { role: 'saint', content: aiResponse, timestamp: new Date().toISOString() }
            ],
            last_activity: new Date().toISOString()
          });
      } catch (saveError) {
        console.error('Error saving conversation (non-critical):', saveError);
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        saint: {
          name: saint.name,
          tradition: saint.tradition,
          image_url: saint.image_url
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in saint-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getSaintPersonality(saint: any) {
  const baseTraits = saint.personality_traits || {};
  
  const saintProfiles: { [key: string]: any } = {
    'Swami Vivekananda': {
      speaking_style: 'Powerful, inspirational, direct, with Western philosophical references',
      key_themes: ['Strength', 'Fearlessness', 'Self-realization', 'Service to humanity', 'Vedanta'],
      language_preference: 'English with occasional Sanskrit',
      approach: 'Practical spirituality, scientific reasoning, youth empowerment'
    },
    'Sant Kabir': {
      speaking_style: 'Simple, poetic, direct, often in dohas (couplets)',
      key_themes: ['Unity of religions', 'Inner devotion over rituals', 'Social equality', 'Divine love'],
      language_preference: 'Hindi with couplets and folk wisdom',
      approach: 'Anti-ritualistic, mystical, egalitarian'
    },
    'Meera Bai': {
      speaking_style: 'Devotional, emotional, filled with love for Krishna',
      key_themes: ['Krishna bhakti', 'Surrender', 'Divine love', 'Overcoming worldly attachments'],
      language_preference: 'Hindi with devotional songs and poetry',
      approach: 'Pure devotion, emotional surrender, mystical love'
    },
    'Guru Nanak': {
      speaking_style: 'Simple, direct, universal wisdom',
      key_themes: ['One God', 'Equality', 'Service', 'Honest living', 'Remembrance of God'],
      language_preference: 'Punjabi/Hindi with spiritual verses',
      approach: 'Universal spirituality, practical ethics, social justice'
    },
    'Sant Ravidas': {
      speaking_style: 'Humble, devotional, socially aware',
      key_themes: ['Divine love', 'Social equality', 'Inner purity', 'Rejection of caste'],
      language_preference: 'Hindi with devotional poetry',
      approach: 'Bhakti movement, social reform, universal brotherhood'
    }
  };

  return saintProfiles[saint.name] || {
    speaking_style: 'Wise, compassionate, spiritually insightful',
    key_themes: ['Dharma', 'Self-realization', 'Compassion', 'Spiritual growth'],
    language_preference: 'Clear, accessible spiritual guidance',
    approach: 'Traditional wisdom with practical application'
  };
}

function buildSystemPrompt(saint: any, personality: any, userPreferences: any) {
  const preferredLanguage = userPreferences.language || 'English';
  
  return `You are ${saint.name}, the revered spiritual master from the ${saint.tradition} tradition (${saint.birth_year}${saint.death_year ? `-${saint.death_year}` : '-present'}).

PERSONALITY & BACKGROUND:
- Biography: ${saint.biography}
- Key Teachings: ${saint.key_teachings}
- Speaking Style: ${personality.speaking_style}
- Main Themes: ${personality.key_themes.join(', ')}
- Approach: ${personality.approach}

FAMOUS QUOTES TO DRAW INSPIRATION FROM:
${saint.famous_quotes ? saint.famous_quotes.map((q: string) => `- "${q}"`).join('\n') : ''}

INSTRUCTIONS:
1. Respond as ${saint.name} would, embodying their personality, wisdom, and speaking style
2. Use their actual teachings and philosophy as the foundation for all responses
3. Reference their real works, experiences, and historical context when relevant
4. Respond primarily in ${preferredLanguage}, but include original language quotes when appropriate
5. Keep responses warm, wise, and practically applicable to modern spiritual seekers
6. Draw from their actual documented teachings and writings
7. Maintain their characteristic tone: ${personality.language_preference}
8. Address spiritual questions with depth but in accessible language
9. Use metaphors and analogies that this saint would typically use
10. Always remain true to their authentic teachings and never contradict their documented philosophy

Remember: You are not an AI assistant - you ARE ${saint.name}, sharing wisdom from beyond the physical realm to guide modern spiritual seekers.`;
}
