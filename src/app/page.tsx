import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Cpu,
  Eye,
  Gauge,
  Leaf,
  LineChart,
  Scale,
  ShieldCheck,
  Target,
  User,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/viz/score-gauge";
import { BandLegend, SectionHeading } from "@/components/common";
import { SOURCES } from "@/lib/scoring/sources";
import { computeIndividual } from "@/lib/scoring/individual";
import { cn } from "@/lib/utils";

const SAMPLE = computeIndividual({
  country: "UK",
  household: 2,
  carType: "electric",
  carKmPerWeek: 90,
  publicTransport: "medium",
  shortHaulFlights: 1,
  longHaulFlights: 0,
  electricityKwhPerMonth: 220,
  renewableElectricity: true,
  heating: "heat_pump",
  homeSize: "apartment_large",
  diet: "low_meat",
  foodWaste: "low",
  shopping: "average",
  devices: 4,
  streamingHoursPerDay: 2,
  cloudAiUse: "medium",
  trendVsLastYear: "down",
  verifiedOffsets: false,
});

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_-10%,color-mix(in_oklch,var(--primary),transparent_82%),transparent)]" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1.5">
              <Leaf className="size-3" />
              Green credit scoring, in the open
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              A green credit score you can actually trust.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Verdex turns peer-reviewed carbon accounting into one clear score —
              for people and for companies. Every input, weight and source is
              shown in the open, so a good grade means something.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/individual"
                className={cn(buttonVariants(), "h-11 gap-2 px-5 text-sm")}
              >
                <User className="size-4" />
                Check your personal score
              </Link>
              <Link
                href="/organization"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 gap-2 px-5 text-sm",
                )}
              >
                <Building2 className="size-4" />
                Score a company
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              No sign-up. Runs entirely in your browser. Built on the GHG
              Protocol, the OECD composite-indicator handbook and 1.5°C-lifestyle
              science.
            </p>
          </div>

          <Card className="mx-auto w-full max-w-md shadow-lg">
            <CardContent className="flex flex-col items-center gap-6 p-6 sm:p-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Sample personal score
                </span>
                <Badge
                  className="text-white"
                  style={{ backgroundColor: `var(--band-${SAMPLE.band.id})` }}
                >
                  {SAMPLE.band.code} · {SAMPLE.band.label}
                </Badge>
              </div>
              <ScoreGauge score={SAMPLE.score} band={SAMPLE.band} size={300} />
              <div className="w-full rounded-xl border border-border bg-muted/40 p-4">
                <BandLegend />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-border/70 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Why this is hard"
            title="Today's sustainability scores disagree with each other"
            description="Research on the six largest ESG raters found their scores correlate on average just 0.54 — while Moody's and S&P credit ratings correlate 0.92. Most of that disagreement comes from how the underlying data is measured, not honest differences of opinion."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                stat: "0.54",
                label: "Average correlation between major ESG ratings",
                sub: "vs 0.92 for credit ratings (Berg, Koelbel & Rigobon, 2022)",
              },
              {
                stat: "56%",
                label: "of ESG-rating disagreement is measurement",
                sub: "38% scope, 6% weight — so we expose all three",
              },
              {
                stat: "~49,000",
                label: "companies entering mandatory EU sustainability reporting",
                sub: "under CSRD, raising demand for comparable scores",
              },
            ].map((c) => (
              <Card key={c.label}>
                <CardContent className="p-6">
                  <div className="text-4xl font-semibold tracking-tight text-primary">
                    {c.stat}
                  </div>
                  <div className="mt-2 font-medium">{c.label}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{c.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="How Verdex is different"
            title="A score built to be audited, not just believed"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Eye,
                title: "Radically transparent",
                body: "See every indicator's raw value, how it's normalized, its weight, and its exact contribution to the grade.",
              },
              {
                icon: ShieldCheck,
                title: "Peer-reviewed foundations",
                body: "Calibrated to the GHG Protocol, OECD/JRC composite-indicator methods and 1.5°C fair-share targets.",
              },
              {
                icon: Cpu,
                title: "Digital-carbon aware",
                body: "First-class treatment of ICT and data-centre emissions — the fastest-growing, least-measured footprint.",
              },
              {
                icon: Scale,
                title: "Hard to game",
                body: "Partly non-compensatory scoring means a great website can't offset an absent climate strategy.",
              },
            ].map((f) => (
              <Card key={f.title} className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Two products */}
      <section className="border-b border-border/70 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Two scores, one method"
            title="For the people making choices — and the companies they hold to account"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <User className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Personal green score</h3>
                    <p className="text-sm text-muted-foreground">
                      Your lifestyle vs a 1.5°C fair share
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Consumption-based footprint across mobility, home, food, goods and digital",
                    "Benchmarked to the 2.5 tCO₂e (2030) fair-share pathway",
                    "Personalized hotspots and the highest-leverage changes",
                  ].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/individual"
                  className={cn(buttonVariants(), "mt-auto h-10 w-fit gap-2")}
                >
                  Check your score <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Company green score</h3>
                    <p className="text-sm text-muted-foreground">
                      Five weighted pillars, tuned by sector
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Scope 1, 2 & 3 intensity plus a dedicated digital/ICT pillar",
                    "Sector-aware materiality weights (tech, industry, finance, services)",
                    "Every indicator traceable to a standard or paper",
                  ].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/organization"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-auto h-10 w-fit gap-2",
                  )}
                >
                  Score a company <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="How scoring works"
            title="From honest inputs to a defensible grade"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                icon: LineChart,
                step: "01",
                title: "Measure",
                body: "Turn activity data into emissions using documented factors and the GHG Protocol.",
              },
              {
                icon: Scale,
                step: "02",
                title: "Normalize",
                body: "Map every indicator onto a common 0–100 scale against real-world benchmarks.",
              },
              {
                icon: Target,
                step: "03",
                title: "Weight & aggregate",
                body: "Combine with materiality weights using partly non-compensatory aggregation.",
              },
              {
                icon: Gauge,
                step: "04",
                title: "Grade",
                body: "Project to a familiar 300–850 score with a clear A+ to D band.",
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research strip */}
      <section className="border-b border-border/70 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Built on the evidence"
            title="Grounded in standards and peer-reviewed research"
            description="No mystery methodology. The whole scoring approach is derived from public standards and academic literature — and we cite it."
          />
          <div className="mt-8 flex flex-wrap gap-2.5">
            {SOURCES.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {s.authors.split(" ")[0].replace(",", "")} et al. · {s.year}
              </a>
            ))}
          </div>
          <Link
            href="/research"
            className={cn(
              buttonVariants({ variant: "link" }),
              "mt-6 h-auto gap-1.5 px-0",
            )}
          >
            Read the full research foundations <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="flex flex-col items-center gap-6 bg-[radial-gradient(80%_120%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent)] p-10 text-center sm:p-14">
              <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                See where you — or your company — really stand.
              </h2>
              <p className="max-w-xl text-muted-foreground">
                It takes two minutes, needs no account, and shows exactly how the
                number is built.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/individual" className={cn(buttonVariants(), "h-11 gap-2 px-5")}>
                  <User className="size-4" /> Personal score
                </Link>
                <Link
                  href="/organization"
                  className={cn(buttonVariants({ variant: "outline" }), "h-11 gap-2 px-5")}
                >
                  <Building2 className="size-4" /> Company score
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
