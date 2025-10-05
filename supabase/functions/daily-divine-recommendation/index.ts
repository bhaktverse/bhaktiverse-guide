import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get current day of week (0 = Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Get today's devotion
    const { data: devotion, error } = await supabaseClient
      .from('daily_devotions')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .single();

    if (error) {
      throw error;
    }

    // Get associated mantra from mantras_library
    const { data: mantra } = await supabaseClient
      .from('mantras_library')
      .select('*')
      .eq('planet', devotion.planet)
      .single();

    // Get user's numerology report if available
    const { data: { user } } = await supabaseClient.auth.getUser();
    let personalizedMessage = null;

    if (user) {
      const { data: report } = await supabaseClient
        .from('numerology_reports')
        .select('destiny_number, lucky_color, lucky_day')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (report) {
        personalizedMessage = generatePersonalizedMessage(devotion, report, dayOfWeek);
      }
    }

    return new Response(JSON.stringify({
      devotion,
      mantra,
      personalizedMessage,
      panchang: generatePanchang(today)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-divine-recommendation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePersonalizedMessage(devotion: any, report: any, dayOfWeek: number) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const isLuckyDay = report.lucky_day === days[dayOfWeek];

  if (isLuckyDay) {
    return `🎉 Shubh Din! Aaj ${days[dayOfWeek]} aapka lucky day hai! ${devotion.deity} ki puja aur ${devotion.mantra} ka jaap karne se aapko vishesh labh milega. Aapka lucky color ${report.lucky_color} hai - isko dharan karein.`;
  } else {
    return `🙏 Aaj ${devotion.deity} ka din hai. ${devotion.benefits} ke liye ${devotion.mantra} ka jaap karein. Aapka destiny number ${report.destiny_number} hai, isliye spiritual practices ko apni routine mein shamil karein.`;
  }
}

function generatePanchang(date: Date) {
  // Simplified Panchang calculation (in real app, use astronomical API)
  const tithis = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
  ];
  
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
    'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
    'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
    'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const daysSinceNewYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    tithi: tithis[daysSinceNewYear % 15],
    nakshatra: nakshatras[daysSinceNewYear % 27],
    yoga: 'Vishkambha',
    karana: 'Bava',
    sunrise: '06:15 AM',
    sunset: '06:30 PM',
    moonrise: calculateMoonTime(date, 'rise'),
    moonset: calculateMoonTime(date, 'set'),
    rahu_kaal: calculateRahuKaal(date.getDay()),
    auspicious_time: '10:00 AM - 12:00 PM'
  };
}

function calculateMoonTime(date: Date, type: 'rise' | 'set'): string {
  // Simplified calculation
  const dayOfMonth = date.getDate();
  const baseHour = type === 'rise' ? 7 : 19;
  const hour = (baseHour + (dayOfMonth % 5)) % 24;
  const minute = (dayOfMonth * 7) % 60;
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function calculateRahuKaal(dayOfWeek: number): string {
  const rahuKaalTimings = [
    '04:30 PM - 06:00 PM', // Sunday
    '07:30 AM - 09:00 AM', // Monday
    '03:00 PM - 04:30 PM', // Tuesday
    '12:00 PM - 01:30 PM', // Wednesday
    '01:30 PM - 03:00 PM', // Thursday
    '10:30 AM - 12:00 PM', // Friday
    '09:00 AM - 10:30 AM'  // Saturday
  ];
  
  return rahuKaalTimings[dayOfWeek];
}