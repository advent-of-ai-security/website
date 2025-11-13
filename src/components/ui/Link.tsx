import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export default function Link({ children, className = '', ...rest }: Props) {
  return (
    <a
      {...rest}
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
