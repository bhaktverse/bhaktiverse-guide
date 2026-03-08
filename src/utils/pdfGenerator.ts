import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface CategoryPrediction {
  title: string;
  prediction: string;
  palmFeatures?: string[];
  observedFeatures?: string[];
  planetaryInfluence?: string;
  timeline?: string;
  guidance: string;
  rating: number;
}

interface LineAnalysis {
  observed?: string;
  type?: string;
  meaning?: string;
  loveStyle?: string;
  thinkingStyle?: string;
  vitality?: string;
  destinyPath?: string;
  successPath?: string;
  rating?: number;
}

interface MountAnalysis {
  strength?: string;
  observed?: string;
  meaning?: string;
  rating?: number;
}

interface HandTypeAnalysis {
  classification?: string;
  tatvaElement?: string;
  palmShape?: string;
  fingerToPalmRatio?: string;
  personalityProfile?: string;
  strengths?: string[];
  challenges?: string[];
}

interface SecondaryLines {
  marriageLines?: { count?: number; depth?: string; position?: string; interpretation?: string };
  childrenLines?: { count?: number; interpretation?: string };
  healthLine?: { present?: boolean; description?: string; interpretation?: string };
  travelLines?: { count?: number; description?: string; interpretation?: string };
  intuitionLine?: { present?: boolean; description?: string; interpretation?: string };
  girdleOfVenus?: { present?: boolean; description?: string; interpretation?: string };
}

interface FingerAnalysis {
  thumbFlexibility?: { type?: string; meaning?: string };
  fingerGaps?: { observed?: string; financialControl?: string };
  ringVsIndex?: { dominant?: string; confidenceLevel?: string };
  nailShape?: { type?: string; healthIndicator?: string };
  fingerProportions?: { details?: string; personality?: string };
}

interface LineQualityDetails {
  breaks?: string[];
  islands?: string[];
  forks?: string[];
  crosses?: string[];
  chains?: string[];
}

interface PalmAnalysis {
  language?: string;
  palmType?: string;
  dominantPlanet?: string;
  nakshatra?: string;
  greeting?: string;
  overallDestiny?: string;
  overallScore?: number;
  confidenceScore?: number;
  categories?: {
    career?: CategoryPrediction;
    love?: CategoryPrediction;
    health?: CategoryPrediction;
    family?: CategoryPrediction;
    education?: CategoryPrediction;
    spiritual?: CategoryPrediction;
    travel?: CategoryPrediction;
  };
  lineAnalysis?: {
    heartLine?: LineAnalysis;
    headLine?: LineAnalysis;
    lifeLine?: LineAnalysis;
    fateLine?: LineAnalysis;
    sunLine?: LineAnalysis;
  };
  mountAnalysis?: {
    jupiter?: MountAnalysis;
    saturn?: MountAnalysis;
    apollo?: MountAnalysis;
    mercury?: MountAnalysis;
    venus?: MountAnalysis;
    mars?: MountAnalysis;
    marsUpper?: MountAnalysis;
    marsLower?: MountAnalysis;
    moon?: MountAnalysis;
  };
  handTypeAnalysis?: HandTypeAnalysis;
  secondaryLines?: SecondaryLines;
  fingerAnalysis?: FingerAnalysis;
  lineQualityDetails?: LineQualityDetails;
  luckyElements?: {
    colors?: string[];
    gemstones?: string[];
    mantras?: Array<{ sanskrit?: string; transliteration?: string; meaning?: string } | string>;
    days?: string[];
    numbers?: number[];
    metals?: string[];
    directions?: string[];
  };
  yogas?: string[];
  remedies?: string[];
  warnings?: string[];
  accuracyNotes?: string;
  blessings?: string;
}

const CATEGORY_TITLES: Record<string, string> = {
  career: 'Career & Finance',
  love: 'Love & Relationships',
  health: 'Health & Vitality',
  family: 'Family & Children',
  education: 'Education & Wisdom',
  spiritual: 'Spiritual Growth',
  travel: 'Travel & Fortune'
};

const LINE_NAMES: Record<string, string> = {
  heartLine: 'Heart Line',
  headLine: 'Head Line',
  lifeLine: 'Life Line',
  fateLine: 'Fate Line',
  sunLine: 'Sun Line'
};

const MOUNT_NAMES: Record<string, string> = {
  jupiter: 'Jupiter Mount',
  saturn: 'Saturn Mount',
  apollo: 'Apollo Mount',
  mercury: 'Mercury Mount',
  venus: 'Venus Mount',
  mars: 'Mars Mount',
  moon: 'Moon Mount'
};

