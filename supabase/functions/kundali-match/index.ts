import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PartnerInfo {
  name: string;
  dob: string;
  timeOfBirth?: string;
  rashi: string;
  rashiHindi: string;
}

interface GunMilanResult {
  varna: { points: number; max: 1; description: string };
  vashya: { points: number; max: 2; description: string };
  tara: { points: number; max: 3; description: string };
  yoni: { points: number; max: 4; description: string };
  maitri: { points: number; max: 5; description: string };
  gana: { points: number; max: 6; description: string };
  bhakoot: { points: number; max: 7; description: string };
  nadi: { points: number; max: 8; description: string };
  total: number;
  maxTotal: 36;
  percentage: number;
  verdict: string;
  recommendation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { partner1, partner2 } = await req.json() as { partner1: PartnerInfo; partner2: PartnerInfo };
    
    if (!partner1 || !partner2) {
      return new Response(JSON.stringify({ error: 'Both partner details required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate Gun Milan scores using Vedic methodology
    const gunMilan = calculateGunMilan(partner1, partner2);
    
    // Get AI analysis
    let analysis = '';
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (openAIKey) {
      try {
        const systemPrompt = `You are "Jyotish AI Pandit", an expert in Vedic marriage compatibility.
Provide a brief, warm analysis (max 150 words) based on Gun Milan results.
Use Hinglish (Hindi-English mix). Be positive but honest about compatibility.
Include one specific remedy if needed.`;

        const userPrompt = `Analyze this Kundali Match:
Groom: ${partner1.name} (${partner1.rashiHindi} - ${partner1.rashi})
Bride: ${partner2.name} (${partner2.rashiHindi} - ${partner2.rashi})

Gun Milan Score: ${gunMilan.total}/36 (${gunMilan.percentage}%)

Key Factors:
- Varna: ${gunMilan.varna.points}/1
- Vashya: ${gunMilan.vashya.points}/2
- Tara: ${gunMilan.tara.points}/3
- Yoni: ${gunMilan.yoni.points}/4
- Maitri: ${gunMilan.maitri.points}/5
- Gana: ${gunMilan.gana.points}/6
- Bhakoot: ${gunMilan.bhakoot.points}/7
- Nadi: ${gunMilan.nadi.points}/8

Provide personalized compatibility analysis and blessing.`;

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
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          analysis = aiData.choices[0].message.content;
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
      }
    }

    // Fallback analysis if AI fails
    if (!analysis) {
      analysis = generateFallbackAnalysis(partner1, partner2, gunMilan);
    }

    return new Response(JSON.stringify({ 
      gunMilan,
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in kundali-match:', error);
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateGunMilan(partner1: PartnerInfo, partner2: PartnerInfo): GunMilanResult {
  // Rashi-based calculations (simplified for demo)
  const rashis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const rashi1Index = rashis.indexOf(partner1.rashi);
  const rashi2Index = rashis.indexOf(partner2.rashi);
  
  // Varna (Caste) - Based on rashi classification
  const varnaGroups = [[0,4,8], [1,5,9], [2,6,10], [3,7,11]]; // Kshatriya, Vaishya, Shudra, Brahmin
  const varna1 = varnaGroups.findIndex(g => g.includes(rashi1Index));
  const varna2 = varnaGroups.findIndex(g => g.includes(rashi2Index));
  const varnaPoints = varna1 >= varna2 ? 1 : 0;
  
  // Vashya (Dominance) - Compatibility based on rashi types
  const vashyaCompatible = Math.abs(rashi1Index - rashi2Index) <= 4;
  const vashyaPoints = vashyaCompatible ? 2 : Math.random() > 0.5 ? 1 : 0;
  
  // Tara (Birth Star) - Based on position difference
  const taraDiff = Math.abs(rashi1Index - rashi2Index);
  const taraPoints = taraDiff <= 3 ? 3 : taraDiff <= 6 ? 2 : taraDiff <= 9 ? 1 : 0;
  
  // Yoni (Animal) - Sexual compatibility
  const yoniPairs = [0,1,2,3,4,5,6,7,8,9,10,11];
  const yoniMatch = (rashi1Index + rashi2Index) % 4;
  const yoniPoints = yoniMatch === 0 ? 4 : yoniMatch === 1 ? 3 : yoniMatch === 2 ? 2 : 1;
  
  // Maitri (Friendship) - Planetary friendship
  const friendlyRashis = [[0,4,8], [1,5,9], [2,6,10], [3,7,11]];
  const inSameGroup = friendlyRashis.some(g => g.includes(rashi1Index) && g.includes(rashi2Index));
  const maitriPoints = inSameGroup ? 5 : Math.floor(Math.random() * 4) + 1;
  
  // Gana (Temperament) - Deva, Manushya, Rakshasa
  const ganaGroups = [[0,4,8], [1,2,5,6,9,10], [3,7,11]]; // Deva, Manushya, Rakshasa
  const gana1 = ganaGroups.findIndex(g => g.includes(rashi1Index));
  const gana2 = ganaGroups.findIndex(g => g.includes(rashi2Index));
  const ganaPoints = gana1 === gana2 ? 6 : Math.abs(gana1 - gana2) === 1 ? 3 : 0;
  
  // Bhakoot (Moon Sign) - 7 points max
  const bhakootBad = [1, 5, 6, 8, 11]; // Bad combinations
  const diff = Math.abs(rashi1Index - rashi2Index);
  const bhakootPoints = bhakootBad.includes(diff) ? Math.floor(Math.random() * 3) : 7;
  
  // Nadi (Health/Genetics) - 8 points max
  const nadiGroups = [[0,3,6,9], [1,4,7,10], [2,5,8,11]]; // Adi, Madhya, Antya
  const nadi1 = nadiGroups.findIndex(g => g.includes(rashi1Index));
  const nadi2 = nadiGroups.findIndex(g => g.includes(rashi2Index));
  const nadiPoints = nadi1 !== nadi2 ? 8 : 0; // Same Nadi = Dosha
  
  const total = varnaPoints + vashyaPoints + taraPoints + yoniPoints + 
                maitriPoints + ganaPoints + bhakootPoints + nadiPoints;
  const percentage = Math.round((total / 36) * 100);
  
  let verdict = "";
  let recommendation = "";
  
  if (percentage >= 75) {
    verdict = "उत्तम मिलान - Excellent Match";
    recommendation = "यह जोड़ी ब्रह्मांडीय आशीर्वाद से युक्त है। विवाह शुभ रहेगा।";
  } else if (percentage >= 60) {
    verdict = "अच्छा मिलान - Good Match";
    recommendation = "अच्छा मिलान है। कुछ उपाय करने से सम्बंध और मजबूत होगा।";
  } else if (percentage >= 50) {
    verdict = "सामान्य मिलान - Average Match";
    recommendation = "विवाह संभव है लेकिन विशेष उपाय आवश्यक हैं। पंडित से परामर्श लें।";
  } else {
    verdict = "चुनौतीपूर्ण मिलान - Challenging Match";
    recommendation = "विवाह से पहले विस्तृत कुंडली विश्लेषण और उपाय जरूरी हैं।";
  }
  
  return {
    varna: { points: varnaPoints, max: 1, description: "आध्यात्मिक अनुकूलता और अहंकार सामंजस्य" },
    vashya: { points: vashyaPoints, max: 2, description: "पारस्परिक आकर्षण और नियंत्रण" },
    tara: { points: taraPoints, max: 3, description: "जन्म नक्षत्र अनुकूलता और स्वास्थ्य" },
    yoni: { points: yoniPoints, max: 4, description: "शारीरिक और यौन अनुकूलता" },
    maitri: { points: maitriPoints, max: 5, description: "मानसिक अनुकूलता और मित्रता" },
    gana: { points: ganaPoints, max: 6, description: "स्वभाव मिलान (देव/मनुष्य/राक्षस)" },
    bhakoot: { points: bhakootPoints, max: 7, description: "चंद्र राशि अनुकूलता और समृद्धि" },
    nadi: { points: nadiPoints, max: 8, description: "स्वास्थ्य और आनुवंशिक अनुकूलता" },
    total,
    maxTotal: 36,
    percentage,
    verdict,
    recommendation
  };
}

function generateFallbackAnalysis(partner1: PartnerInfo, partner2: PartnerInfo, gunMilan: GunMilanResult): string {
  if (gunMilan.percentage >= 75) {
    return `🙏 शुभ समाचार! ${partner1.name} और ${partner2.name} का मिलान ${gunMilan.total}/36 गुणों पर उत्तम है। 
    
${partner1.rashiHindi} और ${partner2.rashiHindi} राशियों का संयोग शुभ है। यह जोड़ी ब्रह्मांडीय आशीर्वाद से युक्त है।

✨ आशीर्वाद: विवाह सुखद और समृद्ध होगा। परस्पर प्रेम और सम्मान से जीवन आनंदमय रहेगा।`;
  } else if (gunMilan.percentage >= 60) {
    return `🙏 ${partner1.name} और ${partner2.name} का मिलान ${gunMilan.total}/36 गुणों पर अच्छा है।

${partner1.rashiHindi} और ${partner2.rashiHindi} राशियों में कुछ चुनौतियां हो सकती हैं, लेकिन प्रेम और समझदारी से सब ठीक होगा।

💡 उपाय: विवाह से पहले गणेश जी की पूजा करें और "ॐ गं गणपतये नमः" मंत्र का जाप करें।`;
  } else {
    return `🙏 ${partner1.name} और ${partner2.name} का मिलान ${gunMilan.total}/36 गुणों पर है।

${partner1.rashiHindi} और ${partner2.rashiHindi} राशियों में कुछ दोष हैं जिनके लिए विशेष उपाय आवश्यक हैं।

⚠️ सलाह: किसी अनुभवी पंडित से विस्तृत कुंडली मिलान करवाएं और उचित उपाय लें।

🙏 मंत्र: "ॐ नमः शिवाय" का नियमित जाप करें।`;
  }
}
