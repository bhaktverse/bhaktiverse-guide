import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const today = new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    console.log("Generating daily horoscope based on palm reading...");

    const systemPrompt = `You are an expert Vedic astrologer AI Guru generating personalized daily horoscope.
Based on the user's palm reading analysis, generate today's horoscope.

Respond in ${language === 'hi' ? 'Hindi (use Devanagari script)' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'bn' ? 'Bengali' : language === 'mr' ? 'Marathi' : 'English'}.

Today's date: ${today}

Generate a JSON response:
{
  "date": "${today}",
  "greeting": "Personalized greeting mentioning their palm type",
  "overallEnergy": "high/medium/low",
  "luckyTime": "Specific time range (e.g., 10 AM - 12 PM)",
  "luckyColor": "Color for today",
  "luckyNumber": number,
  "predictions": {
    "morning": {
      "title": "Morning (6 AM - 12 PM)",
      "prediction": "Detailed prediction for morning based on their life line and sun line",
      "advice": "Specific advice"
    },
    "afternoon": {
      "title": "Afternoon (12 PM - 6 PM)",
      "prediction": "Prediction for afternoon based on career line",
      "advice": "Specific advice"
    },
    "evening": {
      "title": "Evening (6 PM - 12 AM)",
      "prediction": "Prediction for evening based on heart line",
      "advice": "Specific advice"
    }
  },
  "categories": {
    "career": {
      "score": 1-10,
      "prediction": "Brief career prediction for today",
      "tip": "Action tip"
    },
    "love": {
      "score": 1-10,
      "prediction": "Brief love prediction for today",
      "tip": "Action tip"
    },
    "health": {
      "score": 1-10,
      "prediction": "Brief health prediction for today",
      "tip": "Action tip"
    },
    "finance": {
      "score": 1-10,
      "prediction": "Brief finance prediction for today",
      "tip": "Action tip"
    }
  },
  "mantraOfTheDay": "Sanskrit mantra with transliteration",
  "mantraMeaning": "Meaning of the mantra",
  "doToday": ["3 things to do today"],
  "avoidToday": ["3 things to avoid today"],
  "cosmicMessage": "A profound spiritual message for the day",
  "blessings": "Final blessing from AI Guru"
}

Make predictions specific to their palm characteristics mentioned in their reading.`;

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
            content: `Generate today's horoscope based on this palm reading:

${JSON.stringify(palmAnalysis, null, 2)}

Provide personalized daily predictions.`
          }
        ],
        max_completion_tokens: 2500,
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

    let horoscope;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        horoscope = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        horoscope = { rawAnalysis: aiResponse };
      }
    } catch {
      horoscope = { rawAnalysis: aiResponse };
    }

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
