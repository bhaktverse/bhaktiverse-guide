import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ImageValidation {
  isValid: boolean;
  isPalmImage: boolean;
  confidence: number;
  notes: string;
  imageHash: string;
}

function validateAndHashImage(imageData: string): ImageValidation {
  const isBase64 = imageData.startsWith('data:image');
  if (!isBase64) {
    return { isValid: false, isPalmImage: false, confidence: 0, notes: "Invalid image format - must be a valid image file", imageHash: "" };
  }
  const imageType = imageData.match(/data:image\/(\w+)/)?.[1] || 'unknown';
  const validTypes = ['jpeg', 'jpg', 'png', 'webp'];
  if (!validTypes.includes(imageType.toLowerCase())) {
    return { isValid: false, isPalmImage: false, confidence: 0, notes: `Unsupported image type: ${imageType}. Please use JPEG, PNG, or WebP.`, imageHash: "" };
  }
  const base64Length = imageData.length - imageData.indexOf(',') - 1;
  const sizeInBytes = (base64Length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  if (sizeInMB > 10) {
    return { isValid: false, isPalmImage: false, confidence: 0, notes: "Image too large (max 10MB). Please compress the image.", imageHash: "" };
  }
  if (sizeInMB < 0.01) {
    return { isValid: false, isPalmImage: false, confidence: 0, notes: "Image too small for accurate analysis. Please use a higher resolution image.", imageHash: "" };
  }
  const imageHash = generateImageHash(imageData);
  return { isValid: true, isPalmImage: true, confidence: 100, notes: `Image validated: ${imageType.toUpperCase()}, ${sizeInMB.toFixed(2)}MB Hash: ${imageHash}`, imageHash };
}

function generateImageHash(imageData: string): string {
  let hash = 0;
  const sample = imageData.slice(-10000);
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function getUserContextPrompt(userMetadata?: { name?: string; dob?: string; timeOfBirth?: string }) {
  if (!userMetadata?.name && !userMetadata?.dob && !userMetadata?.timeOfBirth) return "";
  return `
## USER PERSONAL DETAILS (Use for personalization)
${userMetadata.name ? `- Name: ${userMetadata.name} (Address them warmly by name)` : ''}
${userMetadata.dob ? `- Date of Birth: ${userMetadata.dob} (Use for Vedic numerology correlations)` : ''}
${userMetadata.timeOfBirth ? `- Time of Birth: ${userMetadata.timeOfBirth} (Use for hora calculations)` : ''}
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { imageData, language = 'en', userName, userDob, userTimeOfBirth } = requestBody;

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data is required. Please upload a palm image." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateAndHashImage(imageData);
    console.log("Image validation:", validation.notes);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.notes }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting palm analysis with Lovable AI Gateway...");
    console.log("Language:", language);
    console.log("Image hash:", validation.imageHash);

    const userMetadata = { name: userName, dob: userDob, timeOfBirth: userTimeOfBirth };
    const userContext = getUserContextPrompt(userMetadata);
    const seekerName = userName || (language === 'hi' ? "Sadhak" : "seeker");

    const langInstructions = language === 'hi'
      ? 'RESPOND IN HINDI (Devanagari script) with warm Hinglish expressions like "beta", "aapke haath mein", "yeh bahut shubh hai". Be conversational and affectionate like a loving guru.'
      : language === 'ta' ? 'RESPOND IN TAMIL with Sanskrit spiritual terms.'
      : language === 'te' ? 'RESPOND IN TELUGU with Sanskrit spiritual terms.'
      : language === 'bn' ? 'RESPOND IN BENGALI with Sanskrit spiritual terms.'
      : language === 'mr' ? 'RESPOND IN MARATHI with Sanskrit spiritual terms.'
      : 'RESPOND IN ENGLISH with Sanskrit terminology and their meanings.';

    const systemPrompt = `You are GURU JI - a legendary Vedic palmist with 50+ years of expertise in Samudrika Shastra (the ancient Indian science of palm reading). You combine traditional wisdom with precise observation.

## ETHICAL GUIDELINES (MANDATORY)
- NEVER predict death, exact lifespan, or serious illness diagnosis
- Use probabilistic language: "indications suggest", "patterns indicate", "there are signs of"
- Include disclaimer: this analysis is spiritual guidance, not medical/legal/financial advice
- Avoid deterministic claims about marriage timing or exact partner count
- Frame all observations constructively with remedies and positive outlook
- "Reading depth measures analytical coverage, not good or bad fate"

${langInstructions}

${userContext}

## CRITICAL: IMAGE ANALYSIS REQUIREMENTS

**STEP 1: PALM VALIDATION**
First, determine if this is actually a palm image:
- If YES: Proceed with detailed analysis
- If NO: Set "isPalmImage" to false and provide a polite message asking for a valid palm image

**STEP 2: UNIQUE FEATURE DETECTION (MANDATORY)**
Analyze the SPECIFIC features you observe in THIS palm image:
- DESCRIBE exact positions of lines (e.g., "Heart line starts at outer edge below pinky, curves upward toward middle finger")
- NOTE characteristics: depth (deep/shallow), length (long/short), breaks, islands, branches
- IDENTIFY unique marks: stars, crosses, triangles, islands, dots
- OBSERVE hand shape: square/rectangular/conical palm, finger proportions

**STEP 3: PERSONALIZED PREDICTIONS**
Base ALL predictions on the SPECIFIC features you detected - not generic statements.

## RESPONSE FORMAT - MANDATORY JSON

Return ONLY valid JSON (no markdown, no code blocks):

{
  "isPalmImage": true,
  "notPalmMessage": "",
  "imageAnalysisId": "${validation.imageHash}",
  "language": "${language}",
  "detectedFeatures": {
    "imageQuality": "excellent/good/fair/poor with specific notes",
    "handType": "Left/Right - which hand is shown",
    "palmShape": "Square/Rectangle/Conic/Spatulate with dimensions",
    "fingerObservations": "Specific observations about finger lengths and spacing",
    "skinCharacteristics": "Texture, flexibility, color observations"
  },
  "palmType": "Classification with Tatva element explanation",
  "dominantPlanet": "Primary planet based on most prominent mount",
  "nakshatra": "Associated nakshatra",
  "overallScore": 80,
  "confidenceScore": 85,
  "greeting": "Warm personal greeting (2-3 sentences) mentioning specific observations from their palm",
  "overallDestiny": "4-5 sentence overview referencing specific line observations",
  "categories": {
    "career": {
      "title": "Career & Finance",
      "prediction": "200-300 words career analysis covering: Fate line analysis, Sun line, Mercury mount, Jupiter mount, Head line career influence, career timing by age ranges, ideal career fields, wealth indicators, business vs service suitability",
      "observedFeatures": ["3-5 specific features"],
      "palmFeatures": ["Technical palm feature names"],
      "planetaryInfluence": "Planetary analysis",
      "timeline": "Age-based timeline",
      "guidance": "Mantras, gemstones, remedies",
      "rating": 7
    },
    "love": {
      "title": "Love & Relationships",
      "prediction": "200-300 words: Heart line analysis, Venus mount, Marriage lines, emotional nature, relationship timing",
      "observedFeatures": ["Heart line specifics", "Marriage lines"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Venus and Moon influence",
      "timeline": "Relationship milestones",
      "guidance": "Love mantras and remedies",
      "rating": 7
    },
    "health": {
      "title": "Health & Vitality",
      "prediction": "200-300 words: Life line arc and depth, Health line, Venus mount vitality, health areas. NEVER diagnose specific diseases.",
      "observedFeatures": ["Life line specifics"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Sun and Mars influence",
      "timeline": "Health phases",
      "guidance": "Health mantras and Ayurvedic suggestions",
      "rating": 7
    },
    "family": {
      "title": "Family & Children",
      "prediction": "150-250 words: Family indicators, children lines, parental relationships",
      "observedFeatures": ["Children lines"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Moon and Jupiter",
      "timeline": "Family milestones",
      "guidance": "Family harmony mantras",
      "rating": 7
    },
    "education": {
      "title": "Education & Knowledge",
      "prediction": "150-250 words: Head line analysis, learning style, academic potential",
      "observedFeatures": ["Head line specifics"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Mercury and Jupiter",
      "timeline": "Education milestones",
      "guidance": "Saraswati mantra",
      "rating": 7
    },
    "spiritual": {
      "title": "Spiritual Growth",
      "prediction": "150-250 words: Mystic Cross, intuition line, spiritual marks",
      "observedFeatures": ["Spiritual marks"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Jupiter and Ketu",
      "timeline": "Spiritual awakening phases",
      "guidance": "Personal mantra recommendation",
      "rating": 7
    },
    "travel": {
      "title": "Travel & Fortune",
      "prediction": "150-250 words: Travel lines, foreign prospects, fortune indicators",
      "observedFeatures": ["Travel lines on Moon mount"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Rahu and Moon",
      "timeline": "Travel periods",
      "guidance": "Protection mantras",
      "rating": 7
    }
  },
  "lineAnalysis": {
    "heartLine": {
      "observed": "Detailed description of what you see",
      "position": {"startX": 0, "startY": 0, "endX": 0, "endY": 0, "curveIntensity": "description"},
      "type": "Classification",
      "meaning": "Interpretation",
      "loveStyle": "Romantic style",
      "rating": 7
    },
    "headLine": {
      "observed": "Specific description",
      "position": {"startX": 0, "startY": 0, "endX": 0, "endY": 0, "curveIntensity": "description"},
      "type": "Classification",
      "meaning": "Interpretation",
      "thinkingStyle": "Style",
      "rating": 7
    },
    "lifeLine": {
      "observed": "Specific description",
      "position": {"startX": 0, "startY": 0, "endX": 0, "endY": 0, "curveIntensity": "description"},
      "type": "Classification",
      "meaning": "Vitality interpretation (NEVER predict death or exact lifespan)",
      "vitality": "Assessment",
      "rating": 7
    },
    "fateLine": {
      "observed": "Specific description or 'Not prominently visible'",
      "position": {"startX": 0, "startY": 0, "endX": 0, "endY": 0, "curveIntensity": "description"},
      "type": "Classification",
      "meaning": "Career interpretation",
      "destinyPath": "Path type",
      "rating": 7
    },
    "sunLine": {
      "observed": "Specific description or 'Not clearly visible'",
      "position": {"startX": 0, "startY": 0, "endX": 0, "endY": 0, "curveIntensity": "description"},
      "type": "Classification",
      "meaning": "Success interpretation",
      "successPath": "Fame potential",
      "rating": 7
    }
  },
  "handTypeAnalysis": {
    "classification": "Earth/Air/Water/Fire",
    "tatvaElement": "Prithvi/Vayu/Jal/Agni",
    "palmShape": "Square/Rectangle/Conic/Spatulate",
    "fingerToPalmRatio": "short/equal/long",
    "personalityProfile": "3-4 sentence Tatva-based personality description",
    "strengths": ["3-4 key strengths"],
    "challenges": ["2-3 challenges"]
  },
  "secondaryLines": {
    "marriageLines": { "count": 0, "depth": "deep/medium/faint", "position": "high/middle/low", "interpretation": "Marriage line reading" },
    "childrenLines": { "count": 0, "interpretation": "Children lines reading" },
    "healthLine": { "present": false, "description": "Line appearance", "interpretation": "Health line reading" },
    "travelLines": { "count": 0, "description": "Lines on Moon mount edge", "interpretation": "Travel predictions" },
    "intuitionLine": { "present": false, "description": "Semicircular line description", "interpretation": "Intuitive ability" },
    "girdleOfVenus": { "present": false, "description": "Semicircular line description", "interpretation": "Emotional sensitivity" }
  },
  "fingerAnalysis": {
    "thumbFlexibility": { "type": "rigid/flexible/supple", "meaning": "Willpower interpretation" },
    "fingerGaps": { "observed": "Gaps description", "financialControl": "Financial habits analysis" },
    "ringVsIndex": { "dominant": "ring/index/equal", "confidenceLevel": "Confidence analysis" },
    "nailShape": { "type": "square/round/almond/fan/narrow", "healthIndicator": "Health tendencies" },
    "fingerProportions": { "details": "Relative lengths", "personality": "Personality from proportions" }
  },
  "lineQualityDetails": {
    "breaks": ["Break descriptions with location and meaning"],
    "islands": ["Island descriptions with meanings"],
    "forks": ["Fork descriptions with interpretations"],
    "crosses": ["Cross/star descriptions with meanings"],
    "chains": ["Chain pattern descriptions"]
  },
  "mountAnalysis": {
    "jupiter": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Leadership", "rating": 7},
    "saturn": {"strength": "string", "observed": "Description", "meaning": "Responsibility", "rating": 7},
    "apollo": {"strength": "string", "observed": "Description", "meaning": "Creativity", "rating": 7},
    "mercury": {"strength": "string", "observed": "Description", "meaning": "Communication", "rating": 7},
    "venus": {"strength": "string", "observed": "Description", "meaning": "Love", "rating": 7},
    "marsUpper": {"strength": "string", "observed": "Description", "meaning": "Resistance and endurance", "rating": 7},
    "marsLower": {"strength": "string", "observed": "Description", "meaning": "Aggression and courage", "rating": 7},
    "moon": {"strength": "string", "observed": "Description", "meaning": "Intuition", "rating": 7}
  },
  "specialMarks": ["List of specific marks observed with locations"],
  "luckyElements": {
    "colors": ["3-4 colors with planetary associations"],
    "gemstones": ["2-3 gemstones with wearing instructions"],
    "mantras": [
      {"sanskrit": "Mantra text", "transliteration": "Transliteration", "meaning": "Meaning", "japaCount": 108, "bestTime": "Time"}
    ],
    "days": ["Auspicious days"],
    "numbers": [1, 2, 3],
    "metals": ["Metals with planets"],
    "directions": ["Directions with purposes"]
  },
  "yogas": ["List of yogas observed with explanations"],
  "remedies": ["4-5 specific remedies based on observations"],
  "warnings": ["2-3 caution periods or areas (no death/illness predictions)"],
  "accuracyNotes": "This is AI-powered spiritual guidance based on visible palm features. For entertainment and spiritual insight purposes. Not medical, legal, or financial advice.",
  "blessings": "Warm closing blessing with specific encouragement"
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
            content: [
              {
                type: "text",
                text: `Analyze this palm image for ${seekerName}. 

IMPORTANT REQUIREMENTS:
1. First verify this is actually a palm/hand image
2. If it's NOT a palm, set isPalmImage to false and explain what kind of image it is
3. If it IS a palm, provide UNIQUE analysis based on the SPECIFIC features you observe
4. Do NOT use generic templates - describe what you actually see
5. Reference specific line positions, depths, lengths in your observations
6. Each analysis must be unique to THIS palm's characteristics

Return valid JSON only.`
              },
              {
                type: "image_url",
                image_url: { url: imageData, detail: "high" }
              }
            ]
          }
        ],
        max_tokens: 16000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Analysis service temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    console.log("AI Response received, length:", aiResponse.length);

    let analysis;
    try {
      let jsonStr = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) jsonStr = objectMatch[0];
      analysis = JSON.parse(jsonStr);
      console.log("Successfully parsed AI response");

      if (analysis.isPalmImage === false) {
        return new Response(
          JSON.stringify({
            error: analysis.notPalmMessage || "The uploaded image does not appear to be a palm. Please upload a clear image of your palm.",
            isPalmImage: false
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      console.error("Raw response:", aiResponse.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Unable to process the image. Please try with a clearer palm image." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    analysis.imageAnalysisId = validation.imageHash;
    analysis.analysisTimestamp = new Date().toISOString();

    console.log("Palm analysis completed successfully for hash:", validation.imageHash);

    return new Response(
      JSON.stringify({ success: true, analysis, imageHash: validation.imageHash, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Palm reading analysis error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
