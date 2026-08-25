import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/common";
import { SOURCES, type Source } from "@/lib/scoring/sources";

export const metadata: Metadata = {
  title: "Research foundations",
  description:
    "The peer-reviewed papers and standards the Verdex green credit score is built on — from Aggregate Confusion to the GHG Protocol and 1.5-Degree Lifestyles.",
};

const TAG_ORDER: Source["tag"][] = [
  "ESG methodology",
  "Carbon accounting",
  "Individual footprint",
  "Digital / ICT",
  "Policy & markets",
];

export default function ResearchPage() {
  const grouped = TAG_ORDER.map((tag) => ({
    tag,
    items: SOURCES.filter((s) => s.tag === tag),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        eyebrow="Research foundations"
        title="Standing on well-documented shoulders"
        description="Verdex is deliberately not an invented methodology. Every scoring choice traces to one of these standards or peer-reviewed papers. Here is the full set, with how each one is used."
        className="mb-10"
      />

      <div className="space-y-12">
        {grouped.map((group) => (
          <section key={group.tag}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold">{group.tag}</h2>
              <Badge variant="secondary">{group.items.length}</Badge>
            </div>
            <div className="grid gap-4">
              {group.items.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-start gap-1.5 font-semibold leading-snug hover:text-primary"
                        >
                          {s.title}
                          <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        </a>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s.authors} · {s.venue} · {s.year}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">How Verdex uses it: </span>
                      {s.usedFor}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
        Citations are provided for verification and academic transparency. Verdex is an independent
        research demonstrator and is not affiliated with or endorsed by any of the cited authors or
        organizations.
      </p>
    </div>
  );
}
