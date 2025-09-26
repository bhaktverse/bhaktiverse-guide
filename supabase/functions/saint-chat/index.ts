import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, saintId, conversationHistory = [], userPreferences = {} } = await req.json();

    if (!message || !saintId) {
      throw new Error('Message and saintId are required');
    }

    console.log('Processing chat request for saint:', saintId);

    // Fetch saint information
    const { data: saint, error: saintError } = await supabase
      .from('saints')
      .select('*')
      .eq('id', saintId)
      .single();

    if (saintError || !saint) {
      throw new Error('Saint not found');
    }

    // Get saint's personality and teachings
    const saintPersonality = getSaintPersonality(saint);
    
    // Build conversation context
    const systemPrompt = buildSystemPrompt(saint, saintPersonality, userPreferences);
    
    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.role === 'saint' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
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
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API failed: ${error}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Generated response length:', aiResponse.length);

    // Save conversation to database
    const { error: saveError } = await supabase
      .from('ai_chat_sessions')
      .upsert({
        user_id: req.headers.get('user-id'),
        session_type: 'saint_specific',
        context_data: { saint_id: saintId, saint_name: saint.name },
        messages: [
          ...conversationHistory,
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'saint', content: aiResponse, timestamp: new Date().toISOString() }
        ],
        last_activity: new Date().toISOString()
      });

    if (saveError) {
      console.error('Error saving conversation:', saveError);
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
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getSaintPersonality(saint: any) {
  // Extract personality traits and create detailed profile
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