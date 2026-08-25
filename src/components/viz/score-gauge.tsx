import { BANDS } from "@/lib/scoring/bands";
import { bandVar } from "@/lib/colors";
import type { Band } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 300-850
  band: Band;
  size?: number;
  className?: string;
}

const MIN = 300;
const MAX = 850;

/** Clockwise, y-down angle (radians) for a score on the 180° top arc. */
function angleFor(score: number): number {
  const t = (Math.min(MAX, Math.max(MIN, score)) - MIN) / (MAX - MIN);
  return Math.PI * (1 + t);
}

function pointFor(score: number, cx: number, cy: number, r: number) {
  const a = angleFor(score);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(
  from: number,
  to: number,
  cx: number,
  cy: number,
  r: number,
): string {
  const start = pointFor(from, cx, cy, r);
  const end = pointFor(to, cx, cy, r);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function ScoreGauge({ score, band, size = 300, className }: ScoreGaugeProps) {
  const w = size;
  const h = size * 0.62;
  const stroke = Math.round(size * 0.075);
  const cx = w / 2;
  const cy = h - stroke;
  const r = w / 2 - stroke;

  // Band segments expressed as score ranges (ordered worst -> best, L -> R).
  const segments = [...BANDS]
    .sort((a, b) => a.min - b.min)
    .map((b, idx, arr) => {
      const fromComposite = b.min;
      const toComposite = idx < arr.length - 1 ? arr[idx + 1].min : 100;
      return {
        id: b.id,
        from: MIN + (fromComposite / 100) * (MAX - MIN),
        to: MIN + (toComposite / 100) * (MAX - MIN),
      };
    });

  const marker = pointFor(score, cx, cy, r);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Green credit score ${score} out of 850, grade ${band.code}`}>
        {/* Track */}
        <path
          d={arcPath(MIN, MAX, cx, cy, r)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Colored band segments */}
        {segments.map((s) => (
          <path
            key={s.id}
            d={arcPath(s.from + (s.id === 5 ? 0 : 1), s.to, cx, cy, r)}
            fill="none"
            stroke={bandVar(s.id)}
            strokeWidth={stroke}
            strokeLinecap="butt"
            opacity={0.9}
          />
        ))}
        {/* Marker */}
        <circle cx={marker.x} cy={marker.y} r={stroke * 0.72} fill="var(--background)" />
        <circle cx={marker.x} cy={marker.y} r={stroke * 0.5} fill={bandVar(band.id)} />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span
          className="text-5xl font-semibold tabular-nums tracking-tight"
          style={{ color: bandVar(band.id) }}
        >
          {score}
        </span>
        <span className="text-xs font-medium text-muted-foreground">of 850</span>
      </div>
    </div>
  );
}
