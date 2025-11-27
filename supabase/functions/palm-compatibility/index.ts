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
    const { palmAnalysis1, palmAnalysis2, language } = await req.json();

    if (!palmAnalysis1 || !palmAnalysis2) {
      return new Response(
        JSON.stringify({ error: "Two palm analyses are required" }),
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

    console.log("Analyzing palm compatibility...");

    const systemPrompt = `You are an expert Vedic palmistry compatibility analyst (AI Guru).
You have analyzed both individuals' palms and now must determine their compatibility.

Respond in ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'bn' ? 'Bengali' : language === 'mr' ? 'Marathi' : 'English'}.

Analyze compatibility across these areas and provide a JSON response:
{
  "overallScore": 0-100,
  "greeting": "Warm personalized greeting as AI Guru",
  "summary": "Overall compatibility summary (2-3 sentences)",
  "categories": {
    "emotional": {
      "score": 0-100,
      "title": "Emotional Compatibility / भावनात्मक अनुकूलता",
      "analysis": "Detailed analysis based on heart lines",
      "advice": "Guidance for emotional harmony"
    },
    "intellectual": {
      "score": 0-100,
      "title": "Intellectual Bond / बौद्धिक बंधन",
      "analysis": "Analysis based on head lines",
      "advice": "Tips for mental harmony"
    },
    "physical": {
      "score": 0-100,
      "title": "Physical Energy / शारीरिक ऊर्जा",
      "analysis": "Analysis based on life lines and vitality indicators",
      "advice": "Health and physical compatibility guidance"
    },
    "spiritual": {
      "score": 0-100,
      "title": "Spiritual Connection / आध्यात्मिक संबंध",
      "analysis": "Analysis based on fate lines and spiritual marks",
      "advice": "Spiritual growth together"
    },
    "financial": {
      "score": 0-100,
      "title": "Financial Harmony / आर्थिक सामंजस्य",
      "analysis": "Analysis based on sun lines and success indicators",
      "advice": "Financial partnership guidance"
    }
  },
  "strengths": ["List of relationship strengths"],
  "challenges": ["List of potential challenges"],
  "remedies": ["Vedic remedies to enhance compatibility"],
  "bestPeriods": ["Auspicious time periods for important decisions"],
  "blessings": "Final blessing for the partnership"
}

Be warm, insightful, and provide actionable guidance.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Compare these two palm readings for compatibility:

PERSON 1:
${JSON.stringify(palmAnalysis1, null, 2)}

PERSON 2:
${JSON.stringify(palmAnalysis2, null, 2)}

Provide detailed compatibility analysis.`
          }
        ],
        max_completion_tokens: 3000,
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
        JSON.stringify({ error: "Failed to analyze compatibility" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    let compatibility;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        compatibility = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        compatibility = { rawAnalysis: aiResponse };
      }
    } catch {
      compatibility = { rawAnalysis: aiResponse };
    }

    return new Response(
      JSON.stringify({ success: true, compatibility }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Compatibility error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
