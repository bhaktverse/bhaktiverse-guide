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
    const { imageData, language } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured. Please add it in Supabase settings." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing palm image with OpenAI GPT-5 vision...");

    const systemPrompt = `You are a renowned Vedic astrologer and palmistry expert (AI Guru) with 30+ years of experience. 
You speak in a warm, wise, and conversational tone as if personally guiding someone through their destiny.

IMPORTANT: Respond in the language requested by the user. Use appropriate greetings and cultural context.

Analyze the palm image thoroughly and provide predictions organized by these categories:

1. **Career & Finance (Karya aur Dhan)**
2. **Love & Relationships (Prem aur Rishte)**
3. **Health & Wellness (Swasthya aur Tandurusti)**
4. **Family & Children (Parivar aur Santan)**
5. **Education & Knowledge (Shiksha aur Gyan)**
6. **Spiritual Growth (Adhyatmik Vikas)**
7. **Travel & Fortune (Yatra aur Bhagya)**

For each category, analyze relevant palm features:
- Major lines (Heart, Head, Life, Fate, Sun, Marriage, Health)
- Mounts (Jupiter, Saturn, Apollo, Mercury, Venus, Mars, Moon)
- Special marks (stars, triangles, crosses, islands, chains, breaks)
- Finger shapes, thumb position, palm texture

Structure your response in JSON:
{
  "language": "language code",
  "palmType": "Fire/Water/Earth/Air hand",
  "greeting": "Warm personalized greeting as AI Guru",
  "overallDestiny": "Brief overview of life path (2-3 sentences)",
  "categories": {
    "career": {
      "title": "Career & Finance",
      "prediction": "Detailed prediction as AI Guru speaking (use 'aapke' style)",
      "palmFeatures": ["Which lines/mounts indicate this"],
      "timeline": "When major events likely (ages/years)",
      "guidance": "Spiritual remedies and advice",
      "rating": "1-10 score"
    },
    "love": { /* same structure */ },
    "health": { /* same structure */ },
    "family": { /* same structure */ },
    "education": { /* same structure */ },
    "spiritual": { /* same structure */ },
    "travel": { /* same structure */ }
  },
  "specialMarks": ["List significant marks found with meanings"],
  "luckyElements": {
    "colors": ["color1", "color2"],
    "gemstones": ["gem1", "gem2"],
    "days": ["day1", "day2"],
    "numbers": [num1, num2]
  },
  "remedies": ["Specific mantras, practices, donations to perform"],
  "warnings": ["Areas to be careful about"],
  "blessings": "Final blessing and encouragement from AI Guru"
}

Be specific, personal, and authentic. Speak as if you're sitting across from the person, reading their palm in person.`;

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
            content: [
              {
                type: "text",
                text: `Please analyze this palm image in detail. Provide comprehensive Vedic palmistry reading in ${language || 'English'}. Speak as an AI Guru with warmth and wisdom. Use phrases like "aapke bhavishya mein" if Hindi is selected.`
              },
              {
                type: "image_url",
                image_url: { url: imageData }
              }
            ]
          }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze palm image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    console.log("AI Response received, parsing...");
    
    // Try to extract JSON from the response
    let analysis;
    try {
      // Look for JSON in code blocks or raw
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // Fallback: create structured response from text
        analysis = {
          palmType: "General",
          overallReading: aiResponse.substring(0, 500),
          rawAnalysis: aiResponse
        };
      }
    } catch (parseError) {
      console.warn("Failed to parse JSON, using raw text", parseError);
      analysis = {
        palmType: "General",
        overallReading: "Analysis completed",
        rawAnalysis: aiResponse
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Palm reading analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});