import type { ReactNode } from 'react';

interface StepsProps {
  children: ReactNode;
}

interface StepProps {
  n: number;
  children: ReactNode;
}

export function Steps({ children }: StepsProps) {
  return <ol className="m-0 list-none p-0 space-y-2">{children}</ol>;
}

export function Step({ n, children }: StepProps) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4 items-start">
      <span className="text-[0.7rem] uppercase tracking-[0.35em] text-black/60">{String(n).padStart(2, '0')}</span>
      <div>{children}</div>
    </li>
  );
}
