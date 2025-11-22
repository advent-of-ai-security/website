import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export default function Link({
  children,
  className = '',
  rel,
  target,
  ...rest
}: Props) {
  const relAttr = rel ?? 'noreferrer';
  const targetAttr = target ?? '_blank';
  return (
    <a
      {...rest}
      rel={relAttr}
      target={targetAttr}
      className={[
        'underline decoration-black underline-offset-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </a>
  );
}
