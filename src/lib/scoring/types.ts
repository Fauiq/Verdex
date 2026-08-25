/**
 * Shared types for the Verdex Green Credit Score engine.
 *
 * The engine is intentionally pure (no I/O, no framework code) so it can be
 * unit-tested in isolation and reused on both server and client.
 */

export type BandId = 1 | 2 | 3 | 4 | 5;

export interface Band {
  id: BandId;
  /** Short grade shown in the UI, e.g. "A+". */
  code: string;
  /** Human label, e.g. "Regenerative leader". */
  label: string;
  /** Tailwind color token name (maps to --color-band-N). */
  colorToken: `band-${BandId}`;
  /** Inclusive lower bound on the 0-100 composite. */
  min: number;
  /** One-line description of what the band means. */
  blurb: string;
}

export interface Recommendation {
  title: string;
  detail: string;
  /** Domain/pillar key this relates to. */
  area: string;
  /** Optional estimated annual saving in tCO2e (individuals). */
  savingTco2e?: number;
  /** Optional estimated score uplift (0-100 composite points). */
  scoreUplift?: number;
}

/* ------------------------------------------------------------------ */
/* Individual model                                                    */
/* ------------------------------------------------------------------ */

export type CountryCode =
  | "GLOBAL"
  | "US"
  | "UK"
  | "CA"
  | "DE"
  | "FR"
  | "IN"
  | "CN"
  | "JP"
  | "AU"
  | "BR"
  | "OTHER";

export type CarType = "none" | "petrol" | "diesel" | "hybrid" | "electric";
export type UsageLevel = "low" | "medium" | "high";
export type DietType =
  | "vegan"
  | "vegetarian"
  | "pescatarian"
  | "low_meat"
  | "average"
  | "high_meat";
export type HeatingFuel =
  | "none"
  | "heat_pump"
  | "electric_resistive"
  | "natural_gas"
  | "oil"
  | "district";
export type HomeSize =
  | "apartment_small"
  | "apartment_large"
  | "house_small"
  | "house_medium"
  | "house_large";
export type ShoppingLevel = "minimal" | "average" | "high" | "very_high";
export type Trend = "down_a_lot" | "down" | "same" | "up";

export interface IndividualInputs {
  country: CountryCode;
  household: number;

  // Mobility
  carType: CarType;
  carKmPerWeek: number;
  publicTransport: UsageLevel;
  shortHaulFlights: number; // round trips / year
  longHaulFlights: number; // round trips / year

  // Home energy
  electricityKwhPerMonth: number;
  renewableElectricity: boolean;
  heating: HeatingFuel;
  homeSize: HomeSize;

  // Food
  diet: DietType;
  foodWaste: UsageLevel;

  // Goods & services
  shopping: ShoppingLevel;

  // Digital
  devices: number;
  streamingHoursPerDay: number;
  cloudAiUse: UsageLevel;

  // Trajectory & commitment
  trendVsLastYear: Trend;
  verifiedOffsets: boolean;
}

export interface DomainResult {
  key: string;
  label: string;
  tco2e: number;
  share: number; // 0-1 of gross footprint
  note?: string;
}

export interface IndividualResult {
  domains: DomainResult[];
  grossTco2e: number;
  totalTco2e: number; // after verified offsets adjustment (floored)
  levelScore: number; // 0-100, footprint vs 1.5C pathway
  trajectoryScore: number; // 0-100
  composite: number; // 0-100
  score: number; // 300-850
  band: Band;
  vsTarget2030: number; // total / 2.5t fair share
  vsCountryAvg: number | null; // total / national avg lifestyle footprint
  recommendations: Recommendation[];
}

/* ------------------------------------------------------------------ */
/* Organization model                                                  */
/* ------------------------------------------------------------------ */

export type Sector = "technology" | "manufacturing" | "financial" | "services";
export type SbtStatus = "none" | "committed" | "near_term" | "net_zero";
export type Disclosure = "none" | "voluntary" | "cdp" | "csrd_esrs";
export type Assurance = "none" | "limited" | "reasonable";

export type PillarKey =
  | "carbon"
  | "digital"
  | "resources"
  | "targets"
  | "transparency";

export interface OrgInputs {
  name: string;
  sector: Sector;
  revenueMillionsUsd: number;

  // Carbon & energy
  scope1and2Tco2e: number;
  scope3Tco2e: number;
  renewableElectricityPct: number;
  emissionsTrendPct: number; // YoY %, negative = reduction

  // Digital & ICT
  dataCenterPue: number; // 1.0 - 3.0
  carbonFreeEnergyPct: number; // 24/7 CFE, 0-100
  hardwareCircularityPct: number; // 0-100

  // Resources & circularity
  wasteDivertedPct: number;
  recycledMaterialPct: number;
  waterIntensity: UsageLevel; // relative to sector peers

  // Targets & trajectory
  sbtStatus: SbtStatus;
  scope3TargetCoveragePct: number;
  onTrackVsTrajectory: boolean;

  // Transparency & governance
  disclosure: Disclosure;
  assurance: Assurance;
  climateGovernance: boolean;
  dataCompletenessPct: number; // measured vs estimated inventory
}

export interface IndicatorResult {
  key: string;
  label: string;
  pillar: PillarKey;
  rawDisplay: string;
  normalized: number; // 0-100
  weightWithinPillar: number; // 0-1
  sourceKey: string;
}

export interface PillarResult {
  key: PillarKey;
  label: string;
  score: number; // 0-100 (linear aggregate of indicators)
  weight: number; // 0-1 in the composite
  indicators: IndicatorResult[];
}

export interface OrgResult {
  pillars: PillarResult[];
  composite: number; // 0-100 weighted geometric mean
  score: number; // 300-850
  band: Band;
  scope3Share: number; // scope3 / total
  totalTco2e: number;
  intensityScope12: number; // tCO2e per $M revenue
  intensityScope3: number;
  recommendations: Recommendation[];
}
