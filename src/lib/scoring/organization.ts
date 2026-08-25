import {
  PILLAR_LABELS,
  SECTOR_PILLAR_WEIGHTS,
} from "./constants";
import {
  bandForComposite,
  clamp,
  normalizeLinear,
  piecewise,
  round2,
  toScore,
  weightedGeometricMean,
} from "./bands";
import type {
  Assurance,
  Disclosure,
  IndicatorResult,
  OrgInputs,
  OrgResult,
  PillarKey,
  PillarResult,
  Recommendation,
  SbtStatus,
  UsageLevel,
} from "./types";

const INTENSITY12_ANCHORS = [
  [0, 100],
  [5, 85],
  [20, 65],
  [50, 50],
  [200, 25],
  [500, 5],
  [1000, 0],
] as const;

const INTENSITY3_ANCHORS = [
  [0, 100],
  [50, 80],
  [200, 55],
  [600, 30],
  [1500, 10],
  [3000, 0],
] as const;

const TREND_ANCHORS = [
  [-15, 100],
  [-5, 85],
  [0, 60],
  [5, 35],
  [15, 10],
  [30, 0],
] as const;

const PUE_ANCHORS = [
  [1.0, 100],
  [1.1, 92],
  [1.2, 82],
  [1.4, 62],
  [1.6, 45],
  [2.0, 22],
  [3.0, 0],
] as const;

const SCOPE3_COVERAGE_ANCHORS = [
  [0, 0],
  [30, 30],
  [67, 80],
  [90, 95],
  [100, 100],
] as const;

const SBT_SCORE: Record<SbtStatus, number> = {
  none: 0,
  committed: 45,
  near_term: 78,
  net_zero: 100,
};
const SBT_LABEL: Record<SbtStatus, string> = {
  none: "No target",
  committed: "Committed",
  near_term: "Near-term validated",
  net_zero: "Net-zero validated",
};

const DISCLOSURE_SCORE: Record<Disclosure, number> = {
  none: 0,
  voluntary: 45,
  cdp: 70,
  csrd_esrs: 96,
};
const DISCLOSURE_LABEL: Record<Disclosure, string> = {
  none: "None",
  voluntary: "Voluntary report",
  cdp: "CDP",
  csrd_esrs: "CSRD / ESRS",
};

const ASSURANCE_SCORE: Record<Assurance, number> = {
  none: 20,
  limited: 62,
  reasonable: 100,
};
const ASSURANCE_LABEL: Record<Assurance, string> = {
  none: "None",
  limited: "Limited",
  reasonable: "Reasonable",
};

const WATER_SCORE: Record<UsageLevel, number> = {
  low: 85,
  medium: 55,
  high: 25,
};

interface Spec {
  key: string;
  label: string;
  pillar: PillarKey;
  within: number; // weight within pillar (each pillar sums to 1)
  sourceKey: string;
  rawDisplay: string;
  normalized: number;
  recTitle: string;
  recDetail: string;
}

