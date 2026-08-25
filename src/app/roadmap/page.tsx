import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/common";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Product roadmap",
  description:
    "How Verdex goes from a research-backed demonstrator to a full green-credit-score SaaS: phased milestones, deliverables and success metrics.",
};

type Status = "done" | "active" | "planned";

interface Phase {
  status: Status;
  name: string;
  goal: string;
  deliverables: string[];
  metric: string;
}

const PHASES: Phase[] = [
  {
    status: "done",
    name: "Phase 0 — Foundation & method (this demonstrator)",
    goal: "Prove a transparent, research-grounded score is buildable for both people and companies.",
    deliverables: [
      "Dual scoring engine (individual + organization) with unit tests",
      "Emission factors and weights traceable to standards and papers",
      "Live calculators, methodology and research pages",
    ],
    metric: "A working, inspectable score with every input, weight and source shown.",
  },
  {
    status: "active",
    name: "Phase 1 — Trustworthy MVP",
    goal: "Turn the demonstrator into a product people return to and can share.",
    deliverables: [
      "Accounts, saved profiles and year-over-year tracking",
      "Shareable score cards and improvement plans",
      "Uncertainty ranges on every estimate",
      "Expanded country/grid coverage and localized factors",
    ],
    metric: "Repeat usage and measurable footprint reductions among active users.",
  },
  {
    status: "planned",
    name: "Phase 2 — Real data, less self-reporting",
    goal: "Reduce input burden and error by connecting to primary data sources.",
    deliverables: [
      "Bank/transaction import with EEIOA spend-based estimation (Svalna-style)",
      "Utility, travel and smart-meter connectors for individuals",
      "Company ingestion from CDP/CSRD filings and cloud-provider carbon exports",
      "Data-quality scoring that rewards measured over estimated inputs",
    ],
    metric: "Majority of a typical footprint derived from verified data, not sliders.",
  },
  {
    status: "planned",
    name: "Phase 3 — Benchmarking & incentives",
    goal: "Make the score valuable by connecting it to peers and real rewards.",
    deliverables: [
      "Sector and cohort percentile benchmarking",
      "Rewards & access layer: partner perks tied to score bands (PCT-style)",
      "Employer and community programs",
    ],
    metric: "Partners issuing benefits against Verdex bands; healthy benchmark coverage.",
  },
  {
    status: "planned",
    name: "Phase 4 — Assurance, API & compliance",
    goal: "Become dependable enough for procurement, finance and reporting.",
    deliverables: [
      "Third-party assurance workflow and audit trail",
      "Public scoring API and embeddable widgets",
      "CSRD/ESRS and SFDR-aligned export packs",
      "Model governance: versioned methodology, sensitivity analysis, change logs",
    ],
    metric: "First assured scores used in supplier and lending decisions.",
  },
  {
    status: "planned",
    name: "Phase 5 — Scale & ecosystem",
    goal: "Grow into shared infrastructure for green creditworthiness.",
    deliverables: [
      "Multi-region factor libraries and languages",
      "Marketplace for verified reductions and offsets (post-reduction)",
      "Open methodology governance with external advisory review",
    ],
    metric: "Independent adoption of the taxonomy and score across partners.",
  },
];

const STATUS_META: Record<Status, { label: string; icon: typeof Circle; className: string }> = {
  done: { label: "Shipped", icon: CheckCircle2, className: "text-[var(--band-1)]" },
  active: { label: "In progress", icon: CircleDot, className: "text-[var(--band-3)]" },
  planned: { label: "Planned", icon: Circle, className: "text-muted-foreground" },
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        eyebrow="Product roadmap"
        title="From demonstrator to green-credit infrastructure"
        description="This build is Phase 0: a working, transparent score for people and companies. The path to a full SaaS is phased so that trust — verified data, assurance and governance — is earned before scale."
        className="mb-10"
      />

      <ol className="relative space-y-6 border-l border-border pl-6">
        {PHASES.map((phase) => {
          const meta = STATUS_META[phase.status];
          const Icon = meta.icon;
          return (
            <li key={phase.name} className="relative">
              <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full bg-background">
                <Icon className={cn("size-5", meta.className)} />
              </span>
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{phase.name}</h3>
                    <Badge
                      variant={phase.status === "planned" ? "outline" : "secondary"}
                    >
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{phase.goal}</p>
                  <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                    {phase.deliverables.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Success signal: </span>
                    {phase.metric}
                  </p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          The full written plan — market, personas, GTM and risks — lives in the repository&apos;s{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">docs/PLAN.md</code>.
        </p>
        <Link
          href="/methodology"
          className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
        >
          See the methodology
        </Link>
      </div>
    </div>
  );
}
