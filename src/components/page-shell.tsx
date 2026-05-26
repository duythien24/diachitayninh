import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>;
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
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase text-lacquer">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h1>
      {description ? <p className="mt-4 text-base leading-7 text-ink/68">{description}</p> : null}
    </div>
  );
}
