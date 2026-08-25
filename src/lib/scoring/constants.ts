/**
 * Calibration constants for the Verdex engine.
 *
 * Every magic number below is tagged with the source it is derived from.
 * Full references live in `sources.ts`. Where a precise public factor was not
 * available we use a defensible mid-range value and flag it as "illustrative";
 * transparency about this is itself a design principle (Birnik 2013; OECD/JRC
 * 2008), surfaced to users on the Methodology page.
 */

import type {
  CarType,
  CountryCode,
  DietType,
  HeatingFuel,
  HomeSize,
  PillarKey,
  Sector,
  ShoppingLevel,
  UsageLevel,
} from "./types";

/* ------------------------------------------------------------------ */
/* Fair-share pathway & benchmarks (individuals)                       */
/* ------------------------------------------------------------------ */

/**
 * Per-capita lifestyle carbon-footprint targets consistent with the 1.5C
 * aspirational goal of the Paris Agreement, derived by distributing the
 * remaining IPCC carbon budget equitably. Source: Hot or Cool Institute /
 * IGES, "1.5-Degree Lifestyles" (2021/2022).
 */
export const FAIR_SHARE = {
  target2030: 2.5, // tCO2e/capita/yr
  target2040: 1.4,
  target2050: 0.7,
  globalAverage2019: 4.6,
} as const;

/**
 * Anchor points mapping a total annual lifestyle footprint (tCO2e) to a
 * 0-100 "level" score via monotonic piecewise-linear interpolation.
 * Anchors are pinned to real benchmarks so the curve is interpretable:
 *  - 0.7 t  -> 100  (2050 fair share)
 *  - 2.5 t  ->  85  (2030 fair share)
 *  - 4.6 t  ->  60  (2019 global average)
 *  - 8.5 t  ->  35  (UK-level lifestyle footprint)
 *  - 13.6 t ->  15  (Canada-level lifestyle footprint)
 *  - 20 t   ->   0
 * Source: Hot or Cool Institute / IGES (2021).
 */
export const FOOTPRINT_SCORE_ANCHORS: readonly (readonly [number, number])[] = [
  [0.7, 100],
  [2.5, 85],
  [4.6, 60],
  [8.5, 35],
  [13.6, 15],
  [20, 0],
];

/**
 * Grid electricity carbon intensity (kgCO2e/kWh) and average per-capita
 * lifestyle footprint (tCO2e/yr) by country. Grid factors are rounded
 * public averages (IEA/Ember-style); lifestyle averages are from Hot or Cool
 * (2021) where available, otherwise a documented public estimate.
 */
export const COUNTRIES: Record<
  CountryCode,
  { label: string; gridKgPerKwh: number; avgLifestyleTco2e: number | null }
> = {
  GLOBAL: { label: "Global average", gridKgPerKwh: 0.48, avgLifestyleTco2e: 4.6 },
  US: { label: "United States", gridKgPerKwh: 0.37, avgLifestyleTco2e: 17.7 },
  UK: { label: "United Kingdom", gridKgPerKwh: 0.21, avgLifestyleTco2e: 8.5 },
  CA: { label: "Canada", gridKgPerKwh: 0.12, avgLifestyleTco2e: 13.6 },
  DE: { label: "Germany", gridKgPerKwh: 0.35, avgLifestyleTco2e: 9.0 },
  FR: { label: "France", gridKgPerKwh: 0.056, avgLifestyleTco2e: 7.5 },
  IN: { label: "India", gridKgPerKwh: 0.71, avgLifestyleTco2e: 3.0 },
  CN: { label: "China", gridKgPerKwh: 0.55, avgLifestyleTco2e: 5.0 },
  JP: { label: "Japan", gridKgPerKwh: 0.47, avgLifestyleTco2e: 8.1 },
  AU: { label: "Australia", gridKgPerKwh: 0.66, avgLifestyleTco2e: 12.0 },
  BR: { label: "Brazil", gridKgPerKwh: 0.1, avgLifestyleTco2e: 3.2 },
  OTHER: { label: "Other / not listed", gridKgPerKwh: 0.48, avgLifestyleTco2e: null },
};

/* ------------------------------------------------------------------ */
/* Emission factors (individuals)                                      */
/* ------------------------------------------------------------------ */

/** Tailpipe + upstream emissions per km by drivetrain (kgCO2e/km).
 *  EV uses a nominal grid; the engine re-scales EV by the selected grid.
 *  Source: UK DEFRA/BEIS conversion factors (order-of-magnitude). */
export const CAR_KG_PER_KM: Record<CarType, number> = {
  none: 0,
  petrol: 0.192,
  diesel: 0.171,
  hybrid: 0.11,
  electric: 0.05,
};

/** Round-trip flight emissions (tCO2e) including a radiative-forcing uplift.
 *  Short-haul ~1,100 km RT; long-haul ~8,000 km RT, economy.
 *  Source: DEFRA/ICAO methodology (order-of-magnitude). */
export const FLIGHT_TCO2E = {
  shortHaulRT: 0.25,
  longHaulRT: 1.8,
} as const;

/** Public-transport annual footprint by usage level (tCO2e/yr). */
export const PUBLIC_TRANSPORT_TCO2E: Record<UsageLevel, number> = {
  low: 0.1,
  medium: 0.3,
  high: 0.6,
};

