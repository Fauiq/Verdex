import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      {/* leaf */}
      <path
        d="M22.5 8.5c0 6.6-4.2 11.5-9.8 11.5-1 0-2-.2-2.9-.5C10.9 13 15.6 9 22.5 8.5Z"
        className="fill-primary-foreground"
        opacity="0.95"
      />
      <path
        d="M9 22.5C11.5 16 16 12.3 22 10.4"
        className="stroke-primary"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* gauge arc */}
      <path
        d="M8 24a8 8 0 0 1 16 0"
        className="stroke-primary-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
    </svg>
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-heading", className)}>
      <BrandMark />
      <span className="text-lg font-semibold tracking-tight">
        Verdex
      </span>
    </span>
  );
}
