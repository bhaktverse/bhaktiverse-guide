import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, dob, language = 'hi' } = await req.json();
    
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
      .eq('ai_version', 'v2')
      .single();

    if (cached) {
      console.log('Cache hit for numerology report');
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
    const planetMapping = getPlanetMapping(destinyNumber);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI service not configured');
    }

    const isHindi = language === 'hi';
    
    const systemPrompt = isHindi
      ? `आप "दिव्य ज्योतिष AI" हैं — BhaktVerse की आध्यात्मिक बुद्धिमत्ता जो हिन्दू ज्योतिष, अंक शास्त्र और भक्ति मार्गदर्शन को जोड़ती है।

शैली दिशानिर्देश:
- लहजा: गर्मजोशी भरा, आध्यात्मिक, गुरु जैसा
- भाषा: शुद्ध हिन्दी में, सरल और पठनीय
- नकारात्मक या भय-आधारित कथन से बचें
- हमेशा सकारात्मक भक्ति सुझाव के साथ समाप्त करें
- उपयोगकर्ता को श्री/श्रीमती कहकर संबोधित करें

इस सटीक JSON प्रारूप में विश्लेषण दें:
{
  "greeting": "हिन्दी में व्यक्तिगत अभिवादन",
  "life_path": "जीवन पथ का विस्तृत विश्लेषण (कम से कम 5-6 वाक्य)",
  "personality": "व्यक्तित्व लक्षण विश्लेषण (कम से कम 5-6 वाक्य)",
  "strengths": ["शक्ति 1", "शक्ति 2", "शक्ति 3", "शक्ति 4"],
  "challenges": ["चुनौती 1", "चुनौती 2", "चुनौती 3"],
  "career": "करियर मार्गदर्शन (कम से कम 4-5 वाक्य)",
  "relationships": "रिश्तों की अंतर्दृष्टि (कम से कम 4-5 वाक्य)",
  "spiritual_path": "आध्यात्मिक विकास मार्गदर्शन (कम से कम 4-5 वाक्य)",
  "remedies": ["उपाय 1 - विस्तृत विवरण", "उपाय 2 - विस्तृत विवरण", "उपाय 3 - विस्तृत विवरण", "उपाय 4 - विस्तृत विवरण"],
  "divine_message": "प्रेरणादायक समापन संदेश (कम से कम 3-4 वाक्य)"
}`
      : `You are "Divine Jyotish AI", the spiritual intelligence of BhaktVerse — combining Hindu Jyotish, Numerology (Ank Shastra), and Devotion guidance.

Style Guidelines:
- Tone: Warm, spiritual, guru-like
- Language: Clear English with spiritual depth
- Avoid negative, fear-based statements
- Always end with a positive devotional suggestion
- Address user respectfully

Provide the analysis in this exact JSON format:
{
  "greeting": "Personalized greeting",
  "life_path": "Detailed life path analysis (at least 5-6 sentences)",
  "personality": "Personality traits analysis (at least 5-6 sentences)",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "challenges": ["challenge 1", "challenge 2", "challenge 3"],
  "career": "Career guidance (at least 4-5 sentences)",
  "relationships": "Relationship insights (at least 4-5 sentences)",
  "spiritual_path": "Spiritual development guidance (at least 4-5 sentences)",
  "remedies": ["remedy 1 - detailed description", "remedy 2 - detailed description", "remedy 3 - detailed description", "remedy 4 - detailed description"],
  "divine_message": "Motivational closing message (at least 3-4 sentences)"
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

Provide detailed ${isHindi ? 'Hindi' : 'English'} devotional analysis. Return ONLY valid JSON.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Service credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices[0].message.content;
    
    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    const analysis = JSON.parse(rawContent);

    // Build readable report text from the analysis
    const reportText = buildReportText(analysis, name, isHindi);

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
      report_text: reportText,
      detailed_analysis: analysis,
      remedies: analysis.remedies || [],
      ai_version: 'v2',
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

function buildReportText(analysis: any, name: string, isHindi: boolean): string {
  const sections: string[] = [];
  
  if (analysis.greeting) {
    sections.push(analysis.greeting);
  }

  if (analysis.life_path) {
    sections.push(`\n${isHindi ? '🔮 जीवन पथ विश्लेषण' : '🔮 Life Path Analysis'}\n${analysis.life_path}`);
  }

  if (analysis.personality) {
    sections.push(`\n${isHindi ? '✨ व्यक्तित्व विश्लेषण' : '✨ Personality Analysis'}\n${analysis.personality}`);
  }

  if (analysis.strengths?.length) {
    sections.push(`\n${isHindi ? '💪 शक्तियाँ' : '💪 Strengths'}\n${analysis.strengths.map((s: string) => `• ${s}`).join('\n')}`);
  }

  if (analysis.challenges?.length) {
    sections.push(`\n${isHindi ? '⚡ चुनौतियाँ' : '⚡ Challenges'}\n${analysis.challenges.map((c: string) => `• ${c}`).join('\n')}`);
  }

  if (analysis.career) {
    sections.push(`\n${isHindi ? '💼 करियर मार्गदर्शन' : '💼 Career Guidance'}\n${analysis.career}`);
  }

  if (analysis.relationships) {
    sections.push(`\n${isHindi ? '❤️ रिश्ते' : '❤️ Relationships'}\n${analysis.relationships}`);
  }

  if (analysis.spiritual_path) {
    sections.push(`\n${isHindi ? '🙏 आध्यात्मिक मार्ग' : '🙏 Spiritual Path'}\n${analysis.spiritual_path}`);
  }

  if (analysis.divine_message) {
    sections.push(`\n${isHindi ? '🙏 दिव्य संदेश' : '🙏 Divine Message'}\n${analysis.divine_message}`);
  }

  return sections.join('\n');
}

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
  const sum = name.toLowerCase().split('').reduce((acc, char) => acc + (values[char] || 0), 0);
  return reduceToSingleDigit(sum);
}

function calculateVowelNumber(name: string): number {
  const values: { [key: string]: number } = { a: 1, e: 5, i: 1, o: 7, u: 6 };
  const sum = name.toLowerCase().split('').reduce((acc, char) => acc + (values[char] || 0), 0);
  return reduceToSingleDigit(sum);
}

function calculateConsonantNumber(name: string): number {
  const vowels = 'aeiou';
  const values: { [key: string]: number } = {
    b: 2, c: 3, d: 4, f: 8, g: 3, h: 5, j: 1, k: 2, l: 3,
    m: 4, n: 5, p: 8, q: 1, r: 2, s: 3, t: 4, v: 6, w: 6,
    x: 5, y: 1, z: 7
  };
  const sum = name.toLowerCase().split('').reduce((acc, char) => !vowels.includes(char) && values[char] ? acc + values[char] : acc, 0);
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
  const xp = 25;
  const { data: journey } = await supabase
    .from('spiritual_journey')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (journey) {
    const newXP = journey.experience_points + xp;
    const newLevel = Math.floor(newXP / 100) + 1;
    await supabase.from('spiritual_journey').update({
      experience_points: newXP,
      level: newLevel,
      reports_generated: journey.reports_generated + 1,
      updated_at: new Date().toISOString()
    }).eq('user_id', userId);
  } else {
    await supabase.from('spiritual_journey').insert({
      user_id: userId,
      experience_points: xp,
      level: 1,
      reports_generated: 1
    });
  }
}
