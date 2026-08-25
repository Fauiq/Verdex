"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { ModeToggle } from "@/components/mode-toggle";

const NAV = [
  { href: "/individual", label: "For individuals" },
  { href: "/organization", label: "For companies" },
  { href: "/methodology", label: "Methodology" },
  { href: "/research", label: "Research" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Verdex home">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <Link
            href="/individual"
            className={cn(
              buttonVariants({ variant: "default" }),
              "hidden h-9 px-4 sm:inline-flex",
            )}
          >
            Check your score
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-background md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pathname.startsWith(item.href) && "bg-muted text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/individual"
              className={cn(buttonVariants({ variant: "default" }), "mt-2 h-10")}
            >
              Check your score
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
