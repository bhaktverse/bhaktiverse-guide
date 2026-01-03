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

const CATEGORY_ICONS: Record<string, string> = {
  career: '💼',
  love: '❤️',
  health: '💪',
  family: '👨‍👩‍👧‍👦',
  education: '🎓',
  spiritual: '🕉️',
  travel: '✈️'
};

const CATEGORY_TITLES: Record<string, { hi: string; en: string }> = {
  career: { hi: 'करियर एवं धन', en: 'Career & Finance' },
  love: { hi: 'प्रेम एवं रिश्ते', en: 'Love & Relationships' },
  health: { hi: 'स्वास्थ्य एवं शक्ति', en: 'Health & Vitality' },
  family: { hi: 'परिवार एवं संतान', en: 'Family & Children' },
  education: { hi: 'शिक्षा एवं ज्ञान', en: 'Education & Wisdom' },
  spiritual: { hi: 'आध्यात्मिक विकास', en: 'Spiritual Growth' },
  travel: { hi: 'यात्रा एवं भाग्य', en: 'Travel & Fortune' }
};

const LINE_NAMES: Record<string, { hi: string; en: string }> = {
  heartLine: { hi: 'हृदय रेखा', en: 'Heart Line' },
  headLine: { hi: 'मस्तिष्क रेखा', en: 'Head Line' },
  lifeLine: { hi: 'जीवन रेखा', en: 'Life Line' },
  fateLine: { hi: 'भाग्य रेखा', en: 'Fate Line' },
  sunLine: { hi: 'सूर्य रेखा', en: 'Sun Line' }
};

const MOUNT_NAMES: Record<string, { hi: string; en: string }> = {
  jupiter: { hi: 'बृहस्पति पर्वत', en: 'Jupiter Mount' },
  saturn: { hi: 'शनि पर्वत', en: 'Saturn Mount' },
  apollo: { hi: 'सूर्य पर्वत', en: 'Apollo Mount' },
  mercury: { hi: 'बुध पर्वत', en: 'Mercury Mount' },
  venus: { hi: 'शुक्र पर्वत', en: 'Venus Mount' },
  mars: { hi: 'मंगल पर्वत', en: 'Mars Mount' },
  moon: { hi: 'चंद्र पर्वत', en: 'Moon Mount' }
};

