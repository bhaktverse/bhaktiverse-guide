// Comprehensive Rashi (Zodiac) Data with Vedic Astrology Correlations

export interface RashiData {
  id: number;
  name: string;
  englishName: string;
  hindiName: string;
  symbol: string;
  element: string;
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  rulerHindi: string;
  exalted?: string;
  debilitated?: string;
  nakshatras: string[];
  characteristics: string[];
  bodyPart: string;
  luckyColor: string;
  luckyNumber: number[];
  luckyDay: string;
  luckyGemstone: string;
  deity: string;
  mantra: string;
  dateRange: string;
  vedic: {
    tattva: string;
    guna: string;
    direction: string;
  };
}

export const RASHIS: RashiData[] = [
  {
    id: 1,
    name: "Aries",
    englishName: "Aries",
    hindiName: "मेष",
    symbol: "♈",
    element: "Fire (अग्नि)",
    quality: "Cardinal",
    ruler: "Mars",
    rulerHindi: "मंगल",
    exalted: "Sun",
    debilitated: "Saturn",
    nakshatras: ["Ashwini", "Bharani", "Krittika (1st pada)"],
    characteristics: ["Leadership", "Courage", "Energy", "Pioneer spirit", "Competitive"],
    bodyPart: "Head",
    luckyColor: "Red",
    luckyNumber: [1, 9],
    luckyDay: "Tuesday",
    luckyGemstone: "Red Coral (Moonga)",
    deity: "Lord Kartikeya",
    mantra: "Om Mangalaya Namaha",
    dateRange: "Mar 21 - Apr 19",
    vedic: {
      tattva: "Agni (Fire)",
      guna: "Rajas",
      direction: "East"
    }
  },
  {
    id: 2,
    name: "Taurus",
    englishName: "Taurus",
    hindiName: "वृषभ",
    symbol: "♉",
    element: "Earth (पृथ्वी)",
    quality: "Fixed",
    ruler: "Venus",
    rulerHindi: "शुक्र",
    exalted: "Moon",
    debilitated: "Ketu",
    nakshatras: ["Krittika (2-4 pada)", "Rohini", "Mrigashira (1-2 pada)"],
    characteristics: ["Stability", "Luxury", "Persistence", "Sensual", "Practical"],
    bodyPart: "Throat, Neck",
    luckyColor: "White, Pink",
    luckyNumber: [2, 6],
    luckyDay: "Friday",
    luckyGemstone: "Diamond (Heera)",
    deity: "Lord Vishnu",
    mantra: "Om Shukraya Namaha",
    dateRange: "Apr 20 - May 20",
    vedic: {
      tattva: "Prithvi (Earth)",
      guna: "Tamas",
      direction: "South"
    }
  },
  {
    id: 3,
    name: "Gemini",
    englishName: "Gemini",
    hindiName: "मिथुन",
    symbol: "♊",
    element: "Air (वायु)",
    quality: "Mutable",
    ruler: "Mercury",
    rulerHindi: "बुध",
    exalted: "Rahu",
    debilitated: "Ketu",
    nakshatras: ["Mrigashira (3-4 pada)", "Ardra", "Punarvasu (1-3 pada)"],
    characteristics: ["Communication", "Versatility", "Curiosity", "Witty", "Adaptable"],
    bodyPart: "Arms, Shoulders, Lungs",
    luckyColor: "Green",
    luckyNumber: [3, 5],
    luckyDay: "Wednesday",
    luckyGemstone: "Emerald (Panna)",
    deity: "Lord Krishna",
    mantra: "Om Budhaya Namaha",
    dateRange: "May 21 - Jun 20",
    vedic: {
      tattva: "Vayu (Air)",
      guna: "Rajas",
      direction: "West"
    }
  },
  {
    id: 4,
    name: "Cancer",
    englishName: "Cancer",
    hindiName: "कर्क",
    symbol: "♋",
    element: "Water (जल)",
    quality: "Cardinal",
    ruler: "Moon",
    rulerHindi: "चंद्र",
    exalted: "Jupiter",
    debilitated: "Mars",
    nakshatras: ["Punarvasu (4th pada)", "Pushya", "Ashlesha"],
    characteristics: ["Nurturing", "Emotional", "Intuitive", "Protective", "Home-loving"],
    bodyPart: "Chest, Stomach",
    luckyColor: "White, Silver",
    luckyNumber: [2, 7],
    luckyDay: "Monday",
    luckyGemstone: "Pearl (Moti)",
    deity: "Goddess Parvati",
    mantra: "Om Chandraya Namaha",
    dateRange: "Jun 21 - Jul 22",
    vedic: {
      tattva: "Jala (Water)",
      guna: "Sattva",
      direction: "North"
    }
  },
  {
    id: 5,
    name: "Leo",
    englishName: "Leo",
    hindiName: "सिंह",
    symbol: "♌",
    element: "Fire (अग्नि)",
    quality: "Fixed",
    ruler: "Sun",
    rulerHindi: "सूर्य",
    nakshatras: ["Magha", "Purva Phalguni", "Uttara Phalguni (1st pada)"],
    characteristics: ["Leadership", "Confidence", "Generosity", "Creative", "Dramatic"],
    bodyPart: "Heart, Spine",
    luckyColor: "Gold, Orange",
    luckyNumber: [1, 4],
    luckyDay: "Sunday",
    luckyGemstone: "Ruby (Manik)",
    deity: "Lord Surya",
    mantra: "Om Suryaya Namaha",
    dateRange: "Jul 23 - Aug 22",
    vedic: {
      tattva: "Agni (Fire)",
      guna: "Sattva",
      direction: "East"
    }
  },
  {
    id: 6,
    name: "Virgo",
    englishName: "Virgo",
    hindiName: "कन्या",
    symbol: "♍",
    element: "Earth (पृथ्वी)",
    quality: "Mutable",
    ruler: "Mercury",
    rulerHindi: "बुध",
    exalted: "Mercury",
    debilitated: "Venus",
    nakshatras: ["Uttara Phalguni (2-4 pada)", "Hasta", "Chitra (1-2 pada)"],
    characteristics: ["Analytical", "Practical", "Perfectionist", "Helpful", "Detail-oriented"],
    bodyPart: "Digestive system",
    luckyColor: "Green, Brown",
    luckyNumber: [5, 6],
    luckyDay: "Wednesday",
    luckyGemstone: "Emerald (Panna)",
    deity: "Lord Vishnu",
    mantra: "Om Budhaya Namaha",
    dateRange: "Aug 23 - Sep 22",
    vedic: {
      tattva: "Prithvi (Earth)",
      guna: "Rajas",
      direction: "South"
    }
  },
  {
    id: 7,
    name: "Libra",
    englishName: "Libra",
    hindiName: "तुला",
    symbol: "♎",
    element: "Air (वायु)",
    quality: "Cardinal",
    ruler: "Venus",
    rulerHindi: "शुक्र",
    exalted: "Saturn",
    debilitated: "Sun",
    nakshatras: ["Chitra (3-4 pada)", "Swati", "Vishakha (1-3 pada)"],
    characteristics: ["Balance", "Harmony", "Diplomatic", "Aesthetic", "Partnership-oriented"],
    bodyPart: "Kidneys, Lower back",
    luckyColor: "White, Blue",
    luckyNumber: [6, 9],
    luckyDay: "Friday",
    luckyGemstone: "Diamond (Heera)",
    deity: "Goddess Lakshmi",
    mantra: "Om Shukraya Namaha",
    dateRange: "Sep 23 - Oct 22",
    vedic: {
      tattva: "Vayu (Air)",
      guna: "Tamas",
      direction: "West"
    }
  },
  {
    id: 8,
    name: "Scorpio",
    englishName: "Scorpio",
    hindiName: "वृश्चिक",
    symbol: "♏",
    element: "Water (जल)",
    quality: "Fixed",
    ruler: "Mars",
    rulerHindi: "मंगल",
    debilitated: "Moon",
    nakshatras: ["Vishakha (4th pada)", "Anuradha", "Jyeshtha"],
    characteristics: ["Intense", "Transformative", "Passionate", "Mysterious", "Resourceful"],
    bodyPart: "Reproductive organs",
    luckyColor: "Red, Maroon",
    luckyNumber: [1, 4, 9],
    luckyDay: "Tuesday",
    luckyGemstone: "Red Coral (Moonga)",
    deity: "Lord Shiva",
    mantra: "Om Mangalaya Namaha",
    dateRange: "Oct 23 - Nov 21",
    vedic: {
      tattva: "Jala (Water)",
      guna: "Rajas",
      direction: "North"
    }
  },
  {
    id: 9,
    name: "Sagittarius",
    englishName: "Sagittarius",
    hindiName: "धनु",
    symbol: "♐",
    element: "Fire (अग्नि)",
    quality: "Mutable",
    ruler: "Jupiter",
    rulerHindi: "बृहस्पति",
    nakshatras: ["Moola", "Purva Ashadha", "Uttara Ashadha (1st pada)"],
    characteristics: ["Philosophical", "Adventurous", "Optimistic", "Honest", "Freedom-loving"],
    bodyPart: "Thighs, Hips",
    luckyColor: "Yellow, Purple",
    luckyNumber: [3, 9],
    luckyDay: "Thursday",
    luckyGemstone: "Yellow Sapphire (Pukhraj)",
    deity: "Lord Vishnu",
    mantra: "Om Gurave Namaha",
    dateRange: "Nov 22 - Dec 21",
    vedic: {
      tattva: "Agni (Fire)",
      guna: "Sattva",
      direction: "East"
    }
  },
  {
    id: 10,
    name: "Capricorn",
    englishName: "Capricorn",
    hindiName: "मकर",
    symbol: "♑",
    element: "Earth (पृथ्वी)",
    quality: "Cardinal",
    ruler: "Saturn",
    rulerHindi: "शनि",
    exalted: "Mars",
    debilitated: "Jupiter",
    nakshatras: ["Uttara Ashadha (2-4 pada)", "Shravana", "Dhanishta (1-2 pada)"],
    characteristics: ["Ambitious", "Disciplined", "Practical", "Patient", "Responsible"],
    bodyPart: "Knees, Bones",
    luckyColor: "Black, Brown",
    luckyNumber: [4, 8],
    luckyDay: "Saturday",
    luckyGemstone: "Blue Sapphire (Neelam)",
    deity: "Lord Shani",
    mantra: "Om Shanaye Namaha",
    dateRange: "Dec 22 - Jan 19",
    vedic: {
      tattva: "Prithvi (Earth)",
      guna: "Tamas",
      direction: "South"
    }
  },
  {
    id: 11,
    name: "Aquarius",
    englishName: "Aquarius",
    hindiName: "कुंभ",
    symbol: "♒",
    element: "Air (वायु)",
    quality: "Fixed",
    ruler: "Saturn",
    rulerHindi: "शनि",
    nakshatras: ["Dhanishta (3-4 pada)", "Shatabhisha", "Purva Bhadrapada (1-3 pada)"],
    characteristics: ["Humanitarian", "Innovative", "Independent", "Intellectual", "Unconventional"],
    bodyPart: "Ankles, Calves",
    luckyColor: "Blue, Violet",
    luckyNumber: [4, 7, 8],
    luckyDay: "Saturday",
    luckyGemstone: "Blue Sapphire (Neelam)",
    deity: "Lord Shani / Varuna",
    mantra: "Om Shanaye Namaha",
    dateRange: "Jan 20 - Feb 18",
    vedic: {
      tattva: "Vayu (Air)",
      guna: "Sattva",
      direction: "West"
    }
  },
  {
    id: 12,
    name: "Pisces",
    englishName: "Pisces",
    hindiName: "मीन",
    symbol: "♓",
    element: "Water (जल)",
    quality: "Mutable",
    ruler: "Jupiter",
    rulerHindi: "बृहस्पति",
    exalted: "Venus",
    debilitated: "Mercury",
    nakshatras: ["Purva Bhadrapada (4th pada)", "Uttara Bhadrapada", "Revati"],
    characteristics: ["Intuitive", "Compassionate", "Artistic", "Dreamy", "Spiritual"],
    bodyPart: "Feet",
    luckyColor: "Yellow, Sea Green",
    luckyNumber: [3, 7, 9],
    luckyDay: "Thursday",
    luckyGemstone: "Yellow Sapphire (Pukhraj)",
    deity: "Lord Vishnu / Matsya Avatar",
    mantra: "Om Gurave Namaha",
    dateRange: "Feb 19 - Mar 20",
    vedic: {
      tattva: "Jala (Water)",
      guna: "Tamas",
      direction: "North"
    }
  }
];

