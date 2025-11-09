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
    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing palm image with AI vision...");

    const systemPrompt = `You are an expert palmistry reader with deep knowledge of Hindu/Vedic palm reading traditions. Analyze the palm image and identify the following major lines and provide detailed interpretations:

1. **Heart Line** (Emotional life, relationships, love)
2. **Head Line** (Intelligence, thinking style, decision-making)
3. **Life Line** (Vitality, major life changes, health)
4. **Fate Line** (Career, destiny, life path)
5. **Sun Line** (Success, fame, creativity)
6. **Marriage Lines** (Relationships, partnerships)
7. **Health Line** (Physical well-being)
8. **Mounts** (Jupiter, Saturn, Apollo, Mercury, Venus, Mars, Moon)

For each line/mount found, provide:
- **Position & Quality**: Where it is, depth, clarity, breaks, chains, islands
- **Interpretation**: What it reveals about personality, life events, tendencies
- **Guidance**: Spiritual advice or remedies (mantras, gemstones, practices)

Structure your response in JSON format with the following structure:
{
  "palmType": "Water/Fire/Earth/Air hand",
  "overallReading": "Brief summary of personality and life path",
  "lines": {
    "heartLine": { "present": true/false, "quality": "deep/faint/broken", "meaning": "...", "guidance": "..." },
    "headLine": { "present": true/false, "quality": "...", "meaning": "...", "guidance": "..." },
    "lifeLine": { "present": true/false, "quality": "...", "meaning": "...", "guidance": "..." },
    "fateLine": { "present": true/false, "quality": "...", "meaning": "...", "guidance": "..." },
    "sunLine": { "present": true/false, "quality": "...", "meaning": "...", "guidance": "..." }
  },
  "mounts": {
    "jupiter": { "prominence": "high/medium/low", "meaning": "..." },
    "saturn": { "prominence": "high/medium/low", "meaning": "..." },
    "apollo": { "prominence": "high/medium/low", "meaning": "..." }
  },
  "specialMarks": ["Star on Apollo mount means sudden fame", "Triangle on Jupiter means wisdom"],
  "remedies": ["Chant Gayatri Mantra daily", "Wear yellow sapphire", "Practice meditation"],
  "lifeGuidance": "Overall spiritual and life guidance based on palm analysis"
}

Be detailed, specific, and provide actionable spiritual guidance rooted in Vedic palmistry traditions.`;

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
            content: [
              {
                type: "text",
                text: "Please analyze this palm image in detail according to Vedic palmistry principles. Identify all major lines, mounts, and special marks. Provide comprehensive interpretations and spiritual guidance."
              },
              {
                type: "image_url",
                image_url: { url: imageData }
              }
            ]
          }
        ],
        temperature: 0.7,
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