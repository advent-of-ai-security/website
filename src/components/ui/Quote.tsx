import type { ReactNode } from 'react';

interface QuoteProps {
  children: ReactNode;
  source: string;
  href: string;
  minimal?: boolean;
}

export default function Quote({ children, source, href, minimal = false }: QuoteProps) {
  if (minimal) {
    return (
      <figure className="not-prose m-0">
        <blockquote className="m-0 text-[13px] italic">{children}</blockquote>
        <figcaption className="mt-1 text-[11px] text-black/70">
          - <a className="underline decoration-black underline-offset-2" href={href} target="_blank" rel="noreferrer">{source}</a>
        </figcaption>
      </figure>
    );
  }
  return (
    <figure className="not-prose my-[var(--shell-gap)] border border-black p-[calc(var(--shell-gap)/2)]">
      <blockquote className="text-[13px]">{children}</blockquote>
      <figcaption className="mt-[calc(var(--shell-gap)/3)] text-[11px]">
        - <a className="underline decoration-black underline-offset-2" href={href} target="_blank" rel="noreferrer">{source}</a>
      </figcaption>
    </figure>
  );
}
