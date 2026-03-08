import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rashiName, rashiHindi, ruler, element, panchang } = await req.json();
    
    if (!rashiName) {
      return new Response(JSON.stringify({ error: 'Rashi name required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        prediction: generateFallbackPrediction(rashiName, rashiHindi, ruler, element)
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const today = new Date().toLocaleDateString('hi-IN', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const systemPrompt = `You are "Jyotish AI Guru", a Vedic astrology expert providing daily horoscope readings.

Style:
- Warm, spiritual, guru-like tone
- Mix of Hindi and English (Hinglish)
- Positive and constructive guidance
- Reference today's Panchang data when provided

Return ONLY valid JSON in this exact format:
{
  "overall": "2-3 sentence overall prediction",
  "love": { "score": 75, "prediction": "...", "tip": "..." },
  "career": { "score": 80, "prediction": "...", "tip": "..." },
  "health": { "score": 70, "prediction": "...", "tip": "..." },
  "finance": { "score": 72, "prediction": "...", "tip": "..." },
  "luckyColor": "शुभ रंग",
  "luckyNumber": 7,
  "luckyTime": "Morning time window",
  "mantraOfDay": "Specific mantra",
  "doToday": ["3 things to do"],
  "avoidToday": ["2 things to avoid"],
  "cosmicMessage": "Inspirational message"
}`;

    const userPrompt = `Generate today's horoscope for:
Rashi: ${rashiName} (${rashiHindi})
Ruling Planet: ${ruler}
Element: ${element}
Date: ${today}
${panchang ? `Panchang: Tithi - ${panchang.hindu?.tithi || 'N/A'}, Nakshatra - ${panchang.hindu?.nakshatra || 'N/A'}` : ''}

Provide specific, personalized predictions.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI gateway error:', aiResponse.status);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error('AI API error');
    }

    const aiData = await aiResponse.json();
    let prediction;
    
    try {
      const content = aiData.choices[0].message.content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      prediction = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      prediction = generateFallbackPrediction(rashiName, rashiHindi, ruler, element);
    }

    return new Response(JSON.stringify({ prediction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-horoscope:', error);
    return new Response(JSON.stringify({ 
      error: 'Service temporarily unavailable',
      prediction: generateFallbackPrediction('', '', '', '')
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackPrediction(rashiName: string, rashiHindi: string, ruler: string, element: string) {
  const scores = [65, 70, 75, 80, 85];
  const randomScore = () => scores[Math.floor(Math.random() * scores.length)];
  
  return {
    overall: `आज ${rashiHindi || 'आपकी'} राशि के लिए सकारात्मक दिन है। ${ruler || 'ग्रह'} का प्रभाव आपको ऊर्जा प्रदान करेगा। धैर्य रखें और अपने लक्ष्यों पर ध्यान केंद्रित करें।`,
    love: { score: randomScore(), prediction: "प्रेम जीवन में हल्की-फुल्की खुशियां मिलेंगी।", tip: "पार्टनर के साथ quality time बिताएं।" },
    career: { score: randomScore(), prediction: "करियर में नई opportunities आ सकती हैं।", tip: "नई skills सीखने पर focus करें।" },
    health: { score: randomScore(), prediction: "स्वास्थ्य सामान्य रहेगा।", tip: "सुबह व्यायाम और पर्याप्त पानी पिएं।" },
    finance: { score: randomScore(), prediction: "आर्थिक स्थिति स्थिर रहेगी।", tip: "अनावश्यक खर्चों से बचें।" },
    luckyColor: "पीला",
    luckyNumber: 7,
    luckyTime: "सुबह 9-11 बजे",
    mantraOfDay: "ॐ गं गणपतये नमः",
    doToday: ["ध्यान करें", "परिवार के साथ समय बिताएं", "नया कार्य शुरू करें"],
    avoidToday: ["जल्दबाजी में निर्णय न लें", "नकारात्मक लोगों से दूर रहें"],
    cosmicMessage: "ब्रह्मांडीय ऊर्जा आपके साथ है। आत्मविश्वास बनाए रखें और सकारात्मक रहें।"
  };
}
