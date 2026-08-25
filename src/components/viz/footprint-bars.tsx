import { DOMAIN_COLORS } from "@/lib/colors";
import type { DomainResult } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

export function FootprintBars({
  domains,
  className,
}: {
  domains: DomainResult[];
  className?: string;
}) {
  const max = Math.max(0.001, ...domains.map((d) => d.tco2e));
  const sorted = [...domains].sort((a, b) => b.tco2e - a.tco2e);

  return (
    <div className={cn("space-y-3", className)}>
      {sorted.map((d) => (
        <div key={d.key} className="grid grid-cols-[9rem_1fr_4.5rem] items-center gap-3">
          <span className="truncate text-sm text-muted-foreground">{d.label}</span>
          <div className="h-2.5 rounded-full bg-muted">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{
                width: `${(d.tco2e / max) * 100}%`,
                backgroundColor: DOMAIN_COLORS[d.key] ?? "var(--primary)",
              }}
            />
          </div>
          <span className="text-right text-sm font-medium tabular-nums">
            {d.tco2e.toFixed(2)}t
          </span>
        </div>
      ))}
    </div>
  );
}

interface FootprintScaleProps {
  total: number;
  target2030: number;
  globalAverage: number;
  countryAverage?: number | null;
  countryLabel?: string;
  className?: string;
}

export function FootprintScale({
  total,
  target2030,
  globalAverage,
  countryAverage,
  countryLabel,
  className,
}: FootprintScaleProps) {
  const max = Math.max(total * 1.15, globalAverage * 1.2, countryAverage ?? 0, 5);
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;

  const markers = [
    { value: target2030, label: `1.5°C fair share (${target2030}t)`, color: "var(--band-1)" },
    { value: globalAverage, label: "Global avg", color: "var(--band-3)" },
  ];
  if (countryAverage) {
    markers.push({
      value: countryAverage,
      label: `${countryLabel ?? "Country"} avg`,
      color: "var(--band-5)",
    });
  }

  return (
    <div className={cn("pt-6", className)}>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-[var(--band-1)] via-[var(--band-3)] to-[var(--band-5)] opacity-90">
        {/* User's total marker */}
        <div
          className="absolute -top-6 flex -translate-x-1/2 flex-col items-center"
          style={{ left: pct(total) }}
        >
          <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
            You · {total.toFixed(1)}t
          </span>
        </div>
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground"
          style={{ left: pct(total) }}
        />
      </div>

      <div className="relative mt-2 h-10">
        {markers.map((m) => (
          <div
            key={m.label}
            className="absolute flex -translate-x-1/2 flex-col items-center gap-0.5"
            style={{ left: pct(m.value) }}
          >
            <span className="h-2 w-px" style={{ backgroundColor: m.color }} />
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
