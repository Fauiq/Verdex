import { BANDS, toScore } from "@/lib/scoring/bands";
import { bandVar } from "@/lib/colors";
import type { Band } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-semibold text-primary">{eyebrow}</span>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function GradePill({
  band,
  size = "md",
  className,
}: {
  band: Band;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "lg" ? "size-14 text-2xl" : size === "sm" ? "size-8 text-sm" : "size-11 text-xl";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl font-semibold text-white shadow-sm",
          dims,
        )}
        style={{ backgroundColor: bandVar(band.id) }}
      >
        {band.code}
      </div>
      <div className="leading-tight">
        <div className="font-semibold">{band.label}</div>
        <div className="text-xs text-muted-foreground">Grade {band.code}</div>
      </div>
    </div>
  );
}

export function BandLegend({ className }: { className?: string }) {
  const ordered = [...BANDS].sort((a, b) => b.min - a.min);
  return (
    <ul className={cn("space-y-2", className)}>
      {ordered.map((b, i, arr) => {
        const lower = toScore(b.min);
        const upper = i === 0 ? 850 : toScore(arr[i - 1].min) - 1;
        return (
          <li key={b.id} className="flex items-center gap-3 text-sm">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: bandVar(b.id) }}
            />
            <span className="font-medium">{b.code}</span>
            <span className="text-muted-foreground">{b.label}</span>
            <span className="ml-auto tabular-nums text-muted-foreground">
              {lower}–{upper}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
