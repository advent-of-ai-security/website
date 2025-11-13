import type { ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
}

interface ItemProps {
  children: ReactNode;
}

export function List({ children }: ListProps) {
  return <ul className="m-0 list-none space-y-2 p-0">{children}</ul>;
}

export function Item({ children }: ItemProps) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-x-3">
      <span className="mt-3 block h-[1px] w-6 bg-black/70" aria-hidden />
      <div>{children}</div>
    </li>
  );
}
