import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, Download, FileCode, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import PalmReadingReport from '@/components/PalmReadingReport';
import { generatePalmReadingPDF } from '@/utils/pdfGenerator';
import { usePremium } from '@/hooks/usePremium';

/**
 * Dedicated print/export route for a saved palm reading.
 * Loads from palm_reading_history by id, then offers:
 *   - Native browser print (pixel-perfect, Devanagari safe)
 *   - PDF download via html2canvas+jsPDF
 *   - Self-contained HTML download (single file, inline CSS, base64 image)
 *
 * Designed so users can re-export anytime without re-scanning (saves AI credits).
 */
const PalmReadingPrint = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('palm_reading_history')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        toast.error('Reading not found');
        navigate('/palm-reading');
        return;
      }
      setRecord(data);
      setLoading(false);
    })();
  }, [id, navigate]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!isPremium) {
      toast.error('Premium required to download PDF');
      return;
    }
    setDownloading(true);
    try {
      await generatePalmReadingPDF(
        record.analysis,
        record.user_name,
        record.language,
        record.user_dob,
        undefined,
        record.id
      );
      toast.success('PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('PDF generation failed');
    } finally {
      setDownloading(false);
    }
  };

  /** Build a single self-contained HTML file (inline CSS + base64 image). */
  const handleDownloadHTML = async () => {
    setExportingHtml(true);
    try {
      const root = document.getElementById('palm-report-print');
      if (!root) throw new Error('Report not on page');

      // Inline all stylesheets currently on the page so the offline HTML looks identical.
      const styles: string[] = [];
      document.querySelectorAll('style').forEach((s) => styles.push(s.innerHTML));
      for (const link of Array.from(document.querySelectorAll('link[rel="stylesheet"]'))) {
        try {
          const href = (link as HTMLLinkElement).href;
          const css = await fetch(href).then((r) => r.text()).catch(() => '');
          if (css) styles.push(css);
        } catch {/* skip */}
      }

      // Convert <img> srcs to base64 so the file is fully offline-portable.
      const clone = root.cloneNode(true) as HTMLElement;
      const imgs = Array.from(clone.querySelectorAll('img'));
      await Promise.all(imgs.map(async (img) => {
        try {
          const src = img.getAttribute('src');
          if (!src || src.startsWith('data:')) return;
          const blob = await fetch(src, { mode: 'cors' }).then((r) => r.blob());
          const dataUrl = await new Promise<string>((res) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result as string);
            fr.readAsDataURL(blob);
          });
          img.setAttribute('src', dataUrl);
        } catch {/* keep original src */}
      }));

      const safeName = (record.user_name || 'Seeker').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const html = `<!doctype html>
<html lang="${record.language || 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BhaktVerse Palm Reading — ${safeName}</title>
<style>${styles.join('\n')}
body{margin:0;background:#fff;color:#111;font-family:'Inter',system-ui,sans-serif;}
@media print{@page{size:A4;margin:12mm}}
.no-print{display:none!important}</style>
</head>
<body class="dark">
<div style="max-width:1024px;margin:0 auto;padding:24px">
${clone.outerHTML}
</div>
</body></html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhaktVerse_Palm_Reading_${safeName}_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success('HTML report downloaded');
    } catch (e) {
      console.error(e);
      toast.error('HTML export failed');
    } finally {
      setExportingHtml(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!record) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar — hidden in print */}
      <div className="no-print sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/palm-reading')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">
              {record.user_name || 'Seeker'} · Palm Reading
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {new Date(record.created_at).toLocaleString('en-IN')}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadHTML} disabled={exportingHtml}>
            {exportingHtml ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileCode className="h-4 w-4 mr-1" />}
            HTML
          </Button>
          <Button size="sm" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            PDF
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-6">
        <PalmReadingReport
          analysis={record.analysis}
          palmImage={record.palm_image_url || undefined}
          userName={record.user_name || 'Seeker'}
          isPremium={isPremium}
          selectedLanguage={record.language}
        />
      </div>
    </div>
  );
};

export default PalmReadingPrint;
