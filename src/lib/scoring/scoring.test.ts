import { describe, expect, it } from "vitest";

import {
  bandForComposite,
  piecewise,
  normalizeLinear,
  toScore,
  weightedGeometricMean,
} from "./bands";
import { computeIndividual, DEFAULT_INDIVIDUAL } from "./individual";
import { computeOrganization, DEFAULT_ORG } from "./organization";
import type { IndividualInputs, OrgInputs } from "./types";

describe("math helpers", () => {
  it("interpolates piecewise anchors monotonically", () => {
    const anchors = [
      [0, 100],
      [10, 0],
    ] as const;
    expect(piecewise(0, anchors)).toBe(100);
    expect(piecewise(5, anchors)).toBe(50);
    expect(piecewise(10, anchors)).toBe(0);
    // clamps outside range
    expect(piecewise(-5, anchors)).toBe(100);
    expect(piecewise(20, anchors)).toBe(0);
  });

  it("normalizes linearly with direction", () => {
    expect(normalizeLinear(50, 0, 100)).toBe(50);
    expect(normalizeLinear(0, 0, 100)).toBe(0);
    expect(normalizeLinear(100, 0, 100)).toBe(100);
    // inverted (lower is better): best=0, worst=100
    expect(normalizeLinear(25, 100, 0)).toBe(75);
  });

  it("maps composite to the 300-850 scale", () => {
    expect(toScore(0)).toBe(300);
    expect(toScore(100)).toBe(850);
    expect(toScore(50)).toBe(575);
  });

  it("geometric mean punishes an extreme weak point more than linear", () => {
    const values = [90, 90, 10];
    const weights = [1, 1, 1];
    const geo = weightedGeometricMean(values, weights);
    const linear = values.reduce((a, b) => a + b, 0) / values.length;
    expect(geo).toBeLessThan(linear);
  });

  it("assigns bands by threshold", () => {
    expect(bandForComposite(95).code).toBe("A+");
    expect(bandForComposite(70).code).toBe("A");
    expect(bandForComposite(55).code).toBe("B");
    expect(bandForComposite(40).code).toBe("C");
    expect(bandForComposite(10).code).toBe("D");
  });
});

describe("individual score", () => {
  it("produces a score in range for the default profile", () => {
    const r = computeIndividual(DEFAULT_INDIVIDUAL);
    expect(r.score).toBeGreaterThanOrEqual(300);
    expect(r.score).toBeLessThanOrEqual(850);
    expect(r.domains).toHaveLength(4);
    // shares should sum to ~1
    const shareSum = r.domains.reduce((a, d) => a + d.share, 0);
    expect(shareSum).toBeCloseTo(1, 5);
  });

  it("rewards a low-carbon lifestyle with a higher score", () => {
    const green: IndividualInputs = {
      ...DEFAULT_INDIVIDUAL,
      carType: "none",
      carKmPerWeek: 0,
      publicTransport: "high",
      shortHaulFlights: 0,
      longHaulFlights: 0,
      electricityKwhPerMonth: 200,
      renewableElectricity: true,
      heating: "heat_pump",
      homeSize: "apartment_small",
      shopping: "minimal",
      devices: 2,
      streamingHoursPerDay: 1,
      cloudAiUse: "low",
      trendVsLastYear: "down_a_lot",
      verifiedOffsets: true,
    };
    const heavy: IndividualInputs = {
      ...DEFAULT_INDIVIDUAL,
      carType: "diesel",
      carKmPerWeek: 500,
      longHaulFlights: 6,
      shortHaulFlights: 8,
      renewableElectricity: false,
      heating: "oil",
      homeSize: "house_large",
      shopping: "very_high",
      trendVsLastYear: "up",
    };
    const g = computeIndividual(green);
    const h = computeIndividual(heavy);
    expect(g.score).toBeGreaterThan(h.score);
    expect(g.totalTco2e).toBeLessThan(h.totalTco2e);
    expect(g.band.id).toBeLessThan(h.band.id); // lower id = better band
  });

  it("keeps a near-fair-share footprint in a strong band", () => {
    const r = computeIndividual({
      ...DEFAULT_INDIVIDUAL,
      carType: "none",
      carKmPerWeek: 0,
      publicTransport: "medium",
      shortHaulFlights: 0,
      longHaulFlights: 0,
      electricityKwhPerMonth: 150,
      renewableElectricity: true,
      heating: "heat_pump",
      homeSize: "apartment_small",
      shopping: "minimal",
      devices: 2,
      streamingHoursPerDay: 1,
      cloudAiUse: "low",
      trendVsLastYear: "down",
    });
    expect(r.totalTco2e).toBeLessThan(2.5);
    expect(r.band.id).toBeLessThanOrEqual(2);
  });

  it("caps the benefit of offsets so they cannot buy a top grade alone", () => {
    const base = computeIndividual({ ...DEFAULT_INDIVIDUAL, verifiedOffsets: false });
    const offset = computeIndividual({ ...DEFAULT_INDIVIDUAL, verifiedOffsets: true });
    expect(offset.totalTco2e).toBeLessThan(base.grossTco2e);
    // Offsetting a high footprint still shouldn't reach the top band.
    expect(offset.band.id).toBeGreaterThan(1);
  });
});

