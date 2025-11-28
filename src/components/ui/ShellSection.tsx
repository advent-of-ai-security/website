import type { ReactNode } from 'react';
import { IconArrowUp } from '@tabler/icons-react';

type Props = {
  title: string;
  meta?: string;
  children: ReactNode;
  className?: string;
  anchorId?: string;
  noPadding?: boolean;
};

export default function ShellSection({ title, meta, children, className, anchorId, noPadding }: Props) {

  return (
    <section
      data-shell-section
      id={anchorId}
      className={[
        'shell-section',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="shell-section__card">
        <header className="shell-section__header flex flex-wrap items-center justify-between border-b border-black/20 text-[0.7rem] uppercase tracking-[0.16em] sm:text-[0.75rem] sm:tracking-[0.25em]">
          {anchorId ? (
            <a href={`#${anchorId}`} className="no-underline text-current hover:text-black">
              {title}
            </a>
          ) : (
            <span>{title}</span>
          )}
          <div className="flex items-center gap-[calc(var(--shell-gap)/2)]">
            {meta && (
              <span className="text-black/50 text-[0.6rem] tracking-[0.4em]">{meta}</span>
            )}
            <a
              href="#section-why-you-need-to-know-this"
              title="Back to top"
              aria-label="Scroll back to top"
              className="inline-flex items-center justify-center text-black/40 hover:text-black transition-colors"
            >
              <IconArrowUp size={18} aria-hidden="true" />
            </a>
          </div>
        </header>
        <div className={`shell-section__body text-[14px] leading-relaxed ${noPadding ? '!p-0' : ''}`}>{children}</div>
      </div>
      <div className="shell-section__rail" aria-hidden="true">
        <span className="shell-section__badge" />
      </div>
    </section>
  );
}
