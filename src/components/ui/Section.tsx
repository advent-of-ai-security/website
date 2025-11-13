import type { ReactNode } from 'react';
import ShellSection from './ShellSection';
import { anchorize } from '@/utils/anchorize';

export default function Section({
  title,
  meta,
  className,
  children,
}: {
  title: string;
  meta?: string;
  className?: string;
  children: ReactNode;
}) {
  const anchorId = anchorize(title);
  return (
    <ShellSection
      title={title}
      anchorId={anchorId}
      {...(meta !== undefined ? { meta } : {})}
      {...(className !== undefined ? { className } : {})}
    >
      <div className="space-y-3">{children}</div>
    </ShellSection>
  );
}
