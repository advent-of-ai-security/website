import type { ReactNode } from 'react';
import ShellSection from './ShellSection';
import { anchorize } from '@/utils/anchorize';

interface TLDRProps {
  children: ReactNode;
  className?: string;
}

export default function TLDR({ children, className }: TLDRProps) {
  const anchorId = anchorize('TLDR');
  return (
    <ShellSection
      title="TL;DR"
      meta="SUMMARY"
      anchorId={anchorId}
      {...(className !== undefined ? { className } : {})}
    >
      <div className="space-y-3">{children}</div>
    </ShellSection>
  );
}