export const generatePalmReadingPDF = (analysis: PalmAnalysis, userName?: string): void => {
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

  // Colors
  const primaryColor: [number, number, number] = [255, 102, 0]; // Saffron
  const secondaryColor: [number, number, number] = [128, 0, 128]; // Purple
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const successColor: [number, number, number] = [34, 139, 34];

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
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

  // ========== COVER PAGE ==========
  // Background
  doc.setFillColor(255, 250, 240);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative border
  doc.setDrawColor(255, 153, 51);
  doc.setLineWidth(2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Om symbol
  doc.setFontSize(48);
  doc.setTextColor(255, 102, 0);
  doc.text('🕉️', pageWidth / 2, 50, { align: 'center' });

  // Title
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('AI GURU PALM READING', pageWidth / 2, 75, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(...secondaryColor);
  doc.text('Comprehensive Vedic Analysis Report', pageWidth / 2, 88, { align: 'center' });

  // User info box
  doc.setFillColor(255, 243, 224);
  doc.roundedRect(margin + 20, 105, contentWidth - 40, 50, 5, 5, 'F');
  doc.setDrawColor(255, 153, 51);
  doc.roundedRect(margin + 20, 105, contentWidth - 40, 50, 5, 5, 'S');

  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  
  const infoY = 120;
  if (userName) {
    doc.text(`Name: ${userName}`, pageWidth / 2, infoY, { align: 'center' });
  }
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Palm Type: ${analysis.palmType || 'Analyzed'}`, pageWidth / 2, infoY + 10, { align: 'center' });
  doc.text(`Dominant Planet: ${analysis.dominantPlanet || 'Multiple'}`, pageWidth / 2, infoY + 20, { align: 'center' });
  if (analysis.nakshatra) {
    doc.text(`Nakshatra: ${analysis.nakshatra}`, pageWidth / 2, infoY + 30, { align: 'center' });
  }

  // Scores
  if (analysis.overallScore || analysis.confidenceScore) {
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(margin + 30, 165, (contentWidth - 60) / 2 - 5, 30, 3, 3, 'F');
    doc.roundedRect(pageWidth / 2 + 5, 165, (contentWidth - 60) / 2 - 5, 30, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(...successColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Score`, margin + 30 + (contentWidth - 60) / 4 - 2.5, 178, { align: 'center' });
    doc.text(`${analysis.overallScore || 8.0}/10`, margin + 30 + (contentWidth - 60) / 4 - 2.5, 190, { align: 'center' });
    
    doc.text(`Confidence`, pageWidth / 2 + 5 + (contentWidth - 60) / 4 - 2.5, 178, { align: 'center' });
    doc.text(`${analysis.confidenceScore || 85}%`, pageWidth / 2 + 5 + (contentWidth - 60) / 4 - 2.5, 190, { align: 'center' });
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
  })}`, pageWidth / 2, 210, { align: 'center' });

  // Footer on cover
  doc.text('Powered by BhaktVerse AI', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ========== PAGE 2: GREETING & DESTINY ==========
  doc.addPage();
  yPos = margin;

  // AI Guru Greeting
  if (analysis.greeting) {
    doc.setFillColor(255, 248, 240);
    const greetingLines = doc.splitTextToSize(analysis.greeting, contentWidth - 20);
    const greetingHeight = Math.max(greetingLines.length * 5 + 20, 35);
    doc.roundedRect(margin, yPos, contentWidth, greetingHeight, 3, 3, 'F');
    doc.setDrawColor(255, 153, 51);
    doc.roundedRect(margin, yPos, contentWidth, greetingHeight, 3, 3, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('🙏 AI GURU\'S BLESSING', margin + 10, yPos + 8);
    
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
    doc.text('⭐ YOUR LIFE PATH & DESTINY', margin, yPos);
    
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
    doc.text('🖐️ PALM LINE ANALYSIS', margin, yPos);
    yPos += 10;

    Object.entries(analysis.lineAnalysis).forEach(([key, line]) => {
      if (!line) return;
      
      checkPageBreak(35);
      
      const lineName = LINE_NAMES[key] || { hi: key, en: key };
      
      doc.setFillColor(248, 248, 255);
      doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${lineName.en} (${lineName.hi})`, margin + 3, yPos + 6);
      
      if (line.rating) {
        doc.setTextColor(255, 102, 0);
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
        yPos = addWrappedText(`Meaning: ${line.meaning}`, margin + 3, yPos, contentWidth - 6, 4);
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
    doc.text('🏔️ MOUNT ANALYSIS', margin, yPos);
    yPos += 10;

    Object.entries(analysis.mountAnalysis).forEach(([key, mount]) => {
      if (!mount) return;
      
      checkPageBreak(20);
      
      const mountName = MOUNT_NAMES[key] || { hi: key, en: key };
      
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${mountName.en}:`, margin + 3, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      const mountInfo = `${mount.strength || 'Moderate'} - ${mount.meaning || mount.observed || ''}`;
      doc.text(mountInfo.substring(0, 80), margin + 35, yPos);
      
      yPos += 5;
    });
    
    yPos += 5;
  }

  // ========== CATEGORY PREDICTIONS ==========
  if (analysis.categories) {
    doc.addPage();
    yPos = margin;
    
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 DETAILED CATEGORY PREDICTIONS', margin, yPos);
    yPos += 12;

    Object.entries(analysis.categories).forEach(([key, category]) => {
      if (!category) return;

      const predictionLength = category.prediction?.length || 0;
      const estimatedHeight = 30 + (predictionLength / 100) * 5;
      checkPageBreak(Math.min(estimatedHeight, 80));

      // Category header
      doc.setFillColor(248, 248, 255);
      doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
      
      const icon = CATEGORY_ICONS[key] || '📌';
      const title = CATEGORY_TITLES[key] || { hi: key, en: key };
      
      doc.setFontSize(11);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${icon} ${title.en} (${title.hi})`, margin + 3, yPos + 7);
      
      // Rating
      doc.setFontSize(10);
      doc.setTextColor(255, 102, 0);
      doc.text(`Rating: ${category.rating || 8}/10`, pageWidth - margin - 25, yPos + 7);
      
      yPos += 14;

      // Prediction text (truncate if too long for a single page section)
      if (category.prediction) {
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        
        // Limit prediction to avoid page overflow
        const maxChars = 1500;
        const truncatedPrediction = category.prediction.length > maxChars 
          ? category.prediction.substring(0, maxChars) + '...' 
          : category.prediction;
        
        yPos = addWrappedText(truncatedPrediction, margin + 3, yPos, contentWidth - 6, 4);
      }
      
      // Observed Features
      if (category.observedFeatures && category.observedFeatures.length > 0) {
        yPos += 3;
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Observed Features:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(category.observedFeatures.slice(0, 3).join(' | '), margin + 35, yPos);
        yPos += 4;
      }
      
      // Timeline
      if (category.timeline) {
        doc.setFontSize(8);
        doc.setTextColor(...successColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Timeline:', margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        const timelineText = category.timeline.length > 80 ? category.timeline.substring(0, 80) + '...' : category.timeline;
        doc.text(timelineText, margin + 22, yPos);
        yPos += 4;
      }

      // Guidance
      if (category.guidance) {
        checkPageBreak(15);
        doc.setFillColor(232, 245, 233);
        const guidanceLines = doc.splitTextToSize(`💡 ${category.guidance}`, contentWidth - 10);
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
    doc.text('🍀 LUCKY ELEMENTS', margin, yPos);
    yPos += 10;

    const elements = [
      { label: '🎨 Colors', values: analysis.luckyElements.colors },
      { label: '💎 Gemstones', values: analysis.luckyElements.gemstones },
      { label: '📅 Auspicious Days', values: analysis.luckyElements.days },
      { label: '🔢 Lucky Numbers', values: analysis.luckyElements.numbers?.map(String) },
      { label: '🧭 Directions', values: analysis.luckyElements.directions },
      { label: '⚗️ Metals', values: analysis.luckyElements.metals },
    ];

    elements.forEach((elem) => {
      if (!elem.values || elem.values.length === 0) return;

      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(elem.label, margin + 3, yPos);
      
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      doc.text(elem.values.join(', '), margin + 45, yPos);
      
      yPos += 6;
    });
    
    yPos += 5;
  }

  // ========== MANTRAS ==========
  if (analysis.luckyElements?.mantras && analysis.luckyElements.mantras.length > 0) {
    checkPageBreak(40);

    doc.setFillColor(255, 243, 224);
    const mantraCount = analysis.luckyElements.mantras.length;
    doc.roundedRect(margin, yPos, contentWidth, 12 + mantraCount * 18, 3, 3, 'F');
    doc.setDrawColor(255, 153, 51);
    doc.roundedRect(margin, yPos, contentWidth, 12 + mantraCount * 18, 3, 3, 'S');

    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('🕉️ RECOMMENDED MANTRAS', margin + 5, yPos + 8);

    yPos += 14;
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    
    analysis.luckyElements.mantras.forEach(mantra => {
      if (typeof mantra === 'string') {
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${mantra}`, margin + 8, yPos);
        yPos += 6;
      } else if (mantra && typeof mantra === 'object') {
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${mantra.sanskrit || ''}`, margin + 8, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        if (mantra.transliteration) {
          doc.text(`  ${mantra.transliteration}`, margin + 12, yPos);
          yPos += 4;
        }
        if (mantra.meaning) {
          doc.setTextColor(...mutedColor);
          doc.text(`  Meaning: ${mantra.meaning}`, margin + 12, yPos);
          doc.setTextColor(...textColor);
          yPos += 5;
        }
      }
    });
    yPos += 5;
  }

  // ========== YOGAS ==========
  if (analysis.yogas && analysis.yogas.length > 0) {
    checkPageBreak(30);

    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('✨ SPECIAL YOGAS DETECTED', margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    analysis.yogas.forEach(yoga => {
      const lines = doc.splitTextToSize(`• ${yoga}`, contentWidth - 10);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 4 + 2;
    });
    yPos += 5;
  }

  // ========== REMEDIES ==========
  if (analysis.remedies && analysis.remedies.length > 0) {
    checkPageBreak(40);

    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('🔱 SPIRITUAL REMEDIES', margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    analysis.remedies.forEach(remedy => {
      const lines = doc.splitTextToSize(`• ${remedy}`, contentWidth - 10);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 4 + 2;
    });
    yPos += 5;
  }

  // ========== WARNINGS ==========
  if (analysis.warnings && analysis.warnings.length > 0) {
    checkPageBreak(30);

    doc.setFillColor(255, 240, 240);
    const warningHeight = 10 + analysis.warnings.length * 8;
    doc.roundedRect(margin, yPos, contentWidth, warningHeight, 3, 3, 'F');
    doc.setDrawColor(255, 100, 100);
    doc.roundedRect(margin, yPos, contentWidth, warningHeight, 3, 3, 'S');

    doc.setFontSize(10);
    doc.setTextColor(180, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️ CAUTION PERIODS', margin + 5, yPos + 7);
    yPos += 12;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    analysis.warnings.forEach(warning => {
      doc.text(`• ${warning.substring(0, 100)}`, margin + 8, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  // ========== BLESSINGS ==========
  if (analysis.blessings) {
    checkPageBreak(35);

    doc.setFillColor(232, 245, 233);
    const blessingLines = doc.splitTextToSize(analysis.blessings, contentWidth - 20);
    const blessingHeight = blessingLines.length * 5 + 15;
    doc.roundedRect(margin, yPos, contentWidth, blessingHeight, 3, 3, 'F');
    doc.setDrawColor(76, 175, 80);
    doc.roundedRect(margin, yPos, contentWidth, blessingHeight, 3, 3, 'S');

    doc.setFontSize(10);
    doc.setTextColor(46, 125, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('🙏 FINAL BLESSINGS', margin + 5, yPos + 8);

    doc.setFont('helvetica', 'italic');
    doc.text(blessingLines, margin + 10, yPos + 16);
    yPos += blessingHeight + 5;
  }

  // ========== FOOTER ON EACH PAGE ==========
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('🕉️ BhaktVerse AI Palm Reading • For spiritual guidance', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  // Save the PDF
  const fileName = `BhaktVerse-Palm-Reading-${userName || 'Report'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