// Nakshatra data for more detailed predictions
export interface NakshatraData {
  id: number;
  name: string;
  hindiName: string;
  ruler: string;
  deity: string;
  symbol: string;
  rashi: string[];
  characteristics: string[];
}

export const NAKSHATRAS: NakshatraData[] = [
  { id: 1, name: "Ashwini", hindiName: "अश्विनी", ruler: "Ketu", deity: "Ashwini Kumaras", symbol: "🐴", rashi: ["Aries"], characteristics: ["Swift", "Healing", "New beginnings"] },
  { id: 2, name: "Bharani", hindiName: "भरणी", ruler: "Venus", deity: "Yama", symbol: "🔺", rashi: ["Aries"], characteristics: ["Creative", "Nurturing", "Transformative"] },
  { id: 3, name: "Krittika", hindiName: "कृत्तिका", ruler: "Sun", deity: "Agni", symbol: "🔥", rashi: ["Aries", "Taurus"], characteristics: ["Sharp", "Purifying", "Leadership"] },
  { id: 4, name: "Rohini", hindiName: "रोहिणी", ruler: "Moon", deity: "Brahma", symbol: "🐂", rashi: ["Taurus"], characteristics: ["Beauty", "Creativity", "Growth"] },
  { id: 5, name: "Mrigashira", hindiName: "मृगशिरा", ruler: "Mars", deity: "Soma", symbol: "🦌", rashi: ["Taurus", "Gemini"], characteristics: ["Searching", "Gentle", "Curious"] },
  { id: 6, name: "Ardra", hindiName: "आर्द्रा", ruler: "Rahu", deity: "Rudra", symbol: "💧", rashi: ["Gemini"], characteristics: ["Intense", "Transformative", "Intellectual"] },
  { id: 7, name: "Punarvasu", hindiName: "पुनर्वसु", ruler: "Jupiter", deity: "Aditi", symbol: "🏹", rashi: ["Gemini", "Cancer"], characteristics: ["Renewal", "Optimistic", "Spiritual"] },
  { id: 8, name: "Pushya", hindiName: "पुष्य", ruler: "Saturn", deity: "Brihaspati", symbol: "🌸", rashi: ["Cancer"], characteristics: ["Nourishing", "Auspicious", "Devoted"] },
  { id: 9, name: "Ashlesha", hindiName: "आश्लेषा", ruler: "Mercury", deity: "Nagas", symbol: "🐍", rashi: ["Cancer"], characteristics: ["Mystical", "Intuitive", "Transformative"] },
  { id: 10, name: "Magha", hindiName: "मघा", ruler: "Ketu", deity: "Pitris", symbol: "🦁", rashi: ["Leo"], characteristics: ["Royal", "Ancestral", "Traditional"] },
  { id: 11, name: "Purva Phalguni", hindiName: "पूर्व फाल्गुनी", ruler: "Venus", deity: "Bhaga", symbol: "🛏️", rashi: ["Leo"], characteristics: ["Creative", "Romantic", "Artistic"] },
  { id: 12, name: "Uttara Phalguni", hindiName: "उत्तर फाल्गुनी", ruler: "Sun", deity: "Aryaman", symbol: "🌞", rashi: ["Leo", "Virgo"], characteristics: ["Friendly", "Generous", "Helpful"] },
  { id: 13, name: "Hasta", hindiName: "हस्त", ruler: "Moon", deity: "Savitar", symbol: "✋", rashi: ["Virgo"], characteristics: ["Skillful", "Healing", "Clever"] },
  { id: 14, name: "Chitra", hindiName: "चित्रा", ruler: "Mars", deity: "Vishwakarma", symbol: "💎", rashi: ["Virgo", "Libra"], characteristics: ["Beautiful", "Creative", "Artistic"] },
  { id: 15, name: "Swati", hindiName: "स्वाति", ruler: "Rahu", deity: "Vayu", symbol: "🌬️", rashi: ["Libra"], characteristics: ["Independent", "Flexible", "Diplomatic"] },
  { id: 16, name: "Vishakha", hindiName: "विशाखा", ruler: "Jupiter", deity: "Indra-Agni", symbol: "🌿", rashi: ["Libra", "Scorpio"], characteristics: ["Goal-oriented", "Determined", "Ambitious"] },
  { id: 17, name: "Anuradha", hindiName: "अनुराधा", ruler: "Saturn", deity: "Mitra", symbol: "🌺", rashi: ["Scorpio"], characteristics: ["Devoted", "Friendly", "Successful"] },
  { id: 18, name: "Jyeshtha", hindiName: "ज्येष्ठा", ruler: "Mercury", deity: "Indra", symbol: "👑", rashi: ["Scorpio"], characteristics: ["Protective", "Eldest", "Responsible"] },
  { id: 19, name: "Moola", hindiName: "मूल", ruler: "Ketu", deity: "Nirriti", symbol: "🌳", rashi: ["Sagittarius"], characteristics: ["Root-seeking", "Transformative", "Philosophical"] },
  { id: 20, name: "Purva Ashadha", hindiName: "पूर्वाषाढ़ा", ruler: "Venus", deity: "Apas", symbol: "🌊", rashi: ["Sagittarius"], characteristics: ["Victorious", "Invincible", "Optimistic"] },
  { id: 21, name: "Uttara Ashadha", hindiName: "उत्तराषाढ़ा", ruler: "Sun", deity: "Vishvedevas", symbol: "🐘", rashi: ["Sagittarius", "Capricorn"], characteristics: ["Righteous", "Final victory", "Universal"] },
  { id: 22, name: "Shravana", hindiName: "श्रवण", ruler: "Moon", deity: "Vishnu", symbol: "👂", rashi: ["Capricorn"], characteristics: ["Listening", "Learning", "Knowledge"] },
  { id: 23, name: "Dhanishta", hindiName: "धनिष्ठा", ruler: "Mars", deity: "Vasus", symbol: "🥁", rashi: ["Capricorn", "Aquarius"], characteristics: ["Wealthy", "Musical", "Marching"] },
  { id: 24, name: "Shatabhisha", hindiName: "शतभिषा", ruler: "Rahu", deity: "Varuna", symbol: "💫", rashi: ["Aquarius"], characteristics: ["Healing", "Mysterious", "Independent"] },
  { id: 25, name: "Purva Bhadrapada", hindiName: "पूर्व भाद्रपद", ruler: "Jupiter", deity: "Aja Ekapada", symbol: "⚡", rashi: ["Aquarius", "Pisces"], characteristics: ["Fiery", "Transformative", "Mystical"] },
  { id: 26, name: "Uttara Bhadrapada", hindiName: "उत्तर भाद्रपद", ruler: "Saturn", deity: "Ahir Budhnya", symbol: "🌙", rashi: ["Pisces"], characteristics: ["Deep", "Spiritual", "Controlling"] },
  { id: 27, name: "Revati", hindiName: "रेवती", ruler: "Mercury", deity: "Pushan", symbol: "🐟", rashi: ["Pisces"], characteristics: ["Nourishing", "Final", "Protective"] }
];

