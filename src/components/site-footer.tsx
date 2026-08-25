import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/individual", label: "Individual score" },
      { href: "/organization", label: "Company score" },
      { href: "/methodology", label: "Methodology" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/research", label: "Research foundations" },
      { href: "/methodology#transparency", label: "Score transparency" },
      { href: "/methodology#limitations", label: "Limitations" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <BrandLogo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A transparent green credit score for people and companies, built on
            peer-reviewed carbon accounting and composite-indicator science —
            not a black box.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Verdex. A research demonstrator, not financial or compliance advice.</p>
          <p>Estimates are indicative and depend on self-reported inputs.</p>
        </div>
      </div>
    </footer>
  );
}