function buildSpecs(i: OrgInputs): Spec[] {
  const rev = Math.max(0.001, i.revenueMillionsUsd);
  const intensity12 = i.scope1and2Tco2e / rev;
  const intensity3 = i.scope3Tco2e / rev;

  return [
    // Carbon & Energy
    {
      key: "intensity12",
      label: "Scope 1+2 intensity",
      pillar: "carbon",
      within: 0.3,
      sourceKey: "ghgp_scope3",
      rawDisplay: `${round2(intensity12)} tCO₂e / $M`,
      normalized: piecewise(intensity12, INTENSITY12_ANCHORS),
      recTitle: "Cut operational (Scope 1+2) intensity",
      recDetail:
        "Electrify operations and procure renewable power to reduce emissions per unit of revenue.",
    },
    {
      key: "intensity3",
      label: "Scope 3 intensity",
      pillar: "carbon",
      within: 0.3,
      sourceKey: "ghgp_scope3",
      rawDisplay: `${round2(intensity3)} tCO₂e / $M`,
      normalized: piecewise(intensity3, INTENSITY3_ANCHORS),
      recTitle: "Tackle value-chain (Scope 3) emissions",
      recDetail:
        "Scope 3 is usually the largest share. Engage top suppliers and set procurement standards.",
    },
    {
      key: "renewable",
      label: "Renewable electricity",
      pillar: "carbon",
      within: 0.2,
      sourceKey: "ghgp_scope3",
      rawDisplay: `${Math.round(i.renewableElectricityPct)}%`,
      normalized: normalizeLinear(i.renewableElectricityPct, 0, 100),
      recTitle: "Increase renewable electricity",
      recDetail:
        "Sign power purchase agreements (PPAs) to raise your renewable share toward 100%.",
    },
    {
      key: "trend",
      label: "Emissions trend (YoY)",
      pillar: "carbon",
      within: 0.2,
      sourceKey: "sbti2023",
      rawDisplay: `${i.emissionsTrendPct > 0 ? "+" : ""}${round2(i.emissionsTrendPct)}%`,
      normalized: piecewise(i.emissionsTrendPct, TREND_ANCHORS),
      recTitle: "Bend the emissions curve downward",
      recDetail:
        "Absolute emissions should be falling year-on-year to stay aligned with a 1.5°C pathway.",
    },

    // Digital & ICT
    {
      key: "pue",
      label: "Data-centre PUE",
      pillar: "digital",
      within: 0.4,
      sourceKey: "unctad2024",
      rawDisplay: `${round2(i.dataCenterPue)}`,
      normalized: piecewise(i.dataCenterPue, PUE_ANCHORS),
      recTitle: "Improve data-centre efficiency (PUE)",
      recDetail:
        "Optimise cooling, airflow and load management. Best-in-class hyperscale PUE approaches 1.1.",
    },
    {
      key: "cfe",
      label: "Carbon-free energy for compute",
      pillar: "digital",
      within: 0.35,
      sourceKey: "malmodin2023",
      rawDisplay: `${Math.round(i.carbonFreeEnergyPct)}% CFE`,
      normalized: normalizeLinear(i.carbonFreeEnergyPct, 0, 100),
      recTitle: "Move toward 24/7 carbon-free compute",
      recDetail:
        "Match compute load to carbon-free energy hour-by-hour, not just via annual certificates.",
    },
    {
      key: "circularity",
      label: "Hardware circularity",
      pillar: "digital",
      within: 0.25,
      sourceKey: "malmodin2023",
      rawDisplay: `${Math.round(i.hardwareCircularityPct)}%`,
      normalized: normalizeLinear(i.hardwareCircularityPct, 0, 100),
      recTitle: "Extend hardware lifetimes",
      recDetail:
        "Refurbish, resell and recover devices to cut embodied emissions and e-waste.",
    },

    // Resources & Circularity
    {
      key: "waste",
      label: "Waste diverted from landfill",
      pillar: "resources",
      within: 0.35,
      sourceKey: "oecd2008",
      rawDisplay: `${Math.round(i.wasteDivertedPct)}%`,
      normalized: normalizeLinear(i.wasteDivertedPct, 0, 100),
      recTitle: "Divert more waste from landfill",
      recDetail: "Expand recycling, reuse and composting across sites.",
    },
    {
      key: "recycled",
      label: "Recycled / renewable materials",
      pillar: "resources",
      within: 0.35,
      sourceKey: "oecd2008",
      rawDisplay: `${Math.round(i.recycledMaterialPct)}%`,
      normalized: normalizeLinear(i.recycledMaterialPct, 0, 100),
      recTitle: "Increase recycled material content",
      recDetail: "Design for circularity and specify recycled inputs in procurement.",
    },
    {
      key: "water",
      label: "Water intensity vs peers",
      pillar: "resources",
      within: 0.3,
      sourceKey: "unctad2024",
      rawDisplay:
        i.waterIntensity === "low"
          ? "Low"
          : i.waterIntensity === "medium"
            ? "Medium"
            : "High",
      normalized: WATER_SCORE[i.waterIntensity],
      recTitle: "Reduce water intensity",
      recDetail:
        "Recycle process/cooling water and set context-based water targets in stressed basins.",
    },

    // Targets & Trajectory
    {
      key: "sbt",
      label: "Science-based target",
      pillar: "targets",
      within: 0.4,
      sourceKey: "sbti2023",
      rawDisplay: SBT_LABEL[i.sbtStatus],
      normalized: SBT_SCORE[i.sbtStatus],
      recTitle: "Validate a science-based target",
      recDetail:
        "Commit to and get SBTi validation for near-term and net-zero targets.",
    },
    {
      key: "scope3coverage",
      label: "Scope 3 target coverage",
      pillar: "targets",
      within: 0.35,
      sourceKey: "sbti2023",
      rawDisplay: `${Math.round(i.scope3TargetCoveragePct)}%`,
      normalized: piecewise(i.scope3TargetCoveragePct, SCOPE3_COVERAGE_ANCHORS),
      recTitle: "Extend targets across Scope 3",
      recDetail:
        "SBTi requires ≥67% Scope 3 coverage for near-term targets and 90% for net-zero.",
    },
    {
      key: "ontrack",
      label: "On track vs trajectory",
      pillar: "targets",
      within: 0.25,
      sourceKey: "sbti2023",
      rawDisplay: i.onTrackVsTrajectory ? "On track" : "Off track",
      normalized: i.onTrackVsTrajectory ? 88 : 25,
      recTitle: "Close the gap to your trajectory",
      recDetail: "Accelerate initiatives so actual emissions match your stated pathway.",
    },

    // Transparency & Governance
    {
      key: "disclosure",
      label: "Disclosure framework",
      pillar: "transparency",
      within: 0.3,
      sourceKey: "eu2024",
      rawDisplay: DISCLOSURE_LABEL[i.disclosure],
      normalized: DISCLOSURE_SCORE[i.disclosure],
      recTitle: "Adopt CSRD / ESRS-aligned disclosure",
      recDetail:
        "Standardised, double-materiality disclosure improves comparability and trust.",
    },
    {
      key: "assurance",
      label: "Third-party assurance",
      pillar: "transparency",
      within: 0.25,
      sourceKey: "eu2024",
      rawDisplay: ASSURANCE_LABEL[i.assurance],
      normalized: ASSURANCE_SCORE[i.assurance],
      recTitle: "Get your inventory assured",
      recDetail:
        "Independent (ideally reasonable) assurance reduces the risk of greenwashing claims.",
    },
    {
      key: "governance",
      label: "Board oversight & incentives",
      pillar: "transparency",
      within: 0.2,
      sourceKey: "berg2022",
      rawDisplay: i.climateGovernance ? "In place" : "Absent",
      normalized: i.climateGovernance ? 90 : 25,
      recTitle: "Link governance and pay to climate",
      recDetail: "Board-level oversight and executive incentives drive follow-through.",
    },
    {
      key: "completeness",
      label: "Inventory data completeness",
      pillar: "transparency",
      within: 0.25,
      sourceKey: "berg2022",
      rawDisplay: `${Math.round(i.dataCompletenessPct)}% measured`,
      normalized: normalizeLinear(i.dataCompletenessPct, 0, 100),
      recTitle: "Replace estimates with primary data",
      recDetail:
        "Measurement quality is the #1 driver of ESG-rating disagreement (Berg et al. 2022).",
    },
  ];
}

