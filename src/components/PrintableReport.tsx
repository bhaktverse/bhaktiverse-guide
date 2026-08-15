import { ReactNode, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintableReportProps {
  /** Shown in the print header (e.g. "Kundali Match Report"). */
  title: string;
  /** Optional subtitle line (names, date, rashi…). */
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Hide the floating print button (when the page supplies its own). */
  hideButton?: boolean;
}

/**
 * Wraps any astrology result block so it prints pixel-perfect on A4.
 *
 * The universal print stylesheet in index.css targets `[data-print-root]`:
 * everything else on the page is hidden, the root is expanded to full width,
 * cards get `break-inside: avoid`, and Devanagari keeps its own font stack —
 * so there are no layout shifts or clipped columns in the printed/downloaded
 * PDF regardless of the viewport the user printed from.
 */
const PrintableReport = ({ title, subtitle, children, className, hideButton }: PrintableReportProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Give the browser a frame to apply print styles to lazily-mounted charts.
    requestAnimationFrame(() => window.print());
  };

  return (
    <div ref={rootRef} data-print-root className={className}>
      {/* Print-only branded header — hidden on screen. */}
      <div className="hidden print:block mb-4 border-b pb-3">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">
          BhaktVerse · {new Date().toLocaleDateString()} · bhaktverse.lovable.app
        </p>
      </div>

      {!hideButton && (
        <div className="flex justify-end print:hidden mb-3">
          <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </Button>
        </div>
      )}

      {children}
    </div>
  );
};

export default PrintableReport;
