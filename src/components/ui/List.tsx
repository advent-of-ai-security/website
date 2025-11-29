import type { ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
}

interface ItemProps {
  children: ReactNode;
}

export function List({ children }: ListProps) {
  return <ul className="m-0 list-none p-0 flex flex-col gap-[calc(var(--shell-gap)/3)]">{children}</ul>;
}

export function Item({ children }: ItemProps) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-x-[calc(var(--shell-gap)/2)]">
      <span className="mt-[14px] block h-[1px] w-6 bg-black/70" aria-hidden />
      <div>{children}</div>
    </li>
  );
}
