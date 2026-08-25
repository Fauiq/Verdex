import type { Metadata } from "next";

import { OrganizationCalculator } from "@/components/calculators/organization-calculator";
import { SectionHeading } from "@/components/common";

export const metadata: Metadata = {
  title: "Company green credit score",
  description:
    "Score a company across five sector-weighted pillars — carbon, digital/ICT, resources, targets and transparency — with every indicator traceable to a standard or paper.",
};

export default function OrganizationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        eyebrow="Company score"
        title="Score a company the way it should be scored"
        description="Five pillars, weighted by sector materiality and combined with partly non-compensatory aggregation. A dedicated digital/ICT pillar captures the footprint most ratings miss."
        className="mb-8 max-w-3xl"
      />
      <OrganizationCalculator />
    </div>
  );
}
