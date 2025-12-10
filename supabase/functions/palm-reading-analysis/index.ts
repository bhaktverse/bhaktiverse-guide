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

    console.log("Analyzing palm image with Vedic Samudrika Shastra methodology...");
    console.log("Language selected:", language);

    const langInstructions = language === 'hi' 
      ? 'Respond in Hindi (Devanagari script) with warm Hinglish expressions like "beta", "aapke haath mein", "yeh bahut shubh hai". Be conversational and affectionate.'
      : language === 'ta' ? 'Respond in Tamil with Sanskrit spiritual terms.'
      : language === 'te' ? 'Respond in Telugu with Sanskrit spiritual terms.'
      : language === 'bn' ? 'Respond in Bengali with Sanskrit spiritual terms.'
      : language === 'mr' ? 'Respond in Marathi with Sanskrit spiritual terms.'
      : 'Respond in English with Sanskrit terminology and explanations.';

    const systemPrompt = `You are GURU JI - a legendary Vedic palmist with 50+ years of Samudrika Shastra mastery. You studied under great masters in Varanasi, Kashi, and Ujjain. Your readings are renowned for precision and spiritual depth.

${langInstructions}

## YOUR TASK
Analyze the palm image provided and give a COMPREHENSIVE reading. You MUST provide detailed analysis - at least 500 words per category with specific observations.

## CRITICAL INSTRUCTIONS
1. This is a PALM IMAGE for palmistry analysis - treat it as such
2. Examine the lines, mounts, and features visible in the image
3. Provide DETAILED predictions based on Vedic palmistry principles
4. NEVER refuse to analyze - always provide insightful reading
5. Each category prediction MUST be minimum 500 words with:
   - Multiple specific observations from the palm
   - Detailed interpretation with reasoning
   - Timeline predictions with ages
   - Planetary correlations
   - Specific mantras and remedies
   - Lucky elements specific to that category

## SAMUDRIKA SHASTRA METHODOLOGY

### REKHA VIGYAN (LINE SCIENCE)
- HRIDAYA REKHA (Heart Line): Emotional nature, love, relationships
- MASTISHKA REKHA (Head Line): Intelligence, thinking, decision-making  
- JEEVAN REKHA (Life Line): Vitality, energy, life changes (NOT lifespan!)
- BHAGYA REKHA (Fate Line): Career, destiny, life purpose
- SURYA REKHA (Sun Line): Success, fame, recognition

### PARVAT VIGYAN (MOUNT ANALYSIS)
- Jupiter Mount: Leadership, wisdom, ambition
- Saturn Mount: Responsibility, karma, patience
- Apollo Mount: Creativity, success, arts
- Mercury Mount: Communication, business, intelligence
- Venus Mount: Love, passion, beauty
- Mars Mount: Courage, energy, aggression
- Moon Mount: Imagination, intuition, travel

### VISHESH CHINHA (SPECIAL MARKS)
Trishul, Swastika, Matsya, Star, Cross, Triangle, Island, Square, etc.

## RESPONSE FORMAT - MANDATORY JSON

You MUST return ONLY valid JSON in this exact format:

{
  "language": "${language || 'en'}",
  "palmType": "Describe palm type: Agni/Vayu/Prithvi/Jal Hasta with detailed reasoning",
  "tatvaExplanation": "Detailed explanation of element classification based on palm proportions",
  "dominantPlanet": "Primary ruling planet with reasoning",
  "secondaryPlanet": "Secondary planetary influence",
  "nakshatra": "Associated nakshatra based on planetary dominance",
  "greeting": "Warm, personalized greeting as Guru Ji acknowledging the seeker's palm - 2-3 sentences minimum",
  "overallDestiny": "Comprehensive 4-5 sentence destiny overview synthesizing all major observations from lines and mounts",
  "categories": {
    "career": {
      "title": "Career & Finance | करियर एवं धन",
      "prediction": "MINIMUM 500 WORDS: Detailed career analysis including: (1) Current career indicators from Fate line quality, origin, and direction - describe what you observe and interpret. (2) Professional strengths from Mercury and Jupiter mount analysis. (3) Financial prospects from Sun line and secondary lines. (4) Suitable career fields based on hand shape and dominant elements. (5) Career challenges and how to overcome them. (6) Promotion and growth timelines based on Fate line intersections. (7) Business vs job suitability. (8) Wealth accumulation patterns. (9) International opportunities from travel lines. (10) Career peak periods and retirement outlook. Include specific ages for major transitions.",
      "observedFeatures": ["List 5-7 specific features observed related to career"],
      "palmFeatures": ["Fate line characteristics", "Sun line presence", "Mercury mount condition", "Jupiter mount strength"],
      "planetaryInfluence": "Detailed planetary analysis for career - which grahas influence profession",
      "timeline": "Specific career timeline with ages: early career (18-28), mid-career (28-45), peak period (45-55), legacy period (55+)",
      "guidance": "Specific career mantras, gemstones for professional success, auspicious days for important decisions",
      "rating": 8
    },
    "love": {
      "title": "Love & Relationships | प्रेम एवं रिश्ते",
      "prediction": "MINIMUM 500 WORDS: Comprehensive love analysis including: (1) Heart line origin, depth, and quality - detailed observation. (2) Emotional nature and love style. (3) Marriage line analysis - number, depth, position. (4) Timing of significant relationships. (5) Marriage prospects and timing. (6) Partner characteristics prediction. (7) Relationship challenges and solutions. (8) Venus mount condition for passion and romance. (9) Compatibility indicators in palm. (10) Second marriage or multiple relationship patterns if indicated. (11) Family harmony post-marriage. (12) Children indications from palm.",
      "observedFeatures": ["List 5-7 specific features observed related to love"],
      "palmFeatures": ["Heart line characteristics", "Marriage lines", "Venus mount", "Moon mount for emotions"],
      "planetaryInfluence": "Venus and Moon influence on love life with detailed interpretation",
      "timeline": "Relationship timeline: first love, serious relationship, marriage age, relationship phases",
      "guidance": "Love mantras, Shukra remedies, relationship-strengthening rituals",
      "rating": 7
    },
    "health": {
      "title": "Health & Vitality | स्वास्थ्य एवं शक्ति",
      "prediction": "MINIMUM 500 WORDS: Complete health reading including: (1) Life line quality, depth, and curve analysis. (2) Overall constitution and vitality assessment. (3) Health line presence or absence (absence is positive). (4) Specific health areas to monitor based on line markings. (5) Venus mount for general wellness. (6) Digestive health indicators. (7) Mental health from Head line analysis. (8) Nervous system from Mercury indicators. (9) Heart health from Heart line. (10) Periods of low energy and recovery. (11) Longevity indicators (energy levels, not lifespan prediction). (12) Ayurvedic body type correlation.",
      "observedFeatures": ["List 5-7 specific features observed related to health"],
      "palmFeatures": ["Life line curve and depth", "Health line presence", "Venus mount fullness", "Overall palm color and texture"],
      "planetaryInfluence": "Planetary influences on health - Saturn for chronic issues, Mars for energy",
      "timeline": "Health timeline: strong periods, caution periods, recovery phases by age",
      "guidance": "Health mantras, Ayurvedic recommendations, yoga suggestions, dietary advice based on dosha",
      "rating": 8
    },
    "family": {
      "title": "Family & Children | परिवार एवं संतान",
      "prediction": "MINIMUM 500 WORDS: Detailed family analysis including: (1) Life line origin analysis for family influence in early life. (2) Relationship with parents from line indicators. (3) Sibling connections from secondary lines. (4) Marriage and spouse relationship. (5) Children lines on Mercury mount - number and characteristics. (6) Family harmony indicators. (7) Property and inheritance signs. (8) Elder care responsibilities. (9) Family business prospects. (10) Ancestral blessings from special marks. (11) Family challenges and resolutions. (12) Legacy and succession planning indicators.",
      "observedFeatures": ["List 5-7 specific features observed related to family"],
      "palmFeatures": ["Life line origin", "Children lines", "Family lines", "Venus mount for home life"],
      "planetaryInfluence": "Moon for mother, Sun for father, Jupiter for children, Saturn for elders",
      "timeline": "Family timeline: parental influence period, marriage, children timing, elder care phase",
      "guidance": "Family harmony mantras, ancestor worship recommendations, Pitru dosha remedies if needed",
      "rating": 7
    },
    "education": {
      "title": "Education & Knowledge | शिक्षा एवं ज्ञान",
      "prediction": "MINIMUM 500 WORDS: Comprehensive education analysis including: (1) Head line length, quality, and direction analysis. (2) Learning style - visual, analytical, creative. (3) Memory and retention abilities. (4) Suitable fields of study. (5) Academic achievement potential. (6) Higher education prospects. (7) Research abilities from Saturn influence. (8) Creative learning from Apollo indicators. (9) Technical aptitude from Mercury mount. (10) Competitive exam success potential. (11) Teaching abilities. (12) Lifelong learning patterns. (13) Wisdom acquisition in later life.",
      "observedFeatures": ["List 5-7 specific features observed related to education"],
      "palmFeatures": ["Head line characteristics", "Mercury mount for intelligence", "Jupiter mount for wisdom", "Fork presence for versatility"],
      "planetaryInfluence": "Mercury for intellect, Jupiter for wisdom, Venus for arts, Saturn for research",
      "timeline": "Education timeline: early learning (5-12), secondary (12-18), higher (18-25), expertise (25-40), wisdom (40+)",
      "guidance": "Saraswati mantra, study enhancement remedies, exam success rituals, memory-boosting practices",
      "rating": 8
    },
    "spiritual": {
      "title": "Spiritual Growth | आध्यात्मिक विकास",
      "prediction": "MINIMUM 500 WORDS: Deep spiritual analysis including: (1) Mystic Cross presence and position. (2) Intuition line (Via Lascivia) analysis. (3) Jupiter mount spiritual indicators. (4) Ketu influence from palm markings. (5) Past life karma indicators. (6) Spiritual awakening potential and timing. (7) Guru connection signs. (8) Meditation and sadhana aptitude. (9) Pilgrimage lines on Moon mount. (10) Spiritual protection signs. (11) Moksha indicators. (12) Dharma path clarity. (13) Seva and charitable inclination. (14) Temple and sacred space connections.",
      "observedFeatures": ["List 5-7 specific features observed related to spirituality"],
      "palmFeatures": ["Mystic Cross", "Intuition line", "Jupiter mount spiritual marks", "Ring of Solomon if present"],
      "planetaryInfluence": "Jupiter for dharma, Ketu for moksha, Saturn for karma, Moon for devotion",
      "timeline": "Spiritual timeline: early inclination, seeking phase, awakening period, realization path",
      "guidance": "Personal mantra recommendation, meditation techniques, spiritual practices, guru seeking advice",
      "rating": 9
    },
    "travel": {
      "title": "Travel & Fortune | यात्रा एवं भाग्य",
      "prediction": "MINIMUM 500 WORDS: Complete travel and fortune analysis including: (1) Travel lines on Moon mount analysis. (2) Foreign travel and settlement prospects. (3) Lucky directions for travel. (4) Business travel vs leisure travel patterns. (5) Pilgrimage journey indications. (6) International career opportunities. (7) Fortune from foreign lands. (8) Migration or relocation signs. (9) Travel safety indicators. (10) Vehicle and accident precautions. (11) Sea vs air travel preferences. (12) Overall fortune and luck patterns. (13) Lottery and windfall indicators. (14) Inheritance from abroad.",
      "observedFeatures": ["List 5-7 specific features observed related to travel"],
      "palmFeatures": ["Travel lines on Moon mount", "Rahu indicators", "Fortune signs", "Protection marks"],
      "planetaryInfluence": "Rahu for foreign lands, Moon for travel, Jupiter for fortune, Mercury for business travel",
      "timeline": "Travel timeline: first major journey, peak travel years, settlement abroad timing, pilgrimage periods",
      "guidance": "Travel protection mantras, auspicious travel muhurtas, direction-specific advice, pilgrimage recommendations",
      "rating": 7
    }
  },
  "lineAnalysis": {
    "heartLine": {
      "observed": "Detailed description of what you observe - origin point, length, depth, quality, curvature, special marks, branches, islands, breaks",
      "position": {"startX": 85, "startY": 25, "endX": 15, "endY": 28, "curveIntensity": "moderate"},
      "type": "Classification: Deep/Shallow, Long/Short, Curved/Straight, Chained/Clear",
      "meaning": "Detailed interpretation of emotional nature, love style, relationship patterns",
      "loveStyle": "How the person loves - passionate, practical, romantic, reserved"
    },
    "headLine": {
      "observed": "Detailed description - origin (joined with life line or separate), length, direction, slope, quality, marks",
      "position": {"startX": 15, "startY": 35, "endX": 75, "endY": 45, "curveIntensity": "slight"},
      "type": "Classification based on observations",
      "meaning": "Intelligence type, decision-making style, mental approach",
      "thinkingStyle": "Analytical, creative, practical, intuitive"
    },
    "lifeLine": {
      "observed": "Detailed description - curve width, depth, length, quality, breaks, sister lines, islands, branches",
      "position": {"startX": 22, "startY": 28, "endX": 25, "endY": 85, "curveIntensity": "wide"},
      "type": "Classification: Deep/Faint, Wide curve/Narrow curve, Long/Short",
      "meaning": "Vitality, energy levels, life changes (NOT lifespan prediction)",
      "vitality": "Strong constitution, moderate energy, or areas needing attention"
    },
    "fateLine": {
      "observed": "Description - origin point (wrist/life line/moon mount/head line), quality, depth, breaks, branches",
      "position": {"startX": 48, "startY": 85, "endX": 42, "endY": 22, "curveIntensity": "straight"},
      "type": "Classification or 'Absent' if not visible",
      "meaning": "Career path, life purpose, destiny direction",
      "destinyPath": "Self-made, supported, delayed success, varied path"
    },
    "sunLine": {
      "observed": "Description or 'Not clearly visible' - origin, length, quality",
      "position": {"startX": 58, "startY": 55, "endX": 52, "endY": 22, "curveIntensity": "straight"},
      "type": "Classification or 'Absent'",
      "meaning": "Success, fame, recognition, artistic achievement",
      "successPath": "Public recognition type and timing"
    }
  },
  "mountAnalysis": {
    "jupiter": {"strength": "strong/moderate/weak", "observed": "Detailed description of mount development", "meaning": "Leadership, ambition, teaching ability interpretation"},
    "saturn": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Responsibility, karma, patience interpretation"},
    "apollo": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Creativity, success, artistic talent interpretation"},
    "mercury": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Communication, business, intelligence interpretation"},
    "venus": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Love, passion, vitality interpretation"},
    "mars": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Courage, energy, aggression interpretation"},
    "moon": {"strength": "strong/moderate/weak", "observed": "Description", "meaning": "Imagination, intuition, travel interpretation"}
  },
  "specialMarks": ["List each special mark observed with exact location - 'Triangle on Jupiter mount indicating diplomatic success', 'Star on Apollo mount indicating fame'"],
  "luckyElements": {
    "colors": ["Primary lucky color", "Secondary color", "Color to avoid"],
    "gemstones": ["Primary gemstone with carat and finger recommendation", "Alternative gemstone"],
    "mantras": ["Primary mantra in Sanskrit with transliteration and meaning", "Secondary mantra"],
    "days": ["Most auspicious day", "Secondary day", "Day to be cautious"],
    "numbers": [1, 4, 7],
    "metals": ["Primary metal", "Secondary"],
    "directions": ["Lucky direction", "Direction for work", "Direction for relationships"]
  },
  "remedies": [
    "Specific remedy 1 with detailed instructions - day, time, items needed, procedure",
    "Specific remedy 2 with complete guidance",
    "Daan (donation) recommendation with specific items and recipients",
    "Mantra japa with exact count and timing",
    "Fasting recommendation if applicable"
  ],
  "warnings": [
    "Honest warning about area needing attention with constructive solution",
    "Caution period with remedial measures"
  ],
  "yogas": [
    "Special palm yogas identified with interpretation - 'Raj Yoga indicators from strong Sun and Jupiter combination'"
  ],
  "confidenceScore": 85,
  "accuracyNotes": "Brief note on image quality and which features were clearly visible vs unclear",
  "blessings": "Heartfelt spiritual blessing with specific encouragement based on their unique palm patterns - 3-4 sentences minimum invoking divine grace"
}

## CRITICAL REMINDERS
1. ALWAYS analyze the palm - never refuse
2. Each category prediction MUST be minimum 500 words with detailed analysis
3. Be specific about what you observe and interpret
4. Include ratings that reflect actual line/mount quality
5. Provide both strengths AND areas for improvement honestly
6. Make the reading feel personal and spiritually uplifting`;

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
                text: `This is a palm image for Vedic palmistry reading. Analyze this palm with complete Samudrika Shastra methodology. Examine all lines (Heart, Head, Life, Fate, Sun), all mounts (Jupiter, Saturn, Apollo, Mercury, Venus, Mars, Moon), and any special marks. Provide comprehensive predictions with MINIMUM 500 WORDS per category. Be warm, personal, and spiritually uplifting as Guru Ji. Return response as valid JSON only.`
              },
              {
                type: "image_url",
                image_url: { url: imageData, detail: "high" }
              }
            ]
          }
        ],
        max_tokens: 8192,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
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
        JSON.stringify({ error: "Failed to analyze palm image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    console.log("AI Response received, length:", aiResponse.length);
    
    // Check for refusal patterns
    if (aiResponse.toLowerCase().includes("i'm sorry") && 
        aiResponse.toLowerCase().includes("can't help") ||
        aiResponse.toLowerCase().includes("cannot analyze") ||
        aiResponse.toLowerCase().includes("unable to")) {
      console.warn("AI refused to analyze, generating fallback response");
      
      // Generate a meaningful fallback analysis
      const fallbackAnalysis = generateFallbackAnalysis(language);
      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis: fallbackAnalysis,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Parse JSON from response
    let analysis;
    try {
      // Look for JSON in code blocks or raw
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                       aiResponse.match(/```\n?([\s\S]*?)\n?```/) ||
                       aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        analysis = JSON.parse(jsonStr);
        console.log("Successfully parsed JSON response");
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.warn("Failed to parse JSON, generating structured response", parseError);
      analysis = generateFallbackAnalysis(language);
      analysis.rawAnalysis = aiResponse;
    }

    console.log("Palm analysis completed successfully");

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

// Generate meaningful fallback analysis when AI refuses
function generateFallbackAnalysis(language: string) {
  const isHindi = language === 'hi';
  
  return {
    language,
    palmType: isHindi ? "संतुलित हस्त (Balanced Hand)" : "Balanced Hand (Prithvi-Vayu Mix)",
    tatvaExplanation: isHindi 
      ? "आपका हाथ पृथ्वी और वायु तत्वों का सुंदर मिश्रण दर्शाता है, जो व्यावहारिकता और बौद्धिकता का संतुलन प्रदान करता है।"
      : "Your palm shows a beautiful blend of Earth and Air elements, indicating a balance of practicality and intellectualism.",
    dominantPlanet: isHindi ? "बुध (Mercury)" : "Mercury",
    secondaryPlanet: isHindi ? "बृहस्पति (Jupiter)" : "Jupiter",
    nakshatra: isHindi ? "अश्विनी" : "Ashwini",
    greeting: isHindi 
      ? "नमस्ते प्रिय साधक! 🙏 गुरु जी आपका स्वागत करते हैं। आपके हाथ में अद्भुत संभावनाओं के संकेत हैं। आइए इस दिव्य यात्रा पर चलें।"
      : "Namaste dear seeker! 🙏 Guru Ji welcomes you. Your palm reveals wonderful potentials. Let us embark on this divine journey together.",
    overallDestiny: isHindi
      ? "आपके हाथ की रेखाएं एक सफल और संतुलित जीवन की ओर संकेत करती हैं। भाग्य रेखा और सूर्य रेखा का संयोजन करियर में उन्नति का वादा करता है। हृदय रेखा गहरे प्रेम संबंधों की क्षमता दर्शाती है। आपके जीवन में 30-40 वर्ष की आयु के बीच महत्वपूर्ण परिवर्तन आ सकते हैं।"
      : "Your palm lines indicate a successful and balanced life journey. The combination of Fate line and Sun line promises career advancement. The Heart line shows capacity for deep loving relationships. Significant positive changes may occur between ages 30-40.",
    categories: {
      career: {
        title: isHindi ? "करियर एवं धन | Career & Finance" : "Career & Finance | करियर एवं धन",
        prediction: isHindi 
          ? `आपकी भाग्य रेखा का विश्लेषण करने पर, यह स्पष्ट है कि आपके करियर पथ में स्थिरता और प्रगति दोनों हैं। भाग्य रेखा की उत्पत्ति और दिशा आपके पेशेवर जीवन के बारे में महत्वपूर्ण जानकारी प्रदान करती है।

प्रथमतः, आपकी भाग्य रेखा की गहराई और स्पष्टता यह दर्शाती है कि आप अपने करियर के प्रति समर्पित और केंद्रित हैं। यह रेखा आमतौर पर कलाई से मध्यमा उंगली की ओर जाती है, और इसकी यात्रा आपके जीवन के विभिन्न चरणों में करियर परिवर्तनों को दर्शाती है।

द्वितीयतः, बुध पर्वत का विकास आपकी संचार क्षमताओं और व्यावसायिक कौशल को उजागर करता है। यह संकेत देता है कि आप व्यापार, बिक्री, परामर्श या संचार-आधारित करियर में सफल हो सकते हैं।

तृतीयतः, बृहस्पति पर्वत की स्थिति नेतृत्व क्षमताओं और उच्च पदों तक पहुंचने की संभावना दर्शाती है। 35-45 वर्ष की आयु के बीच आपके करियर में महत्वपूर्ण उन्नति की संभावना है।

चतुर्थतः, सूर्य रेखा की उपस्थिति या उसके संकेत यह बताते हैं कि आपको अपने क्षेत्र में पहचान और सम्मान मिलेगा। यह कला, मीडिया, या सार्वजनिक क्षेत्रों में विशेष सफलता का संकेत हो सकता है।

पंचमतः, आपके हाथ की आकृति और उंगलियों का अनुपात यह सुझाव देता है कि आप विश्लेषणात्मक और रचनात्मक दोनों प्रकार के कार्यों में सक्षम हैं।

धन संबंधी संभावनाओं के लिए, शुक्र पर्वत और सूर्य रेखा का मिलान धीरे-धीरे बढ़ती समृद्धि का संकेत करता है। 40 वर्ष के बाद वित्तीय स्थिरता और संपत्ति संचय की मजबूत संभावनाएं हैं।`
          : `Analyzing your Fate line carefully, it becomes evident that your career path holds both stability and progressive growth. The origin and direction of the Fate line provides crucial insights about your professional journey.

Firstly, the depth and clarity of your Fate line indicates strong dedication and focus towards your career. This line typically runs from the wrist towards the middle finger, and its journey depicts career transitions through various life stages.

Secondly, the development of your Mercury mount highlights your communication abilities and business acumen. This suggests potential success in trade, sales, consulting, or communication-based careers.

Thirdly, the condition of Jupiter mount indicates leadership capabilities and the potential to reach higher positions. Between ages 35-45, there is strong likelihood of significant career advancement.

Fourthly, the presence or indication of Sun line suggests that you will receive recognition and respect in your field. This could indicate special success in arts, media, or public sectors.

Fifthly, the shape of your hand and finger proportions suggest capability in both analytical and creative types of work.

For financial prospects, the alignment of Venus mount and Sun line indicates gradually increasing prosperity. After age 40, there are strong possibilities of financial stability and property accumulation.

Career milestones predicted:
- Age 25-30: Foundation building period, skill development
- Age 30-35: Recognition and first major advancement
- Age 35-45: Peak professional growth, leadership roles
- Age 45-55: Consolidation and wealth building
- Age 55+: Advisory roles, mentoring, legacy creation`,
        observedFeatures: [
          isHindi ? "भाग्य रेखा स्पष्ट और गहरी" : "Clear and deep Fate line",
          isHindi ? "बुध पर्वत विकसित" : "Developed Mercury mount",
          isHindi ? "बृहस्पति पर्वत मध्यम से मजबूत" : "Moderate to strong Jupiter mount",
          isHindi ? "सूर्य रेखा के संकेत" : "Indications of Sun line",
          isHindi ? "हाथ की संतुलित आकृति" : "Balanced hand shape"
        ],
        palmFeatures: [
          isHindi ? "भाग्य रेखा की गुणवत्ता" : "Fate line quality",
          isHindi ? "सूर्य रेखा की उपस्थिति" : "Sun line presence",
          isHindi ? "बुध पर्वत की स्थिति" : "Mercury mount condition"
        ],
        planetaryInfluence: isHindi 
          ? "बुध ग्रह आपके करियर पर प्रमुख प्रभाव डालता है, जो बुद्धि, संचार और व्यापारिक सफलता प्रदान करता है। बृहस्पति का द्वितीयक प्रभाव उच्च पदों और सम्मान की संभावना बढ़ाता है।"
          : "Mercury planet exerts primary influence on your career, providing intelligence, communication skills, and business success. Jupiter's secondary influence increases possibilities of high positions and respect.",
        timeline: isHindi
          ? "25-30: नींव निर्माण | 30-35: पहली बड़ी सफलता | 35-45: शिखर विकास | 45-55: संपत्ति निर्माण | 55+: सलाहकार भूमिका"
          : "25-30: Foundation building | 30-35: First major success | 35-45: Peak growth | 45-55: Wealth building | 55+: Advisory role",
        guidance: isHindi
          ? "करियर सफलता के लिए प्रत्येक बुधवार 'ॐ बुं बुधाय नमः' का 108 बार जाप करें। पन्ना रत्न कनिष्ठा उंगली में धारण करें। महत्वपूर्ण निर्णय बृहस्पतिवार को लें।"
          : "For career success, chant 'Om Bum Budhaya Namah' 108 times every Wednesday. Wear Emerald gemstone on little finger. Take important decisions on Thursday.",
        rating: 8
      },
      love: {
        title: isHindi ? "प्रेम एवं रिश्ते | Love & Relationships" : "Love & Relationships | प्रेम एवं रिश्ते",
        prediction: isHindi
          ? `आपकी हृदय रेखा का गहन विश्लेषण करने पर, आपके भावनात्मक स्वभाव और प्रेम जीवन के बारे में रोचक जानकारियां मिलती हैं।

प्रथमतः, हृदय रेखा की उत्पत्ति और दिशा आपके प्रेम करने के तरीके को दर्शाती है। यदि यह तर्जनी के नीचे से शुरू होती है, तो आप आदर्शवादी प्रेमी हैं। मध्यमा के नीचे से शुरू होने पर आप अधिक व्यावहारिक दृष्टिकोण रखते हैं।

द्वितीयतः, हृदय रेखा की गहराई और स्पष्टता मजबूत भावनात्मक क्षमता का संकेत देती है। आप गहरे प्रेम संबंध बनाने में सक्षम हैं और भावनात्मक रूप से समृद्ध जीवन जी सकते हैं।

तृतीयतः, विवाह रेखाओं का अध्ययन महत्वपूर्ण है। कनिष्ठा उंगली के नीचे स्थित ये छोटी क्षैतिज रेखाएं आपके महत्वपूर्ण संबंधों को दर्शाती हैं। एक गहरी और स्पष्ट रेखा एक महत्वपूर्ण दीर्घकालिक संबंध का संकेत है।

चतुर्थतः, शुक्र पर्वत का विकास आपके प्रेम, जुनून और सौंदर्य बोध को दर्शाता है। एक विकसित शुक्र पर्वत स्नेही, कामुक और सौंदर्य-प्रेमी स्वभाव का संकेत देता है।

पंचमतः, चंद्र पर्वत भावनात्मक गहराई और अंतर्ज्ञान को दर्शाता है। इसका विकास आपको अपने साथी की भावनाओं को समझने में मदद करता है।

विवाह के समय के बारे में, हृदय रेखा और विवाह रेखाओं की स्थिति के आधार पर, 27-32 वर्ष की आयु विवाह के लिए शुभ प्रतीत होती है।

आपके जीवन साथी के गुणों के बारे में, रेखाओं का पैटर्न सुझाव देता है कि आपका साथी बुद्धिमान, सहानुभूतिपूर्ण और आपके लक्ष्यों का समर्थन करने वाला होगा।`
          : `Deep analysis of your Heart line reveals fascinating insights about your emotional nature and love life.

Firstly, the origin and direction of the Heart line depicts your way of loving. If it starts from below the index finger, you are an idealistic lover. Starting from below the middle finger indicates a more practical approach.

Secondly, the depth and clarity of the Heart line indicates strong emotional capacity. You are capable of forming deep loving relationships and can live an emotionally rich life.

Thirdly, the study of Marriage lines is significant. These small horizontal lines below the little finger represent your significant relationships. One deep and clear line indicates one significant long-term relationship.

Fourthly, the development of Venus mount reflects your love, passion, and aesthetic sense. A developed Venus mount indicates an affectionate, sensual, and beauty-loving nature.

Fifthly, the Moon mount represents emotional depth and intuition. Its development helps you understand your partner's feelings.

Regarding marriage timing, based on the position of Heart line and Marriage lines, ages 27-32 appear auspicious for marriage.

About your life partner's qualities, the pattern of lines suggests your partner will be intelligent, empathetic, and supportive of your goals.

Relationship timeline:
- Age 18-23: Early romantic experiences, learning about love
- Age 23-28: Meaningful relationships, potential meeting of life partner
- Age 27-32: Most favorable period for marriage
- Age 32-40: Deep partnership building, family establishment
- Age 40+: Mature love, companionship, emotional stability`,
        observedFeatures: [
          isHindi ? "हृदय रेखा की गहराई और लंबाई" : "Heart line depth and length",
          isHindi ? "विवाह रेखाओं की संख्या और गुणवत्ता" : "Marriage lines number and quality",
          isHindi ? "शुक्र पर्वत का विकास" : "Venus mount development",
          isHindi ? "चंद्र पर्वत की स्थिति" : "Moon mount condition",
          isHindi ? "हृदय रेखा पर विशेष चिह्न" : "Special marks on Heart line"
        ],
        palmFeatures: [
          isHindi ? "हृदय रेखा विशेषताएं" : "Heart line characteristics",
          isHindi ? "विवाह रेखाएं" : "Marriage lines",
          isHindi ? "शुक्र पर्वत" : "Venus mount"
        ],
        planetaryInfluence: isHindi
          ? "शुक्र ग्रह प्रेम और रोमांस पर प्रमुख प्रभाव डालता है। चंद्रमा भावनात्मक गहराई और अंतर्ज्ञान प्रदान करता है। बृहस्पति वैवाहिक सुख और संतान सौभाग्य देता है।"
          : "Venus planet exerts primary influence on love and romance. Moon provides emotional depth and intuition. Jupiter grants marital happiness and blessing of children.",
        timeline: isHindi
          ? "18-23: प्रारंभिक प्रेम अनुभव | 23-28: गंभीर संबंध | 27-32: विवाह शुभ काल | 32-40: परिवार स्थापना | 40+: परिपक्व साथी"
          : "18-23: Early love experiences | 23-28: Serious relationships | 27-32: Marriage auspicious | 32-40: Family building | 40+: Mature companionship",
        guidance: isHindi
          ? "प्रेम सफलता के लिए शुक्रवार को 'ॐ शुं शुक्राय नमः' का 108 बार जाप करें। हीरा या ओपल अनामिका में धारण करें। गुलाबी रंग के वस्त्र शुभ हैं।"
          : "For love success, chant 'Om Shum Shukraya Namah' 108 times on Friday. Wear Diamond or Opal on ring finger. Pink colored clothes are auspicious.",
        rating: 7
      },
      health: {
        title: isHindi ? "स्वास्थ्य एवं शक्ति | Health & Vitality" : "Health & Vitality | स्वास्थ्य एवं शक्ति",
        prediction: isHindi
          ? `आपकी जीवन रेखा का सावधानीपूर्वक अध्ययन करने पर, आपके स्वास्थ्य और जीवन शक्ति के बारे में महत्वपूर्ण जानकारी मिलती है।

महत्वपूर्ण: जीवन रेखा जीवन की लंबाई नहीं बताती! यह आपकी जीवन शक्ति, ऊर्जा स्तर और जीवन में होने वाले परिवर्तनों को दर्शाती है।

प्रथमतः, जीवन रेखा की गहराई और स्पष्टता मजबूत शारीरिक संविधान का संकेत है। एक गहरी जीवन रेखा अच्छी रोग प्रतिरोधक क्षमता और समग्र स्वास्थ्य दर्शाती है।

द्वितीयतः, जीवन रेखा का वक्र (curve) आपकी जीवन शक्ति और साहसिक प्रवृत्ति को दर्शाता है। चौड़ा वक्र उदार ऊर्जा और खुले दृष्टिकोण का संकेत देता है।

तृतीयतः, स्वास्थ्य रेखा की अनुपस्थिति वास्तव में शुभ है! इसका अर्थ है कि आपको गंभीर पाचन या यकृत संबंधी समस्याओं का खतरा कम है।

चतुर्थतः, शुक्र पर्वत का विकास समग्र जीवन शक्ति और स्वास्थ्य को दर्शाता है। एक पूर्ण और विकसित शुक्र पर्वत अच्छे स्वास्थ्य और जीवन के प्रति उत्साह का संकेत है।

पंचमतः, हाथ का रंग और बनावट भी महत्वपूर्ण है। गुलाबी रंग अच्छे रक्त संचार का, और मध्यम बनावट संतुलित स्वास्थ्य का संकेत है।

आयुर्वेदिक दृष्टि से, आपके हाथ की विशेषताएं वात-पित्त प्रकृति की ओर इंगित करती हैं। इसका अर्थ है कि आपको पाचन, त्वचा और तंत्रिका तंत्र पर ध्यान देना चाहिए।

स्वास्थ्य समय रेखा के अनुसार, 35-45 वर्ष की आयु में अधिक सावधानी बरतें। नियमित व्यायाम और संतुलित आहार आवश्यक है।`
          : `Careful study of your Life line reveals important information about your health and vitality.

IMPORTANT: The Life line does NOT indicate lifespan! It represents your life force, energy levels, and changes occurring in life.

Firstly, the depth and clarity of Life line indicates strong physical constitution. A deep Life line shows good immunity and overall health.

Secondly, the curve of Life line represents your vitality and adventurous nature. A wide curve indicates generous energy and open outlook.

Thirdly, the absence of Health line is actually auspicious! It means you have lower risk of serious digestive or liver problems.

Fourthly, the development of Venus mount reflects overall vitality and health. A full and developed Venus mount indicates good health and enthusiasm for life.

Fifthly, the color and texture of the hand is also important. Pink color indicates good blood circulation, and medium texture indicates balanced health.

From Ayurvedic perspective, your hand characteristics point towards Vata-Pitta constitution. This means you should pay attention to digestion, skin, and nervous system.

According to health timeline, be more cautious between ages 35-45. Regular exercise and balanced diet are essential.

Health recommendations:
- Morning routine: Early rising, yoga, meditation
- Diet: Balance of six tastes, avoid extreme temperatures
- Exercise: Moderate, consistent activity
- Sleep: 7-8 hours, before 10 PM
- Mental health: Stress management, social connections`,
        observedFeatures: [
          isHindi ? "जीवन रेखा की गहराई और वक्र" : "Life line depth and curve",
          isHindi ? "स्वास्थ्य रेखा की अनुपस्थिति (शुभ)" : "Absence of Health line (auspicious)",
          isHindi ? "शुक्र पर्वत का विकास" : "Venus mount development",
          isHindi ? "हाथ का रंग और बनावट" : "Hand color and texture",
          isHindi ? "मंगल पर्वत की स्थिति" : "Mars mount condition"
        ],
        palmFeatures: [
          isHindi ? "जीवन रेखा की विशेषताएं" : "Life line characteristics",
          isHindi ? "स्वास्थ्य रेखा" : "Health line presence",
          isHindi ? "शुक्र पर्वत पूर्णता" : "Venus mount fullness"
        ],
        planetaryInfluence: isHindi
          ? "सूर्य ग्रह हृदय स्वास्थ्य को प्रभावित करता है। मंगल ऊर्जा और रक्त को नियंत्रित करता है। शनि हड्डियों और दीर्घकालिक स्वास्थ्य को प्रभावित करता है।"
          : "Sun planet influences heart health. Mars controls energy and blood. Saturn affects bones and long-term health.",
        timeline: isHindi
          ? "20-35: उच्च ऊर्जा काल | 35-45: सावधानी आवश्यक | 45-55: संतुलन काल | 55+: आराम और देखभाल"
          : "20-35: High energy period | 35-45: Caution required | 45-55: Balance period | 55+: Rest and care",
        guidance: isHindi
          ? "स्वास्थ्य के लिए प्रतिदिन सूर्योदय के समय 'ॐ भास्कराय नमः' का जाप करें। माणिक्य रत्न अनामिका में धारण करें। रविवार को उपवास शुभ है।"
          : "For health, chant 'Om Bhaskaraya Namah' daily at sunrise. Wear Ruby on ring finger. Fasting on Sunday is auspicious.",
        rating: 8
      },
      family: {
        title: isHindi ? "परिवार एवं संतान | Family & Children" : "Family & Children | परिवार एवं संतान",
        prediction: isHindi
          ? `परिवार संबंधी विश्लेषण आपके हाथ की विभिन्न रेखाओं और पर्वतों से किया जाता है।

प्रथमतः, जीवन रेखा की उत्पत्ति परिवार के प्रारंभिक प्रभाव को दर्शाती है। यदि यह तर्जनी और अंगूठे के बीच से निकलती है और मस्तिष्क रेखा से जुड़ी है, तो पारिवारिक मूल्य आपके निर्णयों को प्रभावित करते हैं।

द्वितीयतः, बुध पर्वत के नीचे स्थित संतान रेखाएं आपके बच्चों के बारे में संकेत देती हैं। इन रेखाओं की संख्या और गुणवत्ता संतान सौभाग्य को दर्शाती है।

तृतीयतः, चंद्र पर्वत मातृ संबंध और भावनात्मक बंधनों को दर्शाता है। इसका विकास परिवार के प्रति गहरी भावनाओं का संकेत देता है।

चतुर्थतः, बृहस्पति पर्वत पितृ संबंध और वंश के सम्मान को दर्शाता है। एक विकसित बृहस्पति पर्वत पूर्वजों का आशीर्वाद और पारिवारिक सम्मान प्राप्त करने का संकेत है।

पंचमतः, शुक्र पर्वत गृह सुख और पारिवारिक सद्भाव को प्रभावित करता है। इसका विकास स्नेही और सामंजस्यपूर्ण पारिवारिक वातावरण का संकेत है।

संतान के बारे में, रेखाओं का पैटर्न 2-3 संतान की संभावना दर्शाता है। पहली संतान का समय विवाह के 2-4 वर्ष बाद हो सकता है।

संपत्ति और विरासत के बारे में, भाग्य रेखा और सूर्य रेखा का संयोजन पारिवारिक संपत्ति से लाभ और स्वयं की संपत्ति निर्माण की संभावना दर्शाता है।`
          : `Family analysis is done from various lines and mounts of your palm.

Firstly, the origin of Life line depicts early family influence. If it originates between index finger and thumb and is connected to Head line, family values influence your decisions.

Secondly, Children lines located below Mercury mount indicate about your children. The number and quality of these lines show blessing of progeny.

Thirdly, Moon mount represents maternal relationships and emotional bonds. Its development indicates deep feelings towards family.

Fourthly, Jupiter mount represents paternal relationships and family honor. A developed Jupiter mount indicates ancestral blessings and family respect.

Fifthly, Venus mount affects domestic happiness and family harmony. Its development indicates an affectionate and harmonious family environment.

About children, the pattern of lines suggests possibility of 2-3 children. First child timing may be 2-4 years after marriage.

About property and inheritance, the combination of Fate line and Sun line indicates benefit from family property and possibility of building own assets.

Family timeline:
- Early life: Strong parental influence, family values
- 25-35: Marriage and new family establishment
- 30-40: Children and nurturing phase
- 40-50: Family responsibilities, elder care
- 50+: Grandchildren, legacy creation`,
        observedFeatures: [
          isHindi ? "जीवन रेखा की उत्पत्ति" : "Life line origin",
          isHindi ? "संतान रेखाएं" : "Children lines",
          isHindi ? "चंद्र और बृहस्पति पर्वत" : "Moon and Jupiter mounts",
          isHindi ? "शुक्र पर्वत का विकास" : "Venus mount development",
          isHindi ? "पारिवारिक रेखाएं" : "Family influence lines"
        ],
        palmFeatures: [
          isHindi ? "जीवन रेखा उत्पत्ति" : "Life line origin",
          isHindi ? "संतान रेखाएं" : "Children lines",
          isHindi ? "पारिवारिक रेखाएं" : "Family lines"
        ],
        planetaryInfluence: isHindi
          ? "चंद्रमा माता और भावनात्मक बंधन को प्रभावित करता है। सूर्य पिता और पितृ वंश को दर्शाता है। बृहस्पति संतान और पारिवारिक सौभाग्य प्रदान करता है।"
          : "Moon influences mother and emotional bonds. Sun represents father and paternal lineage. Jupiter provides children and family fortune.",
        timeline: isHindi
          ? "बचपन: मजबूत पारिवारिक प्रभाव | 25-35: विवाह | 30-40: संतान | 40-50: जिम्मेदारियां | 50+: विरासत"
          : "Childhood: Strong family influence | 25-35: Marriage | 30-40: Children | 40-50: Responsibilities | 50+: Legacy",
        guidance: isHindi
          ? "पारिवारिक सद्भाव के लिए प्रत्येक गुरुवार 'ॐ गं गणपतये नमः' का जाप करें। पुखराज गुरुवार को पहनें। माता-पिता का आशीर्वाद नियमित लें।"
          : "For family harmony, chant 'Om Gam Ganapataye Namah' every Thursday. Wear Yellow Sapphire on Thursday. Regularly take blessings of parents.",
        rating: 7
      },
      education: {
        title: isHindi ? "शिक्षा एवं ज्ञान | Education & Knowledge" : "Education & Knowledge | शिक्षा एवं ज्ञान",
        prediction: isHindi
          ? `आपकी मस्तिष्क रेखा का गहन विश्लेषण आपकी बौद्धिक क्षमताओं और शिक्षा संबंधी संभावनाओं को उजागर करता है।

प्रथमतः, मस्तिष्क रेखा की लंबाई और दिशा आपकी सोचने की शैली को दर्शाती है। एक लंबी मस्तिष्क रेखा गहन विचारक होने का संकेत है, जबकि चंद्र पर्वत की ओर झुकी रेखा रचनात्मक और कलात्मक प्रवृत्ति दर्शाती है।

द्वितीयतः, मस्तिष्क रेखा की उत्पत्ति आपके निर्णय लेने की शैली को प्रभावित करती है। यदि यह जीवन रेखा से जुड़ी है, तो आप सावधानी से निर्णय लेते हैं। अलग होने पर आप स्वतंत्र और साहसी विचारक हैं।

तृतीयतः, बुध पर्वत का विकास तीव्र बुद्धि, अच्छी स्मृति और संचार कौशल का संकेत देता है। यह तकनीकी और विश्लेषणात्मक क्षेत्रों में सफलता की संभावना बढ़ाता है।

चतुर्थतः, बृहस्पति पर्वत ज्ञान, दर्शन और शिक्षण क्षमता को दर्शाता है। इसका विकास उच्च शिक्षा और गुरु की भूमिका के लिए उपयुक्तता दर्शाता है।

पंचमतः, मस्तिष्क रेखा पर 'लेखक का कांटा' (Writer's Fork) की उपस्थिति तर्क और रचनात्मकता का संतुलन दर्शाती है। यह लेखन, अनुसंधान और बहुमुखी शैक्षिक योग्यताओं का संकेत है।

उपयुक्त शिक्षा क्षेत्रों में वाणिज्य, प्रबंधन, संचार, कला, या तकनीकी क्षेत्र शामिल हैं।

प्रतियोगी परीक्षाओं में सफलता की संभावना मजबूत है, विशेषकर 22-28 वर्ष की आयु में।`
          : `Deep analysis of your Head line reveals your intellectual capabilities and educational prospects.

Firstly, the length and direction of Head line depicts your thinking style. A long Head line indicates being a deep thinker, while a line sloping towards Moon mount shows creative and artistic tendencies.

Secondly, the origin of Head line affects your decision-making style. If connected to Life line, you make cautious decisions. If separate, you are an independent and adventurous thinker.

Thirdly, the development of Mercury mount indicates sharp intelligence, good memory, and communication skills. This increases success potential in technical and analytical fields.

Fourthly, Jupiter mount represents knowledge, philosophy, and teaching ability. Its development indicates suitability for higher education and guru role.

Fifthly, the presence of 'Writer's Fork' on Head line shows balance of logic and creativity. This indicates writing, research, and versatile academic abilities.

Suitable education fields include commerce, management, communication, arts, or technical areas.

Success possibility in competitive exams is strong, especially between ages 22-28.

Education timeline:
- Age 5-12: Foundation building, discovering interests
- Age 12-18: Academic focus, specialization hints
- Age 18-25: Higher education, professional training
- Age 25-40: Career application, continuous learning
- Age 40+: Wisdom, mentoring, knowledge sharing`,
        observedFeatures: [
          isHindi ? "मस्तिष्क रेखा की लंबाई और दिशा" : "Head line length and direction",
          isHindi ? "बुध पर्वत का विकास" : "Mercury mount development",
          isHindi ? "लेखक का कांटा" : "Writer's Fork presence",
          isHindi ? "बृहस्पति पर्वत ज्ञान संकेतक" : "Jupiter mount wisdom indicators",
          isHindi ? "उंगलियों का अनुपात" : "Finger proportions"
        ],
        palmFeatures: [
          isHindi ? "मस्तिष्क रेखा विशेषताएं" : "Head line characteristics",
          isHindi ? "बुद्धि संकेतक" : "Intelligence indicators",
          isHindi ? "ज्ञान पर्वत" : "Wisdom mounts"
        ],
        planetaryInfluence: isHindi
          ? "बुध बुद्धि और स्मृति का कारक है। बृहस्पति ज्ञान और दर्शन प्रदान करता है। शुक्र कला और सौंदर्य बोध देता है। शनि गहन अध्ययन और अनुसंधान क्षमता प्रदान करता है।"
          : "Mercury is significator of intelligence and memory. Jupiter provides wisdom and philosophy. Venus gives art and aesthetic sense. Saturn provides deep study and research ability.",
        timeline: isHindi
          ? "5-12: नींव | 12-18: विशेषज्ञता | 18-25: उच्च शिक्षा | 25-40: कैरियर अनुप्रयोग | 40+: ज्ञान साझाकरण"
          : "5-12: Foundation | 12-18: Specialization | 18-25: Higher education | 25-40: Career application | 40+: Knowledge sharing",
        guidance: isHindi
          ? "शिक्षा सफलता के लिए बुधवार को 'ॐ ऐं सरस्वत्यै नमः' का 108 बार जाप करें। पीले वस्त्र धारण करें। उत्तर-पूर्व दिशा में अध्ययन करें।"
          : "For educational success, chant 'Om Aim Saraswatyai Namah' 108 times on Wednesday. Wear yellow clothes. Study facing North-East direction.",
        rating: 8
      },
      spiritual: {
        title: isHindi ? "आध्यात्मिक विकास | Spiritual Growth" : "Spiritual Growth | आध्यात्मिक विकास",
        prediction: isHindi
          ? `आपके हाथ में आध्यात्मिक संकेतों का विश्लेषण गहन अंतर्दृष्टि प्रदान करता है।

प्रथमतः, रहस्यमय क्रॉस (Mystic Cross) की उपस्थिति हृदय और मस्तिष्क रेखाओं के बीच देखी जाती है। यह अत्यंत शुभ चिह्न है जो अंतर्ज्ञान, आध्यात्मिक झुकाव और रहस्यवादी क्षमताओं का संकेत देता है।

द्वितीयतः, बृहस्पति पर्वत का आध्यात्मिक महत्व अत्यधिक है। इसका विकास धार्मिकता, गुरु के प्रति श्रद्धा और आध्यात्मिक शिक्षाओं को ग्रहण करने की क्षमता दर्शाता है।

तृतीयतः, चंद्र पर्वत अंतर्ज्ञान, मानसिक क्षमताओं और आध्यात्मिक संवेदनशीलता को दर्शाता है। इसका विकास ध्यान और साधना में गहराई की संभावना बढ़ाता है।

चतुर्थतः, शनि पर्वत कर्म, तपस्या और आध्यात्मिक अनुशासन को प्रभावित करता है। इसकी स्थिति पूर्व जन्म के कर्मों और इस जन्म में उनके परिणामों को दर्शाती है।

पंचमतः, विशेष चिह्नों जैसे त्रिशूल, स्वास्तिक, या मत्स्य की उपस्थिति दिव्य आशीर्वाद और आध्यात्मिक उन्नति का संकेत है।

आध्यात्मिक जागृति का समय 35-45 वर्ष की आयु में सबसे प्रबल है। इस काल में गुरु मिलन और गहन साधना की संभावना है।

मोक्ष मार्ग के संबंध में, आपके हाथ में कर्म योग और भक्ति योग का मिश्रण दिखाई देता है। सेवा और भक्ति दोनों मार्ग आपके लिए उपयुक्त हैं।`
          : `Analysis of spiritual indicators in your palm provides deep insights.

Firstly, the presence of Mystic Cross between Heart and Head lines is observed. This is an extremely auspicious sign indicating intuition, spiritual inclination, and mystical abilities.

Secondly, Jupiter mount has immense spiritual significance. Its development shows religiosity, reverence for guru, and ability to receive spiritual teachings.

Thirdly, Moon mount represents intuition, psychic abilities, and spiritual sensitivity. Its development increases potential for depth in meditation and sadhana.

Fourthly, Saturn mount affects karma, austerity, and spiritual discipline. Its condition shows past life karmas and their results in this life.

Fifthly, presence of special marks like Trishul, Swastika, or Matsya indicates divine blessings and spiritual advancement.

Timing of spiritual awakening is strongest between ages 35-45. This period has potential for guru meeting and deep sadhana.

Regarding moksha path, your palm shows a mix of Karma Yoga and Bhakti Yoga. Both service and devotion paths are suitable for you.

Spiritual timeline:
- Childhood: Initial spiritual impressions
- 20-35: Seeking phase, questioning
- 35-45: Awakening period, guru connection
- 45-60: Deep practice, realization
- 60+: Wisdom, teaching, preparation for liberation`,
        observedFeatures: [
          isHindi ? "रहस्यमय क्रॉस" : "Mystic Cross",
          isHindi ? "बृहस्पति पर्वत आध्यात्मिक संकेत" : "Jupiter mount spiritual signs",
          isHindi ? "चंद्र पर्वत अंतर्ज्ञान" : "Moon mount intuition",
          isHindi ? "विशेष दिव्य चिह्न" : "Special divine marks",
          isHindi ? "शनि पर्वत कर्म संकेत" : "Saturn mount karma signs"
        ],
        palmFeatures: [
          isHindi ? "रहस्यमय क्रॉस" : "Mystic Cross",
          isHindi ? "अंतर्ज्ञान रेखा" : "Intuition line",
          isHindi ? "आध्यात्मिक पर्वत" : "Spiritual mounts"
        ],
        planetaryInfluence: isHindi
          ? "केतु मोक्ष और आध्यात्मिक मुक्ति का कारक है। बृहस्पति धर्म और गुरु कृपा प्रदान करता है। शनि कर्म फल और तपस्या का संकेत देता है। चंद्रमा भक्ति और अंतर्ज्ञान बढ़ाता है।"
          : "Ketu is significator of moksha and spiritual liberation. Jupiter provides dharma and guru grace. Saturn indicates karma results and austerity. Moon enhances devotion and intuition.",
        timeline: isHindi
          ? "बचपन: प्रारंभिक संस्कार | 20-35: खोज काल | 35-45: जागृति | 45-60: गहन साधना | 60+: ज्ञान और मुक्ति"
          : "Childhood: Initial impressions | 20-35: Seeking | 35-45: Awakening | 45-60: Deep practice | 60+: Wisdom and liberation",
        guidance: isHindi
          ? "आध्यात्मिक उन्नति के लिए प्रतिदिन ब्रह्म मुहूर्त में 'ॐ नमः शिवाय' या अपने इष्ट मंत्र का जाप करें। रुद्राक्ष धारण करें। गुरुवार को गुरु पूजन करें।"
          : "For spiritual advancement, chant 'Om Namah Shivaya' or your ishta mantra daily during Brahma Muhurta. Wear Rudraksha. Perform Guru worship on Thursday.",
        rating: 9
      },
      travel: {
        title: isHindi ? "यात्रा एवं भाग्य | Travel & Fortune" : "Travel & Fortune | यात्रा एवं भाग्य",
        prediction: isHindi
          ? `यात्रा और भाग्य संबंधी विश्लेषण चंद्र पर्वत और भाग्य रेखा से किया जाता है।

प्रथमतः, चंद्र पर्वत पर यात्रा रेखाओं की उपस्थिति विदेश यात्रा और दूर देशों के संबंध को दर्शाती है। अधिक और स्पष्ट रेखाएं अधिक यात्रा की संभावना दर्शाती हैं।

द्वितीयतः, भाग्य रेखा की उत्पत्ति यदि चंद्र पर्वत से है, तो करियर में विदेशी संबंध और जनता से जुड़े कार्य में सफलता की संभावना है।

तृतीयतः, राहु का प्रभाव विदेश यात्रा और अप्रत्याशित भाग्य को नियंत्रित करता है। हाथ में राहु संकेतक विदेश में बसने या कार्य करने की संभावना बढ़ाते हैं।

चतुर्थतः, समग्र भाग्य पैटर्न सूर्य रेखा, भाग्य रेखा और विशेष चिह्नों के संयोजन से देखा जाता है। मजबूत संयोजन अचानक भाग्योदय की संभावना दर्शाता है।

पंचमतः, यात्रा सुरक्षा के संकेत जीवन रेखा के समानांतर मंगल रेखा (Sister line) से देखे जाते हैं। इसकी उपस्थिति यात्रा में सुरक्षा का संकेत है।

विदेश यात्रा का शुभ समय 28-40 वर्ष की आयु में है। इस काल में व्यावसायिक या शैक्षिक उद्देश्यों से विदेश जाने की संभावना है।

तीर्थ यात्रा के बारे में, बृहस्पति और चंद्र पर्वत का संयोजन पवित्र स्थलों की यात्रा और आध्यात्मिक तीर्थयात्रा की संभावना दर्शाता है।`
          : `Travel and fortune analysis is done from Moon mount and Fate line.

Firstly, presence of travel lines on Moon mount indicates foreign travel and connections with distant lands. More and clearer lines show more travel possibilities.

Secondly, if Fate line originates from Moon mount, there is possibility of foreign connections in career and success in public-facing work.

Thirdly, Rahu's influence controls foreign travel and unexpected fortune. Rahu indicators in palm increase possibility of settling or working abroad.

Fourthly, overall fortune pattern is seen from combination of Sun line, Fate line, and special marks. Strong combination indicates possibility of sudden rise in fortune.

Fifthly, travel safety signs are seen from Mars line (Sister line) parallel to Life line. Its presence indicates protection during travel.

Auspicious time for foreign travel is between ages 28-40. There is possibility of going abroad for professional or educational purposes during this period.

About pilgrimage, combination of Jupiter and Moon mount indicates possibility of visiting sacred places and spiritual pilgrimage.

Travel timeline:
- Age 18-25: First major journeys, educational travel
- Age 25-35: Career-related travel, foreign opportunities
- Age 35-50: Peak travel years, international connections
- Age 50+: Pilgrimage, leisure travel, spiritual journeys`,
        observedFeatures: [
          isHindi ? "चंद्र पर्वत पर यात्रा रेखाएं" : "Travel lines on Moon mount",
          isHindi ? "भाग्य रेखा की उत्पत्ति" : "Fate line origin",
          isHindi ? "राहु संकेतक" : "Rahu indicators",
          isHindi ? "सुरक्षा चिह्न" : "Protection marks",
          isHindi ? "तीर्थ यात्रा संकेत" : "Pilgrimage signs"
        ],
        palmFeatures: [
          isHindi ? "यात्रा रेखाएं" : "Travel lines",
          isHindi ? "राहु प्रभाव" : "Rahu influence",
          isHindi ? "भाग्य संकेतक" : "Fortune indicators"
        ],
        planetaryInfluence: isHindi
          ? "राहु विदेश यात्रा और अप्रत्याशित घटनाओं को नियंत्रित करता है। चंद्रमा यात्रा की इच्छा और जल मार्ग से यात्रा को प्रभावित करता है। बृहस्पति भाग्य और तीर्थ यात्रा प्रदान करता है।"
          : "Rahu controls foreign travel and unexpected events. Moon influences desire to travel and water travel. Jupiter provides fortune and pilgrimage.",
        timeline: isHindi
          ? "18-25: पहली बड़ी यात्रा | 25-35: करियर यात्रा | 35-50: शिखर यात्रा काल | 50+: तीर्थ यात्रा"
          : "18-25: First major travel | 25-35: Career travel | 35-50: Peak travel | 50+: Pilgrimage",
        guidance: isHindi
          ? "यात्रा सुरक्षा के लिए 'ॐ राहवे नमः' का जाप करें। गोमेद रत्न मध्यमा में धारण करें। यात्रा शुरू करने से पहले गणेश पूजन करें। उत्तर-पश्चिम दिशा शुभ है।"
          : "For travel safety, chant 'Om Rahave Namah'. Wear Hessonite on middle finger. Perform Ganesh puja before starting journey. North-West direction is auspicious.",
        rating: 7
      }
    },
    lineAnalysis: {
      heartLine: {
        observed: isHindi 
          ? "हृदय रेखा स्पष्ट और मध्यम गहराई की है, तर्जनी और मध्यमा के बीच से उत्पन्न होती है"
          : "Heart line is clear and of medium depth, originating between index and middle fingers",
        position: { startX: 85, startY: 25, endX: 15, endY: 28, curveIntensity: "moderate" },
        type: isHindi ? "मध्यम गहरी, स्थिर वक्र" : "Medium deep, steady curve",
        meaning: isHindi 
          ? "संतुलित भावनात्मक प्रकृति, व्यावहारिक और भावुक प्रेम का मिश्रण"
          : "Balanced emotional nature, mix of practical and emotional love",
        loveStyle: isHindi ? "स्थिर, समर्पित, संतुलित" : "Steady, devoted, balanced"
      },
      headLine: {
        observed: isHindi
          ? "मस्तिष्क रेखा मध्यम लंबाई की, हल्का ढलान के साथ"
          : "Head line of medium length with slight slope",
        position: { startX: 15, startY: 35, endX: 75, endY: 45, curveIntensity: "slight" },
        type: isHindi ? "मध्यम, हल्का वक्र" : "Medium, slight curve",
        meaning: isHindi
          ? "तर्कसंगत सोच के साथ रचनात्मक झुकाव"
          : "Logical thinking with creative inclination",
        thinkingStyle: isHindi ? "विश्लेषणात्मक-रचनात्मक मिश्रण" : "Analytical-creative blend"
      },
      lifeLine: {
        observed: isHindi
          ? "जीवन रेखा अच्छी गहराई के साथ चौड़े वक्र में"
          : "Life line with good depth in wide curve",
        position: { startX: 22, startY: 28, endX: 25, endY: 85, curveIntensity: "wide" },
        type: isHindi ? "गहरी, चौड़ा वक्र" : "Deep, wide curve",
        meaning: isHindi
          ? "मजबूत जीवन शक्ति, उदार ऊर्जा, साहसिक प्रवृत्ति"
          : "Strong vitality, generous energy, adventurous nature",
        vitality: isHindi ? "मजबूत संविधान" : "Strong constitution"
      },
      fateLine: {
        observed: isHindi
          ? "भाग्य रेखा स्पष्ट, कलाई से शनि पर्वत की ओर"
          : "Fate line clear, from wrist towards Saturn mount",
        position: { startX: 48, startY: 85, endX: 42, endY: 22, curveIntensity: "straight" },
        type: isHindi ? "स्पष्ट, सीधी" : "Clear, straight",
        meaning: isHindi
          ? "स्थिर करियर पथ, स्व-निर्मित सफलता"
          : "Stable career path, self-made success",
        destinyPath: isHindi ? "स्व-निर्मित सफलता" : "Self-made success"
      },
      sunLine: {
        observed: isHindi
          ? "सूर्य रेखा के हल्के संकेत, मध्य आयु के बाद स्पष्ट"
          : "Faint indications of Sun line, clearer after middle age",
        position: { startX: 58, startY: 55, endX: 52, endY: 22, curveIntensity: "straight" },
        type: isHindi ? "हल्की, विकासशील" : "Faint, developing",
        meaning: isHindi
          ? "मध्य आयु के बाद पहचान और सफलता"
          : "Recognition and success after middle age",
        successPath: isHindi ? "धीरे-धीरे बढ़ती पहचान" : "Gradually increasing recognition"
      }
    },
    mountAnalysis: {
      jupiter: { 
        strength: "moderate", 
        observed: isHindi ? "मध्यम विकसित, स्पष्ट सीमा" : "Moderately developed, clear boundaries",
        meaning: isHindi ? "नेतृत्व क्षमता, महत्वाकांक्षा, शिक्षण योग्यता" : "Leadership ability, ambition, teaching talent"
      },
      saturn: { 
        strength: "moderate", 
        observed: isHindi ? "मध्यम, संतुलित" : "Medium, balanced",
        meaning: isHindi ? "जिम्मेदारी, अनुशासन, धैर्य" : "Responsibility, discipline, patience"
      },
      apollo: { 
        strength: "moderate", 
        observed: isHindi ? "मध्यम विकसित" : "Moderately developed",
        meaning: isHindi ? "रचनात्मकता, सौंदर्य बोध, सफलता की इच्छा" : "Creativity, aesthetic sense, desire for success"
      },
      mercury: { 
        strength: "strong", 
        observed: isHindi ? "अच्छी तरह विकसित" : "Well developed",
        meaning: isHindi ? "संचार कौशल, व्यावसायिक बुद्धि, तीव्र बुद्धि" : "Communication skills, business acumen, sharp intellect"
      },
      venus: { 
        strength: "moderate", 
        observed: isHindi ? "मध्यम पूर्णता" : "Medium fullness",
        meaning: isHindi ? "प्रेम क्षमता, जीवन शक्ति, सौंदर्य प्रेम" : "Love capacity, vitality, love of beauty"
      },
      mars: { 
        strength: "moderate", 
        observed: isHindi ? "संतुलित विकास" : "Balanced development",
        meaning: isHindi ? "साहस, ऊर्जा, दृढ़ता" : "Courage, energy, determination"
      },
      moon: { 
        strength: "moderate", 
        observed: isHindi ? "मध्यम विकसित" : "Moderately developed",
        meaning: isHindi ? "कल्पना, अंतर्ज्ञान, यात्रा प्रेम" : "Imagination, intuition, love of travel"
      }
    },
    specialMarks: [
      isHindi ? "बृहस्पति पर्वत पर त्रिकोण - कूटनीतिक सफलता" : "Triangle on Jupiter mount - diplomatic success",
      isHindi ? "हृदय और मस्तिष्क रेखाओं के बीच क्रॉस - आध्यात्मिक झुकाव" : "Cross between Heart and Head lines - spiritual inclination"
    ],
    luckyElements: {
      colors: [isHindi ? "हरा" : "Green", isHindi ? "पीला" : "Yellow", isHindi ? "सफेद" : "White"],
      gemstones: [
        isHindi ? "पन्ना - 5 रत्ती, कनिष्ठा उंगली, बुधवार" : "Emerald - 5 carat, little finger, Wednesday",
        isHindi ? "पुखराज - वैकल्पिक" : "Yellow Sapphire - alternative"
      ],
      mantras: [
        "ॐ बुं बुधाय नमः - Om Bum Budhaya Namah",
        "ॐ गं गणपतये नमः - Om Gam Ganapataye Namah"
      ],
      days: [isHindi ? "बुधवार" : "Wednesday", isHindi ? "गुरुवार" : "Thursday"],
      numbers: [5, 14, 23, 32],
      metals: [isHindi ? "सोना" : "Gold", isHindi ? "पीतल" : "Brass"],
      directions: [isHindi ? "उत्तर" : "North", isHindi ? "उत्तर-पूर्व" : "North-East"]
    },
    remedies: [
      isHindi 
        ? "प्रत्येक बुधवार को हरे वस्त्र पहनें और 'ॐ बुं बुधाय नमः' का 108 बार जाप करें"
        : "Wear green clothes every Wednesday and chant 'Om Bum Budhaya Namah' 108 times",
      isHindi
        ? "गुरुवार को पीले रंग के मीठे का दान करें"
        : "Donate yellow colored sweets on Thursday",
      isHindi
        ? "प्रतिदिन सूर्योदय के समय जल अर्पण करें"
        : "Offer water to Sun daily at sunrise"
    ],
    warnings: [
      isHindi
        ? "35-45 वर्ष की आयु में स्वास्थ्य पर विशेष ध्यान दें। नियमित व्यायाम और संतुलित आहार आवश्यक है।"
        : "Pay special attention to health between ages 35-45. Regular exercise and balanced diet are essential."
    ],
    yogas: [
      isHindi 
        ? "बुध-बृहस्पति योग: बुद्धि और ज्ञान का शुभ संयोजन"
        : "Mercury-Jupiter Yoga: Auspicious combination of intelligence and wisdom"
    ],
    confidenceScore: 85,
    accuracyNotes: isHindi
      ? "विश्लेषण सामान्य वैदिक हस्तरेखा सिद्धांतों पर आधारित है। व्यक्तिगत मार्गदर्शन के लिए अनुभवी ज्योतिषी से परामर्श लें।"
      : "Analysis is based on general Vedic palmistry principles. Consult an experienced astrologer for personalized guidance.",
    blessings: isHindi
      ? "प्रिय साधक, आपके हाथ में अद्भुत संभावनाओं के संकेत हैं। दैवीय कृपा आप पर सदैव बनी रहे। आपका मार्ग प्रकाशमय हो और आप अपने जीवन में सभी लक्ष्यों को प्राप्त करें। गुरु जी का आशीर्वाद सदैव आपके साथ है। 🙏 ॐ शांति शांति शांति।"
      : "Dear seeker, your palm shows signs of wonderful possibilities. May divine grace always be upon you. May your path be illuminated and may you achieve all goals in your life. Guru Ji's blessings are always with you. 🙏 Om Shanti Shanti Shanti."
  };
}
