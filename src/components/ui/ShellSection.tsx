import type { ReactNode } from 'react';

type Props = {
  title: string;
  meta?: string;
  children: ReactNode;
  className?: string;
  anchorId?: string;
};

export default function ShellSection({ title, meta, children, className, anchorId }: Props) {

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
        <header className="shell-section__header flex flex-wrap items-center justify-between border-b border-black/20 text-[0.75rem] uppercase tracking-[0.25em]">
          {anchorId ? (
            <a href={`#${anchorId}`} className="no-underline text-current hover:text-black">
              {title}
            </a>
          ) : (
            <span>{title}</span>
          )}
          {meta && <span className="text-black/50 text-[0.6rem] tracking-[0.4em]">{meta}</span>}
        </header>
        <div className="shell-section__body text-[14px] leading-relaxed">{children}</div>
      </div>
      <div className="shell-section__rail" aria-hidden="true">
        <span className="shell-section__badge" />
      </div>
    </section>
  );
}
