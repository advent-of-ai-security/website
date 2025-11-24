import { IconArrowRight, IconArrowDown } from '@tabler/icons-react';

export const PipelineConnector = ({ 
  active, 
  pulsing 
}: { 
  active: boolean; 
  pulsing?: boolean 
}) => (
  <div className="flex items-center justify-center py-4 lg:py-0 lg:px-4 relative z-0">
    {/* Desktop: Horizontal - arrow centered in full height */}
    <div className="hidden lg:flex items-center w-12 relative h-full">
      <div
        className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full transition-all duration-500 ${active ? 'bg-neutral-300' : 'bg-neutral-100'}`}
      />
      {active && pulsing && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-4 rounded-full bg-neutral-900 animate-flow-right" />
      )}
      <IconArrowRight
        size={16}
        className={`absolute -right-1 top-1/2 -translate-y-1/2 transition-all duration-500 ${active ? 'text-neutral-400' : 'text-neutral-200'}`}
      />
    </div>

    {/* Mobile: Vertical */}
    <div className="lg:hidden flex flex-col items-center h-12 relative">
      <div
        className={`absolute inset-0 mx-auto w-0.5 h-full rounded-full transition-all duration-500 ${active ? 'bg-neutral-300' : 'bg-neutral-100'}`}
      />
      {active && pulsing && (
        <div className="absolute inset-0 mx-auto w-0.5 h-4 rounded-full bg-neutral-900 animate-flow-down" />
      )}
      <IconArrowDown
        size={16}
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-500 ${active ? 'text-neutral-400' : 'text-neutral-200'}`}
      />
    </div>
  </div>
);
