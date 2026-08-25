import {
  CAR_KG_PER_KM,
  CLOUD_AI_TCO2E,
  COUNTRIES,
  DEVICE_EMBODIED_TCO2E,
  FAIR_SHARE,
  FOOTPRINT_SCORE_ANCHORS,
  HEATING_IS_ELECTRIC,
  HEATING_TCO2E,
  INDIVIDUAL_WEIGHTS,
  OFFSET_MAX_CREDIT_TCO2E,
  PUBLIC_TRANSPORT_TCO2E,
  SHOPPING_TCO2E,
  STREAMING_KG_PER_HOUR,
} from "./constants";
import { bandForComposite, clamp, piecewise, round2, toScore } from "./bands";
import type {
  DomainResult,
  IndividualInputs,
  IndividualResult,
  Recommendation,
  Trend,
} from "./types";

/** Nominal grid intensity assumed when the electric-heating factors were set. */
const NOMINAL_HEATING_GRID = 0.4;
/** Assumed EV efficiency (kWh/km) — combined with the grid to get emissions. */
const EV_KWH_PER_KM = 0.19;
/** Residual emission factor for a verified renewable tariff (kgCO2e/kWh). */
const RENEWABLE_RESIDUAL = 0.025;

const TREND_SCORE: Record<Trend, number> = {
  down_a_lot: 100,
  down: 75,
  same: 45,
  up: 15,
};

function mobilityFootprint(i: IndividualInputs, gridKgPerKwh: number): number {
  const perKmKg =
    i.carType === "electric"
      ? EV_KWH_PER_KM * gridKgPerKwh
      : CAR_KG_PER_KM[i.carType];
  const car = (i.carKmPerWeek * 52 * perKmKg) / 1000;
  const transit = PUBLIC_TRANSPORT_TCO2E[i.publicTransport];
  const flights =
    i.shortHaulFlights * 0.25 + i.longHaulFlights * 1.8; // FLIGHT_TCO2E
  return car + transit + flights;
}

function homeFootprint(i: IndividualInputs, gridKgPerKwh: number): number {
  const household = Math.max(1, i.household);
  const elecFactor = i.renewableElectricity ? RENEWABLE_RESIDUAL : gridKgPerKwh;
  const elec = (i.electricityKwhPerMonth * 12 * elecFactor) / 1000 / household;

  let heat = HEATING_TCO2E[i.heating][i.homeSize];
  if (HEATING_IS_ELECTRIC[i.heating]) {
    const factor = i.renewableElectricity ? RENEWABLE_RESIDUAL : gridKgPerKwh;
    heat *= factor / NOMINAL_HEATING_GRID;
  }
  heat = heat / household;

  return elec + heat;
}

function digitalFootprint(i: IndividualInputs): number {
  const devices = i.devices * DEVICE_EMBODIED_TCO2E;
  const streaming = (i.streamingHoursPerDay * 365 * STREAMING_KG_PER_HOUR) / 1000;
  const cloud = CLOUD_AI_TCO2E[i.cloudAiUse];
  return devices + streaming + cloud;
}

function trajectoryScore(i: IndividualInputs): number {
  const trend = TREND_SCORE[i.trendVsLastYear];
  const renewable = i.renewableElectricity ? 100 : 40;
  const offsets = i.verifiedOffsets ? 90 : 45;
  return clamp(0.6 * trend + 0.2 * renewable + 0.2 * offsets, 0, 100);
}

