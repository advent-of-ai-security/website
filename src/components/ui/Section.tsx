import type { ReactNode } from 'react';
import ShellSection from './ShellSection';
import { anchorize } from '@/utils/anchorize';

interface SectionProps {
  title: string;
  meta?: string;
  className?: string;
  noPadding?: boolean;
  children: ReactNode;
}

export default function Section({
  title,
  meta,
  className,
  noPadding,
  children,
}: SectionProps) {
  const anchorId = anchorize(title);
  return (
        <ShellSection
          title={title}
          anchorId={anchorId}
          noPadding={!!noPadding}
          {...(meta !== undefined ? { meta } : {})}
          {...(className !== undefined ? { className } : {})}>
      {noPadding ? children : <div className="space-y-3">{children}</div>}
    </ShellSection>
  );
}
