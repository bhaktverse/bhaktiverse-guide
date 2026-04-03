import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// ===== INTERFACES =====
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
  visibility?: string;
  depth?: string;
  curvature?: string;
  startPoint?: string;
  endPoint?: string;
  markings?: string[];
  samudrikaInterpretation?: string;
  prediction?: string;
}

interface MountAnalysis {
  strength?: string;
  observed?: string;
  meaning?: string;
  rating?: number;
  development?: string;
  markings?: string[];
  interpretation?: string;
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

interface TimingPredictions {
  next_1_year?: string;
  next_3_years?: string;
  next_7_years?: string;
  age_of_peak_success?: string;
  health_alert_periods?: string[];
  financial_growth_periods?: string[];
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
    mercuryLine?: LineAnalysis;
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
  timingPredictions?: TimingPredictions;
  quadrangleAndGreatTriangle?: {
    quadrangle?: { shape?: string; interpretation?: string };
    greatTriangle?: { shape?: string; interpretation?: string };
  };
  specialMarkings?: {
    stars?: Array<{ location?: string; interpretation?: string }>;
    crosses?: Array<{ location?: string; interpretation?: string }>;
    triangles?: Array<{ location?: string; interpretation?: string }>;
    squares?: Array<{ location?: string; interpretation?: string }>;
    grilles?: Array<{ location?: string; interpretation?: string }>;
    mysticCross?: { present?: boolean; interpretation?: string };
    simianLine?: { present?: boolean; interpretation?: string };
    ringOfSolomon?: { present?: boolean; interpretation?: string };
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

// ===== CONSTANTS =====
const SAFFRON: [number, number, number] = [255, 102, 0];
const GOLD: [number, number, number] = [218, 165, 32];
const TEXT: [number, number, number] = [40, 40, 40];
const MUTED: [number, number, number] = [120, 120, 120];
const GREEN: [number, number, number] = [34, 139, 34];
const RED: [number, number, number] = [200, 50, 50];
const BG: [number, number, number] = [250, 248, 245];
const CARD_BG: [number, number, number] = [255, 252, 248];
const SECTION_BG: [number, number, number] = [245, 240, 235];
const PURPLE: [number, number, number] = [128, 60, 128];

const LINE_COLORS: Record<string, [number, number, number]> = {
  lifeLine: [34, 139, 34],
  heartLine: [200, 50, 80],
  headLine: [50, 100, 200],
  fateLine: [128, 60, 128],
  sunLine: [218, 165, 32],
  mercuryLine: [50, 150, 150],
};

const LINE_LABELS: Record<string, { en: string; hi: string }> = {
  lifeLine: { en: 'Life Line', hi: 'Jeevan Rekha' },
  heartLine: { en: 'Heart Line', hi: 'Hriday Rekha' },
  headLine: { en: 'Head Line', hi: 'Mastishk Rekha' },
  fateLine: { en: 'Fate Line', hi: 'Bhagya Rekha' },
  sunLine: { en: 'Sun Line', hi: 'Surya Rekha' },
  mercuryLine: { en: 'Mercury Line', hi: 'Buddh Rekha' },
};

const MOUNT_LABELS: Record<string, string> = {
  jupiter: 'Guru (Jupiter)',
  saturn: 'Shani (Saturn)',
  apollo: 'Surya (Apollo)',
  mercury: 'Budh (Mercury)',
  venus: 'Shukra (Venus)',
  mars: 'Mangal (Mars)',
  marsUpper: 'Upper Mars',
  marsLower: 'Lower Mars',
  moon: 'Chandra (Luna)',
};

const CATEGORY_LABELS: Record<string, string> = {
  career: 'Career & Finance',
  love: 'Love & Relationships',
  health: 'Health & Vitality',
  family: 'Family & Children',
  education: 'Education & Wisdom',
  spiritual: 'Spiritual Growth',
  travel: 'Travel & Fortune',
};

function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

function getZodiacFromDob(dob: string): { sign: string; hindiSign: string } {
  if (!dob) return { sign: '', hindiSign: '' };
  const date = new Date(dob);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const zodiacData = [
    { sign: 'Capricorn', hindiSign: 'Makar', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { sign: 'Aquarius', hindiSign: 'Kumbh', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { sign: 'Pisces', hindiSign: 'Meen', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { sign: 'Aries', hindiSign: 'Mesh', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { sign: 'Taurus', hindiSign: 'Vrishabh', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { sign: 'Gemini', hindiSign: 'Mithun', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { sign: 'Cancer', hindiSign: 'Kark', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { sign: 'Leo', hindiSign: 'Singh', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { sign: 'Virgo', hindiSign: 'Kanya', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { sign: 'Libra', hindiSign: 'Tula', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { sign: 'Scorpio', hindiSign: 'Vrishchik', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { sign: 'Sagittarius', hindiSign: 'Dhanu', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  ];
  for (const z of zodiacData) {
    if (z.startMonth === 12 && z.endMonth === 1) {
      if ((month === 12 && day >= z.startDay) || (month === 1 && day <= z.endDay)) return z;
    } else {
      if ((month === z.startMonth && day >= z.startDay) || (month === z.endMonth && day <= z.endDay)) return z;
    }
  }
  return { sign: 'Aries', hindiSign: 'Mesh' };
}

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.substring(0, maxLen - 3) + '...';
}

function safeStr(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  return String(val) || fallback;
}

// ===== FONT LOADING =====
let devanagariLoaded = false;

async function loadDevanagariFont(doc: jsPDF): Promise<boolean> {
  try {
    const resp = await fetch('/fonts/NotoSansDevanagari-Regular.ttf');
    if (!resp.ok) return false;
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    doc.addFileToVFS('NotoSansDevanagari.ttf', b64);
    doc.addFont('NotoSansDevanagari.ttf', 'NotoSansDevanagari', 'normal');
    devanagariLoaded = true;
    return true;
  } catch {
    console.warn('Devanagari font load failed, using fallback');
    return false;
  }
}

function setFont(doc: jsPDF, text: string, style: 'normal' | 'bold' | 'italic' = 'normal') {
  if (devanagariLoaded && containsDevanagari(text)) {
    doc.setFont('NotoSansDevanagari', 'normal');
  } else {
    doc.setFont('helvetica', style);
  }
}

function safeText(doc: jsPDF, text: string, x: number, y: number, options?: any) {
  setFont(doc, text);
  doc.text(text, x, y, options);
}

// ===== MAIN EXPORT =====
export const generatePalmReadingPDF = async (
  analysis: PalmAnalysis,
  userName?: string,
  language?: string,
  userDob?: string,
  readingUrl?: string,
  dbReadingId?: string
): Promise<void> => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const M = 14; // margin
  const CW = W - M * 2; // content width
  const BM = H - 18; // bottom margin
  let y = M;
  const readingId = `BV-${Date.now().toString(36).toUpperCase()}`;
  const zodiac = userDob ? getZodiacFromDob(userDob) : null;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const name = safeStr(userName, 'Seeker');

  // Load Devanagari font
  await loadDevanagariFont(doc);

  // ===== HELPERS =====
  const addFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text('Hasta Rekha Vishleshan Report', M, H - 8);
    doc.text('For guidance purposes only · Not a substitute for medical or legal advice', W / 2, H - 8, { align: 'center' });
  };

  const newPage = () => {
    addFooter();
    doc.addPage();
    y = M;
    doc.setFillColor(...BG);
    doc.rect(0, 0, W, H, 'F');
  };

  const checkSpace = (need: number) => {
    if (y + need > BM) newPage();
  };

  const drawPill = (x: number, py: number, label: string, value: string, w: number) => {
    doc.setFillColor(240, 237, 232);
    doc.roundedRect(x, py, w, 12, 3, 3, 'F');
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + w / 2, py + 4.5, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(...TEXT);
    doc.setFont('helvetica', 'bold');
    doc.text(truncate(value, 20), x + w / 2, py + 9.5, { align: 'center' });
  };

  const sectionHeader = (num: number, titleEn: string, titleHi: string) => {
    checkSpace(16);
    doc.setFontSize(13);
    doc.setTextColor(...SAFFRON);
    doc.setFont('helvetica', 'bold');
    doc.text(`${num}`, M, y + 5);
    doc.setFontSize(11);
    doc.text(titleEn, M + 8, y + 5);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'italic');
    doc.text(titleHi, M + 8 + doc.getTextWidth(titleEn + '  '), y + 5);
    y += 10;
  };

  const wrapText = (text: string, x: number, maxW: number, lh: number, maxChars?: number) => {
    const t = maxChars ? truncate(safeStr(text), maxChars) : safeStr(text);
    if (!t) return;
    setFont(doc, t);
    const lines: string[] = doc.splitTextToSize(t, maxW);
    for (const line of lines) {
      checkSpace(lh + 1);
      setFont(doc, line);
      doc.text(line, x, y);
      y += lh;
    }
  };

  const drawProgressBar = (x: number, py: number, rating: number, w: number = 40) => {
    const h = 3;
    doc.setFillColor(225, 220, 215);
    doc.roundedRect(x, py, w, h, 1.5, 1.5, 'F');
    const fill = Math.min((rating / 10) * w, w);
    if (rating >= 8) doc.setFillColor(...GREEN);
    else if (rating >= 5) doc.setFillColor(...GOLD);
    else doc.setFillColor(...RED);
    doc.roundedRect(x, py, fill, h, 1.5, 1.5, 'F');
  };

  // ========== PAGE 1: COVER ==========
  doc.setFillColor(...BG);
  doc.rect(0, 0, W, H, 'F');

  // Top banner
  doc.setFillColor(60, 45, 35);
  doc.rect(0, 0, W, 40, 'F');
  doc.setFontSize(7);
  doc.setTextColor(180, 160, 140);
  doc.setFont('helvetica', 'normal');
  const headerLetters = 'H A S T A   R E K H A   V I S H L E S H A N  ·  S A M U D R I K A   S H A S T R A';
  doc.text(headerLetters, W / 2, 12, { align: 'center' });

  // Title
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Full Palm Reading Report', W / 2, 26, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(200, 180, 160);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive analysis — Indian + Western palmistry', W / 2, 34, { align: 'center' });

  y = 50;

  // Meta pills row
  const pillW = (CW - 12) / 4;
  drawPill(M, y, 'Client name', name, pillW);
  drawPill(M + pillW + 4, y, 'Rashi / Zodiac', zodiac ? `${zodiac.sign} (${zodiac.hindiSign})` : 'N/A', pillW);
  drawPill(M + (pillW + 4) * 2, y, 'Hand analyzed', safeStr(analysis.palmType, 'Both'), pillW);
  drawPill(M + (pillW + 4) * 3, y, 'Report date', dateStr, pillW);
  y += 20;

  // Confidence indicator
  if (analysis.confidenceScore) {
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(M, y, CW, 10, 3, 3, 'F');
    doc.setFillColor(...GREEN);
    doc.circle(M + 6, y + 5, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT);
    doc.setFont('helvetica', 'normal');
    doc.text(`Image quality: ${analysis.confidenceScore >= 80 ? 'High' : analysis.confidenceScore >= 50 ? 'Medium' : 'Low'} — Confidence: ${analysis.confidenceScore}%`, M + 12, y + 6);
    y += 16;
  }

  // Score cards
  if (analysis.overallScore) {
    const halfW = (CW - 6) / 2;
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(M, y, halfW, 28, 4, 4, 'F');
    doc.roundedRect(M + halfW + 6, y, halfW, 28, 4, 4, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text('Overall Score', M + halfW / 2, y + 10, { align: 'center' });
    doc.text('Accuracy Confidence', M + halfW + 6 + halfW / 2, y + 10, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(...SAFFRON);
    doc.setFont('helvetica', 'bold');
    const rawScore = analysis.overallScore > 10 ? (analysis.overallScore / 10).toFixed(1) : String(analysis.overallScore);
    doc.text(`${rawScore}/10`, M + halfW / 2, y + 22, { align: 'center' });
    doc.text(`${analysis.confidenceScore || 85}%`, M + halfW + 6 + halfW / 2, y + 22, { align: 'center' });
    y += 34;
  }

  // Greeting
  if (analysis.greeting) {
    checkSpace(30);
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(M, y, CW, 24, 4, 4, 'F');
    doc.setDrawColor(...SAFFRON);
    doc.setLineWidth(0.8);
    doc.line(M + 3, y + 4, M + 3, y + 20);

    doc.setFontSize(8);
    doc.setTextColor(...SAFFRON);
    doc.setFont('helvetica', 'bold');
    doc.text("Pandit VisionHast's Note", M + 8, y + 8);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT);
    setFont(doc, analysis.greeting, 'italic');
    const greetLines: string[] = doc.splitTextToSize(safeStr(analysis.greeting), CW - 16);
    doc.text(greetLines.slice(0, 3), M + 8, y + 14);
    y += 28;
  }

  // QR code
  const shareId = dbReadingId || readingId;
  const qrUrl = readingUrl || `https://bhaktverse.lovable.app/palm-reading/shared/${shareId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 150, margin: 1, color: { dark: '#3C2D23', light: '#FAF8F5' }, errorCorrectionLevel: 'M' });
    const qrSize = 22;
    doc.addImage(qrDataUrl, 'PNG', (W - qrSize) / 2, y, qrSize, qrSize);
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text('Scan to view & share online', W / 2, y + qrSize + 4, { align: 'center' });
    y += qrSize + 10;
  } catch { /* QR optional */ }

  addFooter();

  // ========== SECTION 1: HAND CONSTITUTION ==========
  newPage();

  sectionHeader(1, 'Hath ka Swaroop', 'Hand Constitution');

  if (analysis.handTypeAnalysis) {
    const ht = analysis.handTypeAnalysis;
    const pw = (CW - 12) / 4;
    drawPill(M, y, 'Hand shape', safeStr(ht.palmShape || ht.classification, 'N/A'), pw);
    drawPill(M + pw + 4, y, 'Finger ratio', safeStr(ht.fingerToPalmRatio, 'N/A'), pw);
    drawPill(M + (pw + 4) * 2, y, 'Tatva element', safeStr(ht.tatvaElement, 'N/A'), pw);
    drawPill(M + (pw + 4) * 3, y, 'Personality', safeStr(ht.classification, 'N/A'), pw);
    y += 18;

    if (ht.personalityProfile) {
      doc.setFillColor(...CARD_BG);
      doc.roundedRect(M, y, CW, 20, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...TEXT);
      setFont(doc, ht.personalityProfile);
      const lines: string[] = doc.splitTextToSize(safeStr(ht.personalityProfile), CW - 10);
      doc.text(lines.slice(0, 4), M + 5, y + 6);
      y += Math.min(lines.length * 4 + 8, 24);
    }

    if (ht.strengths?.length || ht.challenges?.length) {
      y += 4;
      if (ht.strengths?.length) {
        doc.setFontSize(8);
        doc.setTextColor(...GREEN);
        doc.setFont('helvetica', 'bold');
        doc.text('Strengths: ', M, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...TEXT);
        doc.text(truncate(ht.strengths.join(', '), 80), M + 20, y);
        y += 5;
      }
      if (ht.challenges?.length) {
        doc.setFontSize(8);
        doc.setTextColor(...RED);
        doc.setFont('helvetica', 'bold');
        doc.text('Challenges: ', M, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...TEXT);
        doc.text(truncate(ht.challenges.join(', '), 80), M + 22, y);
        y += 5;
      }
    }
    y += 6;
  }

  // ========== SECTION 2: MAJOR LINES ==========
  sectionHeader(2, 'Pramukh Rekhayein', 'Major Palm Lines');

  if (analysis.lineAnalysis) {
    const entries = Object.entries(analysis.lineAnalysis).filter(([, v]) => v);
    const colW = (CW - 6) / 2;

    entries.forEach(([key, line], i) => {
      if (!line) return;
      const col = i % 2;
      const x = M + col * (colW + 6);

      if (col === 0) checkSpace(45);

      const cardY = y;
      doc.setFillColor(...CARD_BG);
      doc.roundedRect(x, cardY, colW, 40, 3, 3, 'F');

      // Color dot + name
      const color = LINE_COLORS[key] || SAFFRON;
      doc.setFillColor(...color);
      doc.circle(x + 5, cardY + 6, 2, 'F');

      const labels = LINE_LABELS[key] || { en: key, hi: '' };
      doc.setFontSize(9);
      doc.setTextColor(...TEXT);
      doc.setFont('helvetica', 'bold');
      doc.text(labels.en, x + 10, cardY + 7);
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'italic');
      doc.text(labels.hi, x + 10 + doc.getTextWidth(labels.en + ' '), cardY + 7);

      // Rating
      if (line.rating) {
        drawProgressBar(x + colW - 30, cardY + 4, line.rating, 25);
      }

      // Attributes
      let attrY = cardY + 13;
      const attrs: [string, string][] = [];
      if (line.depth || line.visibility) attrs.push(['Depth', safeStr(line.depth || line.visibility)]);
      if (line.curvature) attrs.push(['Curvature', safeStr(line.curvature)]);
      if (line.observed) attrs.push(['Observed', truncate(safeStr(line.observed), 30)]);
      if (line.markings?.length) attrs.push(['Markings', truncate(line.markings.join(', '), 30)]);

      attrs.slice(0, 4).forEach(([k, v]) => {
        doc.setFontSize(6.5);
        doc.setTextColor(...MUTED);
        doc.setFont('helvetica', 'normal');
        doc.text(k, x + 5, attrY);
        doc.setTextColor(...TEXT);
        doc.text(v, x + 22, attrY);
        attrY += 4;
      });

      // Prediction or meaning
      const predText = safeStr(line.prediction || line.meaning || line.samudrikaInterpretation, '');
      if (predText) {
        doc.setFontSize(6.5);
        doc.setTextColor(...TEXT);
        setFont(doc, predText);
        const pLines: string[] = doc.splitTextToSize(truncate(predText, 120), colW - 10);
        doc.text(pLines.slice(0, 2), x + 5, attrY + 2);
      }

      if (col === 1 || i === entries.length - 1) {
        y += 44;
      }
    });
  }

  // ========== SECTION 3: AGE TIMELINE ==========
  const tp = analysis.timingPredictions;
  if (tp) {
    checkSpace(80);
    sectionHeader(3, 'Aayu Rekha Timeline', 'Age-based Predictions');

    doc.setFillColor(...CARD_BG);
    doc.roundedRect(M, y, CW, 2, 0, 0, 'F');
    y += 2;

    const timelineItems: { label: string; text: string; active?: boolean }[] = [];
    if (tp.next_1_year) timelineItems.push({ label: 'Next 1 Year', text: tp.next_1_year, active: true });
    if (tp.next_3_years) timelineItems.push({ label: 'Next 3 Years', text: tp.next_3_years });
    if (tp.next_7_years) timelineItems.push({ label: 'Next 7 Years', text: tp.next_7_years });
    if (tp.age_of_peak_success) timelineItems.push({ label: 'Peak Success', text: tp.age_of_peak_success });

    timelineItems.forEach((item, i) => {
      checkSpace(22);
      const dotX = M + 8;

      // Vertical line
      if (i < timelineItems.length - 1) {
        doc.setDrawColor(200, 195, 190);
        doc.setLineWidth(0.5);
        doc.line(dotX, y + 4, dotX, y + 22);
      }

      // Dot
      doc.setFillColor(item.active ? SAFFRON[0] : 180, item.active ? SAFFRON[1] : 175, item.active ? SAFFRON[2] : 170);
      doc.circle(dotX, y + 3, item.active ? 3 : 2, 'F');

      // Label
      doc.setFontSize(9);
      doc.setTextColor(item.active ? SAFFRON[0] : TEXT[0], item.active ? SAFFRON[1] : TEXT[1], item.active ? SAFFRON[2] : TEXT[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, dotX + 8, y + 5);

      // Text
      doc.setFontSize(7.5);
      doc.setTextColor(...TEXT);
      setFont(doc, item.text);
      const lines: string[] = doc.splitTextToSize(truncate(item.text, 200), CW - 30);
      doc.text(lines.slice(0, 2), dotX + 8, y + 10);
      y += Math.max(lines.slice(0, 2).length * 4 + 12, 18);
    });

    // Financial growth periods
    if (tp.financial_growth_periods?.length) {
      y += 2;
      doc.setFontSize(8);
      doc.setTextColor(...GOLD);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Growth Periods:', M + 16, y);
      y += 5;
      tp.financial_growth_periods.slice(0, 3).forEach(p => {
        checkSpace(8);
        doc.setFontSize(7.5);
        doc.setTextColor(...TEXT);
        doc.setFont('helvetica', 'normal');
        wrapText(`> ${p}`, M + 18, CW - 22, 4, 150);
      });
    }
    y += 4;
  }

  // ========== SECTION 4: MOUNTS ==========
  if (analysis.mountAnalysis) {
    sectionHeader(4, 'Parvat', 'Mounts');

    const mounts = Object.entries(analysis.mountAnalysis).filter(([, v]) => v);
    const colW3 = (CW - 8) / 3;

    mounts.forEach(([key, mount], i) => {
      if (!mount) return;
      const col = i % 3;
      const x = M + col * (colW3 + 4);

      if (col === 0) checkSpace(30);

      const cardY = y;
      doc.setFillColor(...CARD_BG);
      doc.roundedRect(x, cardY, colW3, 24, 3, 3, 'F');

      doc.setFontSize(8);
      doc.setTextColor(...PURPLE);
      doc.setFont('helvetica', 'bold');
      doc.text(MOUNT_LABELS[key] || key, x + 3, cardY + 7);

      const dev = safeStr(mount.development || mount.strength, 'Medium');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'normal');
      doc.text(dev, x + 3, cardY + 13);

      // Progress bar
      const r = mount.rating || (dev.includes('Well') || dev.includes('Prominent') || dev.includes('Very') ? 8 : dev.includes('Flat') ? 3 : 5);
      drawProgressBar(x + 3, cardY + 16, r, colW3 - 6);

      // Interpretation snippet
      const interp = truncate(safeStr(mount.interpretation || mount.meaning || mount.observed, ''), 40);
      if (interp) {
        doc.setFontSize(6);
        doc.setTextColor(...MUTED);
        doc.text(interp, x + 3, cardY + 22);
      }

      if (col === 2 || i === mounts.length - 1) {
        y += 28;
      }
    });
  }

  // ========== SECTION 5: MARRIAGE & SECONDARY LINES ==========
  if (analysis.secondaryLines) {
    sectionHeader(5, 'Vivah Rekhayein', 'Marriage & Secondary Lines');
    const sl = analysis.secondaryLines;

    if (sl.marriageLines) {
      doc.setFillColor(...CARD_BG);
      checkSpace(20);
      const mh = 16;
      doc.roundedRect(M, y, CW / 2 - 3, mh, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...PURPLE);
      doc.setFont('helvetica', 'bold');
      doc.text('Marriage Lines', M + 4, y + 6);
      doc.setFontSize(7);
      doc.setTextColor(...TEXT);
      doc.setFont('helvetica', 'normal');
      doc.text(`Count: ${sl.marriageLines.count ?? 'N/A'} · ${safeStr(sl.marriageLines.depth, '')}`, M + 4, y + 11);

      // Children lines
      if (sl.childrenLines) {
        doc.setFillColor(...CARD_BG);
        doc.roundedRect(M + CW / 2 + 3, y, CW / 2 - 3, mh, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...PURPLE);
        doc.setFont('helvetica', 'bold');
        doc.text('Children Lines', M + CW / 2 + 7, y + 6);
        doc.setFontSize(7);
        doc.setTextColor(...TEXT);
        doc.setFont('helvetica', 'normal');
        doc.text(`Count: ${sl.childrenLines.count ?? 'N/A'}`, M + CW / 2 + 7, y + 11);
      }
      y += mh + 4;

      if (sl.marriageLines.interpretation) {
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        setFont(doc, sl.marriageLines.interpretation, 'italic');
        wrapText(sl.marriageLines.interpretation, M + 2, CW - 4, 3.5, 200);
        y += 3;
      }
    }

    // Other secondary lines
    const otherLines: [string, string, string][] = [];
    if (sl.healthLine) otherLines.push(['Health Line', sl.healthLine.present ? 'Present' : 'Not visible', safeStr(sl.healthLine.interpretation)]);
    if (sl.travelLines) otherLines.push(['Travel Lines', `Count: ${sl.travelLines.count ?? 0}`, safeStr(sl.travelLines.interpretation)]);
    if (sl.intuitionLine) otherLines.push(['Intuition Line', sl.intuitionLine.present ? 'Present' : 'Not visible', safeStr(sl.intuitionLine.interpretation)]);
    if (sl.girdleOfVenus) otherLines.push(['Girdle of Venus', sl.girdleOfVenus.present ? 'Present' : 'Not visible', safeStr(sl.girdleOfVenus.interpretation)]);

    otherLines.forEach(([name2, info, interp]) => {
      checkSpace(10);
      doc.setFontSize(7.5);
      doc.setTextColor(...PURPLE);
      doc.setFont('helvetica', 'bold');
      doc.text(`${name2}:`, M + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT);
      doc.text(truncate(info, 40), M + 30, y);
      y += 4;
      if (interp) {
        doc.setFontSize(6.5);
        doc.setTextColor(...MUTED);
        doc.text(truncate(interp, 80), M + 4, y);
        y += 4;
      }
    });
    y += 4;
  }

  // ========== SECTION 6: SPECIAL MARKINGS ==========
  const sm = analysis.specialMarkings;
  if (sm) {
    const hasMarkings = sm.stars?.length || sm.crosses?.length || sm.triangles?.length || sm.squares?.length || sm.grilles?.length || sm.mysticCross?.present || sm.simianLine?.present || sm.ringOfSolomon?.present;
    if (hasMarkings) {
      sectionHeader(6, 'Vishesh Chinh', 'Special Markings');

      const chipData: { symbol: string; label: string; items: Array<{ location?: string; interpretation?: string }> }[] = [];
      if (sm.stars?.length) chipData.push({ symbol: '★', label: 'Star', items: sm.stars });
      if (sm.triangles?.length) chipData.push({ symbol: '◇', label: 'Triangle', items: sm.triangles });
      if (sm.squares?.length) chipData.push({ symbol: '□', label: 'Square', items: sm.squares });
      if (sm.crosses?.length) chipData.push({ symbol: '+', label: 'Cross', items: sm.crosses });
      if (sm.grilles?.length) chipData.push({ symbol: '#', label: 'Grille', items: sm.grilles });

      const chipW = (CW - 8) / Math.min(chipData.length, 3);
      chipData.forEach((chip, i) => {
        const col = i % 3;
        if (col === 0 && i > 0) y += 30;
        if (col === 0) checkSpace(28);
        const x = M + col * (chipW + 4);

        doc.setFillColor(...CARD_BG);
        doc.roundedRect(x, y, chipW, 26, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setTextColor(...SAFFRON);
        doc.setFont('helvetica', 'bold');
        doc.text(chip.symbol, x + 4, y + 9);

        doc.setFontSize(8);
        doc.setTextColor(...TEXT);
        doc.text(chip.label, x + 14, y + 8);

        chip.items.slice(0, 2).forEach((item, j) => {
          doc.setFontSize(6.5);
          doc.setTextColor(...MUTED);
          doc.setFont('helvetica', 'normal');
          doc.text(truncate(`${safeStr(item.location, '')} — ${safeStr(item.interpretation, '')}`, 45), x + 4, y + 14 + j * 5);
        });
      });
      if (chipData.length > 0) y += 30;

      // Special marks (mystic cross, simian, ring of solomon)
      const specials: [string, string][] = [];
      if (sm.mysticCross?.present) specials.push(['Mystic Cross', safeStr(sm.mysticCross.interpretation)]);
      if (sm.simianLine?.present) specials.push(['Simian Line', safeStr(sm.simianLine.interpretation)]);
      if (sm.ringOfSolomon?.present) specials.push(['Ring of Solomon', safeStr(sm.ringOfSolomon.interpretation)]);

      specials.forEach(([n, interp]) => {
        checkSpace(8);
        doc.setFontSize(7.5);
        doc.setTextColor(...GOLD);
        doc.setFont('helvetica', 'bold');
        doc.text(`✦ ${n}:`, M + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...TEXT);
        doc.text(truncate(interp, 60), M + 30, y);
        y += 5;
      });
      y += 4;
    }
  }

  // ========== SECTION 7: REMEDIES ==========
  const hasRemedies = analysis.remedies?.length || analysis.luckyElements?.gemstones?.length || analysis.luckyElements?.mantras?.length;
  if (hasRemedies) {
    sectionHeader(7, 'Upay aur Sujhav', 'Remedies & Recommendations');

    // 2x2 grid
    const halfW = (CW - 6) / 2;
    const cards: { title: string; content: string }[] = [];

    if (analysis.luckyElements?.gemstones?.length) {
      cards.push({ title: 'Ratna (Gemstone)', content: analysis.luckyElements.gemstones.join(', ') });
    }
    if (analysis.luckyElements?.mantras?.length) {
      const m = analysis.luckyElements.mantras[0];
      const mantraText = typeof m === 'string' ? m : safeStr(m.transliteration || m.sanskrit);
      cards.push({ title: 'Mantra', content: mantraText });
    }
    if (analysis.remedies?.length) {
      cards.push({ title: 'Jeevan Sujhav', content: analysis.remedies.slice(0, 2).join('. ') });
    }
    if (analysis.luckyElements?.colors?.length || analysis.luckyElements?.numbers?.length) {
      const lucky: string[] = [];
      if (analysis.luckyElements?.colors?.length) lucky.push(`Colors: ${analysis.luckyElements.colors.join(', ')}`);
      if (analysis.luckyElements?.numbers?.length) lucky.push(`Numbers: ${analysis.luckyElements.numbers.join(', ')}`);
      if (analysis.luckyElements?.days?.length) lucky.push(`Days: ${analysis.luckyElements.days.join(', ')}`);
      cards.push({ title: 'Lucky Elements', content: lucky.join(' · ') });
    }

    cards.slice(0, 4).forEach((card, i) => {
      const col = i % 2;
      const x = M + col * (halfW + 6);
      if (col === 0) checkSpace(30);

      doc.setFillColor(...CARD_BG);
      doc.roundedRect(x, y, halfW, 24, 3, 3, 'F');

      doc.setFontSize(8);
      doc.setTextColor(...SAFFRON);
      doc.setFont('helvetica', 'bold');
      doc.text(card.title, x + 4, y + 7);

      doc.setFontSize(7);
      doc.setTextColor(...TEXT);
      setFont(doc, card.content);
      const lines: string[] = doc.splitTextToSize(truncate(card.content, 100), halfW - 8);
      doc.text(lines.slice(0, 3), x + 4, y + 13);

      if (col === 1 || i === Math.min(cards.length, 4) - 1) y += 28;
    });

    // Additional remedies list
    if (analysis.remedies && analysis.remedies.length > 2) {
      y += 2;
      analysis.remedies.slice(2, 7).forEach((remedy, i) => {
        checkSpace(10);
        doc.setFontSize(7.5);
        doc.setTextColor(...TEXT);
        doc.setFont('helvetica', 'normal');
        wrapText(`${i + 3}. ${remedy}`, M + 2, CW - 4, 3.5, 150);
        y += 1;
      });
    }
    y += 4;
  }

  // ========== SECTION 8: CATEGORY PREDICTIONS ==========
  if (analysis.categories) {
    sectionHeader(8, 'Kshetra Bhavishyavani', 'Category Predictions');

    Object.entries(analysis.categories).forEach(([key, cat]) => {
      if (!cat) return;
      checkSpace(35);

      doc.setFillColor(...CARD_BG);
      doc.roundedRect(M, y, CW, 30, 3, 3, 'F');

      // Header
      doc.setFontSize(9);
      doc.setTextColor(...PURPLE);
      doc.setFont('helvetica', 'bold');
      doc.text(CATEGORY_LABELS[key] || key, M + 4, y + 7);

      doc.setFontSize(8);
      doc.setTextColor(...SAFFRON);
      doc.text(`${cat.rating || 8}/10`, M + CW - 20, y + 7);
      drawProgressBar(M + CW - 60, y + 4, cat.rating || 8, 35);

      // Prediction
      if (cat.prediction) {
        doc.setFontSize(7);
        doc.setTextColor(...TEXT);
        setFont(doc, cat.prediction);
        const lines: string[] = doc.splitTextToSize(truncate(cat.prediction, 300), CW - 10);
        doc.text(lines.slice(0, 4), M + 4, y + 13);
      }

      // Guidance
      if (cat.guidance) {
        doc.setFontSize(6.5);
        doc.setTextColor(...GREEN);
        doc.setFont('helvetica', 'italic');
        doc.text(truncate(`Guidance: ${cat.guidance}`, 100), M + 4, y + 27);
      }

      y += 34;
    });
  }

  // ========== SECTION 9: OVERALL SUMMARY ==========
  checkSpace(60);
  sectionHeader(9, 'Sarvangeen Saar', 'Overall Summary');

  // Summary pills
  const summPillW = (CW - 8) / 3;
  const archetype = safeStr((analysis as any).personalityType, 'Spiritual Seeker');
  const lifeTheme = safeStr((analysis as any).lifeTheme || analysis.overallDestiny, 'Growth & Wisdom');
  const peakAge = safeStr(tp?.age_of_peak_success, 'N/A');

  drawPill(M, y, 'Personality archetype', truncate(archetype, 18), summPillW);
  drawPill(M + summPillW + 4, y, 'Life theme', truncate(lifeTheme, 18), summPillW);
  drawPill(M + (summPillW + 4) * 2, y, 'Peak success age', truncate(peakAge, 18), summPillW);
  y += 18;

  // Yogas
  if (analysis.yogas?.length) {
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text('Special Yogas Detected:', M, y);
    y += 5;
    analysis.yogas.slice(0, 4).forEach(yoga => {
      checkSpace(8);
      doc.setFontSize(7);
      doc.setTextColor(...TEXT);
      doc.setFont('helvetica', 'normal');
      wrapText(`• ${yoga}`, M + 4, CW - 8, 3.5, 120);
    });
    y += 3;
  }

  // Warnings
  if (analysis.warnings?.length) {
    doc.setFontSize(8);
    doc.setTextColor(...RED);
    doc.setFont('helvetica', 'bold');
    doc.text('Caution Periods:', M, y);
    y += 5;
    analysis.warnings.slice(0, 3).forEach(w => {
      checkSpace(8);
      doc.setFontSize(7);
      doc.setTextColor(...TEXT);
      doc.setFont('helvetica', 'normal');
      wrapText(`⚠ ${w}`, M + 4, CW - 8, 3.5, 120);
    });
    y += 3;
  }

  // Jyotishi note
  if (analysis.blessings) {
    checkSpace(30);
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(M, y, CW, 28, 4, 4, 'F');
    doc.setDrawColor(...SAFFRON);
    doc.setLineWidth(1);
    doc.line(M + 3, y + 4, M + 3, y + 24);

    doc.setFontSize(8);
    doc.setTextColor(...SAFFRON);
    doc.setFont('helvetica', 'bold');
    doc.text("Jyotishi ki Tippani — Pandit VisionHast", M + 8, y + 8);

    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT);
    setFont(doc, analysis.blessings, 'italic');
    const bLines: string[] = doc.splitTextToSize(truncate(analysis.blessings, 400), CW - 16);
    doc.text(bLines.slice(0, 4), M + 8, y + 14);
    y += 32;
  }

  // ========== FINAL: DISCLAIMER & PAGE NUMBERS ==========
  checkSpace(15);
  doc.setDrawColor(200, 195, 190);
  doc.setLineWidth(0.3);
  doc.line(M + 20, y, W - M - 20, y);
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reading ID: ${readingId} · Generated: ${dateStr}`, W / 2, y, { align: 'center' });
  y += 4;
  doc.text('Powered by BhaktVerse AI — Samudrika Shastra + Western Chiromancy', W / 2, y, { align: 'center' });

  addFooter();

  // Add page numbers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, W - M, H - 8, { align: 'right' });
  }

  const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`BhaktVerse_Palm_Reading_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
