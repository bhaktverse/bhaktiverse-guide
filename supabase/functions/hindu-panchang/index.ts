import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simplified Hindu calendar calculations (Panchang)
// For production, consider using a dedicated library or API

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const tithis = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
  "Purnima/Amavasya"
];

const yogas = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya",
  "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const karanas = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

function calculateLunarDay(date: Date): number {
  // Simplified lunar day calculation (approximate)
  const newMoonRef = new Date("2025-01-29"); // Known new moon
  const daysSince = Math.floor((date.getTime() - newMoonRef.getTime()) / (1000 * 60 * 60 * 24));
  return ((daysSince % 30) + 30) % 30;
}

function calculatePanchang(date: Date, latitude = 23.0, longitude = 77.0) {
  const lunarDay = calculateLunarDay(date);
  const isShukla = lunarDay < 15;
  const tithiIndex = lunarDay % 15;
  
  // Calculate nakshatra (simplified - based on day of year)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const nakshatraIndex = dayOfYear % 27;
  
  // Calculate yoga and karana
  const yogaIndex = (dayOfYear + Math.floor(lunarDay / 2)) % 27;
  const karanaIndex = (lunarDay * 2) % 11;
  
  // Calculate sunrise and sunset (approximate for India)
  const sunrise = new Date(date);
  sunrise.setHours(6, 15, 0);
  const sunset = new Date(date);
  sunset.setHours(18, 30, 0);
  
  // Determine paksha
  const paksha = isShukla ? "Shukla Paksha" : "Krishna Paksha";
  
  // Determine masa (month) - simplified
  const masas = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
    "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
  ];
  const masaIndex = (date.getMonth() + 10) % 12; // Approximate Hindu month
  
  // Calculate Rahu Kaal (inauspicious time)
  const rahuKaalStart = new Date(sunrise);
  const sunriseToSunset = sunset.getTime() - sunrise.getTime();
  const dayPortion = sunriseToSunset / 8;
  const rahuKaalDay = [7, 1, 6, 4, 5, 3, 2][date.getDay()]; // Day-based Rahu Kaal
  rahuKaalStart.setTime(sunrise.getTime() + (dayPortion * rahuKaalDay));
  const rahuKaalEnd = new Date(rahuKaalStart.getTime() + dayPortion);
  
  // Auspicious timings
  const abhijitStart = new Date(sunrise.getTime() + (sunriseToSunset / 2) - (24 * 60 * 1000));
  const abhijitEnd = new Date(abhijitStart.getTime() + (48 * 60 * 1000));
  
  return {
    date: date.toISOString().split('T')[0],
    gregorian: {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'long' }),
      year: date.getFullYear(),
      weekday: date.toLocaleString('en-US', { weekday: 'long' })
    },
    hindu: {
      tithi: `${paksha} ${tithis[tithiIndex]}`,
      tithiNumber: tithiIndex + 1,
      paksha,
      nakshatra: nakshatras[nakshatraIndex],
      nakshatraLord: getNakshatraLord(nakshatraIndex),
      yoga: yogas[yogaIndex],
      karana: karanas[karanaIndex],
      masa: masas[masaIndex],
      samvat: date.getFullYear() + 57, // Vikram Samvat (approximate)
      ritu: getRitu(date.getMonth())
    },
    timings: {
      sunrise: sunrise.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sunset: sunset.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      rahuKaal: {
        start: rahuKaalStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        end: rahuKaalEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      },
      abhijit: {
        start: abhijitStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        end: abhijitEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        description: "Most auspicious time of the day"
      }
    },
    auspicious: yogaIndex % 3 !== 1, // Simplified auspiciousness
    specialDay: getSpecialDay(lunarDay, date),
    vrat: getVrat(tithiIndex, paksha),
    moonPhase: getMoonPhase(lunarDay)
  };
}

function getNakshatraLord(index: number): string {
  const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  return lords[Math.floor(index / 3) % 9];
}

function getRitu(month: number): string {
  const ritus = ["Vasanta", "Grishma", "Varsha", "Sharad", "Hemanta", "Shishira"];
  return ritus[Math.floor(month / 2) % 6];
}

function getMoonPhase(lunarDay: number): string {
  if (lunarDay === 0) return "New Moon (Amavasya)";
  if (lunarDay === 15) return "Full Moon (Purnima)";
  if (lunarDay < 7) return "Waxing Crescent";
  if (lunarDay < 15) return "Waxing Gibbous";
  if (lunarDay < 22) return "Waning Gibbous";
  return "Waning Crescent";
}

function getSpecialDay(lunarDay: number, date: Date): string | null {
  const month = date.getMonth();
  const day = date.getDate();
  
  // Major Hindu festivals (simplified)
  if (month === 2 && day >= 20 && day <= 25) return "Holi";
  if (month === 7 && day >= 15 && day <= 20) return "Janmashtami";
  if (month === 9 && day >= 20 && day <= 25) return "Diwali";
  if (month === 10 && day >= 10 && day <= 15) return "Karva Chauth";
  
  if (lunarDay === 0) return "Amavasya (New Moon)";
  if (lunarDay === 15) return "Purnima (Full Moon)";
  if (lunarDay % 15 === 11) return "Ekadashi (Fasting Day)";
  
  return null;
}

function getVrat(tithiIndex: number, paksha: string): string | null {
  if (tithiIndex === 10) return "Ekadashi Vrat (Fasting for Lord Vishnu)";
  if (tithiIndex === 13 && paksha === "Krishna Paksha") return "Pradosh Vrat (Lord Shiva)";
  if (tithiIndex === 3 && paksha === "Shukla Paksha") return "Ganesh Chaturthi Vrat";
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, latitude, longitude } = await req.json();
    
    const targetDate = date ? new Date(date) : new Date();
    const lat = latitude || 23.0;
    const lon = longitude || 77.0;
    
    console.log(`Calculating Panchang for ${targetDate.toDateString()}`);
    
    const panchang = calculatePanchang(targetDate, lat, lon);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        panchang,
        location: { latitude: lat, longitude: lon }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Panchang calculation error:", error);
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