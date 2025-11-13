import { useEffect, useMemo, useState } from 'react';

type Props = {
  targetIso: string;
  className?: string;
  prefix?: string;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Countdown({ targetIso, className, prefix }: Props) {
  const target = useMemo(() => new Date(targetIso), [targetIso]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  let diff = target.getTime() - now.getTime();
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  if (totalSeconds <= 0) return null;
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <span role="timer" aria-live="polite" className={className}>
      {prefix && prefix.trim().length > 0 && (
        <span className="mr-3 uppercase tracking-[0.25em] text-[0.7rem] text-black/70">{prefix}</span>
      )}
      <span className="[font-feature-settings:'tnum'] tabular-nums">
        {days > 0 && (
          <>
            <span className="inline-block min-w-6 text-right">{days}</span>
            <span className="mx-1">d</span>
          </>
        )}
        <span className="inline-block min-w-6 text-right">{pad(hours)}</span>
        <span className="mx-1">h</span>
        <span className="inline-block min-w-6 text-right">{pad(minutes)}</span>
        <span className="mx-1">m</span>
        <span className="inline-block min-w-6 text-right">{pad(seconds)}</span>
        <span className="ml-1">s</span>
      </span>
    </span>
  );
}
