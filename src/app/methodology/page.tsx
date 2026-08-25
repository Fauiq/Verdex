import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/common";
import { BANDS, toScore } from "@/lib/scoring/bands";
import {
  DIET_TCO2E,
  FAIR_SHARE,
  FOOTPRINT_SCORE_ANCHORS,
  INDIVIDUAL_WEIGHTS,
  PILLAR_LABELS,
  SECTOR_LABELS,
  SECTOR_PILLAR_WEIGHTS,
} from "@/lib/scoring/constants";
import { SOURCE_BY_ID } from "@/lib/scoring/sources";
import { bandVar } from "@/lib/colors";
import type { PillarKey, Sector } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "Exactly how the Verdex green credit score is built: emission factors, normalization, sector weights, aggregation, the band scale, and its limitations.",
};

function Cite({ id }: { id: string }) {
  const s = SOURCE_BY_ID[id];
  if (!s) return null;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {s.authors.split(",")[0]} {s.year}
    </a>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <SectionHeading eyebrow={eyebrow} title={title} className="mb-6" />
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

const PILLAR_ORDER: PillarKey[] = [
  "carbon",
  "digital",
  "resources",
  "targets",
  "transparency",
];

export default function MethodologyPage() {
  const sectors = Object.keys(SECTOR_LABELS) as Sector[];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        eyebrow="Methodology"
        title="How the score is built — in full"
        description="Sustainability scores lose trust when they are black boxes. This page documents every factor, weight and formula. If you disagree with a choice, you can see exactly where it lives."
        className="mb-10"
      />

      <nav className="mb-12 flex flex-wrap gap-2 text-sm">
        {[
          ["#philosophy", "Philosophy"],
          ["#individual", "Personal score"],
          ["#organization", "Company score"],
          ["#bands", "Band scale"],
          ["#transparency", "Transparency"],
          ["#limitations", "Limitations"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        <Section id="philosophy" eyebrow="Principles" title="Three commitments">
          <p>
            First, <strong className="text-foreground">transparency over convenience</strong>.
            Research on the six largest ESG raters found their scores correlate only ~0.54,
            and that most disagreement comes from measurement, not opinion (<Cite id="berg2022" />).
            So we expose scope (which indicators), measurement (raw → normalized) and weight for
            every metric.
          </p>
          <p>
            Second, <strong className="text-foreground">standards over invention</strong>. Company
            emissions follow the GHG Protocol scopes (<Cite id="ghgp_scope3" />); the index
            construction follows the OECD/JRC composite-indicator handbook (<Cite id="oecd2008" />);
            personal footprints are benchmarked to 1.5°C fair-share targets (<Cite id="hotorcool2021" />).
          </p>
          <p>
            Third, <strong className="text-foreground">honesty about uncertainty</strong>. These are
            screening-level estimates from coarse, self-reported inputs. Where a precise public
            factor was unavailable we use a defensible mid-range value and say so.
          </p>
        </Section>

        <Section id="individual" eyebrow="Personal score" title="From lifestyle to a fair-share grade">
          <p>
            We estimate a consumption-based annual footprint across five domains — mobility, home
            energy, food, goods &amp; services, and digital — using documented emission factors
            (<Cite id="birnik2013" />, <Cite id="ivanova2016" />, <Cite id="scarborough2014" />).
            The total is compared against the per-capita fair share for 1.5°C.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold text-foreground">Fair-share targets</h4>
                <p className="mt-1 text-xs">Per capita, tCO₂e/yr (<Cite id="hotorcool2021" />)</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row k="2030 target" v={`${FAIR_SHARE.target2030} t`} />
                  <Row k="2040 target" v={`${FAIR_SHARE.target2040} t`} />
                  <Row k="2050 target" v={`${FAIR_SHARE.target2050} t`} />
                  <Row k="2019 global avg" v={`${FAIR_SHARE.globalAverage2019} t`} />
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold text-foreground">Footprint → level score</h4>
                <p className="mt-1 text-xs">Monotonic anchors, interpolated</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {FOOTPRINT_SCORE_ANCHORS.map(([t, s]) => (
                    <Row key={t} k={`${t} tCO₂e`} v={`${s} / 100`} />
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>

          <p>
            The <strong className="text-foreground">composite</strong> weights the footprint level
            at {Math.round(INDIVIDUAL_WEIGHTS.level * 100)}% and a forward-looking trajectory
            (year-on-year change, renewable supply, verified offsets) at{" "}
            {Math.round(INDIVIDUAL_WEIGHTS.trajectory * 100)}%. Offsets are capped so they cannot
            buy a top grade — reduction comes first.
          </p>

          <Card>
            <CardContent className="p-5">
              <h4 className="text-sm font-semibold text-foreground">
                Example: diet factors (tCO₂e/yr)
              </h4>
              <p className="mt-1 text-xs">
                One domain&apos;s factors, shown in full (<Cite id="scarborough2014" />)
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                {Object.entries(DIET_TCO2E).map(([k, v]) => (
                  <Row key={k} k={k.replace("_", " ")} v={`${v} t`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="organization" eyebrow="Company score" title="Five pillars, weighted by sector">
          <p>
            Each company indicator is normalized to 0–100 against real-world anchors (e.g. a
            data-centre PUE of 1.1 scores far higher than 2.0). Indicators combine linearly within a
            pillar; pillars combine into the composite with a{" "}
            <strong className="text-foreground">weighted geometric mean</strong>, which is partly
            non-compensatory — a very weak pillar cannot be fully offset by a strong one
            (<Cite id="oecd2008" />).
          </p>

          <Card>
            <CardContent className="p-5">
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                Pillar weights by sector (materiality)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Sector</th>
                      {PILLAR_ORDER.map((p) => (
                        <th key={p} className="px-2 py-2 text-right font-medium">
                          {PILLAR_LABELS[p].split(" ")[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sectors.map((s) => (
                      <tr key={s} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3 font-medium text-foreground">
                          {SECTOR_LABELS[s]}
                        </td>
                        {PILLAR_ORDER.map((p) => (
                          <td key={p} className="px-2 py-2 text-right tabular-nums">
                            {Math.round(SECTOR_PILLAR_WEIGHTS[s][p] * 100)}%
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <p>
            The digital/ICT pillar (data-centre PUE, 24/7 carbon-free energy, hardware circularity)
            is weighted most for technology firms — the footprint that grows fastest and is least
            consistently reported (<Cite id="malmodin2023" />, <Cite id="unctad2024" />). Targets
            follow SBTi thresholds: ≥67% Scope 3 coverage for near-term, 90% for net-zero
            (<Cite id="sbti2023" />).
          </p>
        </Section>

        <Section id="bands" eyebrow="Grades" title="The 300–850 band scale">
          <p>
            The 0–100 composite is projected onto a familiar 300–850 range and mapped to five bands.
          </p>
          <Card>
            <CardContent className="p-5">
              <ul className="space-y-2.5">
                {[...BANDS]
                  .sort((a, b) => b.min - a.min)
                  .map((b, i, arr) => {
                    const lower = toScore(b.min);
                    const upper = i === 0 ? 850 : toScore(arr[i - 1].min) - 1;
                    return (
                      <li key={b.id} className="flex items-center gap-3 text-sm">
                        <span
                          className="flex size-8 items-center justify-center rounded-lg text-xs font-semibold text-white"
                          style={{ backgroundColor: bandVar(b.id) }}
                        >
                          {b.code}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{b.label}</div>
                          <div className="text-xs">{b.blurb}</div>
                        </div>
                        <span className="tabular-nums text-muted-foreground">
                          {lower}–{upper}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </CardContent>
          </Card>
        </Section>

        <Section id="transparency" eyebrow="No black box" title="What we always show">
          <p>
            Every result exposes the three things ESG raters usually hide (<Cite id="berg2022" />):
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Scope</strong> — which indicators are included, and
              which are not.
            </li>
            <li>
              <strong className="text-foreground">Measurement</strong> — each indicator&apos;s raw
              value and the normalized 0–100 it becomes.
            </li>
            <li>
              <strong className="text-foreground">Weight</strong> — each indicator&apos;s exact share
              of the final grade.
            </li>
          </ul>
        </Section>

        <Section id="limitations" eyebrow="Honesty" title="Limitations">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Inputs are coarse and self-reported; this is a screening estimate, not an audited
              inventory or investment advice.
            </li>
            <li>
              Emission factors are global/regional averages. Real footprints vary with local grids,
              supply chains and behaviour.
            </li>
            <li>
              Weights encode value judgements. We publish them so they can be challenged — a
              recommendation of the composite-indicator literature (<Cite id="oecd2008" />).
            </li>
            <li>
              A production system would add data verification, peer benchmarking, uncertainty ranges
              and third-party assurance.
            </li>
          </ul>
        </Section>

        <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Want the papers behind every number?
          </p>
          <Link
            href="/research"
            className={cn(buttonVariants({ variant: "outline" }), "mt-3 gap-2")}
          >
            Research foundations <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="capitalize text-muted-foreground">{k}</dt>
      <dd className="font-medium tabular-nums text-foreground">{v}</dd>
    </div>
  );
}