describe("organization score", () => {
  it("produces a valid score and pillar weights that sum to 1", () => {
    const r = computeOrganization(DEFAULT_ORG);
    expect(r.score).toBeGreaterThanOrEqual(300);
    expect(r.score).toBeLessThanOrEqual(850);
    const wSum = r.pillars.reduce((a, p) => a + p.weight, 0);
    expect(wSum).toBeCloseTo(1, 5);
    expect(r.pillars).toHaveLength(5);
  });

  it("weights the digital pillar more for technology than manufacturing", () => {
    const tech = computeOrganization({ ...DEFAULT_ORG, sector: "technology" });
    const mfg = computeOrganization({ ...DEFAULT_ORG, sector: "manufacturing" });
    const techDigital = tech.pillars.find((p) => p.key === "digital")!.weight;
    const mfgDigital = mfg.pillars.find((p) => p.key === "digital")!.weight;
    expect(techDigital).toBeGreaterThan(mfgDigital);
  });

  it("rewards a credible sustainability profile over a laggard", () => {
    const leader: OrgInputs = {
      ...DEFAULT_ORG,
      scope1and2Tco2e: 8000,
      scope3Tco2e: 90000,
      renewableElectricityPct: 100,
      emissionsTrendPct: -12,
      dataCenterPue: 1.1,
      carbonFreeEnergyPct: 90,
      hardwareCircularityPct: 80,
      wasteDivertedPct: 95,
      recycledMaterialPct: 70,
      waterIntensity: "low",
      sbtStatus: "net_zero",
      scope3TargetCoveragePct: 95,
      onTrackVsTrajectory: true,
      disclosure: "csrd_esrs",
      assurance: "reasonable",
      climateGovernance: true,
      dataCompletenessPct: 95,
    };
    const laggard: OrgInputs = {
      ...DEFAULT_ORG,
      scope1and2Tco2e: 300000,
      scope3Tco2e: 2500000,
      renewableElectricityPct: 5,
      emissionsTrendPct: 12,
      dataCenterPue: 2.1,
      carbonFreeEnergyPct: 5,
      hardwareCircularityPct: 5,
      wasteDivertedPct: 10,
      recycledMaterialPct: 2,
      waterIntensity: "high",
      sbtStatus: "none",
      scope3TargetCoveragePct: 0,
      onTrackVsTrajectory: false,
      disclosure: "none",
      assurance: "none",
      climateGovernance: false,
      dataCompletenessPct: 20,
    };
    const l = computeOrganization(leader);
    const b = computeOrganization(laggard);
    expect(l.score).toBeGreaterThan(b.score);
    expect(l.band.id).toBeLessThan(b.band.id);
    expect(b.recommendations.length).toBeGreaterThan(0);
  });

  it("surfaces recommendations targeting the weakest, highest-weight areas", () => {
    const r = computeOrganization({
      ...DEFAULT_ORG,
      dataCenterPue: 2.4,
      carbonFreeEnergyPct: 10,
    });
    const areas = r.recommendations.map((x) => x.area);
    expect(areas).toContain("digital");
  });
});
