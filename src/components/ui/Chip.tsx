import type { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
}

export default function Chip({ children }: ChipProps) {
  return (
    <span className="inline-flex h-[calc(var(--shell-gap)*1.5)] items-center border border-black/60 bg-white/95 px-[calc(var(--shell-gap)/2)] text-[11px] uppercase tracking-[0.25em] text-black">
      {children}
    </span>
  );
}
