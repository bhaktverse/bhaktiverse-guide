import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PartnerInfo {
  name: string;
  dob: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
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
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const VALID_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    for (const p of [partner1, partner2]) {
      if (typeof p.rashi !== 'string' || !VALID_SIGNS.includes(p.rashi) || typeof p.name !== 'string' || p.name.trim().length === 0 || p.name.length > 100) {
        return new Response(JSON.stringify({ error: 'Each partner needs a valid name and rashi' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Rate limit check
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user } } = await authClient.auth.getUser();
      
      if (user) {
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: usageCheck } = await serviceClient.rpc('check_and_increment_api_usage', {
          _user_id: user.id,
          _function_name: 'kundali-match',
          _daily_limit: 20
        });
        if (!usageCheck || !usageCheck.allowed) {
          return new Response(JSON.stringify({ 
            error: `Daily limit reached (${usageCheck?.daily_limit ?? 20} calls/day). Please try again tomorrow or upgrade to Premium.`,
            rate_limited: true
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    const gunMilan = calculateGunMilan(partner1, partner2);
    
    let analysis = '';
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (LOVABLE_API_KEY) {
      try {
        const systemPrompt = `You are "Jyotish AI Pandit", an expert in Vedic marriage compatibility.
Provide a brief, warm analysis (max 150 words) based on Gun Milan results.
Use Hinglish (Hindi-English mix). Be positive but honest about compatibility.
Include one specific remedy if needed.`;

        const userPrompt = `Analyze this Kundali Match:
Groom: ${partner1.name} (${partner1.rashiHindi} - ${partner1.rashi})${partner1.placeOfBirth ? `, Born in ${partner1.placeOfBirth}` : ''}${partner1.timeOfBirth ? `, Time: ${partner1.timeOfBirth}` : ''}
Bride: ${partner2.name} (${partner2.rashiHindi} - ${partner2.rashi})${partner2.placeOfBirth ? `, Born in ${partner2.placeOfBirth}` : ''}${partner2.timeOfBirth ? `, Time: ${partner2.timeOfBirth}` : ''}

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

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
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

    if (!analysis) {
      analysis = generateFallbackAnalysis(partner1, partner2, gunMilan);
    }

    return new Response(JSON.stringify({ gunMilan, analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in kundali-match:', error);
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateGunMilan(partner1: PartnerInfo, partner2: PartnerInfo): GunMilanResult {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const g = Math.max(0, SIGNS.indexOf(partner1.rashi));
  const b = Math.max(0, SIGNS.indexOf(partner2.rashi));

  const VARNA: Record<number, number> = { 3:0,7:0,11:0, 0:1,4:1,8:1, 1:2,5:2,9:2, 2:3,6:3,10:3 };
  const VASHYA: Record<number, string> = {0:"c",1:"c",2:"m",3:"j",4:"v",5:"m",6:"m",7:"k",8:"m",9:"j",10:"m",11:"j"};
  const YONI: Record<number, string> = {0:"mesh",1:"sarp",2:"marjar",3:"sarp",4:"mooshak",5:"mahisha",6:"vyaghra",7:"mrig",8:"ashwa",9:"nakul",10:"simha",11:"gau"};
  const YONI_FRIENDS: Record<string,string[]> = { mesh:["gau"], sarp:["mooshak"], marjar:["mooshak"], mooshak:["marjar","sarp"], mahisha:["ashwa"], vyaghra:["mrig"], mrig:["vyaghra"], ashwa:["mahisha"], nakul:["sarp"], simha:["gau"], gau:["mesh","simha"] };
  const GANA: Record<number, string> = {0:"m",1:"m",2:"d",3:"d",4:"r",5:"m",6:"r",7:"r",8:"d",9:"m",10:"d",11:"r"};
  const NADI: Record<number, string> = {0:"a",1:"m",2:"y",3:"a",4:"m",5:"y",6:"a",7:"m",8:"y",9:"a",10:"m",11:"y"};
  const LORDS: Record<number, string> = {0:"mars",1:"venus",2:"mercury",3:"moon",4:"sun",5:"mercury",6:"venus",7:"mars",8:"jupiter",9:"saturn",10:"saturn",11:"jupiter"};
  const MAITRI: Record<string, Record<string, number>> = {
    sun:{sun:5,moon:5,mars:5,mercury:3,jupiter:5,venus:1,saturn:1},
    moon:{sun:5,moon:5,mars:3,mercury:5,jupiter:3,venus:3,saturn:3},
    mars:{sun:5,moon:3,mars:5,mercury:1,jupiter:5,venus:3,saturn:3},
    mercury:{sun:3,moon:5,mars:1,mercury:5,jupiter:3,venus:5,saturn:3},
    jupiter:{sun:5,moon:3,mars:5,mercury:1,jupiter:5,venus:1,saturn:3},
    venus:{sun:1,moon:3,mars:3,mercury:5,jupiter:1,venus:5,saturn:5},
    saturn:{sun:1,moon:3,mars:3,mercury:3,jupiter:3,venus:5,saturn:5},
  };

  const varnaPoints = VARNA[g] <= VARNA[b] ? 1 : 0;
  const vashyaPoints = VASHYA[g] === VASHYA[b] ? 2 : 1;
  const taraDiff = (((b - g) % 9) + 9) % 9;
  const taraTable = [3,1,3,1,0,3,1,3,1];
  const taraPoints = taraTable[taraDiff];
  const y1 = YONI[g], y2 = YONI[b];
  const yoniPoints = y1 === y2 ? 4 : (YONI_FRIENDS[y1] || []).includes(y2) ? 3 : 2;
  const maitriPoints = MAITRI[LORDS[g]]?.[LORDS[b]] ?? 3;
  const ganaPoints = GANA[g] === GANA[b] ? 6 : (GANA[g] === "r" || GANA[b] === "r") ? 0 : 5;
  const dist = Math.abs(g - b);
  const bhakootPoints = [1,4,5,7,8,11].includes(dist) ? 0 : 7;
  const nadiPoints = NADI[g] === NADI[b] ? 0 : 8;

  const total = varnaPoints + vashyaPoints + taraPoints + yoniPoints + maitriPoints + ganaPoints + bhakootPoints + nadiPoints;
  const percentage = Math.round((total / 36) * 100);

  const doshas: string[] = [];
  if (nadiPoints === 0) doshas.push("Nadi Dosha");
  if (bhakootPoints === 0) doshas.push("Bhakoot Dosha");
  if (ganaPoints === 0) doshas.push("Gana Dosha");

  let verdict = "", recommendation = "";
  if (percentage >= 75) {
    verdict = "उत्तम मिलान - Excellent Match";
    recommendation = "यह जोड़ी ब्रह्मांडीय आशीर्वाद से युक्त है। विवाह शुभ रहेगा।";
  } else if (percentage >= 60) {
    verdict = "अच्छा मिलान - Good Match";
    recommendation = "अच्छा मिलान है। गणेश पूजन व नवग्रह शांति से सम्बंध और मजबूत होगा।";
  } else if (percentage >= 50) {
    verdict = "सामान्य मिलान - Average Match";
    recommendation = "विवाह संभव है लेकिन विशेष उपाय आवश्यक हैं। पंडित से परामर्श लें।";
  } else {
    verdict = "चुनौतीपूर्ण मिलान - Challenging Match";
    recommendation = "विवाह से पहले विस्तृत कुंडली विश्लेषण और उपाय जरूरी हैं।";
  }
  if (doshas.length) recommendation += ` दोष: ${doshas.join(", ")}.`;

  return {
    varna: { points: varnaPoints, max: 1, description: "आध्यात्मिक अनुकूलता और अहंकार सामंजस्य" },
    vashya: { points: vashyaPoints, max: 2, description: "पारस्परिक आकर्षण और नियंत्रण" },
    tara: { points: taraPoints, max: 3, description: "जन्म नक्षत्र अनुकूलता और स्वास्थ्य" },
    yoni: { points: yoniPoints, max: 4, description: "शारीरिक और यौन अनुकूलता" },
    maitri: { points: maitriPoints, max: 5, description: "मानसिक अनुकूलता और मित्रता" },
    gana: { points: ganaPoints, max: 6, description: "स्वभाव मिलान (देव/मनुष्य/राक्षस)" },
    bhakoot: { points: bhakootPoints, max: 7, description: "चंद्र राशि अनुकूलता और समृद्धि" },
    nadi: { points: nadiPoints, max: 8, description: "स्वास्थ्य और आनुवंशिक अनुकूलता" },
    total, maxTotal: 36, percentage, verdict, recommendation,
  };
}

function generateFallbackAnalysis(partner1: PartnerInfo, partner2: PartnerInfo, gunMilan: GunMilanResult): string {
  if (gunMilan.percentage >= 75) {
    return `🙏 शुभ समाचार! ${partner1.name} और ${partner2.name} का मिलान ${gunMilan.total}/36 गुणों पर उत्तम है। 
    
${partner1.rashiHindi} और ${partner2.rashiHindi} राशियों का संयोग शुभ है। यह जोड़ी ब्रह्मांडीय आशीर्वाद से युक्त है।

✨ आशीर्वाद: विवाह सुखद और समृद्ध होगा।`;
  } else if (gunMilan.percentage >= 60) {
    return `🙏 ${partner1.name} और ${partner2.name} का मिलान ${gunMilan.total}/36 गुणों पर अच्छा है।

💡 उपाय: विवाह से पहले गणेश जी की पूजा करें और "ॐ गं गणपतये नमः" मंत्र का जाप करें।`;
  } else {
    return `🙏 ${partner1.name} और ${partner2.name} का मिलान ${gunMilan.total}/36 गुणों पर है।

⚠️ सलाह: किसी अनुभवी पंडित से विस्तृत कुंडली मिलान करवाएं।

🙏 मंत्र: "ॐ नमः शिवाय" का नियमित जाप करें।`;
  }
}
