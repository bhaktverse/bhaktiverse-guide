import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const getDayPlanet = (day: number) => {
  const planets = [
    { name: "Surya (Sun)", deity: "Lord Surya", color: "Orange/Red", mantra: "Om Suryaya Namaha" },
    { name: "Chandra (Moon)", deity: "Lord Shiva", color: "White/Silver", mantra: "Om Chandraya Namaha" },
    { name: "Mangal (Mars)", deity: "Lord Hanuman", color: "Red", mantra: "Om Angarakaya Namaha" },
    { name: "Budh (Mercury)", deity: "Lord Vishnu", color: "Green", mantra: "Om Budhaya Namaha" },
    { name: "Guru (Jupiter)", deity: "Lord Brihaspati", color: "Yellow", mantra: "Om Gurave Namaha" },
    { name: "Shukra (Venus)", deity: "Goddess Lakshmi", color: "White/Pink", mantra: "Om Shukraya Namaha" },
    { name: "Shani (Saturn)", deity: "Lord Shani", color: "Blue/Black", mantra: "Om Shanaischaraya Namaha" }
  ];
  return planets[day];
};

const getTithiInfo = () => {
  const tithis = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
  ];
  const lunarDay = Math.floor((new Date().getDate() % 15)) || 15;
  return tithis[lunarDay - 1];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50000) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { palmAnalysis, language } = await req.json();

    if (!palmAnalysis) {
      return new Response(
        JSON.stringify({ error: "Palm analysis is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation: cap palmAnalysis size to prevent prompt injection
    const safeAnalysis = JSON.stringify(palmAnalysis).slice(0, 5000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayPlanet = getDayPlanet(dayOfWeek);
    const tithi = getTithiInfo();
    
    const today = now.toLocaleDateString('en-IN', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    console.log("Generating Vedic daily horoscope based on palm reading...");

    const systemPrompt = `You are GURU JI - a master Vedic astrologer creating personalized daily horoscope based on someone's palm reading analysis.

## TODAY'S COSMIC CONTEXT
- Date: ${today}
- Ruling Planet: ${todayPlanet.name}
- Presiding Deity: ${todayPlanet.deity}
- Auspicious Color: ${todayPlanet.color}
- Day Mantra: ${todayPlanet.mantra}
- Approximate Tithi: ${tithi}

Respond in ${language === 'hi' ? 'Hindi (Devanagari script with warm Hinglish)' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'bn' ? 'Bengali' : language === 'mr' ? 'Marathi' : 'English with Sanskrit terms'}.

Generate JSON with these fields:
{
  "date": "${today}",
  "dayPlanet": "${todayPlanet.name}",
  "tithi": "${tithi}",
  "greeting": "Personal greeting",
  "overallEnergy": "excellent/good/moderate/challenging",
  "energyScore": 1-100,
  "cosmicAlignment": "How today's planets align with their palm destiny",
  "luckyTime": "Best time period",
  "luckyColor": "Color",
  "luckyNumber": number,
  "luckyDirection": "Direction",
  "predictions": {
    "morning": { "title": "Morning", "prediction": "...", "advice": "...", "caution": "..." },
    "afternoon": { "title": "Afternoon", "prediction": "...", "advice": "...", "caution": "..." },
    "evening": { "title": "Evening", "prediction": "...", "advice": "...", "caution": "..." }
  },
  "categories": {
    "career": { "score": 1-100, "prediction": "...", "tip": "..." },
    "love": { "score": 1-100, "prediction": "...", "tip": "..." },
    "health": { "score": 1-100, "prediction": "...", "tip": "..." },
    "finance": { "score": 1-100, "prediction": "...", "tip": "..." },
    "spiritual": { "score": 1-100, "prediction": "...", "tip": "..." }
  },
  "mantraOfTheDay": { "sanskrit": "${todayPlanet.mantra}", "meaning": "...", "japaCount": "108" },
  "doToday": ["5 things to do"],
  "avoidToday": ["5 things to avoid"],
  "cosmicMessage": "Profound message",
  "affirmation": "Affirmation",
  "blessings": "Blessing"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate today's personalized Vedic horoscope for this person based on their palm reading:\n\nPALM ANALYSIS:\n${safeAnalysis}\n\nCreate deeply personalized predictions combining their palm destiny with today's cosmic energy.`
          }
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      return new Response(JSON.stringify({ error: "Failed to generate horoscope" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    let horoscope;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        horoscope = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        horoscope = { date: today, greeting: "Namaste! Today brings cosmic opportunities.", rawAnalysis: aiResponse };
      }
    } catch {
      horoscope = { date: today, greeting: "Namaste! Today brings cosmic opportunities.", rawAnalysis: aiResponse };
    }

    return new Response(JSON.stringify({ success: true, horoscope }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Horoscope error:", error);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
