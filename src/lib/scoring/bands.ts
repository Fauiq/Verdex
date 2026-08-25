import type { Band } from "./types";

/**
 * Five score bands, mapped to the five --color-band-N design tokens.
 * The 0-100 composite is projected onto a familiar 300-850 credit-score
 * scale for the headline number.
 */
export const BANDS: Band[] = [
  {
    id: 1,
    code: "A+",
    label: "Regenerative leader",
    colorToken: "band-1",
    min: 80,
    blurb: "Living/operating at or below a 1.5°C fair share with credible, verified action.",
  },
  {
    id: 2,
    code: "A",
    label: "Climate-aligned",
    colorToken: "band-2",
    min: 65,
    blurb: "Well below average impact and on a clear downward trajectory.",
  },
  {
    id: 3,
    code: "B",
    label: "Transitioning",
    colorToken: "band-3",
    min: 50,
    blurb: "Around the responsible middle — real progress in some areas, gaps in others.",
  },
  {
    id: 4,
    code: "C",
    label: "Lagging",
    colorToken: "band-4",
    min: 35,
    blurb: "Above a sustainable footprint with limited evidence of change.",
  },
  {
    id: 5,
    code: "D",
    label: "High impact",
    colorToken: "band-5",
    min: 0,
    blurb: "Well above a fair share; the biggest opportunity — and responsibility — to cut.",
  },
];

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Monotonic piecewise-linear interpolation over (x, y) anchor points.
 * Anchors must be sorted by ascending x. Values outside the range clamp
 * to the nearest endpoint.
 */
export function piecewise(
  value: number,
  anchors: readonly (readonly [number, number])[],
): number {
  if (anchors.length === 0) return 0;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (value <= first[0]) return first[1];
  if (value >= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    if (value >= x0 && value <= x1) {
      const t = (value - x0) / (x1 - x0);
      return lerp(y0, y1, t);
    }
  }
  return last[1];
}

/**
 * Linear normalization to 0-100. If `higherIsBetter` is false the scale is
 * inverted (a common source of ESG "scope" error, so it is explicit here).
 */
export function normalizeLinear(
  value: number,
  worst: number,
  best: number,
): number {
  if (best === worst) return 50;
  const t = (value - worst) / (best - worst);
  return clamp(t * 100, 0, 100);
}

/** Project the 0-100 composite onto the 300-850 headline scale. */
export function toScore(composite: number): number {
  return Math.round(clamp(300 + (composite / 100) * 550, 300, 850));
}

export function bandForComposite(composite: number): Band {
  const c = clamp(composite, 0, 100);
  // BANDS is ordered best -> worst; pick the first whose min is satisfied.
  return BANDS.find((b) => c >= b.min) ?? BANDS[BANDS.length - 1];
}

/**
 * Weighted geometric mean. Partially non-compensatory: a very weak pillar
 * drags the whole score down more than a linear mean would, reflecting the
 * OECD/JRC guidance on compensability (a great website cannot offset an
 * absent climate strategy). Scores are floored at 1 to keep ln() finite.
 */
export function weightedGeometricMean(
  values: number[],
  weights: number[],
): number {
  const wSum = weights.reduce((a, b) => a + b, 0);
  if (wSum === 0) return 0;
  let acc = 0;
  for (let i = 0; i < values.length; i++) {
    const v = Math.max(values[i], 1);
    acc += weights[i] * Math.log(v);
  }
  return Math.exp(acc / wSum);
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
