import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Image validation and palm detection
interface ImageValidation {
  isValid: boolean;
  isPalmImage: boolean;
  confidence: number;
  notes: string;
  imageHash: string;
}

function validateAndHashImage(imageData: string): ImageValidation {
  // Basic validation of base64 image
  const isBase64 = imageData.startsWith('data:image');
  if (!isBase64) {
    return { 
      isValid: false, 
      isPalmImage: false, 
      confidence: 0, 
      notes: "Invalid image format - must be a valid image file",
      imageHash: ""
    };
  }
  
  // Extract image type
  const imageType = imageData.match(/data:image\/(\w+)/)?.[1] || 'unknown';
  const validTypes = ['jpeg', 'jpg', 'png', 'webp'];
  
  if (!validTypes.includes(imageType.toLowerCase())) {
    return { 
      isValid: false, 
      isPalmImage: false, 
      confidence: 0, 
      notes: `Unsupported image type: ${imageType}. Please use JPEG, PNG, or WebP.`,
      imageHash: ""
    };
  }
  
  // Estimate image size from base64
  const base64Length = imageData.length - imageData.indexOf(',') - 1;
  const sizeInBytes = (base64Length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  if (sizeInMB > 10) {
    return { 
      isValid: false, 
      isPalmImage: false, 
      confidence: 0, 
      notes: "Image too large (max 10MB). Please compress the image.",
      imageHash: ""
    };
  }
  
  if (sizeInMB < 0.01) {
    return { 
      isValid: false, 
      isPalmImage: false, 
      confidence: 0, 
      notes: "Image too small for accurate analysis. Please use a higher resolution image.",
      imageHash: ""
    };
  }
  
  // Generate a hash from the image data for uniqueness checking
  const imageHash = generateImageHash(imageData);
  
  return { 
    isValid: true, 
    isPalmImage: true, // Will be verified by AI
    confidence: 100, 
    notes: `Image validated: ${imageType.toUpperCase()}, ${sizeInMB.toFixed(2)}MB`,
    imageHash
  };
}

// Generate a unique hash from image data
function generateImageHash(imageData: string): string {
  let hash = 0;
  const sample = imageData.slice(-10000); // Use last 10000 chars for performance
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Generate user context prompt
function getUserContextPrompt(userMetadata?: { name?: string; dob?: string; timeOfBirth?: string }) {
  if (!userMetadata?.name && !userMetadata?.dob && !userMetadata?.timeOfBirth) {
    return "";
  }
  
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image
    const validation = validateAndHashImage(imageData);
    console.log("Image validation:", validation.notes, "Hash:", validation.imageHash);
    
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.notes }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting palm analysis with real AI vision...");
    console.log("Language:", language);
    console.log("Image hash:", validation.imageHash);

    const userMetadata = { name: userName, dob: userDob, timeOfBirth: userTimeOfBirth };
    const userContext = getUserContextPrompt(userMetadata);
    const seekerName = userName || (language === 'hi' ? "साधक" : "seeker");

    const langInstructions = language === 'hi' 
      ? 'RESPOND IN HINDI (Devanagari script) with warm Hinglish expressions like "beta", "aapke haath mein", "yeh bahut shubh hai". Be conversational and affectionate like a loving guru.'
      : language === 'ta' ? 'RESPOND IN TAMIL with Sanskrit spiritual terms.'
      : language === 'te' ? 'RESPOND IN TELUGU with Sanskrit spiritual terms.'
      : language === 'bn' ? 'RESPOND IN BENGALI with Sanskrit spiritual terms.'
      : language === 'mr' ? 'RESPOND IN MARATHI with Sanskrit spiritual terms.'
      : 'RESPOND IN ENGLISH with Sanskrit terminology and their meanings.';

    const systemPrompt = `You are GURU JI - a legendary Vedic palmist with 50+ years of expertise in Samudrika Shastra (the ancient Indian science of palm reading). You combine traditional wisdom with precise observation.

${langInstructions}

${userContext}

## CRITICAL: IMAGE ANALYSIS REQUIREMENTS

**STEP 1: PALM VALIDATION**
First, determine if this is actually a palm image:
- If YES: Proceed with detailed analysis
- If NO: Set "isPalmImage" to false and provide a polite message asking for a valid palm image

**STEP 2: UNIQUE FEATURE DETECTION (MANDATORY)**
You MUST analyze the SPECIFIC features you observe in THIS palm image:
- DESCRIBE exact positions of lines you see (e.g., "Heart line starts at outer edge below pinky, curves upward toward middle finger")
- NOTE specific characteristics: depth (deep/shallow), length (long/short), breaks, islands, branches
- IDENTIFY unique marks: stars, crosses, triangles, islands, dots
- OBSERVE hand shape: square/rectangular/conical palm, finger proportions

**STEP 3: PERSONALIZED PREDICTIONS**
Base ALL predictions on the SPECIFIC features you detected - not generic statements.
Each prediction must reference what you OBSERVED in their palm.

## RESPONSE FORMAT - MANDATORY JSON

Return ONLY valid JSON (no markdown, no code blocks):

{
  "isPalmImage": true/false,
  "notPalmMessage": "Message if not a palm image",
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
  "overallScore": number between 70-95 based on actual observations,
  "confidenceScore": number between 75-92 based on image clarity,
  "greeting": "Warm personal greeting (3-4 sentences) mentioning specific observations from their palm",
  "overallDestiny": "5-6 sentence overview referencing specific line observations",
  "categories": {
    "career": {
      "title": "Career & Finance | करियर एवं धन",
      "prediction": "MINIMUM 600 WORDS comprehensive career analysis including:
        
1. FATE LINE ANALYSIS: 'I observe your Bhagya Rekha [specific description - origin point, direction, depth, any breaks or branches]. This indicates [interpretation].'

2. SUN LINE OBSERVATIONS: 'Your Surya Rekha [if present: describe; if absent: note its absence and meaning].'

3. MERCURY MOUNT: 'The Mercury parvat below your little finger shows [specific prominence level], suggesting [business/communication interpretation].'

4. JUPITER MOUNT: 'Your Jupiter mount development indicates [leadership/teaching potential with specifics].'

5. HEAD LINE CAREER INFLUENCE: 'The slope and length of your head line suggests [thinking style for career].'

6. CAREER TIMING PREDICTIONS:
   - Age 20-25: [Specific predictions based on line positions]
   - Age 25-30: [Growth phase predictions]
   - Age 30-40: [Peak career period]
   - Age 40-50: [Senior role predictions]
   - Age 50+: [Advisory and legacy phase]

7. IDEAL CAREER FIELDS: [List 5-7 specific fields based on observations]

8. WEALTH INDICATORS: [Dhana yoga signs observed]

9. BUSINESS VS SERVICE: [Which is more suitable based on palm features]

10. INTERNATIONAL OPPORTUNITIES: [Travel lines and foreign career potential]",
      "observedFeatures": ["List 5+ specific features you observed"],
      "palmFeatures": ["Technical palm feature names"],
      "planetaryInfluence": "Detailed planetary analysis",
      "timeline": "Specific age-based timeline",
      "guidance": "Mantras, gemstones, remedies specific to observations",
      "rating": number 6-9 based on actual features
    },
    "love": {
      "title": "Love & Relationships | प्रेम एवं रिश्ते",
      "prediction": "MINIMUM 600 WORDS: Heart line analysis, Venus mount, Marriage lines (count, depth, position), emotional nature, relationship timing, partner characteristics",
      "observedFeatures": ["Heart line specifics", "Marriage lines count", "Venus mount development"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Venus and Moon influence",
      "timeline": "Relationship milestones by age",
      "guidance": "Love mantras and remedies",
      "rating": number based on observations
    },
    "health": {
      "title": "Health & Vitality | स्वास्थ्य एवं शक्ति",
      "prediction": "MINIMUM 600 WORDS: Life line arc and depth, Health line presence, Venus mount vitality, specific health areas based on observations",
      "observedFeatures": ["Life line specifics", "Health indicators"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Sun and Mars influence",
      "timeline": "Health phases",
      "guidance": "Health mantras and Ayurvedic suggestions",
      "rating": number
    },
    "family": {
      "title": "Family & Children | परिवार एवं संतान",
      "prediction": "MINIMUM 500 WORDS: Family indicators, children lines, parental relationships",
      "observedFeatures": ["Children lines observed"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Moon and Jupiter",
      "timeline": "Family milestones",
      "guidance": "Family harmony mantras",
      "rating": number
    },
    "education": {
      "title": "Education & Knowledge | शिक्षा एवं ज्ञान",
      "prediction": "MINIMUM 500 WORDS: Head line analysis, learning style, academic potential",
      "observedFeatures": ["Head line specifics"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Mercury and Jupiter",
      "timeline": "Education milestones",
      "guidance": "Saraswati mantra",
      "rating": number
    },
    "spiritual": {
      "title": "Spiritual Growth | आध्यात्मिक विकास",
      "prediction": "MINIMUM 500 WORDS: Mystic Cross, intuition line, spiritual marks",
      "observedFeatures": ["Spiritual marks observed"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Jupiter and Ketu",
      "timeline": "Spiritual awakening phases",
      "guidance": "Personal mantra recommendation",
      "rating": number
    },
    "travel": {
      "title": "Travel & Fortune | यात्रा एवं भाग्य",
      "prediction": "MINIMUM 500 WORDS: Travel lines, foreign prospects, fortune indicators",
      "observedFeatures": ["Travel lines on Moon mount"],
      "palmFeatures": ["Technical features"],
      "planetaryInfluence": "Rahu and Moon",
      "timeline": "Travel periods",
      "guidance": "Protection mantras",
      "rating": number
    }
  },
  "lineAnalysis": {
    "heartLine": {
      "observed": "DETAILED: 'I see your Heart line begins at [exact location], extends [length] with [depth], showing [curvature]. Notable: [branches/islands/breaks].'",
      "position": {"startX": number, "startY": number, "endX": number, "endY": number, "curveIntensity": "string"},
      "type": "Classification",
      "meaning": "Interpretation",
      "loveStyle": "Romantic style",
      "rating": number
    },
    "headLine": {
      "observed": "Specific description",
      "position": {"startX": number, "startY": number, "endX": number, "endY": number, "curveIntensity": "string"},
      "type": "Classification",
      "meaning": "Interpretation",
      "thinkingStyle": "Style",
      "rating": number
    },
    "lifeLine": {
      "observed": "Specific description",
      "position": {"startX": number, "startY": number, "endX": number, "endY": number, "curveIntensity": "string"},
      "type": "Classification",
      "meaning": "Vitality interpretation",
      "vitality": "Assessment",
      "rating": number
    },
    "fateLine": {
      "observed": "Specific description or 'Not prominently visible in this image'",
      "position": {"startX": number, "startY": number, "endX": number, "endY": number, "curveIntensity": "string"},
      "type": "Classification",
      "meaning": "Career interpretation",
      "destinyPath": "Path type",
      "rating": number
    },
    "sunLine": {
      "observed": "Specific description or 'Not clearly visible'",
      "position": {"startX": number, "startY": number, "endX": number, "endY": number, "curveIntensity": "string"},
      "type": "Classification",
      "meaning": "Success interpretation",
      "successPath": "Fame potential",
      "rating": number
    }
  },
  "mountAnalysis": {
    "jupiter": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Leadership", "rating": number},
    "saturn": {"strength": "string", "observed": "Description", "meaning": "Responsibility", "rating": number},
    "apollo": {"strength": "string", "observed": "Description", "meaning": "Creativity", "rating": number},
    "mercury": {"strength": "string", "observed": "Description", "meaning": "Communication", "rating": number},
    "venus": {"strength": "string", "observed": "Description", "meaning": "Love", "rating": number},
    "mars": {"strength": "string", "observed": "Description", "meaning": "Courage", "rating": number},
    "moon": {"strength": "string", "observed": "Description", "meaning": "Intuition", "rating": number}
  },
  "specialMarks": ["List of specific marks observed with locations"],
  "luckyElements": {
    "colors": ["3-4 colors with planetary associations"],
    "gemstones": ["2-3 gemstones with wearing instructions"],
    "mantras": [
      {"sanskrit": "मंत्र", "transliteration": "Mantra", "meaning": "Meaning", "japaCount": 108, "bestTime": "Time"}
    ],
    "days": ["Auspicious days"],
    "numbers": [1, 2, 3],
    "metals": ["Metals with planets"],
    "directions": ["Directions with purposes"]
  },
  "yogas": ["List of yogas observed with explanations"],
  "remedies": ["4-5 specific remedies based on observations"],
  "warnings": ["2-3 caution periods or areas"],
  "accuracyNotes": "Note about analysis being based on visible features",
  "blessings": "Warm closing blessing with specific encouragement"
}`;

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
        max_tokens: 12000,
        temperature: 0.8, // Slightly higher for more varied responses
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    
    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON from various formats
      let jsonStr = aiResponse;
      
      // Remove markdown code blocks if present
      const jsonMatch = aiResponse.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      // Try to find JSON object
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }
      
      analysis = JSON.parse(jsonStr);
      console.log("Successfully parsed AI response");
      
      // Check if AI detected this is not a palm image
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
        JSON.stringify({ 
          error: "Unable to process the image. Please try with a clearer palm image." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add metadata
    analysis.imageAnalysisId = validation.imageHash;
    analysis.analysisTimestamp = new Date().toISOString();

    console.log("Palm analysis completed successfully for hash:", validation.imageHash);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        imageHash: validation.imageHash,
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
        error: "An unexpected error occurred. Please try again." 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
