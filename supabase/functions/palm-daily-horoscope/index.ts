import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Vedic day-planet correlations
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

// Get current tithi approximation
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
    const { palmAnalysis, language } = await req.json();

    if (!palmAnalysis) {
      return new Response(
        JSON.stringify({ error: "Palm analysis is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayPlanet = getDayPlanet(dayOfWeek);
    const tithi = getTithiInfo();
    
    const today = now.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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

## VEDIC HOROSCOPE METHODOLOGY
Combine the person's palm characteristics with today's planetary energy:

1. **Palm-Planet Synergy**: 
   - If their dominant mount aligns with today's planet → Enhanced luck
   - Conflicting energies → Need for remedies

2. **Time-Based Predictions** (Hora System):
   - Each hour ruled by different planet
   - Morning: Sun/Venus hour optimal for new beginnings
   - Afternoon: Jupiter/Mercury for business/communication
   - Evening: Moon/Saturn for reflection/spiritual work

3. **Nakshatra Influence**:
   - Moon's nakshatra today affects emotions and intuition
   - Connect to their palm's dominant qualities

Respond in ${language === 'hi' ? 'Hindi (Devanagari script with warm Hinglish)' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'bn' ? 'Bengali' : language === 'mr' ? 'Marathi' : 'English with Sanskrit terms'}.

Generate JSON:
{
  "date": "${today}",
  "dayPlanet": "${todayPlanet.name}",
  "tithi": "${tithi}",
  "greeting": "Personal greeting referencing their palm type and today's energy",
  "overallEnergy": "excellent/good/moderate/challenging",
  "energyScore": 1-100,
  "cosmicAlignment": "How today's planets align with their palm destiny",
  "luckyTime": "Best hora (time period) with specific hours like '10:00 AM - 12:00 PM'",
  "luckyColor": "${todayPlanet.color} or personalized based on their palm",
  "luckyNumber": number based on their palm numerology,
  "luckyDirection": "North/South/East/West based on palm and day",
  "predictions": {
    "morning": {
      "title": "प्रातःकाल / Morning (6 AM - 12 PM)",
      "ruling": "Sun and Venus hours",
      "prediction": "Detailed prediction based on their life line and today's solar energy",
      "bestActivity": "What to do in morning",
      "advice": "Specific actionable advice",
      "caution": "What to avoid"
    },
    "afternoon": {
      "title": "मध्याह्न / Afternoon (12 PM - 6 PM)",
      "ruling": "Mercury and Jupiter hours",
      "prediction": "Prediction for afternoon based on career/fate line",
      "bestActivity": "Optimal afternoon activities",
      "advice": "Business and communication guidance",
      "caution": "Afternoon cautions"
    },
    "evening": {
      "title": "संध्या / Evening (6 PM - 12 AM)",
      "ruling": "Moon and Saturn hours",
      "prediction": "Evening prediction based on heart line and emotional patterns",
      "bestActivity": "Evening recommendations",
      "advice": "Relationship and spiritual advice",
      "caution": "Evening warnings"
    }
  },
  "categories": {
    "career": {
      "score": 1-100,
      "planetInfluence": "How today's planet affects their career indicators",
      "prediction": "Career forecast based on their fate line + today's energy",
      "tip": "Actionable career tip",
      "auspiciousTime": "Best time for career activities"
    },
    "love": {
      "score": 1-100,
      "planetInfluence": "Venus/Moon influence on their heart line today",
      "prediction": "Love forecast based on heart line + today's energy",
      "tip": "Relationship tip",
      "auspiciousTime": "Best time for romance"
    },
    "health": {
      "score": 1-100,
      "planetInfluence": "Today's effect on their life line vitality",
      "prediction": "Health forecast",
      "tip": "Health tip with yoga/exercise suggestion",
      "auspiciousTime": "Best time for exercise/healing"
    },
    "finance": {
      "score": 1-100,
      "planetInfluence": "Mercury/Jupiter effect on their sun line",
      "prediction": "Financial forecast",
      "tip": "Money management tip",
      "auspiciousTime": "Best time for financial decisions"
    },
    "spiritual": {
      "score": 1-100,
      "planetInfluence": "Saturn/Jupiter spiritual guidance",
      "prediction": "Spiritual energy for today",
      "tip": "Meditation/prayer recommendation",
      "auspiciousTime": "Best time for spiritual practice"
    }
  },
  "mantraOfTheDay": {
    "sanskrit": "${todayPlanet.mantra}",
    "transliteration": "Pronunciation guide",
    "meaning": "Deep meaning of the mantra",
    "japaCount": "Recommended repetitions (like 108, 21, 11)",
    "bestTime": "Best time to chant"
  },
  "rituals": {
    "morning": "Morning ritual suggestion",
    "evening": "Evening aarti/prayer suggestion",
    "special": "Special ritual if any tithi/day significance"
  },
  "doToday": [
    "5 specific actions to take today based on palm + planets",
    "Include worship, charity, colors to wear, foods to eat",
    "Practical achievable suggestions"
  ],
  "avoidToday": [
    "5 things to avoid today",
    "Based on planetary conflicts with their palm characteristics"
  ],
  "gemstoneAdvice": {
    "wear": "Which gemstone from their palm reading is most beneficial today",
    "avoid": "Which to avoid today if any"
  },
  "cosmicMessage": "A profound, personalized spiritual message for today based on their unique destiny",
  "affirmation": "A powerful Sanskrit-inspired affirmation for them to repeat",
  "blessings": "Warm, hopeful blessing from Guru Ji for the day"
}

Make predictions specific to THEIR palm characteristics combined with today's cosmic energy.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate today's personalized Vedic horoscope for this person based on their palm reading:

PALM ANALYSIS:
${JSON.stringify(palmAnalysis, null, 2)}

Create deeply personalized predictions combining their palm destiny with today's cosmic energy. Be warm, wise, and spiritually uplifting.`
          }
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate horoscope" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    console.log("Horoscope generated, parsing...");

    let horoscope;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        horoscope = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        horoscope = { 
          date: today,
          greeting: "Namaste! Today brings cosmic opportunities for you.",
          rawAnalysis: aiResponse 
        };
      }
    } catch {
      horoscope = { 
        date: today,
        greeting: "Namaste! Today brings cosmic opportunities for you.",
        rawAnalysis: aiResponse 
      };
    }

    console.log("Daily horoscope generated successfully");

    return new Response(
      JSON.stringify({ success: true, horoscope }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Horoscope error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
