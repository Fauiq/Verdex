import type { Metadata } from "next";

import { IndividualCalculator } from "@/components/calculators/individual-calculator";
import { SectionHeading } from "@/components/common";

export const metadata: Metadata = {
  title: "Personal green credit score",
  description:
    "Estimate your consumption-based carbon footprint across mobility, home, goods and digital — scored against a 1.5°C fair share, with your highest-leverage changes.",
};

export default function IndividualPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        eyebrow="Personal score"
        title="How green is your lifestyle, really?"
        description="Your footprint is estimated across four domains — mobility, home, goods and digital — and scored against the per-capita fair share for 1.5°C (net of food). Everything runs in your browser — nothing is stored."
        className="mb-8 max-w-3xl"
      />
      <IndividualCalculator />
    </div>
  );
}
