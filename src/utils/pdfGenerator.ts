import React from 'react';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { PalmReadingPDFDocument } from './PalmReadingPDFDocument';

export const generatePalmReadingPDF = async (
  analysis: any,
  userName?: string,
  language?: string,
  userDob?: string,
  readingUrl?: string,
  dbReadingId?: string
): Promise<void> => {
  const clientName = userName || 'Seeker';
  const readingId = dbReadingId || `BV-${Date.now().toString(36).toUpperCase()}`;
  const generatedAt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Generate QR code as data URL
  let qrDataUrl: string | undefined;
  try {
    const shareUrl = readingUrl || `https://bhaktverse.lovable.app/shared-reading/${readingId}`;
    qrDataUrl = await QRCode.toDataURL(shareUrl, { width: 100, margin: 1, color: { dark: '#8B0000', light: '#FDF8F0' } });
  } catch (e) {
    console.warn('QR code generation failed, proceeding without it:', e);
  }

  const element = React.createElement(PalmReadingPDFDocument, {
    analysis,
    clientName,
    readingId,
    generatedAt,
    qrDataUrl,
    userDob,
    language,
  });

  try {
    const blob = await pdf(element).toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BhaktVerse_Palm_Reading_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    console.error('PDF blob generation failed:', err);
    throw new Error(`PDF generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};
