import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  History, Download, Eye, Trash2, Calendar, User, Globe,
  Loader2, FileText, Hand, ChevronRight
} from 'lucide-react';
import { generatePalmReadingPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

interface PalmReadingRecord {
  id: string;
  palm_image_url: string | null;
  language: string;
  palm_type: string | null;
  analysis: any;
  created_at: string;
  user_name?: string | null;
  user_dob?: string | null;
}

interface PalmReadingHistoryProps {
  history: PalmReadingRecord[];
  loading: boolean;
  onViewReading: (record: PalmReadingRecord) => void;
  onDeleteReading: (id: string) => void;
  isPremium: boolean;
}

const LANG_LABELS: Record<string, string> = {
  hi: 'हिंदी', en: 'English', ta: 'தமிழ்', te: 'తెలుగు', bn: 'বাংলা', mr: 'मराठी',
};

const PalmReadingHistory = ({
  history,
  loading,
  onViewReading,
  onDeleteReading,
  isPremium,
}: PalmReadingHistoryProps) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPDF = async (record: PalmReadingRecord) => {
    if (!isPremium) {
      toast.error('Upgrade to Premium to download PDF reports');
      return;
    }
    setDownloadingId(record.id);
    try {
      await generatePalmReadingPDF(
        record.analysis,
        record.user_name || undefined,
        record.language,
        record.user_dob || undefined,
        undefined,
        record.id
      );
      toast.success('📄 PDF Report downloaded successfully');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Could not generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Group readings by person name
  const groupedByName = history.reduce<Record<string, PalmReadingRecord[]>>((acc, r) => {
    const name = r.user_name || 'Anonymous';
    if (!acc[name]) acc[name] = [];
    acc[name].push(r);
    return acc;
  }, {});

  if (loading) {
    return (
      <Card className="border border-border/50">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading reading history...</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border border-border/50">
        <CardContent className="py-12 text-center space-y-3">
          <Hand className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No readings yet</p>
          <p className="text-xs text-muted-foreground">
            Scan a palm to get your first reading — it will be saved here automatically
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Reading History
          <Badge variant="secondary" className="ml-auto">{history.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            {Object.entries(groupedByName).map(([name, records]) => (
              <div key={name}>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{name}</span>
                  <Badge variant="outline" className="text-[10px]">{records.length} reading{records.length > 1 ? 's' : ''}</Badge>
                </div>
                <div className="space-y-2 ml-6">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/30 transition-colors group"
                    >
                      {/* Thumbnail */}
                      {record.palm_image_url ? (
                        <img
                          src={record.palm_image_url}
                          alt="Palm"
                          className="w-12 h-12 rounded-lg object-cover border border-border/50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Hand className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium truncate">
                            {record.analysis?.palmType || 'Palm Reading'}
                          </span>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            {LANG_LABELS[record.language] || record.language}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                          {record.analysis?.overallScore && (
                            <span className="text-primary font-medium">
                              Score: {record.analysis.overallScore}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onViewReading(record)}
                          title="View reading"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownloadPDF(record)}
                          disabled={downloadingId === record.id}
                          title={isPremium ? 'Download PDF' : 'Premium only'}
                        >
                          {downloadingId === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive/60 hover:text-destructive"
                          onClick={() => onDeleteReading(record.id)}
                          title="Delete reading"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PalmReadingHistory;
