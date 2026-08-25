"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDownRight, Info, Lightbulb, RotateCcw, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreGauge } from "@/components/viz/score-gauge";
import { FootprintBars, FootprintScale } from "@/components/viz/footprint-bars";
import { Stat } from "@/components/common";
import {
  FieldGroup,
  SelectField,
  SliderField,
  SwitchField,
  type Option,
} from "@/components/calculators/controls";
import { computeIndividual, DEFAULT_INDIVIDUAL } from "@/lib/scoring/individual";
import { COUNTRIES, FAIR_SHARE } from "@/lib/scoring/constants";
import { bandVar } from "@/lib/colors";
import type {
  CarType,
  CountryCode,
  DietType,
  HeatingFuel,
  HomeSize,
  IndividualInputs,
  ShoppingLevel,
  Trend,
  UsageLevel,
} from "@/lib/scoring/types";

const COUNTRY_OPTIONS: Option<CountryCode>[] = (
  Object.keys(COUNTRIES) as CountryCode[]
).map((c) => ({ value: c, label: COUNTRIES[c].label }));

const CAR_OPTIONS: Option<CarType>[] = [
  { value: "none", label: "No car" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

const USAGE_OPTIONS: Option<UsageLevel>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const DIET_OPTIONS: Option<DietType>[] = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "low_meat", label: "Low meat" },
  { value: "average", label: "Average / mixed" },
  { value: "high_meat", label: "High meat" },
];

const HEATING_OPTIONS: Option<HeatingFuel>[] = [
  { value: "none", label: "None / minimal" },
  { value: "heat_pump", label: "Heat pump" },
  { value: "electric_resistive", label: "Electric (resistive)" },
  { value: "natural_gas", label: "Natural gas" },
  { value: "oil", label: "Oil" },
  { value: "district", label: "District heating" },
];

const HOME_OPTIONS: Option<HomeSize>[] = [
  { value: "apartment_small", label: "Small apartment" },
  { value: "apartment_large", label: "Large apartment" },
  { value: "house_small", label: "Small house" },
  { value: "house_medium", label: "Medium house" },
  { value: "house_large", label: "Large house" },
];

const SHOPPING_OPTIONS: Option<ShoppingLevel>[] = [
  { value: "minimal", label: "Minimal" },
  { value: "average", label: "Average" },
  { value: "high", label: "High" },
  { value: "very_high", label: "Very high" },
];

const TREND_OPTIONS: Option<Trend>[] = [
  { value: "down_a_lot", label: "Down a lot" },
  { value: "down", label: "Down a little" },
  { value: "same", label: "About the same" },
  { value: "up", label: "Up" },
];

