import type { ReactNode } from 'react';

export function List({ children }: { children: ReactNode }) {
  return <ul className="m-0 list-none space-y-2 p-0">{children}</ul>;
}

export function Item({ children }: { children: ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-x-3">
      <span className="mt-3 block h-[1px] w-6 bg-black/70" aria-hidden />
      <div>{children}</div>
    </li>
  );
}