// Helper to get Rashi by date
export const getRashiByDate = (date: Date): RashiData => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simplified Western zodiac dates (use Vedic calculation for more accuracy)
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return RASHIS[0]; // Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return RASHIS[1]; // Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return RASHIS[2]; // Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return RASHIS[3]; // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return RASHIS[4]; // Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return RASHIS[5]; // Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return RASHIS[6]; // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return RASHIS[7]; // Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return RASHIS[8]; // Sagittarius
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return RASHIS[9]; // Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return RASHIS[10]; // Aquarius
  return RASHIS[11]; // Pisces
};

// Gun Milan (Kundali Match) points calculation
export interface GunMilanResult {
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

// Deterministic Ashta Koot Gun Milan based on rashi (sign).
// Note: Tara and Nadi are most accurate with Nakshatra; we approximate via sign group.
const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

// Varna order (high → low): Brahmin, Kshatriya, Vaishya, Shudra
const VARNA: Record<number, number> = { 3:0, 7:0, 11:0, 0:1, 4:1, 8:1, 1:2, 5:2, 9:2, 2:3, 6:3, 10:3 };
// Vashya groups
const VASHYA_GROUP: Record<number, string> = { 0:"chatushpada",1:"chatushpada",2:"manav",3:"jalachar",4:"vanachar",5:"manav",6:"manav",7:"keet",8:"manav",9:"jalachar",10:"manav",11:"jalachar" };
// Yoni animals (traditional, sign-approximation)
const YONI: Record<number, string> = { 0:"mesh",1:"sarp",2:"marjar",3:"sarp",4:"mooshak",5:"mahisha",6:"vyaghra",7:"mrig",8:"ashwa",9:"nakul",10:"simha",11:"gau" };
const YONI_FRIENDS: Record<string, string[]> = {
  mesh:["gau"], sarp:["mooshak"], marjar:["mooshak"], mooshak:["marjar","sarp"],
  mahisha:["ashwa"], vyaghra:["mrig"], mrig:["vyaghra"], ashwa:["mahisha"],
  nakul:["sarp"], simha:["gau"], gau:["mesh","simha"],
};
// Gana: Deva / Manushya / Rakshasa (by sign approximation)
const GANA: Record<number, string> = { 0:"manushya",1:"manushya",2:"deva",3:"deva",4:"rakshasa",5:"manushya",6:"rakshasa",7:"rakshasa",8:"deva",9:"manushya",10:"deva",11:"rakshasa" };
// Nadi: Aadi / Madhya / Antya
const NADI: Record<number, string> = { 0:"adi",1:"madhya",2:"antya",3:"adi",4:"madhya",5:"antya",6:"adi",7:"madhya",8:"antya",9:"adi",10:"madhya",11:"antya" };
// Planetary friendship (lord-of-sign based)
const LORDS: Record<number, string> = { 0:"mars",1:"venus",2:"mercury",3:"moon",4:"sun",5:"mercury",6:"venus",7:"mars",8:"jupiter",9:"saturn",10:"saturn",11:"jupiter" };
const MAITRI_TABLE: Record<string, Record<string, number>> = {
  sun:{sun:5,moon:5,mars:5,mercury:3,jupiter:5,venus:1,saturn:1},
  moon:{sun:5,moon:5,mars:3,mercury:5,jupiter:3,venus:3,saturn:3},
  mars:{sun:5,moon:3,mars:5,mercury:1,jupiter:5,venus:3,saturn:3},
  mercury:{sun:3,moon:5,mars:1,mercury:5,jupiter:3,venus:5,saturn:3},
  jupiter:{sun:5,moon:3,mars:5,mercury:1,jupiter:5,venus:1,saturn:3},
  venus:{sun:1,moon:3,mars:3,mercury:5,jupiter:1,venus:5,saturn:5},
  saturn:{sun:1,moon:3,mars:3,mercury:3,jupiter:3,venus:5,saturn:5},
};

export const calculateGunMilan = (rashi1: RashiData, rashi2: RashiData): GunMilanResult => {
  const g = SIGNS.indexOf(rashi1.englishName); // groom
  const b = SIGNS.indexOf(rashi2.englishName); // bride
  const safeG = g < 0 ? 0 : g;
  const safeB = b < 0 ? 0 : b;

  // 1. Varna (max 1) — groom varna ≤ bride's level number = pass
  const varna = VARNA[safeG] <= VARNA[safeB] ? 1 : 0;

  // 2. Vashya (max 2)
  const vashya = VASHYA_GROUP[safeG] === VASHYA_GROUP[safeB] ? 2 : 1;

  // 3. Tara (max 3) — approximation via sign distance modulo 9
  const taraDiff = (((safeB - safeG) % 9) + 9) % 9;
  const taraTable = [3, 1.5, 3, 1.5, 0, 3, 1.5, 3, 1.5];
  const tara = Math.round(taraTable[taraDiff]);

  // 4. Yoni (max 4)
  const y1 = YONI[safeG], y2 = YONI[safeB];
  const yoni = y1 === y2 ? 4 : (YONI_FRIENDS[y1] || []).includes(y2) ? 3 : 2;

  // 5. Maitri (max 5)
  const maitri = MAITRI_TABLE[LORDS[safeG]]?.[LORDS[safeB]] ?? 3;

  // 6. Gana (max 6)
  const gn1 = GANA[safeG], gn2 = GANA[safeB];
  const gana = gn1 === gn2 ? 6 : (gn1 === "rakshasa" || gn2 === "rakshasa") ? 0 : 5;

  // 7. Bhakoot (max 7) — differences 2,5,6,8,9,12 → 0 (dosha)
  const dist = Math.abs(safeG - safeB);
  const bhakootDoshaDist = [1, 4, 5, 7, 8, 11];
  const bhakoot = bhakootDoshaDist.includes(dist) ? 0 : 7;

  // 8. Nadi (max 8) — same nadi = 0 (dosha)
  const nadiDosha = NADI[safeG] === NADI[safeB];
  const nadi = nadiDosha ? 0 : 8;

  const total = varna + vashya + tara + yoni + maitri + gana + bhakoot + nadi;
  const percentage = Math.round((total / 36) * 100);

  const doshas: string[] = [];
  if (nadiDosha) doshas.push("Nadi Dosha — same Nadi reduces progeny harmony");
  if (bhakoot === 0) doshas.push("Bhakoot Dosha — moon-sign distance suggests friction");
  if (gana === 0) doshas.push("Gana Dosha — opposing temperaments");

  let verdict = "";
  let recommendation = "";
  if (percentage >= 75) {
    verdict = "Excellent Match — Highly Recommended";
    recommendation = "This union is blessed. Proceed with confidence and the family blessings ritual.";
  } else if (percentage >= 60) {
    verdict = "Good Match — Recommended with Minor Remedies";
    recommendation = "A strong compatibility. Ganesh puja and a Navagraha shanti before the wedding are advised.";
  } else if (percentage >= 50) {
    verdict = "Average Match — Careful Consideration";
    recommendation = "Workable, but consult a pandit for Mangal/Nadi shanti remedies before finalising.";
  } else {
    verdict = "Challenging Match — Detailed Remedies Needed";
    recommendation = "Significant compatibility gaps. A full Janma Kundali (with birth time + place) is essential.";
  }
  if (doshas.length) recommendation += `  Identified: ${doshas.join("; ")}.`;

  return {
    varna: { points: varna, max: 1, description: "Spiritual compatibility and ego harmony" },
    vashya: { points: vashya, max: 2, description: "Mutual attraction and control" },
    tara: { points: tara, max: 3, description: "Birth-star compatibility and health" },
    yoni: { points: yoni, max: 4, description: "Physical and emotional compatibility" },
    maitri: { points: maitri, max: 5, description: "Mental compatibility and friendship" },
    gana: { points: gana, max: 6, description: "Temperament (Deva/Manushya/Rakshasa)" },
    bhakoot: { points: bhakoot, max: 7, description: "Moon-sign compatibility and prosperity" },
    nadi: { points: nadi, max: 8, description: "Health and genetic compatibility" },
    total, maxTotal: 36, percentage, verdict, recommendation,
  };
};