function buildRecommendations(
  i: IndividualInputs,
  domains: DomainResult[],
  gridKgPerKwh: number,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const by = Object.fromEntries(domains.map((d) => [d.key, d.tco2e]));

  if (i.longHaulFlights > 0) {
    recs.push({
      area: "mobility",
      title: "Replace one long-haul return flight",
      detail:
        "A single long-haul return trip is roughly a whole year's fair-share budget. Consider rail, regional trips, or virtual attendance.",
      savingTco2e: 1.8,
    });
  }
  if ((i.carType === "petrol" || i.carType === "diesel") && i.carKmPerWeek > 50) {
    const current = (i.carKmPerWeek * 52 * CAR_KG_PER_KM[i.carType]) / 1000;
    const ev = (i.carKmPerWeek * 52 * EV_KWH_PER_KM * gridKgPerKwh) / 1000;
    recs.push({
      area: "mobility",
      title: "Switch your car to electric",
      detail:
        "On your local grid, an EV would cut most of your driving emissions — even more if paired with renewable charging.",
      savingTco2e: round2(Math.max(0, current - ev)),
    });
  }
  if (!i.renewableElectricity && by.home > 0.4) {
    recs.push({
      area: "home",
      title: "Move to a verified renewable electricity tariff",
      detail:
        "Switching supply is one of the fastest household cuts and improves your trajectory score immediately.",
      savingTco2e: round2(
        ((i.electricityKwhPerMonth * 12 * (gridKgPerKwh - RENEWABLE_RESIDUAL)) /
          1000 /
          Math.max(1, i.household)) *
          0.9,
      ),
    });
  }
  if (i.heating === "natural_gas" || i.heating === "oil") {
    recs.push({
      area: "home",
      title: "Plan a heat-pump upgrade",
      detail:
        "Electrifying heating removes on-site fossil combustion; a heat pump is 3-4× more efficient than resistive heating.",
      savingTco2e: 1.0,
    });
  }
  if (i.shopping === "high" || i.shopping === "very_high") {
    recs.push({
      area: "goods",
      title: "Buy less and buy used",
      detail:
        "Extending product lifetimes and choosing second-hand meaningfully cuts the embodied emissions of goods.",
      savingTco2e: round2(SHOPPING_TCO2E[i.shopping] - SHOPPING_TCO2E.average),
    });
  }

  // Mitigation hierarchy: only suggest offsets after reduction levers.
  if (!i.verifiedOffsets) {
    recs.push({
      area: "trajectory",
      title: "Offset the residual — after reducing",
      detail:
        "For emissions you cannot yet cut, high-quality verified offsets improve your trajectory score (capped so offsetting alone cannot buy a top grade).",
      scoreUplift: 3,
    });
  }

  return recs
    .sort((a, b) => (b.savingTco2e ?? 0) - (a.savingTco2e ?? 0))
    .slice(0, 5);
}

export function computeIndividual(i: IndividualInputs): IndividualResult {
  const grid = COUNTRIES[i.country].gridKgPerKwh;

  const rawDomains: { key: string; label: string; tco2e: number; note?: string }[] = [
    { key: "mobility", label: "Mobility & travel", tco2e: mobilityFootprint(i, grid) },
    { key: "home", label: "Home energy", tco2e: homeFootprint(i, grid) },
    { key: "goods", label: "Goods & services", tco2e: SHOPPING_TCO2E[i.shopping] },
    {
      key: "digital",
      label: "Digital footprint",
      tco2e: digitalFootprint(i),
      note: "Devices, streaming and cloud/AI use.",
    },
  ];

  const gross = rawDomains.reduce((s, d) => s + d.tco2e, 0);

  const domains: DomainResult[] = rawDomains.map((d) => ({
    ...d,
    tco2e: round2(d.tco2e),
    share: gross > 0 ? d.tco2e / gross : 0,
  }));

  const offsetCredit = i.verifiedOffsets ? OFFSET_MAX_CREDIT_TCO2E : 0;
  const total = Math.max(0, gross - offsetCredit);

  const levelScore = piecewise(total, FOOTPRINT_SCORE_ANCHORS);
  const trajectory = trajectoryScore(i);
  const composite = clamp(
    INDIVIDUAL_WEIGHTS.level * levelScore +
      INDIVIDUAL_WEIGHTS.trajectory * trajectory,
    0,
    100,
  );

  const avg = COUNTRIES[i.country].avgLifestyleTco2e;

  return {
    domains,
    grossTco2e: round2(gross),
    totalTco2e: round2(total),
    levelScore: Math.round(levelScore),
    trajectoryScore: Math.round(trajectory),
    composite: Math.round(composite),
    score: toScore(composite),
    band: bandForComposite(composite),
    vsTarget2030: round2(total / FAIR_SHARE.target2030),
    vsCountryAvg: avg ? round2(total / avg) : null,
    recommendations: buildRecommendations(i, domains, grid),
  };
}

/** A realistic starting profile so the calculator shows a result immediately. */
export const DEFAULT_INDIVIDUAL: IndividualInputs = {
  country: "US",
  household: 2,
  carType: "petrol",
  carKmPerWeek: 220,
  publicTransport: "low",
  shortHaulFlights: 2,
  longHaulFlights: 1,
  electricityKwhPerMonth: 550,
  renewableElectricity: false,
  heating: "natural_gas",
  homeSize: "house_medium",
  shopping: "high",
  devices: 6,
  streamingHoursPerDay: 3,
  cloudAiUse: "medium",
  trendVsLastYear: "same",
  verifiedOffsets: false,
};
