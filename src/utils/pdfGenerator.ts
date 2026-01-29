import jsPDF from 'jspdf';

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
    moon?: MountAnalysis;
  };
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

// Hindi/Sanskrit to transliteration mapping for common terms
const transliterationMap: Record<string, string> = {
  // Common spiritual terms
  'ॐ': 'Om',
  'श्री': 'Shri',
  'जी': 'Ji',
  'नमस्ते': 'Namaste',
  'नमः': 'Namah',
  'मंत्र': 'Mantra',
  'शुभ': 'Shubh',
  'अशुभ': 'Ashubh',
  'भाग्य': 'Bhagya',
  'ग्रह': 'Graha',
  'राशि': 'Rashi',
  'नक्षत्र': 'Nakshatra',
  'दोष': 'Dosha',
  'योग': 'Yoga',
  'कर्म': 'Karma',
  'धर्म': 'Dharma',
  'पूजा': 'Puja',
  'आरती': 'Aarti',
  'प्रणाम': 'Pranam',
  'आशीर्वाद': 'Ashirvad',
  'सूर्य': 'Surya',
  'चंद्र': 'Chandra',
  'मंगल': 'Mangal',
  'बुध': 'Budh',
  'गुरु': 'Guru',
  'शुक्र': 'Shukra',
  'शनि': 'Shani',
  'राहु': 'Rahu',
  'केतु': 'Ketu',
  'हृदय': 'Hridaya',
  'रेखा': 'Rekha',
  'पर्वत': 'Parvat',
  'जीवन': 'Jeevan',
  'प्रेम': 'Prem',
  'स्वास्थ्य': 'Swasthya',
  'शिक्षा': 'Shiksha',
  'परिवार': 'Parivar',
  'संतान': 'Santan',
  'विवाह': 'Vivah',
  'आध्यात्मिक': 'Adhyatmik',
  'यात्रा': 'Yatra',
  // Common greetings
  'बेटा': 'Beta',
  'बेटी': 'Beti',
  'बच्चे': 'Bachche',
  'प्रिय': 'Priya',
  'आप': 'Aap',
  'हाथ': 'Hath',
  'देखता': 'Dekhta',
  'हूं': 'Hoon',
  'में': 'Mein',
  'है': 'Hai',
  'और': 'Aur',
  'के': 'Ke',
  'को': 'Ko',
  'से': 'Se',
  'पर': 'Par',
  'बहुत': 'Bahut',
  'अच्छा': 'Achha',
  'खुश': 'Khush',
  'प्यार': 'Pyaar',
};

// Transliterate Hindi/Sanskrit text to romanized form
function transliterate(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  // Replace known Hindi terms with transliterations
  for (const [hindi, roman] of Object.entries(transliterationMap)) {
    result = result.replace(new RegExp(hindi, 'g'), roman);
  }
  
  // For remaining Devanagari, use a simple character-by-character approach
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
  
  // Remove any remaining non-ASCII characters and zero-width chars
  result = result
    .replace(/[\u0900-\u097F]/g, '') // Any remaining Devanagari
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width chars
    .replace(/[^\x00-\x7F]/g, '') // Any non-ASCII
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return result;
}

// Get safe text for PDF with transliteration
function getSafeText(text: string | undefined | null, fallback: string = ''): string {
  if (!text) return fallback;
  const transliterated = transliterate(text);
  return transliterated || fallback;
}

