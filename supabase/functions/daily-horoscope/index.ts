import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rashiName, rashiHindi, ruler, element, panchang } = await req.json();
    
    if (!rashiName) {
      return new Response(JSON.stringify({ error: 'Rashi name required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      // Return fallback prediction
      return new Response(JSON.stringify({
        prediction: generateFallbackPrediction(rashiName, rashiHindi, ruler, element)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toLocaleDateString('hi-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const systemPrompt = `You are "Jyotish AI Guru", a Vedic astrology expert providing daily horoscope readings.

Style:
- Warm, spiritual, guru-like tone
- Mix of Hindi and English (Hinglish)
- Positive and constructive guidance
- Reference today's Panchang data when provided
- Include specific advice, not generic statements

Return ONLY valid JSON in this exact format:
{
  "overall": "2-3 sentence overall prediction for the day in Hinglish",
  "love": {
    "score": 75,
    "prediction": "Love life prediction",
    "tip": "Specific relationship advice"
  },
  "career": {
    "score": 80,
    "prediction": "Career/work prediction",
    "tip": "Professional advice"
  },
  "health": {
    "score": 70,
    "prediction": "Health and wellness prediction",
    "tip": "Health advice"
  },
  "finance": {
    "score": 72,
    "prediction": "Financial prediction",
    "tip": "Money advice"
  },
  "luckyColor": "शुभ रंग in Hindi",
  "luckyNumber": 7,
  "luckyTime": "Morning time window like 9-11 AM in Hindi",
  "mantraOfDay": "Specific mantra with Sanskrit",
  "doToday": ["3 things to do today"],
  "avoidToday": ["2 things to avoid"],
  "cosmicMessage": "Inspirational cosmic message in Hinglish"
}`;

    const userPrompt = `Generate today's horoscope for:
Rashi: ${rashiName} (${rashiHindi})
Ruling Planet: ${ruler}
Element: ${element}
Date: ${today}
${panchang ? `Panchang: Tithi - ${panchang.hindu?.tithi || 'N/A'}, Nakshatra - ${panchang.hindu?.nakshatra || 'N/A'}` : ''}

Provide specific, personalized predictions considering the planetary positions and Panchang of today.`;

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
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const aiData = await aiResponse.json();
    let prediction;
    
    try {
      const content = aiData.choices[0].message.content;
      // Extract JSON from potential markdown code blocks
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
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackPrediction(rashiName: string, rashiHindi: string, ruler: string, element: string) {
  const scores = [65, 70, 75, 80, 85];
  const randomScore = () => scores[Math.floor(Math.random() * scores.length)];
  
  return {
    overall: `आज ${rashiHindi || 'आपकी'} राशि के लिए सकारात्मक दिन है। ${ruler || 'ग्रह'} का प्रभाव आपको ऊर्जा प्रदान करेगा। धैर्य रखें और अपने लक्ष्यों पर ध्यान केंद्रित करें।`,
    love: { 
      score: randomScore(), 
      prediction: "प्रेम जीवन में हल्की-फुल्की खुशियां मिलेंगी।", 
      tip: "पार्टनर के साथ quality time बिताएं।" 
    },
    career: { 
      score: randomScore(), 
      prediction: "करियर में नई opportunities आ सकती हैं।", 
      tip: "नई skills सीखने पर focus करें।" 
    },
    health: { 
      score: randomScore(), 
      prediction: "स्वास्थ्य सामान्य रहेगा।", 
      tip: "सुबह व्यायाम और पर्याप्त पानी पिएं।" 
    },
    finance: { 
      score: randomScore(), 
      prediction: "आर्थिक स्थिति स्थिर रहेगी।", 
      tip: "अनावश्यक खर्चों से बचें।" 
    },
    luckyColor: "पीला",
    luckyNumber: 7,
    luckyTime: "सुबह 9-11 बजे",
    mantraOfDay: "ॐ गं गणपतये नमः",
    doToday: ["ध्यान करें", "परिवार के साथ समय बिताएं", "नया कार्य शुरू करें"],
    avoidToday: ["जल्दबाजी में निर्णय न लें", "नकारात्मक लोगों से दूर रहें"],
    cosmicMessage: "ब्रह्मांडीय ऊर्जा आपके साथ है। आत्मविश्वास बनाए रखें और सकारात्मक रहें।"
  };
}
