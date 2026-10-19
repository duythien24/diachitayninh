import type { ReactNode } from "react";

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
    <div className="bg-pattern relative overflow-hidden rounded-2xl border border-ink/8 bg-sand/70 px-6 py-10 sm:px-10 sm:py-12">
      <span className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brass/15 blur-3xl" aria-hidden="true" />
      <span className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-palm/10 blur-3xl" aria-hidden="true" />
      <div className="relative max-w-3xl animate-fade-up">
        {eyebrow ? (
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lacquer">
            <span className="h-px w-6 bg-lacquer/60" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-base leading-7 text-ink/68 sm:text-lg sm:leading-8">{description}</p> : null}
      </div>
    </div>
  );
}
