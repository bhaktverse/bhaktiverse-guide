interface AdminChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function AdminChartCard({ title, subtitle, children, className = "" }: AdminChartCardProps) {
  return (
    <div className={`rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
