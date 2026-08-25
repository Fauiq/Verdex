import { cn } from "@/lib/utils";

export interface RadarDatum {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  data: RadarDatum[];
  size?: number;
  className?: string;
}

export function RadarChart({ data, size = 340, className }: RadarChartProps) {
  const n = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.34;
  const rings = [0.25, 0.5, 0.75, 1];

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, frac: number) => ({
    x: cx + R * frac * Math.cos(angle(i)),
    y: cy + R * frac * Math.sin(angle(i)),
  });

  const polygon = (frac: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = point(i, frac);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

  const dataPolygon = data
    .map((d, i) => {
      const p = point(i, Math.max(0, Math.min(100, d.value)) / 100);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("max-w-full", className)}
      role="img"
      aria-label="Pillar performance radar chart"
    >
      {rings.map((frac) => (
        <polygon
          key={frac}
          points={polygon(frac)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const p = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="var(--border)"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={dataPolygon}
        fill="var(--primary)"
        fillOpacity={0.18}
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const p = point(i, Math.max(0, Math.min(100, d.value)) / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--primary)" />;
      })}

      {data.map((d, i) => {
        const p = point(i, 1.16);
        const anchor =
          Math.abs(p.x - cx) < 8 ? "middle" : p.x > cx ? "start" : "end";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px] font-medium"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
