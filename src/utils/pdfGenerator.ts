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
};

function transliterate(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [hindi, roman] of Object.entries(transliterationMap)) {
    result = result.replace(new RegExp(hindi, 'g'), roman);
  }
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
  result = result
    .replace(/[\u0900-\u097F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return result;
}

function getSafeText(text: string | undefined | null, fallback: string = ''): string {
  if (!text) return fallback;
  const transliterated = transliterate(text);
  return transliterated || fallback;
}

export const generatePalmReadingPDF = (analysis: PalmAnalysis, userName?: string, language?: string): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  let currentPage = 1;
  let totalPages = 0; // Will be set at end

  const primaryColor: [number, number, number] = [255, 102, 0];
  const secondaryColor: [number, number, number] = [128, 0, 128];
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const successColor: [number, number, number] = [34, 139, 34];
  const goldColor: [number, number, number] = [218, 165, 32];

  const readingId = `BV-${Date.now().toString(36).toUpperCase()}`;

  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const safeText = getSafeText(text, 'Analysis not available');
    const lines = doc.splitTextToSize(safeText, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  const checkPageBreak = (neededSpace: number): void => {
    if (yPos + neededSpace > pageHeight - 25) {
      doc.addPage();
      currentPage++;
      yPos = margin + 5;
      addPageFooter();
    }
  };

  const drawBorder = () => {
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
  };

  const addPageFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reading ID: ${readingId}`, margin, pageHeight - 8);
    doc.text(`BhaktVerse AI Palm Reading Report`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  };

  const addSectionDivider = () => {
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(0.5);
    const lineY = yPos;
    doc.line(margin + 20, lineY, pageWidth - margin - 20, lineY);
    // Decorative diamond in center
    const cx = pageWidth / 2;
    doc.setFillColor(...goldColor);
    doc.circle(cx, lineY, 1.5, 'F');
    doc.circle(cx - 8, lineY, 0.8, 'F');
    doc.circle(cx + 8, lineY, 0.8, 'F');
    yPos += 6;
  };

  const drawRatingBar = (x: number, y: number, rating: number, width: number = 50) => {
    const barHeight = 4;
    // Background
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, width, barHeight, 2, 2, 'F');
    // Filled portion
    const fillWidth = (rating / 10) * width;
    if (rating >= 8) doc.setFillColor(34, 139, 34);
    else if (rating >= 6) doc.setFillColor(218, 165, 32);
    else doc.setFillColor(220, 50, 50);
    doc.roundedRect(x, y, fillWidth, barHeight, 2, 2, 'F');
  };

  // ========== PAGE 1: COVER PAGE ==========
  doc.setFillColor(255, 250, 240);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  drawBorder();

  doc.setFontSize(12);
  doc.setTextColor(...goldColor);
  const symbols = '☉ ☽ ♂ ☿ ♃ ♀ ♄';
  doc.text(symbols, pageWidth / 2, 40, { align: 'center' });

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

  // User info box
  doc.setFillColor(255, 243, 224);
  doc.roundedRect(margin + 15, 100, contentWidth - 30, 65, 5, 5, 'F');
  doc.setDrawColor(...goldColor);
  doc.roundedRect(margin + 15, 100, contentWidth - 30, 65, 5, 5, 'S');

  const infoY = 115;
  const safeUserName = getSafeText(userName, 'Seeker');
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Name: ${safeUserName}`, pageWidth / 2, infoY, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Palm Type: ${getSafeText(analysis.palmType, 'Analyzed')}`, pageWidth / 2, infoY + 10, { align: 'center' });
  doc.text(`Dominant Planet: ${getSafeText(analysis.dominantPlanet, 'Multiple')}`, pageWidth / 2, infoY + 20, { align: 'center' });
  
  if (analysis.nakshatra) {
    const safeNakshatra = getSafeText(analysis.nakshatra);
    if (safeNakshatra) doc.text(`Nakshatra: ${safeNakshatra}`, pageWidth / 2, infoY + 30, { align: 'center' });
  }

  // Reading ID
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text(`Report ID: ${readingId}`, pageWidth / 2, infoY + 42, { align: 'center' });

  // Scores
  if (analysis.overallScore || analysis.confidenceScore) {
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(margin + 25, 178, (contentWidth - 50) / 2 - 5, 35, 3, 3, 'F');
    doc.roundedRect(pageWidth / 2 + 5, 178, (contentWidth - 50) / 2 - 5, 35, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(...successColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Score', margin + 25 + (contentWidth - 50) / 4 - 2.5, 191, { align: 'center' });
    doc.setFontSize(18);
    doc.text(`${analysis.overallScore || 8.0}/10`, margin + 25 + (contentWidth - 50) / 4 - 2.5, 206, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Confidence', pageWidth / 2 + 5 + (contentWidth - 50) / 4 - 2.5, 191, { align: 'center' });
    doc.setFontSize(18);
    doc.text(`${analysis.confidenceScore || 85}%`, pageWidth / 2 + 5 + (contentWidth - 50) / 4 - 2.5, 206, { align: 'center' });
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, 230, { align: 'center' });

  if (language === 'hi') {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('(Transliterated from Hindi for PDF compatibility)', pageWidth / 2, 240, { align: 'center' });
  }

  doc.setTextColor(...goldColor);
  doc.text(symbols, pageWidth / 2, 258, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Powered by BhaktVerse AI - Vedic Palm Reading', pageWidth / 2, pageHeight - 20, { align: 'center' });
  addPageFooter();

  // ========== PAGE 2: TABLE OF CONTENTS ==========
  doc.addPage();
  currentPage++;
  drawBorder();
  yPos = margin + 10;

  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLE OF CONTENTS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  addSectionDivider();

  const tocItems = [
    { title: 'Report Summary Dashboard', page: '3' },
    { title: "Guru Ji's Blessing & Life Path", page: '3' },
    { title: 'Palm Line Analysis (Rekha Vigyan)', page: '4' },
    { title: 'Mount Analysis (Parvat Vigyan)', page: '4-5' },
    { title: 'Category Predictions (7 Areas)', page: '5-8' },
    { title: 'Lucky Elements (Shubh Tatva)', page: '8-9' },
    { title: 'Recommended Mantras', page: '9' },
    { title: 'Special Yogas Detected', page: '9-10' },
    { title: 'Remedies & Recommendations', page: '10' },
    { title: "Guru Ji's Final Blessings", page: '10-11' },
  ];

  tocItems.forEach((item, i) => {
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    
    // Dotted line
    const titleWidth = doc.getTextWidth(`${i + 1}. ${item.title}`);
    doc.text(`${i + 1}. ${item.title}`, margin + 5, yPos);
    
    // Page number right-aligned
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(item.page, pageWidth - margin - 5, yPos, { align: 'right' });
    
    // Dots
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
  yPos = margin + 10;

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
      const rowY = col === 0 ? yPos : yPos;
      
      // Title
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(CATEGORY_TITLES[key] || key, x, rowY);
      
      // Rating number
      doc.setTextColor(...primaryColor);
      doc.text(`${category.rating || 8}/10`, x + colWidth - 15, rowY);
      
      // Rating bar
      drawRatingBar(x, rowY + 2, category.rating || 8, colWidth - 20);
    });
    
    yPos += 20;
  }

  yPos += 10;
  addSectionDivider();

  // Greeting & Destiny on same page
  if (analysis.greeting) {
    checkPageBreak(40);
    doc.setFillColor(255, 248, 240);
    const safeGreeting = getSafeText(analysis.greeting, 'Welcome to your personalized palm reading.');
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

  addPageFooter();

  // ========== LINE ANALYSIS ==========
  if (analysis.lineAnalysis) {
    checkPageBreak(20);
    addSectionDivider();
    
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
        // Rating bar
        drawRatingBar(pageWidth - margin - 65, yPos + 2, line.rating, 40);
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
        yPos = addWrappedText(`Meaning: ${getSafeText(line.meaning)}`, margin + 3, yPos, contentWidth - 6, 4);
      }
      
      yPos += 6;
    });
  }

  addPageFooter();

  // ========== MOUNT ANALYSIS ==========
  if (analysis.mountAnalysis) {
    checkPageBreak(20);
    addSectionDivider();
    
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
      
      yPos += 6;
    });
    
    yPos += 5;
  }

  addPageFooter();

  // ========== CATEGORY PREDICTIONS ==========
  if (analysis.categories) {
    doc.addPage();
    currentPage++;
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
      const estimatedHeight = 30 + Math.min((predictionLength / 80) * 5, 80);
      checkPageBreak(Math.min(estimatedHeight, 90));

      // Section divider before each category
      addSectionDivider();

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
      
      // Rating with bar
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(`${category.rating || 8}/10`, pageWidth - margin - 18, yPos + 7);
      drawRatingBar(pageWidth - margin - 70, yPos + 3, category.rating || 8, 45);
      
      yPos += 14;

      // Prediction text - increased limit to 3000
      if (category.prediction) {
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        
        const maxChars = 3000;
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
        const safeFeatures = category.observedFeatures.slice(0, 3).map((f: string) => getSafeText(f)).join(' | ');
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

      yPos += 8;
    });
  }

  addPageFooter();

  // ========== LUCKY ELEMENTS ==========
  if (analysis.luckyElements) {
    checkPageBreak(60);
    addSectionDivider();
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('LUCKY ELEMENTS (Shubh Tatva)', margin, yPos);
    yPos += 10;

    const elements = [
      { label: 'Colors', icon: '🎨', values: analysis.luckyElements.colors },
      { label: 'Gemstones', icon: '💎', values: analysis.luckyElements.gemstones },
      { label: 'Auspicious Days', icon: '📅', values: analysis.luckyElements.days },
      { label: 'Lucky Numbers', icon: '🔢', values: analysis.luckyElements.numbers?.map(String) },
      { label: 'Directions', icon: '🧭', values: analysis.luckyElements.directions },
      { label: 'Metals', icon: '⚗️', values: analysis.luckyElements.metals },
    ];

    elements.forEach((elem) => {
      if (!elem.values || elem.values.length === 0) return;

      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${elem.label}:`, margin + 3, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      const safeValues = elem.values.map(v => getSafeText(String(v))).join(', ');
      doc.text(safeValues.substring(0, 70), margin + 40, yPos);
      
      yPos += 6;
    });

    yPos += 5;
  }

  // ========== MANTRAS ==========
  if (analysis.luckyElements?.mantras && analysis.luckyElements.mantras.length > 0) {
    checkPageBreak(40);
    addSectionDivider();
    
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

  // ========== YOGAS ==========
  if (analysis.yogas && analysis.yogas.length > 0) {
    checkPageBreak(30);
    addSectionDivider();

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('SPECIAL YOGAS DETECTED', margin, yPos);
    yPos += 10;

    analysis.yogas.slice(0, 5).forEach((yoga, index) => {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      const safeYoga = getSafeText(yoga);
      const lines = doc.splitTextToSize(`* ${safeYoga}`, contentWidth - 10);
      doc.text(lines.slice(0, 2), margin + 3, yPos);
      yPos += lines.slice(0, 2).length * 4 + 2;
    });
    yPos += 5;
  }

  // ========== REMEDIES ==========
  if (analysis.remedies && analysis.remedies.length > 0) {
    checkPageBreak(40);
    addSectionDivider();
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('REMEDIES & RECOMMENDATIONS (Upay)', margin, yPos);
    yPos += 10;

    analysis.remedies.slice(0, 7).forEach((remedy, index) => {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      const safeRemedy = getSafeText(remedy);
      const lines = doc.splitTextToSize(`${index + 1}. ${safeRemedy}`, contentWidth - 10);
      doc.text(lines.slice(0, 3), margin + 3, yPos);
      yPos += lines.slice(0, 3).length * 4 + 2;
    });

    yPos += 5;
  }

  // ========== WARNINGS ==========
  if (analysis.warnings && analysis.warnings.length > 0) {
    checkPageBreak(30);
    addSectionDivider();

    doc.setFontSize(14);
    doc.setTextColor(220, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('CAUTION PERIODS', margin, yPos);
    yPos += 10;

    analysis.warnings.slice(0, 5).forEach((warning, index) => {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      const safeWarning = getSafeText(warning);
      const lines = doc.splitTextToSize(`! ${safeWarning}`, contentWidth - 10);
      doc.text(lines.slice(0, 2), margin + 3, yPos);
      yPos += lines.slice(0, 2).length * 4 + 2;
    });
    yPos += 5;
  }

  // ========== BLESSINGS (FINAL) ==========
  if (analysis.blessings) {
    checkPageBreak(50);
    addSectionDivider();
    
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
  checkPageBreak(30);
  addSectionDivider();
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('This report is generated by BhaktVerse AI based on Vedic palmistry traditions (Samudrika Shastra).', pageWidth / 2, yPos, { align: 'center' });
  doc.text('For entertainment and spiritual guidance purposes. Consult a qualified astrologer for specific advice.', pageWidth / 2, yPos + 5, { align: 'center' });
  
  doc.setTextColor(...goldColor);
  doc.text(symbols, pageWidth / 2, yPos + 15, { align: 'center' });

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

  // Save the PDF
  const safeName = getSafeText(userName, 'Seeker').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`BhaktVerse_Palm_Reading_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
