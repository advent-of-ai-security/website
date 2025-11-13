import type { ReactNode } from 'react';

export default function Quote({ children, source, href, minimal = false }: { children: ReactNode; source: string; href: string; minimal?: boolean }) {
  if (minimal) {
    return (
      <figure className="not-prose m-0">
        <blockquote className="m-0 text-[13px] italic">{children}</blockquote>
        <figcaption className="mt-1 text-[11px] text-black/70">
          — <a className="underline decoration-black underline-offset-2" href={href} target="_blank" rel="noreferrer">{source}</a>
        </figcaption>
      </figure>
    );
  }
  return (
    <figure className="not-prose border border-black p-3 md:p-4">
      <blockquote className="text-[13px]">{children}</blockquote>
      <figcaption className="mt-2 text-[11px]">
        — <a className="underline decoration-black underline-offset-2" href={href} target="_blank" rel="noreferrer">{source}</a>
      </figcaption>
    </figure>
  );
}
