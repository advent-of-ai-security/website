import { IconInfoCircle } from '@tabler/icons-react';

interface InfoBannerProps {
  children: React.ReactNode;
}

export const InfoBanner = ({ children }: InfoBannerProps) => (
  <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
    <div className="flex items-start gap-3">
      <IconInfoCircle size={18} className="mt-0.5 shrink-0 text-neutral-500" />
      <div className="text-xs text-neutral-700 leading-relaxed">
        <span className="font-semibold">How to use:</span> {children}
      </div>
    </div>
  </div>
);
