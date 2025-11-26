import type { ReactNode } from 'react';

interface LabContainerProps {
  children: ReactNode;
}

export const LabContainer = ({ children }: LabContainerProps) => (
  <div className="not-prose w-full max-w-none overflow-hidden bg-gradient-to-br from-neutral-50 to-white">
    {children}
  </div>
);