export function IndividualCalculator() {
  const [inputs, setInputs] = React.useState<IndividualInputs>(DEFAULT_INDIVIDUAL);
  const result = React.useMemo(() => computeIndividual(inputs), [inputs]);

  const update = React.useCallback(
    <K extends keyof IndividualInputs>(key: K, value: IndividualInputs[K]) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const countryLabel = COUNTRIES[inputs.country].label;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
      {/* Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Adjust the inputs — your score updates live.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setInputs(DEFAULT_INDIVIDUAL)}
          >
            <RotateCcw className="size-3.5" /> Reset example
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <FieldGroup
              title="Location & household"
              description="Your grid mix and how many people share your home energy."
            >
              <SelectField
                label="Country / region"
                value={inputs.country}
                onChange={(v) => update("country", v)}
                options={COUNTRY_OPTIONS}
              />
              <SliderField
                label="People in household"
                value={inputs.household}
                min={1}
                max={6}
                onChange={(v) => update("household", v)}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <FieldGroup title="Mobility & travel">
              <SelectField
                label="Car type"
                value={inputs.carType}
                onChange={(v) => update("carType", v)}
                options={CAR_OPTIONS}
              />
              <SliderField
                label="Driving"
                value={inputs.carKmPerWeek}
                min={0}
                max={800}
                step={10}
                format={(v) => `${v} km/wk`}
                onChange={(v) => update("carKmPerWeek", v)}
              />
              <SelectField
                label="Public transport use"
                value={inputs.publicTransport}
                onChange={(v) => update("publicTransport", v)}
                options={USAGE_OPTIONS}
              />
              <SliderField
                label="Short-haul flights"
                hint="Return trips per year"
                value={inputs.shortHaulFlights}
                min={0}
                max={12}
                onChange={(v) => update("shortHaulFlights", v)}
              />
              <SliderField
                label="Long-haul flights"
                hint="Return trips per year"
                value={inputs.longHaulFlights}
                min={0}
                max={8}
                onChange={(v) => update("longHaulFlights", v)}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <FieldGroup title="Home energy">
              <SliderField
                label="Electricity use"
                value={inputs.electricityKwhPerMonth}
                min={0}
                max={1500}
                step={10}
                format={(v) => `${v} kWh/mo`}
                onChange={(v) => update("electricityKwhPerMonth", v)}
              />
              <SwitchField
                label="Verified renewable electricity tariff"
                checked={inputs.renewableElectricity}
                onChange={(v) => update("renewableElectricity", v)}
              />
              <SelectField
                label="Home heating"
                value={inputs.heating}
                onChange={(v) => update("heating", v)}
                options={HEATING_OPTIONS}
              />
              <SelectField
                label="Home size"
                value={inputs.homeSize}
                onChange={(v) => update("homeSize", v)}
                options={HOME_OPTIONS}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <FieldGroup title="Food & consumption">
                <SelectField
                  label="Diet"
                  value={inputs.diet}
                  onChange={(v) => update("diet", v)}
                  options={DIET_OPTIONS}
                />
                <SelectField
                  label="Food waste"
                  value={inputs.foodWaste}
                  onChange={(v) => update("foodWaste", v)}
                  options={USAGE_OPTIONS}
                />
                <SelectField
                  label="Shopping / goods"
                  value={inputs.shopping}
                  onChange={(v) => update("shopping", v)}
                  options={SHOPPING_OPTIONS}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <FieldGroup
                title="Digital footprint"
                description="Small today, but the fastest-growing domain."
              >
                <SliderField
                  label="Personal devices"
                  value={inputs.devices}
                  min={0}
                  max={15}
                  onChange={(v) => update("devices", v)}
                />
                <SliderField
                  label="Streaming / video"
                  value={inputs.streamingHoursPerDay}
                  min={0}
                  max={12}
                  format={(v) => `${v} h/day`}
                  onChange={(v) => update("streamingHoursPerDay", v)}
                />
                <SelectField
                  label="Cloud & AI use"
                  value={inputs.cloudAiUse}
                  onChange={(v) => update("cloudAiUse", v)}
                  options={USAGE_OPTIONS}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <FieldGroup
              title="Trajectory & commitment"
              description="A green credit score is forward-looking — direction matters."
            >
              <SelectField
                label="Footprint vs last year"
                value={inputs.trendVsLastYear}
                onChange={(v) => update("trendVsLastYear", v)}
                options={TREND_OPTIONS}
              />
              <SwitchField
                label="I offset residual emissions with verified credits"
                checked={inputs.verifiedOffsets}
                onChange={(v) => update("verifiedOffsets", v)}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="lg:sticky lg:top-20 space-y-5">
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your green credit score</CardTitle>
              <Badge
                className="text-white"
                style={{ backgroundColor: bandVar(result.band.id) }}
              >
                {result.band.code} · {result.band.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <ScoreGauge score={result.score} band={result.band} size={280} />
            <p className="text-center text-sm text-muted-foreground">
              {result.band.blurb}
            </p>

            <div className="grid w-full grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">Footprint level</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${result.levelScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {result.levelScore}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">Trajectory</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${result.trajectoryScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {result.trajectoryScore}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              <Stat
                label="Footprint"
                value={`${result.totalTco2e}t`}
                hint="CO₂e / year"
              />
              <Stat
                label="vs 2030"
                value={`${result.vsTarget2030}×`}
                hint={`fair share (${FAIR_SHARE.target2030}t)`}
              />
              <Stat
                label={`vs ${countryLabel.split(" ")[0]}`}
                value={result.vsCountryAvg ? `${result.vsCountryAvg}×` : "—"}
                hint="national avg"
              />
            </div>
            <FootprintScale
              total={result.totalTco2e}
              target2030={FAIR_SHARE.target2030}
              globalAverage={FAIR_SHARE.globalAverage2019}
              countryAverage={COUNTRIES[inputs.country].avgLifestyleTco2e}
              countryLabel={countryLabel.split(" ")[0]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Where it comes from</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <FootprintBars domains={result.domains} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-primary" /> Your highest-leverage moves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-2">
            {result.recommendations.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                You&apos;re already close to a fair share — keep it up.
              </div>
            ) : (
              result.recommendations.map((r) => (
                <div
                  key={r.title}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <ArrowDownRight className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{r.title}</span>
                      {r.savingTco2e ? (
                        <Badge variant="secondary" className="shrink-0 tabular-nums">
                          −{r.savingTco2e}t
                        </Badge>
                      ) : r.scoreUplift ? (
                        <Badge variant="secondary" className="shrink-0">
                          trajectory
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {r.detail}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Estimates use documented emission factors and are indicative. See the{" "}
            <Link href="/methodology" className="font-medium text-foreground underline underline-offset-2">
              methodology
            </Link>{" "}
            for every factor and its source.
          </span>
        </div>
      </div>
    </div>
  );
}