/** Space + water heating annual footprint (tCO2e/yr) by fuel and home size.
 *  Electric fuels are re-scaled by the selected grid factor at runtime.
 *  Source: derived from typical dwelling energy demand; illustrative. */
export const HEATING_TCO2E: Record<HeatingFuel, Record<HomeSize, number>> = {
  none: {
    apartment_small: 0,
    apartment_large: 0,
    house_small: 0,
    house_medium: 0,
    house_large: 0,
  },
  heat_pump: {
    apartment_small: 0.2,
    apartment_large: 0.35,
    house_small: 0.5,
    house_medium: 0.7,
    house_large: 1.0,
  },
  electric_resistive: {
    apartment_small: 0.5,
    apartment_large: 0.9,
    house_small: 1.3,
    house_medium: 1.9,
    house_large: 2.7,
  },
  natural_gas: {
    apartment_small: 0.8,
    apartment_large: 1.3,
    house_small: 1.8,
    house_medium: 2.6,
    house_large: 3.6,
  },
  oil: {
    apartment_small: 1.0,
    apartment_large: 1.7,
    house_small: 2.4,
    house_medium: 3.4,
    house_large: 4.6,
  },
  district: {
    apartment_small: 0.4,
    apartment_large: 0.7,
    house_small: 1.0,
    house_medium: 1.4,
    house_large: 2.0,
  },
};

/** Whether a heating fuel's factor should scale with the electricity grid. */
export const HEATING_IS_ELECTRIC: Record<HeatingFuel, boolean> = {
  none: false,
  heat_pump: true,
  electric_resistive: true,
  natural_gas: false,
  oil: false,
  district: false,
};

/** Diet annual footprint (tCO2e/yr). Ranges informed by Scarborough et al.
 *  (2014/2023) and consumption-based diet studies. */
export const DIET_TCO2E: Record<DietType, number> = {
  vegan: 1.5,
  vegetarian: 1.7,
  pescatarian: 1.9,
  low_meat: 2.5,
  average: 3.3,
  high_meat: 3.9,
};

/** Multiplier applied to diet footprint for food-waste behaviour. */
export const FOOD_WASTE_MULTIPLIER: Record<UsageLevel, number> = {
  low: 1.0,
  medium: 1.12,
  high: 1.25,
};

/** Goods & services annual footprint (tCO2e/yr) by consumption level.
 *  Consumption-based (EEIOA-style) bracket; source: Ivanova et al. (2016)
 *  household footprint ranges, illustrative. */
export const SHOPPING_TCO2E: Record<ShoppingLevel, number> = {
  minimal: 0.6,
  average: 1.2,
  high: 2.2,
  very_high: 3.5,
};

/** Amortised embodied emissions per personal device (tCO2e/device/yr),
 *  assuming ~3-4 year lifetimes. Source: Malmodin et al. (2023) ICT LCA. */
export const DEVICE_EMBODIED_TCO2E = 0.05;

/** Streaming/video emissions per hour (kgCO2e/hr), grid-average.
 *  Source: IEA/Carbon Trust streaming estimates (order-of-magnitude). */
export const STREAMING_KG_PER_HOUR = 0.055;

/** Cloud + generative-AI personal usage annual footprint (tCO2e/yr). */
export const CLOUD_AI_TCO2E: Record<UsageLevel, number> = {
  low: 0.02,
  medium: 0.08,
  high: 0.2,
};

/** Credit applied for *verified* offsets, capped so offsetting cannot
 *  manufacture a top score (avoids the mitigation-hierarchy pitfall). */
export const OFFSET_MAX_CREDIT_TCO2E = 1.0;

/* ------------------------------------------------------------------ */
/* Composite weights                                                   */
/* ------------------------------------------------------------------ */

/** Individual composite: footprint level dominates; trajectory is a
 *  forward-looking modifier (credit-score analogy). */
export const INDIVIDUAL_WEIGHTS = {
  level: 0.8,
  trajectory: 0.2,
} as const;

/** Pillar weights by sector, reflecting materiality (SASB-style). Each row
 *  sums to 1. Technology weights ICT most heavily; manufacturing weights
 *  resources; all keep meaningful transparency weight. */
export const SECTOR_PILLAR_WEIGHTS: Record<Sector, Record<PillarKey, number>> = {
  technology: { carbon: 0.25, digital: 0.3, resources: 0.1, targets: 0.2, transparency: 0.15 },
  manufacturing: { carbon: 0.35, digital: 0.05, resources: 0.25, targets: 0.2, transparency: 0.15 },
  financial: { carbon: 0.2, digital: 0.15, resources: 0.05, targets: 0.3, transparency: 0.3 },
  services: { carbon: 0.3, digital: 0.15, resources: 0.15, targets: 0.2, transparency: 0.2 },
};

export const SECTOR_LABELS: Record<Sector, string> = {
  technology: "Technology / Digital",
  manufacturing: "Manufacturing / Industrials",
  financial: "Financial services",
  services: "Services / Other",
};

export const PILLAR_LABELS: Record<PillarKey, string> = {
  carbon: "Carbon & Energy",
  digital: "Digital & ICT footprint",
  resources: "Resources & Circularity",
  targets: "Targets & Trajectory",
  transparency: "Transparency & Governance",
};
