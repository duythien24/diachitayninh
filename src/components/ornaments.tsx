import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Gold divider with a cloud-scroll knot in the middle, used under section titles. */
export function Ornament({ className, tone = "gold" }: { className?: string; tone?: "gold" | "light" }) {
  const color = tone === "gold" ? "#b8893a" : "#e8cf8a";
  return (
    <svg viewBox="0 0 220 24" className={cn("h-5 w-48", className)} aria-hidden="true">
      <line x1="0" y1="12" x2="78" y2="12" stroke={color} strokeWidth="1" />
      <line x1="142" y1="12" x2="220" y2="12" stroke={color} strokeWidth="1" />
      <g fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
        <path d="M80 12c6 0 8-6 13-6s6 6 2 7-4-3-1-3" />
        <path d="M140 12c-6 0-8-6-13-6s-6 6-2 7 4-3 1-3" />
        <path d="M80 12c6 0 8 6 13 6s6-6 2-7" />
        <path d="M140 12c-6 0-8 6-13 6s-6-6-2-7" />
      </g>
      <path d="M110 3l7 9-7 9-7-9z" fill={color} />
      <circle cx="110" cy="12" r="2" fill={tone === "gold" ? "#fbf4e6" : "#8e1b1b"} />
    </svg>
  );
}

/** Centered heritage-style section title: small gold kicker, serif title, ornament. */
export function HeritageHeading({
  title,
  kicker,
  description,
  tone = "dark",
  className
}: {
  title: string;
  kicker?: string;
  description?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("mx-auto mb-10 max-w-2xl text-center", className)}>
      {kicker ? <p className={cn("text-sm font-semibold", tone === "dark" ? "text-lacquer" : "text-brass")}>{kicker}</p> : null}
      <h2 className={cn("mt-1 font-serif text-3xl font-semibold uppercase tracking-wide sm:text-4xl", tone === "dark" ? "text-palm" : "text-white")}>
        {title}
      </h2>
      <Ornament className="mx-auto mt-3" tone={tone === "dark" ? "gold" : "light"} />
      {description ? <p className={cn("mt-4 leading-7", tone === "dark" ? "text-ink/70" : "text-white/80")}>{description}</p> : null}
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("absolute h-10 w-10 text-brass", className)} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M2 46V8a6 6 0 0 1 6-6h38" />
        <path d="M8 46V14a6 6 0 0 1 6-6h32" opacity="0.6" />
        <path d="M14 20c0-4 3-6 6-6 4 0 5 4 2 5s-3-2-1-2" />
      </g>
    </svg>
  );
}

/** Ivory panel with a double gold rule and scrolled corners, like a framed plaque. */
export function GoldFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative rounded-sm border border-brass/50 bg-paper p-2", className)}>
      <div className="relative h-full rounded-sm border border-brass/30 px-6 py-8 sm:px-10 sm:py-10">
        <Corner className="-left-1 -top-1" />
        <Corner className="-right-1 -top-1 rotate-90" />
        <Corner className="-bottom-1 -right-1 rotate-180" />
        <Corner className="-bottom-1 -left-1 -rotate-90" />
        {children}
      </div>
    </div>
  );
}
