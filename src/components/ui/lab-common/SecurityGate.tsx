import { IconShieldLock } from '@tabler/icons-react';
import { TooltipIcon } from './TooltipIcon';

interface SecurityGateProps {
  label: string;
  description: string;
  tooltip?: string;
  isActive: boolean;
  isTriggered: boolean;
  onToggle: () => void;
  icon: React.ComponentType<{ size: number; stroke: number }>;
  triggeredMessage?: string;
}

export const SecurityGate = ({
  label,
  description,
  tooltip,
  isActive,
  isTriggered,
  onToggle,
  icon: Icon,
  triggeredMessage = 'Threat Blocked'
}: SecurityGateProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`relative cursor-pointer overflow-visible rounded-xl border-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 ${
        isActive
          ? isTriggered
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-neutral-900 bg-white shadow-md'
          : 'border-neutral-200 bg-neutral-50/50 opacity-60 hover:opacity-100 hover:bg-white hover:shadow-sm hover:border-neutral-300'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                isActive
                  ? isTriggered
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-neutral-900 text-white'
                  : 'bg-neutral-200 text-neutral-400'
              }`}
            >
              <Icon size={20} stroke={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4
                  className={`font-bold text-sm transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`}
                >
                  {label}
                </h4>
                {tooltip && <TooltipIcon tooltip={tooltip} />}
              </div>
              <p className="text-xs text-neutral-500 leading-tight mt-0.5 max-w-[180px]">{description}</p>
            </div>
          </div>

          <div
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
              isActive ? (isTriggered ? 'bg-emerald-500' : 'bg-neutral-900') : 'bg-neutral-300'
            }`}
          >
            <div
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </div>

        {isTriggered && (
          <div className="mt-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
              <IconShieldLock size={14} />
              {triggeredMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
