import type { ReactNode } from 'react';

interface StepsProps {
  children: ReactNode;
}

interface StepProps {
  n: number;
  children: ReactNode;
}

export function Steps({ children }: StepsProps) {
  return <ol className="m-0 list-none p-0 flex flex-col gap-[calc(var(--shell-gap)/3)]">{children}</ol>;
}

export function Step({ n, children }: StepProps) {
  return (
    <li className="flex items-start gap-[calc(var(--shell-gap)/2)]">
      <span className="inline-flex items-center h-7 text-xs uppercase tracking-[0.25em] text-black/50">
        {String(n).padStart(2, '0')}
      </span>
      <div className="[&>b:first-child]:leading-7">{children}</div>
    </li>
  );
}
