import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface DetailedCategoryCardProps {
  categoryKey: string;
  category: any;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  hindiTitle: string;
  englishTitle: string;
  language: string;
}

const DetailedCategoryCard = ({
  categoryKey,
  category,
  icon: Icon,
  color,
  bgColor,
  hindiTitle,
  englishTitle,
  language,
}: DetailedCategoryCardProps) => {
  const isHindi = language === 'hi';
  const title = isHindi ? hindiTitle : englishTitle;

  // Extract prediction text from category
  const prediction = typeof category === 'string' 
    ? category 
    : category?.prediction || category?.description || category?.text || '';

  const score = typeof category === 'object' ? category?.score : null;
  const strengths = typeof category === 'object' ? (category?.strengths || []) : [];
  const remedies = typeof category === 'object' ? (category?.remedies || category?.suggestions || []) : [];

  return (
    <Card className="overflow-hidden border border-border/50">
      <CardHeader className={`${bgColor} pb-3`}>
        <CardTitle className={`flex items-center gap-2 text-lg ${color}`}>
          <Icon className="h-5 w-5" />
          {title}
          {score && (
            <Badge variant="outline" className="ml-auto">
              {score}/10
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {prediction && (
          <p className="text-sm text-foreground leading-relaxed">{prediction}</p>
        )}

        {strengths.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {isHindi ? 'शक्तियाँ' : 'Strengths'}
            </p>
            <ul className="text-sm space-y-1">
              {strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {remedies.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {isHindi ? 'उपाय' : 'Remedies'}
            </p>
            <ul className="text-sm space-y-1">
              {remedies.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent-foreground mt-0.5">✦</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedCategoryCard;