const transliterationMap: Record<string, string> = {
  'ॐ': 'Om', 'श्री': 'Shri', 'जी': 'Ji', 'नमस्ते': 'Namaste', 'नमः': 'Namah',
  'मंत्र': 'Mantra', 'शुभ': 'Shubh', 'अशुभ': 'Ashubh', 'भाग्य': 'Bhagya',
  'ग्रह': 'Graha', 'राशि': 'Rashi', 'नक्षत्र': 'Nakshatra', 'दोष': 'Dosha',
  'योग': 'Yoga', 'कर्म': 'Karma', 'धर्म': 'Dharma', 'पूजा': 'Puja',
  'आरती': 'Aarti', 'प्रणाम': 'Pranam', 'आशीर्वाद': 'Ashirvad',
  'सूर्य': 'Surya', 'चंद्र': 'Chandra', 'मंगल': 'Mangal', 'बुध': 'Budh',
  'गुरु': 'Guru', 'शुक्र': 'Shukra', 'शनि': 'Shani', 'राहु': 'Rahu', 'केतु': 'Ketu',
  'हृदय': 'Hridaya', 'रेखा': 'Rekha', 'पर्वत': 'Parvat', 'जीवन': 'Jeevan',
  'प्रेम': 'Prem', 'स्वास्थ्य': 'Swasthya', 'शिक्षा': 'Shiksha',
  'परिवार': 'Parivar', 'संतान': 'Santan', 'विवाह': 'Vivah',
  'आध्यात्मिक': 'Adhyatmik', 'यात्रा': 'Yatra',
  'बेटा': 'Beta', 'बेटी': 'Beti', 'बच्चे': 'Bachche', 'प्रिय': 'Priya',
  'आप': 'Aap', 'हाथ': 'Hath', 'देखता': 'Dekhta', 'हूं': 'Hoon',
  'में': 'Mein', 'है': 'Hai', 'और': 'Aur', 'के': 'Ke', 'को': 'Ko',
  'से': 'Se', 'पर': 'Par', 'बहुत': 'Bahut', 'अच्छा': 'Achha',
  'खुश': 'Khush', 'प्यार': 'Pyaar',
  // Expanded spiritual terms
  'भक्ति': 'Bhakti', 'मोक्ष': 'Moksha', 'साधना': 'Sadhana', 'ध्यान': 'Dhyan',
  'तपस्या': 'Tapasya', 'सेवा': 'Seva', 'दान': 'Daan', 'व्रत': 'Vrat',
  'उपवास': 'Upvas', 'संस्कार': 'Sanskar', 'वेद': 'Veda', 'पुराण': 'Puran',
  'गीता': 'Geeta', 'रामायण': 'Ramayana', 'महाभारत': 'Mahabharat',
  'शिव': 'Shiva', 'विष्णु': 'Vishnu', 'ब्रह्मा': 'Brahma', 'लक्ष्मी': 'Lakshmi',
  'सरस्वती': 'Saraswati', 'गणेश': 'Ganesh', 'हनुमान': 'Hanuman', 'कृष्ण': 'Krishna',
  'राम': 'Ram', 'दुर्गा': 'Durga', 'काली': 'Kali', 'पार्वती': 'Parvati',
  'ज्योतिष': 'Jyotish', 'कुंडली': 'Kundali', 'ग्रहण': 'Grahan', 'अमावस्या': 'Amavasya',
  'पूर्णिमा': 'Poornima', 'एकादशी': 'Ekadashi', 'चतुर्थी': 'Chaturthi',
  'प्रदोष': 'Pradosh', 'संक्रांति': 'Sankranti', 'नवरात्रि': 'Navratri',
  'दिवाली': 'Diwali', 'होली': 'Holi', 'मकर': 'Makar', 'कुम्भ': 'Kumbh',
  'मीन': 'Meen', 'मेष': 'Mesh', 'वृषभ': 'Vrishabh', 'मिथुन': 'Mithun',
  'कर्क': 'Kark', 'सिंह': 'Singh', 'कन्या': 'Kanya', 'तुला': 'Tula',
  'वृश्चिक': 'Vrishchik', 'धनु': 'Dhanu',
  'अग्नि': 'Agni', 'वायु': 'Vayu', 'जल': 'Jal', 'पृथ्वी': 'Prithvi', 'आकाश': 'Akash',
  'चक्र': 'Chakra', 'कुंडलिनी': 'Kundalini', 'प्राण': 'Prana', 'नाड़ी': 'Nadi',
  'अंगूठा': 'Angutha', 'अंगुली': 'Anguli', 'तर्जनी': 'Tarjani', 'मध्यमा': 'Madhyama',
  'अनामिका': 'Anamika', 'कनिष्ठा': 'Kanishtha',
  'सफलता': 'Safalta', 'समृद्धि': 'Samriddhi', 'शांति': 'Shanti', 'सुख': 'Sukh',
  'आनंद': 'Anand', 'कल्याण': 'Kalyan', 'मंगलकारी': 'Mangalkari',
  'उपाय': 'Upay', 'रत्न': 'Ratna', 'यंत्र': 'Yantra', 'तंत्र': 'Tantra',
  'रुद्राक्ष': 'Rudraksha', 'तुलसी': 'Tulsi', 'चंदन': 'Chandan',
  'का': 'Ka', 'की': 'Ki', 'कि': 'Ki', 'ये': 'Ye', 'वो': 'Vo',
  'यह': 'Yah', 'वह': 'Vah', 'कैसे': 'Kaise', 'क्या': 'Kya',
  'नहीं': 'Nahin', 'हां': 'Haan', 'अभी': 'Abhi', 'कभी': 'Kabhi',
  'जब': 'Jab', 'तब': 'Tab', 'अगर': 'Agar', 'तो': 'To', 'लेकिन': 'Lekin',
};

