import type { ReactNode } from "react";

import { Ornament } from "@/components/ornaments";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>;
}

export function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-lattice rounded-sm border border-brass/60 p-2 shadow-book">
      <div className="rounded-sm border border-brass/40 px-6 py-10 text-center sm:px-10 sm:py-12">
        {eyebrow ? <p className="font-serif text-base italic text-brass">{eyebrow}</p> : null}
        <h1 className="mt-1 font-serif text-3xl font-semibold uppercase leading-tight tracking-wide text-[#f6e3b0] sm:text-4xl">{title}</h1>
        <Ornament className="mx-auto mt-3" tone="light" />
        {description ? <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">{description}</p> : null}
      </div>
    </div>
  );
}
