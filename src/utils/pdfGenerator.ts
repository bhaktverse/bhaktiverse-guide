import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a multi-page A4 PDF by capturing the live PalmReadingReport DOM.
 *
 * Why DOM-capture instead of @react-pdf/renderer?
 * - Devanagari/Hindi/Sanskrit text renders perfectly using the user's already-loaded fonts.
 * - All gradients, shadows, custom CSS variables work because the browser already painted them.
 * - No font URL fetches (which were 404-ing on Google Fonts in production).
 * - Looks identical to what the user sees on screen ("WYSIWYG" PDF).
 */
export const generatePalmReadingPDF = async (
  _analysis: unknown,
  userName?: string,
  _language?: string,
  _userDob?: string,
  _readingUrl?: string,
  _dbReadingId?: string
): Promise<void> => {
  const clientName = userName || 'Seeker';

  // Find the printable root. PalmReadingReport renders this id.
  const source = document.getElementById('palm-report-print');
  if (!source) {
    throw new Error('Palm reading report not found on page. Please open the report first.');
  }

  // Lock the source width to a desktop-like value so the PDF layout is consistent
  // even if the user is on mobile. Clone into an offscreen container to avoid
  // disturbing the live UI (no scroll jumps, no flicker).
  const PDF_WIDTH_PX = 1024; // matches Tailwind lg breakpoint — best layout
  const clone = source.cloneNode(true) as HTMLElement;
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-10000px';
  container.style.width = `${PDF_WIDTH_PX}px`;
  container.style.background = getComputedStyle(document.body).backgroundColor || '#ffffff';
  container.style.zIndex = '-1';
  clone.style.width = `${PDF_WIDTH_PX}px`;
  clone.style.maxWidth = `${PDF_WIDTH_PX}px`;
  // Strip sticky/fixed positioning that might break in capture
  clone.querySelectorAll('[class*="sticky"],[class*="fixed"]').forEach((el) => {
    (el as HTMLElement).style.position = 'static';
  });
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Wait one frame so all images/fonts settle in the clone
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const canvas = await html2canvas(clone, {
      scale: 2, // retina quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: getComputedStyle(document.body).backgroundColor || '#ffffff',
      logging: false,
      windowWidth: PDF_WIDTH_PX,
    });

    // A4 page dimensions in mm
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidthMm = pdf.internal.pageSize.getWidth();   // 210
    const pageHeightMm = pdf.internal.pageSize.getHeight(); // 297

    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    // Convert the single tall canvas into multiple A4 pages by slicing
    // the source canvas vertically.
    const pageHeightPx = (pageHeightMm / imgWidthMm) * canvas.width; // px per page slice
    let renderedHeightPx = 0;
    let pageIndex = 0;

    while (renderedHeightPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      ctx.drawImage(
        canvas,
        0, renderedHeightPx, canvas.width, sliceHeightPx,
        0, 0, canvas.width, sliceHeightPx
      );
      const sliceImg = sliceCanvas.toDataURL('image/jpeg', 0.92);
      const sliceHeightMm = (sliceHeightPx * imgWidthMm) / canvas.width;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(sliceImg, 'JPEG', 0, 0, imgWidthMm, sliceHeightMm, undefined, 'FAST');
      renderedHeightPx += sliceHeightPx;
      pageIndex += 1;
    }

    const safeName = clientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const fileName = `BhaktVerse_Palm_Reading_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
};