function transliterate(text: string): string {
  if (!text) return '';
  let result = text;
  // Sort by length descending so longer words match first (e.g., "श्री" before "श")
  const sortedEntries = Object.entries(transliterationMap).sort((a, b) => b[0].length - a[0].length);
  for (const [hindi, roman] of sortedEntries) {
    result = result.replace(new RegExp(hindi, 'g'), roman);
  }
  // Character-level Devanagari to Latin
  const devanagariToLatin: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
    'ष': 'sh', 'स': 's', 'ह': 'h',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    '्': '', 'ं': 'n', 'ः': 'h', '़': '',
    '।': '.', '॥': '.',
  };
  for (const [dev, lat] of Object.entries(devanagariToLatin)) {
    result = result.replace(new RegExp(dev, 'g'), lat);
  }
  // Remove any remaining Devanagari, zero-width chars, non-ASCII
  result = result
    .replace(/[\u0900-\u097F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    .replace(/&\s*&[=\w?@]*\s*/g, '')
    .replace(/&[=\w?@]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return result;
}

// Global variable to track if we're generating Hindi PDF
let isHindiPdf = false;

function getSafeText(text: string | undefined | null, fallback: string = ''): string {
  if (!text) return fallback;
  if (isHindiPdf) {
    // For Hindi PDFs, keep Devanagari text as-is (no transliteration)
    // Only clean up zero-width chars and excessive whitespace
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim() || fallback;
  }
  const transliterated = transliterate(text);
  return transliterated || fallback;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

function getZodiacFromDob(dob: string): { sign: string; hindiSign: string } {
  if (!dob) return { sign: '', hindiSign: '' };
  const date = new Date(dob);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const zodiacData: Array<{ sign: string; hindiSign: string; startMonth: number; startDay: number; endMonth: number; endDay: number }> = [
    { sign: 'Capricorn', hindiSign: 'मकर', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { sign: 'Aquarius', hindiSign: 'कुम्भ', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { sign: 'Pisces', hindiSign: 'मीन', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { sign: 'Aries', hindiSign: 'मेष', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { sign: 'Taurus', hindiSign: 'वृषभ', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { sign: 'Gemini', hindiSign: 'मिथुन', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { sign: 'Cancer', hindiSign: 'कर्क', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { sign: 'Leo', hindiSign: 'सिंह', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { sign: 'Virgo', hindiSign: 'कन्या', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { sign: 'Libra', hindiSign: 'तुला', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { sign: 'Scorpio', hindiSign: 'वृश्चिक', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { sign: 'Sagittarius', hindiSign: 'धनु', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  ];
  for (const z of zodiacData) {
    if (z.startMonth === 12 && z.endMonth === 1) {
      if ((month === 12 && day >= z.startDay) || (month === 1 && day <= z.endDay)) return { sign: z.sign, hindiSign: z.hindiSign };
    } else {
      if ((month === z.startMonth && day >= z.startDay) || (month === z.endMonth && day <= z.endDay)) return { sign: z.sign, hindiSign: z.hindiSign };
    }
  }
  return { sign: 'Aries', hindiSign: 'मेष' };
}

export const generatePalmReadingPDF = async (analysis: PalmAnalysis, userName?: string, language?: string, userDob?: string, readingUrl?: string, dbReadingId?: string): Promise<void> => {
  // Set global Hindi mode flag
  isHindiPdf = language === 'hi';
  
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const bottomMargin = pageHeight - 25;
  let yPos = margin;
  let currentPage = 1;

  // For Hindi, we need to use a font that supports Devanagari
  // jsPDF's default fonts don't support Devanagari, so for Hindi we use transliteration as fallback
  // but keep the content more readable than the previous aggressive stripping
  if (isHindiPdf) {
    // Unfortunately jsPDF standard fonts can't render Devanagari glyphs
    // We'll use IAST transliteration but preserve the structure better
    isHindiPdf = false; // Fall back to transliteration but with better mapping
  }

  const primaryColor: [number, number, number] = [255, 102, 0];
  const secondaryColor: [number, number, number] = [128, 0, 128];
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const successColor: [number, number, number] = [34, 139, 34];
  const goldColor: [number, number, number] = [218, 165, 32];
  const saffronColor: [number, number, number] = [255, 153, 51];
  const deepRed: [number, number, number] = [139, 0, 0];

  const readingId = `BV-${Date.now().toString(36).toUpperCase()}`;
  const zodiac = userDob ? getZodiacFromDob(userDob) : null;

  // ===== CORE HELPERS =====

  const drawSwastik = (cx: number, cy: number, size: number) => {
    doc.setDrawColor(...saffronColor);
    doc.setLineWidth(0.8);
    const s = size;
    doc.line(cx - s, cy, cx + s, cy);
    doc.line(cx, cy - s, cx, cy + s);
    doc.line(cx + s, cy, cx + s, cy - s);
    doc.line(cx - s, cy, cx - s, cy + s);
    doc.line(cx, cy - s, cx - s, cy - s);
    doc.line(cx, cy + s, cx + s, cy + s);
  };

  const drawBorder = () => {
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
    drawSwastik(18, 18, 3);
    drawSwastik(pageWidth - 18, 18, 3);
    drawSwastik(18, pageHeight - 18, 3);
    drawSwastik(pageWidth - 18, pageHeight - 18, 3);
  };

  const addWatermark = () => {
    doc.saveGraphicsState();
    doc.setFontSize(50);
    doc.setTextColor(240, 235, 225);
    doc.setFont('helvetica', 'bold');
    // Rotate text for watermark effect — approximate with positioned text
    doc.text('BhaktVerse', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();
  };

  const addPageFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reading ID: ${readingId}`, margin, pageHeight - 8);
    doc.text('BhaktVerse AI Palm Reading Report', pageWidth / 2, pageHeight - 8, { align: 'center' });
  };

  const drawOmHeader = (y: number) => {
    doc.setFontSize(16);
    doc.setTextColor(...saffronColor);
    doc.setFont('helvetica', 'bold');
    doc.text('|| Om ||', pageWidth / 2, y, { align: 'center' });
  };

  const checkPageBreak = (neededSpace: number): void => {
    if (yPos + neededSpace > bottomMargin) {
      addPageFooter();
      doc.addPage();
      currentPage++;
      yPos = margin + 5;
      drawBorder();
      addWatermark();
    }
  };

  // Page-aware wrapped text — splits text into lines and checks page breaks during rendering
  const addWrappedTextSafe = (text: string, x: number, maxWidth: number, lineHeight: number, maxChars?: number): void => {
    const safeText = getSafeText(text, 'Analysis not available');
    const capped = maxChars ? truncate(safeText, maxChars) : safeText;
    const lines: string[] = doc.splitTextToSize(capped, maxWidth);

    for (let i = 0; i < lines.length; i++) {
      checkPageBreak(lineHeight + 2);
      doc.text(lines[i], x, yPos);
      yPos += lineHeight;
    }
  };

  const addSectionDivider = () => {
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(0.5);
    doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
    const cx = pageWidth / 2;
    doc.setFillColor(...goldColor);
    doc.circle(cx, yPos, 1.5, 'F');
    doc.circle(cx - 8, yPos, 0.8, 'F');
    doc.circle(cx + 8, yPos, 0.8, 'F');
    yPos += 6;
  };

  const addThinDivider = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);
    yPos += 4;
  };

  const drawRatingBar = (x: number, y: number, rating: number, width: number = 50) => {
    const barHeight = 4;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, width, barHeight, 2, 2, 'F');
    const fillWidth = (rating / 10) * width;
    if (rating >= 8) doc.setFillColor(34, 139, 34);
    else if (rating >= 6) doc.setFillColor(218, 165, 32);
    else doc.setFillColor(220, 50, 50);
    doc.roundedRect(x, y, fillWidth, barHeight, 2, 2, 'F');
  };

  const addSectionHeader = (title: string) => {
    checkPageBreak(40);
    addThinDivider();
    yPos += 2;
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 10;
  };

  // ========== PAGE 1: COVER PAGE ==========
  doc.setFillColor(255, 250, 240);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  drawBorder();
  addWatermark();

  doc.setFontSize(11);
  doc.setTextColor(...deepRed);
  doc.setFont('helvetica', 'bold');
  doc.text('|| Shri Ganeshaya Namah ||', pageWidth / 2, 28, { align: 'center' });

  drawOmHeader(42);

  doc.setFontSize(10);
  doc.setTextColor(...goldColor);
  doc.text('* * * * * * *', pageWidth / 2, 52, { align: 'center' });

  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('AI GURU PALM READING', pageWidth / 2, 70, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.text('Vedic Kundali-Style Analysis Report', pageWidth / 2, 83, { align: 'center' });

  // User info box
  doc.setFillColor(255, 243, 224);
  const infoBoxH = zodiac ? 75 : 65;
  doc.roundedRect(margin + 15, 95, contentWidth - 30, infoBoxH, 5, 5, 'F');
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(1);
  doc.roundedRect(margin + 15, 95, contentWidth - 30, infoBoxH, 5, 5, 'S');

  const safeUserName = getSafeText(userName, 'Seeker');
  let infoY = 110;

  doc.setFontSize(16);
  doc.setTextColor(...deepRed);
  doc.setFont('helvetica', 'bold');
  doc.text(safeUserName, pageWidth / 2, infoY, { align: 'center' });
  infoY += 10;

  if (zodiac) {
    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Zodiac / Rashi: ${zodiac.sign} (${getSafeText(zodiac.hindiSign)})`, pageWidth / 2, infoY, { align: 'center' });
    infoY += 8;
  }

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Palm Type: ${getSafeText(analysis.palmType, 'Analyzed')}`, pageWidth / 2, infoY, { align: 'center' });
  infoY += 7;
  doc.text(`Dominant Planet: ${getSafeText(analysis.dominantPlanet, 'Multiple')}`, pageWidth / 2, infoY, { align: 'center' });
  infoY += 7;

  if (analysis.nakshatra) {
    const sn = getSafeText(analysis.nakshatra);
    if (sn) {
      doc.text(`Nakshatra: ${sn}`, pageWidth / 2, infoY, { align: 'center' });
      infoY += 7;
    }
  }

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(`Report ID: ${readingId}`, pageWidth / 2, infoY + 3, { align: 'center' });

  // Scores
  const scoreBoxY = zodiac ? 180 : 170;
  if (analysis.overallScore || analysis.confidenceScore) {
    doc.setFillColor(232, 245, 233);
    const halfW = (contentWidth - 50) / 2 - 5;
    doc.roundedRect(margin + 25, scoreBoxY, halfW, 35, 3, 3, 'F');
    doc.roundedRect(pageWidth / 2 + 5, scoreBoxY, halfW, 35, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setTextColor(...successColor);
    doc.setFont('helvetica', 'bold');
    const c1 = margin + 25 + halfW / 2;
    const c2 = pageWidth / 2 + 5 + halfW / 2;
    doc.text('Overall Score', c1, scoreBoxY + 13, { align: 'center' });
    doc.setFontSize(18);
    const rawScore = analysis.overallScore || 8.0;
    const displayScore = rawScore > 10 ? (rawScore / 10).toFixed(1) : rawScore.toString();
    doc.text(`${displayScore}/10`, c1, scoreBoxY + 28, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Confidence', c2, scoreBoxY + 13, { align: 'center' });
    doc.setFontSize(18);
    doc.text(`${analysis.confidenceScore || 85}%`, c2, scoreBoxY + 28, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, scoreBoxY + 50, { align: 'center' });

  if (language === 'hi') {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('(Hindi content displayed in Roman transliteration / IAST for PDF compatibility)', pageWidth / 2, scoreBoxY + 58, { align: 'center' });
  }

  // QR Code for online reading link
  const shareId = dbReadingId || readingId;
  const qrUrl = readingUrl || `https://bhaktverse.lovable.app/palm-reading/shared/${shareId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#8B0000', light: '#FFF8DC' },
      errorCorrectionLevel: 'M',
    });
    const qrSize = 28;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = scoreBoxY + 62;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Scan to view & share your reading online', pageWidth / 2, qrY + qrSize + 4, { align: 'center' });
  } catch (qrErr) {
    console.warn('QR code generation failed:', qrErr);
  }

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Powered by BhaktVerse AI - Vedic Palm Reading', pageWidth / 2, pageHeight - 20, { align: 'center' });
  addPageFooter();

  // ========== PAGE 2: TABLE OF CONTENTS ==========
  doc.addPage();
  currentPage++;
  drawBorder();
  addWatermark();
  drawOmHeader(22);
  yPos = 30;

  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLE OF CONTENTS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  addSectionDivider();

  const tocItems = [
    { title: 'Report Summary Dashboard', page: '3' },
    { title: "Guru Ji's Blessing & Life Path", page: '3' },
    { title: 'Palm Line Analysis (Rekha Vigyan)', page: '4' },
    { title: 'Mount Analysis (Parvat Vigyan)', page: '4-5' },
    { title: 'Hand Type Analysis (Tatva)', page: '5' },
    { title: 'Secondary Lines (Dvitiyak Rekha)', page: '5-6' },
    { title: 'Finger & Nail Analysis (Anguli)', page: '6' },
    { title: 'Category Predictions (7 Areas)', page: '6-8' },
    { title: 'Lucky Elements (Shubh Tatva)', page: '8-9' },
    { title: 'Recommended Mantras', page: '9' },
    { title: 'Special Yogas Detected', page: '9' },
    { title: 'Remedies & Recommendations', page: '9-10' },
    { title: "Guru Ji's Final Blessings", page: '10' },
  ];

  tocItems.forEach((item, i) => {
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    const titleTxt = `${i + 1}. ${item.title}`;
    const titleWidth = doc.getTextWidth(titleTxt);
    doc.text(titleTxt, margin + 5, yPos);

    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(item.page, pageWidth - margin - 5, yPos, { align: 'right' });

    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const dotStart = margin + 5 + titleWidth + 3;
    const dotEnd = pageWidth - margin - 5 - doc.getTextWidth(item.page) - 3;
    let dotX = dotStart;
    while (dotX < dotEnd) {
      doc.text('.', dotX, yPos);
      dotX += 2;
    }
    yPos += 8;
  });

  addPageFooter();

  // ========== PAGE 3: SUMMARY DASHBOARD ==========
  doc.addPage();
  currentPage++;
  drawBorder();
  addWatermark();
  drawOmHeader(22);
  yPos = 30;

  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT SUMMARY DASHBOARD', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  addSectionDivider();

  // Category rating bars
  if (analysis.categories) {
    const cats = Object.entries(analysis.categories);
    const colWidth = (contentWidth - 10) / 2;

    cats.forEach(([key, category], i) => {
      if (!category) return;
      const col = i % 2;
      const x = margin + (col * (colWidth + 10));
      if (col === 0 && i > 0) yPos += 14;
      const rowY = yPos;

      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(CATEGORY_TITLES[key] || key, x, rowY);

      doc.setTextColor(...primaryColor);
      doc.text(`${category.rating || 8}/10`, x + colWidth - 15, rowY);
      drawRatingBar(x, rowY + 2, category.rating || 8, colWidth - 20);
    });
    yPos += 20;
  }

  yPos += 10;
  addThinDivider();

  // Greeting
  if (analysis.greeting) {
    checkPageBreak(40);
    const safeGreeting = getSafeText(analysis.greeting, 'Welcome to your personalized palm reading.');
    const greetingLines: string[] = doc.splitTextToSize(safeGreeting, contentWidth - 20);
    const greetingHeight = Math.min(greetingLines.length * 5 + 20, 50);

    doc.setFillColor(255, 248, 240);
    doc.roundedRect(margin, yPos, contentWidth, greetingHeight, 3, 3, 'F');
    doc.setDrawColor(...goldColor);
    doc.roundedRect(margin, yPos, contentWidth, greetingHeight, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text("GURU JI'S BLESSING", margin + 10, yPos + 8);

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'italic');
    doc.text(greetingLines.slice(0, 5), margin + 10, yPos + 18);

    yPos += greetingHeight + 10;
  }

  // Destiny
  if (analysis.overallDestiny) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('YOUR LIFE PATH & DESTINY', margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    addWrappedTextSafe(analysis.overallDestiny, margin, contentWidth, 5, 600);
    yPos += 10;
  }

  addPageFooter();

  // ========== LINE ANALYSIS ==========
  if (analysis.lineAnalysis) {
    addSectionHeader('PALM LINE ANALYSIS (Rekha Vigyan)');

    Object.entries(analysis.lineAnalysis).forEach(([key, line]) => {
      if (!line) return;
      checkPageBreak(30);

      const lineName = LINE_NAMES[key] || key;
      doc.setFillColor(248, 248, 255);
      doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(lineName, margin + 3, yPos + 6);

      if (line.rating) {
        doc.setTextColor(...primaryColor);
        doc.text(`${line.rating}/10`, pageWidth - margin - 15, yPos + 6);
        drawRatingBar(pageWidth - margin - 65, yPos + 2, line.rating, 40);
      }
      yPos += 12;

      if (line.observed) {
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        addWrappedTextSafe(line.observed, margin + 3, contentWidth - 6, 4, 200);
        yPos += 2;
      }

      if (line.meaning) {
        doc.setFontSize(9);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'italic');
        addWrappedTextSafe(`Meaning: ${getSafeText(line.meaning)}`, margin + 3, contentWidth - 6, 4, 200);
      }
      yPos += 6;
    });
  }

  addPageFooter();

  // ========== MOUNT ANALYSIS ==========
  if (analysis.mountAnalysis) {
    addSectionHeader('MOUNT ANALYSIS (Parvat Vigyan)');

    Object.entries(analysis.mountAnalysis).forEach(([key, mount]) => {
      if (!mount) return;
      checkPageBreak(10);

      const mountName = MOUNT_NAMES[key] || key;
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${mountName}:`, margin + 3, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      const safeStrength = getSafeText(mount.strength, 'Moderate');
      const safeMeaning = getSafeText(mount.meaning || mount.observed, '');
      doc.text(truncate(`${safeStrength} - ${safeMeaning}`, 80), margin + 35, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  addPageFooter();

  // ========== HAND TYPE ANALYSIS ==========
  if (analysis.handTypeAnalysis) {
    addSectionHeader('HAND TYPE ANALYSIS (Tatva Vigyan)');

    const ht = analysis.handTypeAnalysis;
    const htItems = [
      { label: 'Classification', value: ht.classification || 'N/A' },
      { label: 'Tatva Element', value: ht.tatvaElement || 'N/A' },
      { label: 'Palm Shape', value: ht.palmShape || 'N/A' },
      { label: 'Finger-to-Palm Ratio', value: ht.fingerToPalmRatio || 'N/A' },
    ];

    htItems.forEach(item => {
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.label}:`, margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(getSafeText(item.value), margin + 45, yPos);
      yPos += 6;
    });

    if (ht.personalityProfile) {
      yPos += 2;
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'italic');
      addWrappedTextSafe(ht.personalityProfile, margin + 3, contentWidth - 6, 4, 250);
      yPos += 4;
    }

    if (ht.strengths && ht.strengths.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(...successColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Strengths:', margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(truncate(ht.strengths.map(s => getSafeText(s)).join(', '), 90), margin + 25, yPos);
      yPos += 6;
    }

    if (ht.challenges && ht.challenges.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(220, 150, 50);
      doc.setFont('helvetica', 'bold');
      doc.text('Challenges:', margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(truncate(ht.challenges.map(c => getSafeText(c)).join(', '), 90), margin + 28, yPos);
      yPos += 6;
    }
    yPos += 5;
  }

  // ========== SECONDARY LINES ==========
  if (analysis.secondaryLines) {
    addSectionHeader('SECONDARY LINES (Dvitiyak Rekha)');

    const sl = analysis.secondaryLines;
    const secLineItems = [
      { name: 'Marriage Lines', info: sl.marriageLines ? `Count: ${sl.marriageLines.count || 0}, Depth: ${getSafeText(sl.marriageLines.depth)}` : null, interp: sl.marriageLines?.interpretation },
      { name: 'Children Lines', info: sl.childrenLines ? `Count: ${sl.childrenLines.count || 0}` : null, interp: sl.childrenLines?.interpretation },
      { name: 'Health Line', info: sl.healthLine?.present ? getSafeText(sl.healthLine.description) : 'Not prominent', interp: sl.healthLine?.interpretation },
      { name: 'Travel Lines', info: sl.travelLines ? `Count: ${sl.travelLines.count || 0}` : null, interp: sl.travelLines?.interpretation },
      { name: 'Intuition Line', info: sl.intuitionLine?.present ? 'Present' : 'Not visible', interp: sl.intuitionLine?.interpretation },
      { name: 'Girdle of Venus', info: sl.girdleOfVenus?.present ? 'Present' : 'Not visible', interp: sl.girdleOfVenus?.interpretation },
    ];

    secLineItems.forEach(item => {
      if (!item.info && !item.interp) return;
      checkPageBreak(14);
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.name}:`, margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(truncate(getSafeText(item.info || ''), 50), margin + 35, yPos);
      yPos += 5;
      if (item.interp) {
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'italic');
        const lines: string[] = doc.splitTextToSize(truncate(getSafeText(item.interp), 150), contentWidth - 10);
        doc.text(lines.slice(0, 2), margin + 5, yPos);
        yPos += lines.slice(0, 2).length * 4;
      }
      yPos += 2;
    });
    yPos += 5;
  }

  // ========== FINGER & NAIL ANALYSIS ==========
  if (analysis.fingerAnalysis) {
    addSectionHeader('FINGER & NAIL ANALYSIS (Anguli Vigyan)');

    const fa = analysis.fingerAnalysis;
    const fingerItems = [
      { label: 'Thumb Flexibility', value: fa.thumbFlexibility ? `${getSafeText(fa.thumbFlexibility.type)} - ${getSafeText(fa.thumbFlexibility.meaning)}` : null },
      { label: 'Finger Gaps', value: fa.fingerGaps ? `${getSafeText(fa.fingerGaps.observed)} (${getSafeText(fa.fingerGaps.financialControl)})` : null },
      { label: 'Ring vs Index', value: fa.ringVsIndex ? `${getSafeText(fa.ringVsIndex.dominant)} - ${getSafeText(fa.ringVsIndex.confidenceLevel)}` : null },
      { label: 'Nail Shape', value: fa.nailShape ? `${getSafeText(fa.nailShape.type)} - ${getSafeText(fa.nailShape.healthIndicator)}` : null },
      { label: 'Proportions', value: fa.fingerProportions ? `${getSafeText(fa.fingerProportions.details)} (${getSafeText(fa.fingerProportions.personality)})` : null },
    ];

    fingerItems.forEach(item => {
      if (!item.value) return;
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.label}:`, margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      const lines: string[] = doc.splitTextToSize(truncate(item.value, 100), contentWidth - 45);
      doc.text(lines.slice(0, 2), margin + 38, yPos);
      yPos += lines.slice(0, 2).length * 5 + 2;
    });
    yPos += 5;
  }

  addPageFooter();

  // ========== CATEGORY PREDICTIONS ==========
  if (analysis.categories) {
    doc.addPage();
    currentPage++;
    drawBorder();
    addWatermark();
    drawOmHeader(22);
    yPos = 30;

    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED CATEGORY PREDICTIONS', margin, yPos);
    yPos += 12;

    Object.entries(analysis.categories).forEach(([key, category]) => {
      if (!category) return;

      checkPageBreak(50);
      addThinDivider();

      // Category header
      doc.setFillColor(248, 248, 255);
      doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
      doc.setDrawColor(...goldColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'S');

      const title = CATEGORY_TITLES[key] || key;
      doc.setFontSize(11);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 3, yPos + 7);

      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(`${category.rating || 8}/10`, pageWidth - margin - 18, yPos + 7);
      drawRatingBar(pageWidth - margin - 70, yPos + 3, category.rating || 8, 45);
      yPos += 14;

      // Prediction text — capped at 1200 chars
      if (category.prediction) {
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        addWrappedTextSafe(category.prediction, margin + 3, contentWidth - 6, 4, 1200);
      }

      // Observed Features
      if (category.observedFeatures && category.observedFeatures.length > 0) {
        yPos += 3;
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Observations:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(truncate(category.observedFeatures.slice(0, 3).map((f: string) => getSafeText(f)).join(' | '), 80), margin + 35, yPos);
        yPos += 4;
      }

      // Guidance — capped at 200 chars, rendered with page awareness
      if (category.guidance) {
        checkPageBreak(18);
        const safeGuidance = truncate(getSafeText(category.guidance), 200);
        const guidanceLines: string[] = doc.splitTextToSize(`Guidance: ${safeGuidance}`, contentWidth - 10);
        const cappedLines = guidanceLines.slice(0, 4);
        const guidanceHeight = cappedLines.length * 4 + 6;

        doc.setFillColor(232, 245, 233);
        doc.roundedRect(margin + 2, yPos - 2, contentWidth - 4, guidanceHeight, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setTextColor(46, 125, 50);
        doc.text(cappedLines, margin + 5, yPos + 2);
        yPos += guidanceHeight + 4;
      }

      yPos += 6;
    });
  }

  addPageFooter();

  // ========== LUCKY ELEMENTS ==========
  if (analysis.luckyElements) {
    addSectionHeader('LUCKY ELEMENTS (Shubh Tatva)');

    const elements = [
      { label: 'Colors', values: analysis.luckyElements.colors },
      { label: 'Gemstones', values: analysis.luckyElements.gemstones },
      { label: 'Auspicious Days', values: analysis.luckyElements.days },
      { label: 'Lucky Numbers', values: analysis.luckyElements.numbers?.map(String) },
      { label: 'Directions', values: analysis.luckyElements.directions },
      { label: 'Metals', values: analysis.luckyElements.metals },
    ];

    elements.forEach(elem => {
      if (!elem.values || elem.values.length === 0) return;
      checkPageBreak(8);
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${elem.label}:`, margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(truncate(elem.values.map(v => getSafeText(String(v))).join(', '), 70), margin + 40, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  // ========== MANTRAS ==========
  if (analysis.luckyElements?.mantras && analysis.luckyElements.mantras.length > 0) {
    addSectionHeader('RECOMMENDED MANTRAS');

    analysis.luckyElements.mantras.slice(0, 3).forEach(mantra => {
      checkPageBreak(25);

      if (typeof mantra === 'string') {
        const safeMantra = getSafeText(mantra);
        const mLines: string[] = doc.splitTextToSize(safeMantra, contentWidth - 14);
        const mHeight = Math.max(mLines.length * 5 + 6, 18);

        doc.setFillColor(255, 248, 240);
        doc.roundedRect(margin, yPos, contentWidth, mHeight, 2, 2, 'F');
        doc.setDrawColor(...goldColor);
        doc.roundedRect(margin, yPos, contentWidth, mHeight, 2, 2, 'S');

        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'italic');
        doc.text(mLines.slice(0, 3), margin + 5, yPos + 6);
        yPos += mHeight + 4;
      } else {
        const transText = getSafeText(mantra.transliteration || mantra.sanskrit);
        const meaningText = getSafeText(mantra.meaning);
        const tLines: string[] = doc.splitTextToSize(transText, contentWidth - 14);
        const meLines: string[] = meaningText ? doc.splitTextToSize(meaningText, contentWidth - 14) : [];
        const mHeight = tLines.length * 5 + meLines.slice(0, 2).length * 4 + 10;

        doc.setFillColor(255, 248, 240);
        doc.roundedRect(margin, yPos, contentWidth, mHeight, 2, 2, 'F');
        doc.setDrawColor(...goldColor);
        doc.roundedRect(margin, yPos, contentWidth, mHeight, 2, 2, 'S');

        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(tLines.slice(0, 2), margin + 5, yPos + 7);

        if (meaningText) {
          doc.setFontSize(8);
          doc.setTextColor(...mutedColor);
          doc.setFont('helvetica', 'italic');
          doc.text(meLines.slice(0, 2), margin + 5, yPos + 7 + tLines.slice(0, 2).length * 5 + 2);
        }
        yPos += mHeight + 4;
      }
    });
  }

  // ========== YOGAS ==========
  if (analysis.yogas && analysis.yogas.length > 0) {
    addSectionHeader('SPECIAL YOGAS DETECTED');

    analysis.yogas.slice(0, 5).forEach(yoga => {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      const safeYoga = getSafeText(yoga);
      const lines: string[] = doc.splitTextToSize(`* ${truncate(safeYoga, 150)}`, contentWidth - 10);
      doc.text(lines.slice(0, 2), margin + 3, yPos);
      yPos += lines.slice(0, 2).length * 4 + 2;
    });
    yPos += 5;
  }

  // ========== REMEDIES ==========
  if (analysis.remedies && analysis.remedies.length > 0) {
    addSectionHeader('REMEDIES & RECOMMENDATIONS (Upay)');

    analysis.remedies.slice(0, 7).forEach((remedy, index) => {
      checkPageBreak(12);
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      const safeRemedy = getSafeText(remedy);
      const lines: string[] = doc.splitTextToSize(`${index + 1}. ${truncate(safeRemedy, 200)}`, contentWidth - 10);
      doc.text(lines.slice(0, 3), margin + 3, yPos);
      yPos += lines.slice(0, 3).length * 4 + 2;
    });
    yPos += 5;
  }

  // ========== WARNINGS ==========
  if (analysis.warnings && analysis.warnings.length > 0) {
    addSectionHeader('CAUTION PERIODS');
    // Override header color for warnings
    doc.setTextColor(220, 50, 50);

    analysis.warnings.slice(0, 5).forEach(warning => {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      const safeWarning = getSafeText(warning);
      const lines: string[] = doc.splitTextToSize(`! ${truncate(safeWarning, 150)}`, contentWidth - 10);
      doc.text(lines.slice(0, 2), margin + 3, yPos);
      yPos += lines.slice(0, 2).length * 4 + 2;
    });
    yPos += 5;
  }

  // ========== BLESSINGS (FINAL) ==========
  if (analysis.blessings) {
    checkPageBreak(50);
    addThinDivider();

    const safeBlessings = truncate(getSafeText(analysis.blessings), 500);
    const blessingLines: string[] = doc.splitTextToSize(safeBlessings, contentWidth - 20);
    const cappedBlessingLines = blessingLines.slice(0, 8);
    const blessingHeight = cappedBlessingLines.length * 5 + 20;

    doc.setFillColor(255, 248, 225);
    doc.roundedRect(margin, yPos, contentWidth, blessingHeight, 5, 5, 'F');
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, contentWidth, blessingHeight, 5, 5, 'S');

    doc.setFontSize(12);
    doc.setTextColor(...goldColor);
    doc.setFont('helvetica', 'bold');
    doc.text("GURU JI'S BLESSINGS", pageWidth / 2, yPos + 10, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'italic');
    doc.text(cappedBlessingLines, margin + 10, yPos + 20);

    yPos += blessingHeight + 10;
  }

  // Final disclaimer
  checkPageBreak(30);
  addThinDivider();
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('This report is generated by BhaktVerse AI based on Vedic palmistry traditions (Samudrika Shastra).', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('For spiritual guidance purposes. Consult a qualified astrologer for specific advice.', pageWidth / 2, yPos, { align: 'center' });

  addPageFooter();

  // Add page numbers to all pages
  const totalPageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save
  const safeName = getSafeText(userName, 'Seeker').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`BhaktVerse_Palm_Reading_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
