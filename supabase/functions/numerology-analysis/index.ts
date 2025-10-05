import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, dob } = await req.json();
    
    if (!name || !dob) {
      return new Response(JSON.stringify({ error: 'Name and DOB required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user ID
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create hash for caching
    const crypto = await import("https://deno.land/std@0.177.0/crypto/mod.ts");
    const hash = Array.from(
      new Uint8Array(
        await crypto.crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(`${name.toLowerCase()}_${dob}`)
        )
      )
    ).map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache
    const { data: cached } = await supabaseClient
      .from('numerology_reports')
      .select('*')
      .eq('name_dob_hash', hash)
      .eq('ai_version', 'v1')
      .single();

    if (cached) {
      console.log('Cache hit for numerology report');
      
      // Update spiritual journey
      await supabaseClient.rpc('increment_reports_count', { user_id: user.id });
      
      return new Response(JSON.stringify({ 
        ...cached, 
        cached: true,
        xp_earned: 5
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate numerology numbers
    const birthDate = new Date(dob);
    const birthNumber = calculateBirthNumber(birthDate.getDate());
    const destinyNumber = calculateDestinyNumber(birthDate);
    const expressionNumber = calculateNameNumber(name);
    const soulNumber = calculateVowelNumber(name);
    const personalityNumber = calculateConsonantNumber(name);

    // Get planet and deity mapping
    const planetMapping = getPlanetMapping(destinyNumber);
    
    // Call OpenAI for detailed analysis
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    const systemPrompt = `You are "Divine Jyotish AI", the spiritual intelligence of BhaktVerse — a devotional AI system combining Hindu Jyotish, Numerology (Ank Shastra), and Devotion guidance.

Your task is to provide precise, traditional, yet devotional interpretations based on numerology.

Style Guidelines:
- Tone: Warm, spiritual, guru-like
- Language: Hindi-English mix (Hinglish), easy to read
- Avoid negative, fear-based statements
- Always end with a positive devotional suggestion
- Address user respectfully (Shri/Shreemati)

Provide the analysis in this exact JSON format:
{
  "greeting": "Personalized greeting in Hinglish",
  "life_path": "Detailed life path analysis",
  "personality": "Personality traits analysis",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "challenges": ["challenge 1", "challenge 2"],
  "career": "Career guidance",
  "relationships": "Relationship insights",
  "spiritual_path": "Spiritual development guidance",
  "remedies": ["remedy 1", "remedy 2", "remedy 3"],
  "divine_message": "Motivational closing message"
}`;

    const userPrompt = `Analyze numerology for:
Name: ${name}
Date of Birth: ${dob}
Birth Number: ${birthNumber}
Destiny Number: ${destinyNumber}
Expression Number: ${expressionNumber}
Soul Number: ${soulNumber}
Personality Number: ${personalityNumber}
Ruling Planet: ${planetMapping.planet}
Associated Deity: ${planetMapping.deity}

Provide detailed devotional analysis in Hinglish style.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Save to database
    const report = {
      user_id: user.id,
      name,
      dob,
      birth_number: birthNumber,
      destiny_number: destinyNumber,
      expression_number: expressionNumber,
      soul_number: soulNumber,
      personality_number: personalityNumber,
      lucky_color: planetMapping.color,
      lucky_day: planetMapping.day,
      lucky_mantra: planetMapping.mantra,
      lucky_gemstone: planetMapping.gemstone,
      report_text: JSON.stringify(analysis),
      detailed_analysis: analysis,
      remedies: analysis.remedies || [],
      ai_version: 'v1',
      name_dob_hash: hash
    };

    const { data: savedReport, error: saveError } = await supabaseClient
      .from('numerology_reports')
      .insert(report)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
    }

    // Update spiritual journey - award XP
    await updateSpiritualJourney(supabaseClient, user.id, 'report_generated');

    return new Response(JSON.stringify({ 
      ...savedReport,
      cached: false,
      xp_earned: 25
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in numerology-analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function calculateBirthNumber(day: number): number {
  return reduceToSingleDigit(day);
}

function calculateDestinyNumber(date: Date): number {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return reduceToSingleDigit(day + month + year);
}

function calculateNameNumber(name: string): number {
  const values: { [key: string]: number } = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 8, g: 3, h: 5, i: 1,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 7, p: 8, q: 1, r: 2,
    s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7
  };
  
  const sum = name.toLowerCase().split('').reduce((acc, char) => {
    return acc + (values[char] || 0);
  }, 0);
  
  return reduceToSingleDigit(sum);
}

function calculateVowelNumber(name: string): number {
  const vowels = 'aeiou';
  const values: { [key: string]: number } = {
    a: 1, e: 5, i: 1, o: 7, u: 6
  };
  
  const sum = name.toLowerCase().split('').reduce((acc, char) => {
    return vowels.includes(char) ? acc + values[char] : acc;
  }, 0);
  
  return reduceToSingleDigit(sum);
}

function calculateConsonantNumber(name: string): number {
  const vowels = 'aeiou';
  const values: { [key: string]: number } = {
    b: 2, c: 3, d: 4, f: 8, g: 3, h: 5, j: 1, k: 2, l: 3,
    m: 4, n: 5, p: 8, q: 1, r: 2, s: 3, t: 4, v: 6, w: 6,
    x: 5, y: 1, z: 7
  };
  
  const sum = name.toLowerCase().split('').reduce((acc, char) => {
    return !vowels.includes(char) && values[char] ? acc + values[char] : acc;
  }, 0);
  
  return reduceToSingleDigit(sum);
}

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return num;
}

function getPlanetMapping(number: number) {
  const mappings: { [key: number]: any } = {
    1: { planet: 'Sun', deity: 'Surya Dev', color: 'Orange/Red', day: 'Sunday', mantra: 'Om Suryaya Namah', gemstone: 'Ruby' },
    2: { planet: 'Moon', deity: 'Chandra Dev', color: 'White', day: 'Monday', mantra: 'Om Chandraya Namah', gemstone: 'Pearl' },
    3: { planet: 'Jupiter', deity: 'Brihaspati', color: 'Yellow', day: 'Thursday', mantra: 'Om Gurave Namah', gemstone: 'Yellow Sapphire' },
    4: { planet: 'Rahu', deity: 'Rahu Dev', color: 'Blue', day: 'Saturday', mantra: 'Om Rahave Namah', gemstone: 'Hessonite' },
    5: { planet: 'Mercury', deity: 'Budh Dev', color: 'Green', day: 'Wednesday', mantra: 'Om Budhaya Namah', gemstone: 'Emerald' },
    6: { planet: 'Venus', deity: 'Shukra Dev', color: 'Pink/White', day: 'Friday', mantra: 'Om Shukraya Namah', gemstone: 'Diamond' },
    7: { planet: 'Ketu', deity: 'Ketu Dev', color: 'Purple', day: 'Tuesday', mantra: 'Om Ketave Namah', gemstone: "Cat's Eye" },
    8: { planet: 'Saturn', deity: 'Shani Dev', color: 'Black/Blue', day: 'Saturday', mantra: 'Om Shanaye Namah', gemstone: 'Blue Sapphire' },
    9: { planet: 'Mars', deity: 'Mangal Dev', color: 'Red', day: 'Tuesday', mantra: 'Om Mangalaya Namah', gemstone: 'Red Coral' }
  };
  
  return mappings[number] || mappings[1];
}

async function updateSpiritualJourney(supabase: any, userId: string, action: string) {
  const xpMap: { [key: string]: number } = {
    report_generated: 25,
    mantra_chanted: 5,
    consultation_done: 50
  };

  const xp = xpMap[action] || 10;

  // Upsert spiritual journey
  const { data: journey } = await supabase
    .from('spiritual_journey')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (journey) {
    const newXP = journey.experience_points + xp;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    await supabase
      .from('spiritual_journey')
      .update({
        experience_points: newXP,
        level: newLevel,
        reports_generated: journey.reports_generated + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  } else {
    await supabase
      .from('spiritual_journey')
      .insert({
        user_id: userId,
        experience_points: xp,
        level: 1,
        reports_generated: 1
      });
  }
}