export const generatePalmReadingPDF = (analysis: PalmAnalysis, userName?: string, language?: string): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Colors (RGB)
  const primaryColor: [number, number, number] = [255, 102, 0];
  const secondaryColor: [number, number, number] = [128, 0, 128];
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const successColor: [number, number, number] = [34, 139, 34];
  const goldColor: [number, number, number] = [218, 165, 32];

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const safeText = getSafeText(text, 'Analysis not available');
    const lines = doc.splitTextToSize(safeText, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Helper to check page break
  const checkPageBreak = (neededSpace: number): void => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Draw decorative border
  const drawBorder = () => {
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
  };

  // ========== COVER PAGE ==========
  doc.setFillColor(255, 250, 240);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  drawBorder();

  // Planetary symbols header
  doc.setFontSize(12);
  doc.setTextColor(...goldColor);
  const symbols = '☉ ☽ ♂ ☿ ♃ ♀ ♄';
  doc.text(symbols, pageWidth / 2, 40, { align: 'center' });

  // Om Symbol
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('Om', pageWidth / 2, 55, { align: 'center' });

  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('AI GURU PALM READING', pageWidth / 2, 75, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.text('Vedic Kundali-Style Analysis Report', pageWidth / 2, 88, { align: 'center' });

  // User info box with decorative styling
  doc.setFillColor(255, 243, 224);
  doc.roundedRect(margin + 15, 105, contentWidth - 30, 55, 5, 5, 'F');
  doc.setDrawColor(...goldColor);
  doc.roundedRect(margin + 15, 105, contentWidth - 30, 55, 5, 5, 'S');

  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  
  const infoY = 120;
  const safeUserName = getSafeText(userName, 'Seeker');
  doc.text(`Name: ${safeUserName}`, pageWidth / 2, infoY, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  const safePalmType = getSafeText(analysis.palmType, 'Analyzed');
  const safeDominantPlanet = getSafeText(analysis.dominantPlanet, 'Multiple');
  doc.text(`Palm Type: ${safePalmType}`, pageWidth / 2, infoY + 12, { align: 'center' });
  doc.text(`Dominant Planet: ${safeDominantPlanet}`, pageWidth / 2, infoY + 24, { align: 'center' });
  
  if (analysis.nakshatra) {
    const safeNakshatra = getSafeText(analysis.nakshatra);
    if (safeNakshatra) {
      doc.text(`Nakshatra: ${safeNakshatra}`, pageWidth / 2, infoY + 36, { align: 'center' });
    }
  }

  // Scores with visual representation
  if (analysis.overallScore || analysis.confidenceScore) {
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(margin + 25, 170, (contentWidth - 50) / 2 - 5, 35, 3, 3, 'F');
    doc.roundedRect(pageWidth / 2 + 5, 170, (contentWidth - 50) / 2 - 5, 35, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(...successColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Score', margin + 25 + (contentWidth - 50) / 4 - 2.5, 183, { align: 'center' });
    doc.setFontSize(18);
    doc.text(`${analysis.overallScore || 8.0}/10`, margin + 25 + (contentWidth - 50) / 4 - 2.5, 198, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Confidence', pageWidth / 2 + 5 + (contentWidth - 50) / 4 - 2.5, 183, { align: 'center' });
    doc.setFontSize(18);
    doc.text(`${analysis.confidenceScore || 85}%`, pageWidth / 2 + 5 + (contentWidth - 50) / 4 - 2.5, 198, { align: 'center' });
  }

  // Language note
  if (language === 'hi') {
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'italic');
    doc.text('(Transliterated from Hindi for PDF compatibility)', pageWidth / 2, 220, { align: 'center' });
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 240, { align: 'center' });

  // Footer symbols
  doc.setTextColor(...goldColor);
  doc.text(symbols, pageWidth / 2, 265, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text('Powered by BhaktVerse AI - Vedic Palm Reading', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ========== PAGE 2: GREETING & DESTINY ==========
  doc.addPage();
  drawBorder();
  yPos = margin + 10;

  // AI Guru Greeting
  if (analysis.greeting) {
    const safeGreeting = getSafeText(analysis.greeting, 'Welcome to your personalized palm reading.');
    doc.setFillColor(255, 248, 240);
    const greetingLines = doc.splitTextToSize(safeGreeting, contentWidth - 20);
    const greetingHeight = Math.max(greetingLines.length * 5 + 20, 35);
    doc.roundedRect(margin, yPos, contentWidth, greetingHeight, 3, 3, 'F');
    doc.setDrawColor(...goldColor);
    doc.roundedRect(margin, yPos, contentWidth, greetingHeight, 3, 3, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('GURU JI\'S BLESSING', margin + 10, yPos + 8);
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'italic');
    doc.text(greetingLines, margin + 10, yPos + 18);
    
    yPos += greetingHeight + 10;
  }

  // Overall Destiny
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
    yPos = addWrappedText(analysis.overallDestiny, margin, yPos, contentWidth, 5);
    yPos += 10;
  }

  // ========== LINE ANALYSIS ==========
  if (analysis.lineAnalysis) {
    checkPageBreak(20);
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('PALM LINE ANALYSIS (Rekha Vigyan)', margin, yPos);
    yPos += 10;

    Object.entries(analysis.lineAnalysis).forEach(([key, line]) => {
      if (!line) return;
      
      checkPageBreak(35);
      
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
      }
      
      yPos += 12;
      
      if (line.observed) {
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        yPos = addWrappedText(line.observed, margin + 3, yPos, contentWidth - 6, 4);
        yPos += 2;
      }
      
      if (line.meaning) {
        doc.setFontSize(9);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'italic');
        const safeMeaning = getSafeText(line.meaning);
        yPos = addWrappedText(`Meaning: ${safeMeaning}`, margin + 3, yPos, contentWidth - 6, 4);
      }
      
      yPos += 6;
    });
  }

  // ========== MOUNT ANALYSIS ==========
  if (analysis.mountAnalysis) {
    checkPageBreak(20);
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('MOUNT ANALYSIS (Parvat Vigyan)', margin, yPos);
    yPos += 10;

    Object.entries(analysis.mountAnalysis).forEach(([key, mount]) => {
      if (!mount) return;
      
      checkPageBreak(20);
      
      const mountName = MOUNT_NAMES[key] || key;
      
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${mountName}:`, margin + 3, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      const safeStrength = getSafeText(mount.strength, 'Moderate');
      const safeMeaning = getSafeText(mount.meaning || mount.observed, '');
      const mountInfo = `${safeStrength} - ${safeMeaning}`.substring(0, 80);
      doc.text(mountInfo, margin + 35, yPos);
      
      yPos += 5;
    });
    
    yPos += 5;
  }

  // ========== CATEGORY PREDICTIONS ==========
  if (analysis.categories) {
    doc.addPage();
    drawBorder();
    yPos = margin + 10;
    
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED CATEGORY PREDICTIONS', margin, yPos);
    yPos += 12;

    Object.entries(analysis.categories).forEach(([key, category]) => {
      if (!category) return;

      const predictionLength = category.prediction?.length || 0;
      const estimatedHeight = 30 + Math.min((predictionLength / 100) * 5, 60);
      checkPageBreak(Math.min(estimatedHeight, 80));

      // Category header with decorative styling
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
      
      // Rating
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(`Rating: ${category.rating || 8}/10`, pageWidth - margin - 25, yPos + 7);
      
      yPos += 14;

      // Prediction text
      if (category.prediction) {
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        
        // Truncate for PDF
        const maxChars = 1500;
        const safePrediction = getSafeText(category.prediction);
        const truncatedPrediction = safePrediction.length > maxChars 
          ? safePrediction.substring(0, maxChars) + '...' 
          : safePrediction;
        
        yPos = addWrappedText(truncatedPrediction, margin + 3, yPos, contentWidth - 6, 4);
      }
      
      // Observed Features
      if (category.observedFeatures && category.observedFeatures.length > 0) {
        yPos += 3;
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Observations:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        const safeFeatures = category.observedFeatures.slice(0, 3).map(f => getSafeText(f)).join(' | ');
        doc.text(safeFeatures.substring(0, 80), margin + 35, yPos);
        yPos += 4;
      }

      // Guidance
      if (category.guidance) {
        checkPageBreak(15);
        doc.setFillColor(232, 245, 233);
        const safeGuidance = getSafeText(category.guidance);
        const guidanceLines = doc.splitTextToSize(`Guidance: ${safeGuidance}`, contentWidth - 10);
        const guidanceHeight = Math.min(guidanceLines.length * 4 + 4, 25);
        doc.roundedRect(margin + 2, yPos - 2, contentWidth - 4, guidanceHeight, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setTextColor(46, 125, 50);
        doc.text(guidanceLines.slice(0, 5), margin + 5, yPos + 2);
        yPos += guidanceHeight + 4;
      }

      yPos += 6;
    });
  }

  // ========== LUCKY ELEMENTS ==========
  if (analysis.luckyElements) {
    checkPageBreak(60);
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('LUCKY ELEMENTS (Shubh Tatva)', margin, yPos);
    yPos += 10;

    const elements = [
      { label: 'Colors', values: analysis.luckyElements.colors },
      { label: 'Gemstones', values: analysis.luckyElements.gemstones },
      { label: 'Auspicious Days', values: analysis.luckyElements.days },
      { label: 'Lucky Numbers', values: analysis.luckyElements.numbers?.map(String) },
      { label: 'Directions', values: analysis.luckyElements.directions },
      { label: 'Metals', values: analysis.luckyElements.metals },
    ];

    elements.forEach((elem) => {
      if (!elem.values || elem.values.length === 0) return;

      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(elem.label, margin + 3, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      const safeValues = elem.values.map(v => getSafeText(String(v))).join(', ');
      doc.text(safeValues.substring(0, 60), margin + 40, yPos);
      
      yPos += 5;
    });

    yPos += 5;
  }

  // ========== MANTRAS ==========
  if (analysis.luckyElements?.mantras && analysis.luckyElements.mantras.length > 0) {
    checkPageBreak(40);
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDED MANTRAS', margin, yPos);
    yPos += 10;

    analysis.luckyElements.mantras.slice(0, 3).forEach((mantra) => {
      checkPageBreak(20);
      
      doc.setFillColor(255, 248, 240);
      doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');
      doc.setDrawColor(...goldColor);
      doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'S');
      
      if (typeof mantra === 'string') {
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'italic');
        doc.text(getSafeText(mantra), margin + 5, yPos + 11);
      } else {
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(getSafeText(mantra.transliteration || mantra.sanskrit), margin + 5, yPos + 7);
        
        if (mantra.meaning) {
          doc.setFontSize(8);
          doc.setTextColor(...mutedColor);
          doc.setFont('helvetica', 'italic');
          doc.text(getSafeText(mantra.meaning).substring(0, 80), margin + 5, yPos + 14);
        }
      }
      
      yPos += 22;
    });
  }

  // ========== REMEDIES ==========
  if (analysis.remedies && analysis.remedies.length > 0) {
    checkPageBreak(40);
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('REMEDIES & RECOMMENDATIONS (Upay)', margin, yPos);
    yPos += 10;

    analysis.remedies.slice(0, 5).forEach((remedy, index) => {
      checkPageBreak(10);
      
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      
      const safeRemedy = getSafeText(remedy);
      const lines = doc.splitTextToSize(`${index + 1}. ${safeRemedy}`, contentWidth - 10);
      doc.text(lines.slice(0, 2), margin + 3, yPos);
      yPos += lines.slice(0, 2).length * 4 + 2;
    });

    yPos += 5;
  }

  // ========== BLESSINGS (FINAL PAGE) ==========
  if (analysis.blessings) {
    checkPageBreak(50);
    
    doc.setFillColor(255, 248, 225);
    const safeBlessings = getSafeText(analysis.blessings);
    const blessingLines = doc.splitTextToSize(safeBlessings, contentWidth - 20);
    const blessingHeight = blessingLines.length * 5 + 20;
    doc.roundedRect(margin, yPos, contentWidth, blessingHeight, 5, 5, 'F');
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, contentWidth, blessingHeight, 5, 5, 'S');
    
    doc.setFontSize(12);
    doc.setTextColor(...goldColor);
    doc.setFont('helvetica', 'bold');
    doc.text('GURU JI\'S BLESSINGS', pageWidth / 2, yPos + 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'italic');
    doc.text(blessingLines, margin + 10, yPos + 20);
    
    yPos += blessingHeight + 10;
  }

  // Final footer
  checkPageBreak(20);
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('This report is generated by BhaktVerse AI based on Vedic palmistry traditions (Samudrika Shastra).', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('For entertainment and spiritual guidance purposes. Consult a qualified astrologer for specific advice.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  const safeName = getSafeText(userName, 'Seeker').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`BhaktVerse_Palm_Reading_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
