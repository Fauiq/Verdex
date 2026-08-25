"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Info, Lightbulb, RotateCcw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScoreGauge } from "@/components/viz/score-gauge";
import { RadarChart } from "@/components/viz/radar-chart";
import { Stat } from "@/components/common";
import {
  FieldGroup,
  SelectField,
  SliderField,
  SwitchField,
  type Option,
} from "@/components/calculators/controls";
import { computeOrganization, DEFAULT_ORG } from "@/lib/scoring/organization";
import { SECTOR_LABELS, SECTOR_PILLAR_WEIGHTS, PILLAR_LABELS } from "@/lib/scoring/constants";
import { bandVar } from "@/lib/colors";
import type {
  Assurance,
  Disclosure,
  OrgInputs,
  PillarKey,
  SbtStatus,
  Sector,
  UsageLevel,
} from "@/lib/scoring/types";

const SECTOR_OPTIONS: Option<Sector>[] = (
  Object.keys(SECTOR_LABELS) as Sector[]
).map((s) => ({ value: s, label: SECTOR_LABELS[s] }));

const WATER_OPTIONS: Option<UsageLevel>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const SBT_OPTIONS: Option<SbtStatus>[] = [
  { value: "none", label: "No target" },
  { value: "committed", label: "Committed" },
  { value: "near_term", label: "Near-term validated" },
  { value: "net_zero", label: "Net-zero validated" },
];

const DISCLOSURE_OPTIONS: Option<Disclosure>[] = [
  { value: "none", label: "None" },
  { value: "voluntary", label: "Voluntary report" },
  { value: "cdp", label: "CDP" },
  { value: "csrd_esrs", label: "CSRD / ESRS" },
];

const ASSURANCE_OPTIONS: Option<Assurance>[] = [
  { value: "none", label: "None" },
  { value: "limited", label: "Limited" },
  { value: "reasonable", label: "Reasonable" },
];

const PILLAR_SHORT: Record<PillarKey, string> = {
  carbon: "Carbon",
  digital: "Digital",
  resources: "Resources",
  targets: "Targets",
  transparency: "Transparency",
};

function formatTonnes(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)} Mt`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}k t`;
  return `${v} t`;
}

