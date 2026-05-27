import type { CVResult, PalmLineGeometry } from '@/lib/palmCV';

interface Props {
  result: CVResult | null;
  /** When false the overlay is rendered but only shows a tiny corner badge. */
  visible?: boolean;
}

const LINE_META: Record<keyof CVResult['lines'], { label: string; color: string }> = {
  heartLine: { label: 'Heart', color: 'hsl(0 85% 60%)' },
  headLine: { label: 'Head', color: 'hsl(220 90% 65%)' },
  lifeLine: { label: 'Life', color: 'hsl(140 70% 50%)' },
  fateLine: { label: 'Fate', color: 'hsl(280 70% 65%)' },
  sunLine: { label: 'Sun', color: 'hsl(45 95% 55%)' },
};

const PalmCVDebugOverlay = ({ result, visible = true }: Props) => {
  if (!result || !visible) return null;

  const entries = (Object.entries(result.lines) as [keyof CVResult['lines'], PalmLineGeometry | undefined][])
    .filter(([, l]) => !!l) as [keyof CVResult['lines'], PalmLineGeometry][];

  if (entries.length === 0) {
    return (
      <div className="absolute top-2 left-2 z-10 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
        CV: 0 lines · {result.totalSegments} segments
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {entries.map(([key, l]) => {
          const meta = LINE_META[key];
          return (
            <g key={key}>
              <line
                x1={l.startX} y1={l.startY} x2={l.endX} y2={l.endY}
                stroke={meta.color} strokeWidth={0.8} strokeLinecap="round"
                opacity={0.9}
              />
              <circle cx={l.startX} cy={l.startY} r={0.9} fill={meta.color} />
              <circle cx={l.endX} cy={l.endY} r={0.9} fill={meta.color} />
            </g>
          );
        })}
      </svg>
      <div className="absolute top-2 left-2 rounded-md bg-black/75 px-2 py-1.5 text-[10px] leading-tight text-white shadow">
        <div className="font-semibold mb-1">
          CV Debug · {result.detectedCount}/5 · {Math.round(result.avgConfidence * 100)}%
        </div>
        <div className="space-y-0.5">
          {entries.map(([key, l]) => {
            const meta = LINE_META[key];
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: meta.color }} />
                <span className="w-9">{meta.label}</span>
                <span className="tabular-nums opacity-80">
                  {Math.round(l.confidence * 100)}% · d{l.depthScore.toFixed(2)} · {Math.round(l.length)}%
                </span>
              </div>
            );
          })}
          <div className="opacity-60 mt-1">segments: {result.totalSegments}</div>
        </div>
      </div>
    </div>
  );
};

export default PalmCVDebugOverlay;
