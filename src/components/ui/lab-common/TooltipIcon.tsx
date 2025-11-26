import { useState } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';

interface TooltipIconProps {
  tooltip: string;
  size?: number;
}

export const TooltipIcon = ({ tooltip, size = 14 }: TooltipIconProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative group/tooltip">
      <div
        onMouseEnter={(e) => {
          setShowTooltip(true);
          setMousePos({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => e.stopPropagation()}
        className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-help"
      >
        <IconInfoCircle size={size} />
      </div>
      {showTooltip && (
        <div
          className="fixed z-[999999] pointer-events-none"
          style={{
            left: `${mousePos.x + 20}px`,
            top: `${mousePos.y - 10}px`
          }}
        >
          <div className="w-64 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-2xl leading-relaxed">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
};