function formatRevenue(v: number): string {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}b` : `$${v}m`;
}

export function OrganizationCalculator() {
  const [inputs, setInputs] = React.useState<OrgInputs>(DEFAULT_ORG);
  const result = React.useMemo(() => computeOrganization(inputs), [inputs]);

  const update = React.useCallback(
    <K extends keyof OrgInputs>(key: K, value: OrgInputs[K]) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const weights = SECTOR_PILLAR_WEIGHTS[inputs.sector];
  const radarData = result.pillars.map((p) => ({
    label: PILLAR_SHORT[p.key],
    value: p.score,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
      {/* Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Enter what you know — the score and its breakdown update live.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setInputs(DEFAULT_ORG)}
          >
            <RotateCcw className="size-3.5" /> Reset example
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <FieldGroup
              title="Company basics"
              description="Sector sets the materiality weighting of the five pillars."
            >
              <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[1fr_minmax(0,13rem)] sm:gap-3">
                <Label className="text-sm font-normal">Company name</Label>
                <Input
                  value={inputs.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Company name"
                  className="h-9"
                />
              </div>
              <SelectField
                label="Sector"
                value={inputs.sector}
                onChange={(v) => update("sector", v)}
                options={SECTOR_OPTIONS}
              />
              <SliderField
                label="Annual revenue"
                value={inputs.revenueMillionsUsd}
                min={50}
                max={20000}
                step={50}
                format={formatRevenue}
                onChange={(v) => update("revenueMillionsUsd", v)}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(Object.keys(weights) as PillarKey[]).map((k) => (
                  <Badge key={k} variant="outline" className="font-normal">
                    {PILLAR_SHORT[k]} {Math.round(weights[k] * 100)}%
                  </Badge>
                ))}
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <FieldGroup title="Carbon & energy" description="GHG Protocol scopes and energy mix.">
              <SliderField
                label="Scope 1 + 2 emissions"
                value={inputs.scope1and2Tco2e}
                min={0}
                max={500000}
                step={1000}
                format={formatTonnes}
                onChange={(v) => update("scope1and2Tco2e", v)}
              />
              <SliderField
                label="Scope 3 emissions"
                hint="Value-chain emissions — usually the largest"
                value={inputs.scope3Tco2e}
                min={0}
                max={5000000}
                step={10000}
                format={formatTonnes}
                onChange={(v) => update("scope3Tco2e", v)}
              />
              <SliderField
                label="Renewable electricity"
                value={inputs.renewableElectricityPct}
                min={0}
                max={100}
                format={(v) => `${v}%`}
                onChange={(v) => update("renewableElectricityPct", v)}
              />
              <SliderField
                label="Emissions trend (YoY)"
                hint="Negative = reduction"
                value={inputs.emissionsTrendPct}
                min={-20}
                max={30}
                format={(v) => `${v > 0 ? "+" : ""}${v}%`}
                onChange={(v) => update("emissionsTrendPct", v)}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <FieldGroup
              title="Digital & ICT footprint"
              description="Most material for technology and digital-heavy firms."
            >
              <SliderField
                label="Data-centre PUE"
                hint="Power usage effectiveness — 1.0 is ideal"
                value={inputs.dataCenterPue}
                min={1}
                max={3}
                step={0.05}
                format={(v) => v.toFixed(2)}
                onChange={(v) => update("dataCenterPue", v)}
              />
              <SliderField
                label="Carbon-free energy for compute"
                value={inputs.carbonFreeEnergyPct}
                min={0}
                max={100}
                format={(v) => `${v}%`}
                onChange={(v) => update("carbonFreeEnergyPct", v)}
              />
              <SliderField
                label="Hardware circularity"
                hint="Devices reused, refurbished or recovered"
                value={inputs.hardwareCircularityPct}
                min={0}
                max={100}
                format={(v) => `${v}%`}
                onChange={(v) => update("hardwareCircularityPct", v)}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <FieldGroup title="Resources & circularity">
                <SliderField
                  label="Waste diverted"
                  value={inputs.wasteDivertedPct}
                  min={0}
                  max={100}
                  format={(v) => `${v}%`}
                  onChange={(v) => update("wasteDivertedPct", v)}
                />
                <SliderField
                  label="Recycled materials"
                  value={inputs.recycledMaterialPct}
                  min={0}
                  max={100}
                  format={(v) => `${v}%`}
                  onChange={(v) => update("recycledMaterialPct", v)}
                />
                <SelectField
                  label="Water intensity"
                  value={inputs.waterIntensity}
                  onChange={(v) => update("waterIntensity", v)}
                  options={WATER_OPTIONS}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <FieldGroup title="Targets & trajectory">
                <SelectField
                  label="Science-based target"
                  value={inputs.sbtStatus}
                  onChange={(v) => update("sbtStatus", v)}
                  options={SBT_OPTIONS}
                />
                <SliderField
                  label="Scope 3 target coverage"
                  hint="SBTi: ≥67% near-term, 90% net-zero"
                  value={inputs.scope3TargetCoveragePct}
                  min={0}
                  max={100}
                  format={(v) => `${v}%`}
                  onChange={(v) => update("scope3TargetCoveragePct", v)}
                />
                <SwitchField
                  label="On track vs stated trajectory"
                  checked={inputs.onTrackVsTrajectory}
                  onChange={(v) => update("onTrackVsTrajectory", v)}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <FieldGroup title="Transparency & governance">
              <SelectField
                label="Disclosure framework"
                value={inputs.disclosure}
                onChange={(v) => update("disclosure", v)}
                options={DISCLOSURE_OPTIONS}
              />
              <SelectField
                label="Third-party assurance"
                value={inputs.assurance}
                onChange={(v) => update("assurance", v)}
                options={ASSURANCE_OPTIONS}
              />
              <SwitchField
                label="Board oversight & climate-linked incentives"
                checked={inputs.climateGovernance}
                onChange={(v) => update("climateGovernance", v)}
              />
              <SliderField
                label="Inventory data completeness"
                hint="Measured vs estimated"
                value={inputs.dataCompletenessPct}
                min={0}
                max={100}
                format={(v) => `${v}%`}
                onChange={(v) => update("dataCompletenessPct", v)}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="lg:sticky lg:top-20 space-y-5">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="truncate text-base">
                {inputs.name || "Company"} · green score
              </CardTitle>
              <Badge
                className="shrink-0 text-white"
                style={{ backgroundColor: bandVar(result.band.id) }}
              >
                {result.band.code} · {result.band.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <ScoreGauge score={result.score} band={result.band} size={230} />
            <RadarChart data={radarData} size={260} className="mx-auto" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
            <Stat label="Total" value={formatTonnes(result.totalTco2e)} hint="CO₂e / yr" />
            <Stat label="Scope 3" value={`${Math.round(result.scope3Share * 100)}%`} hint="of total" />
            <Stat label="S1+2 int." value={result.intensityScope12} hint="t / $M" />
            <Stat label="S3 int." value={result.intensityScope3} hint="t / $M" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pillar breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">
              Every indicator: its value, how it&apos;s scored, and its weight in the grade.
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <Accordion multiple defaultValue={["carbon"]}>
              {result.pillars.map((p) => (
                <AccordionItem key={p.key} value={p.key}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between gap-3 pr-3">
                      <span>{PILLAR_LABELS[p.key]}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>w {Math.round(p.weight * 100)}%</span>
                        <span
                          className="tabular-nums font-semibold"
                          style={{ color: bandVar(result.band.id) }}
                        >
                          {Math.round(p.score)}
                        </span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2.5">
                      {p.indicators.map((ind) => (
                        <div
                          key={ind.key}
                          className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-xs"
                        >
                          <span className="font-medium text-foreground">{ind.label}</span>
                          <span className="text-right tabular-nums text-muted-foreground">
                            {ind.rawDisplay}
                          </span>
                          <div className="col-span-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-muted">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${ind.normalized}%`,
                                  backgroundColor: bandVar(result.band.id),
                                }}
                              />
                            </div>
                            <span className="w-8 text-right tabular-nums font-medium">
                              {ind.normalized}
                            </span>
                            <span className="w-14 text-right tabular-nums text-muted-foreground">
                              {(p.weight * ind.weightWithinPillar * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-3 flex justify-end gap-3 text-[10px] uppercase tracking-wide text-muted-foreground">
              <span>score /100</span>
              <span>weight in grade</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-primary" /> Priority actions
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Ranked by how much they would lift the score.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-2">
            {result.recommendations.map((r) => (
              <div
                key={r.title}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{r.title}</span>
                    {r.scoreUplift ? (
                      <Badge variant="secondary" className="shrink-0 tabular-nums">
                        +{r.scoreUplift} pts
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {r.detail}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            A screening-level score for illustration. Indicator anchors and weights are
            documented in the{" "}
            <Link href="/methodology" className="font-medium text-foreground underline underline-offset-2">
              methodology
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
