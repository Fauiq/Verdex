import type { BandId } from "@/lib/scoring/types";

/** CSS custom property for a score band color, usable in SVG fill/stroke. */
export function bandVar(id: BandId): string {
  return `var(--band-${id})`;
}

/** Fixed, legible palette for the individual footprint domains. */
export const DOMAIN_COLORS: Record<string, string> = {
  mobility: "var(--band-5)",
  home: "var(--band-4)",
  goods: "var(--band-2)",
  digital: "var(--band-1)",
};