const PILLAR_ORDER: PillarKey[] = [
  "carbon",
  "digital",
  "resources",
  "targets",
  "transparency",
];

export function computeOrganization(i: OrgInputs): OrgResult {
  const specs = buildSpecs(i);
  const weights = SECTOR_PILLAR_WEIGHTS[i.sector];

  const pillars: PillarResult[] = PILLAR_ORDER.map((pk) => {
    const items = specs.filter((s) => s.pillar === pk);
    const indicators: IndicatorResult[] = items.map((s) => ({
      key: s.key,
      label: s.label,
      pillar: s.pillar,
      rawDisplay: s.rawDisplay,
      normalized: Math.round(s.normalized),
      weightWithinPillar: s.within,
      sourceKey: s.sourceKey,
    }));
    const wSum = items.reduce((a, s) => a + s.within, 0) || 1;
    const score =
      items.reduce((a, s) => a + s.normalized * s.within, 0) / wSum;
    return {
      key: pk,
      label: PILLAR_LABELS[pk],
      score: clamp(score, 0, 100),
      weight: weights[pk],
      indicators,
    };
  });

  const composite = weightedGeometricMean(
    pillars.map((p) => p.score),
    pillars.map((p) => p.weight),
  );

  const totalTco2e = i.scope1and2Tco2e + i.scope3Tco2e;
  const rev = Math.max(0.001, i.revenueMillionsUsd);

  // Recommendations: rank indicators by their drag on the composite
  // (global weight × shortfall), so the top fixes are the highest-leverage.
  const recommendations: Recommendation[] = specs
    .map((s) => {
      const drag = weights[s.pillar] * s.within * (100 - s.normalized);
      return { s, drag };
    })
    .filter((x) => x.drag > 0.5)
    .sort((a, b) => b.drag - a.drag)
    .slice(0, 5)
    .map(({ s, drag }) => ({
      area: s.pillar,
      title: s.recTitle,
      detail: s.recDetail,
      scoreUplift: round2((drag / 100) * 12),
    }));

  return {
    pillars,
    composite: Math.round(composite),
    score: toScore(composite),
    band: bandForComposite(composite),
    scope3Share: totalTco2e > 0 ? round2(i.scope3Tco2e / totalTco2e) : 0,
    totalTco2e: Math.round(totalTco2e),
    intensityScope12: round2(i.scope1and2Tco2e / rev),
    intensityScope3: round2(i.scope3Tco2e / rev),
    recommendations,
  };
}

/** A realistic mid-size technology company so results render on first load. */
export const DEFAULT_ORG: OrgInputs = {
  name: "Northwind Cloud",
  sector: "technology",
  revenueMillionsUsd: 1800,
  scope1and2Tco2e: 42000,
  scope3Tco2e: 380000,
  renewableElectricityPct: 62,
  emissionsTrendPct: -4,
  dataCenterPue: 1.35,
  carbonFreeEnergyPct: 55,
  hardwareCircularityPct: 40,
  wasteDivertedPct: 68,
  recycledMaterialPct: 30,
  waterIntensity: "medium",
  sbtStatus: "near_term",
  scope3TargetCoveragePct: 70,
  onTrackVsTrajectory: true,
  disclosure: "cdp",
  assurance: "limited",
  climateGovernance: true,
  dataCompletenessPct: 72,
};
