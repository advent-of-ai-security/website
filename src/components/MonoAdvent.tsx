import { useEffect, useMemo, useState } from 'react';
import { startOfDayUTC, isSameUTC, formatDateLabel, slugCollator } from '@/utils/dates';
import FooterLinks from './FooterLinks';
import Countdown from './Countdown';

const ANIMATIONS_CSS = `
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-stagger {
  animation: fadeSlideIn 0.5s ease-out backwards;
  animation-delay: calc(var(--index) * 50ms);
}
`;

export type DoorState = 'locked' | 'today' | 'open';

export type DoorDocument = {
  slug: string;
  title: string;
  description?: string;
  date: string;
  state?: DoorState;
};

type ParsedDoor = DoorDocument & { date: Date };

type Door = {
  slug: string;
  number: number;
  title: string;
  description?: string;
  date: Date;
  iso: string;
  label: string;
  state: DoorState;
};


type Props = {
  doors: DoorDocument[];
  unlockAll?: boolean;
};


export default function MonoAdvent({ doors: rawDoors, unlockAll }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(t);
  }, []);

  const orderedDoors = useMemo<ParsedDoor[]>(() => {
    return rawDoors
      .map((door) => {
        const date = new Date(door.date);
        if (Number.isNaN(date.getTime())) return null;
        return { ...door, date };
      })
      .filter((door): door is ParsedDoor => Boolean(door))
      .sort((a, b) => slugCollator.compare(a.slug, b.slug));
  }, [rawDoors]);

  const doors = useMemo<Door[]>(() => {
    const todayUTC = startOfDayUTC(now);
    return orderedDoors.map((door, index) => {
      const midnight = startOfDayUTC(door.date);
      let state: DoorState = 'locked';
      if (unlockAll) state = 'open';
      else if (door.state) state = door.state;
      else if (todayUTC > midnight) state = 'open';
      else if (isSameUTC(todayUTC, midnight)) state = 'today';
      return {
        slug: door.slug,
        number: index + 1,
        title: door.title,
        date: door.date,
        iso: door.date.toISOString(),
        label: formatDateLabel(door.date),
        state,
        ...(door.description !== undefined ? { description: door.description } : {}),
      };
    });
  }, [now, orderedDoors, unlockAll]);

  const kickoffUTC = useMemo(() => new Date(Date.UTC(2025, 11, 1, 0, 0, 0)), []);
  const showKickoff = now.getTime() < kickoffUTC.getTime();


  return (
    <>
      <style>{ANIMATIONS_CSS}</style>
    <section
      className="min-h-screen mx-auto w-full max-w-none 2xl:max-w-7xl p-[var(--shell-gap)] text-black [font-family:var(--font-plex-mono),'IBM_Plex_Mono',monospace] flex flex-col gap-[var(--shell-gap)]"
      aria-labelledby="title"
    >
      <header className="grid gap-[var(--shell-gap)]">
        <h1 id="title" className="m-0 text-[1.55rem] uppercase tracking-[0.18em] text-black flex flex-wrap items-baseline gap-[calc(var(--shell-gap)/2)]">
          <span>ADVENT OF AI SECURITY 2025</span>
          {showKickoff && (
            <>
              <span className="normal-case text-[1.1rem] tracking-normal text-black/60">starting in</span>
              <Countdown className="normal-case text-[1.55rem] tracking-[0.18em] text-black" targetIso={kickoffUTC.toISOString()} />
            </>
          )}
        </h1>
      </header>

      <section className="grid gap-[var(--shell-gap)]">
        <div className="shell-section__card border border-black bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <header className="shell-section__header flex flex-wrap items-center justify-between border-b border-black text-[0.7rem] uppercase tracking-[0.16em] sm:text-[0.75rem] sm:tracking-[0.25em]">
            <span>Welcome - December 2025 Beta</span>
          </header>
            <div className="shell-section__body">
              <div className="space-y-6 text-[15px] leading-relaxed">
                <p className="m-0">
                  Welcome! Advent of AI Security 2025 is your guide to the <strong><a href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener noreferrer" className="underline hover:text-black/70 transition-colors">OWASP Top 10 for LLM Applications 2025</a></strong>.
                </p>
                <p className="m-0">
                  Each door reveals a different security vulnerability. Open them to discover what's inside.
                </p>
                <p className="m-0 text-sm opacity-75">
                  Designed for developers, security engineers, and AI practitioners building production LLM applications.
                </p>
              </div>
              <div className="mt-[var(--shell-gap)] pt-[var(--shell-gap)] border-t border-black/10">
                <p className="m-0 text-xs opacity-60 leading-relaxed">
                  All content was created with the assistance of AI and proofread by humans.
                </p>
              </div>
            </div>
        </div>
      </section>

      <ol className="grid lg:grid-cols-2 gap-[var(--shell-gap)]" role="list">
        {doors.map((d, index) => (
          <li
            key={d.slug}
            className="group animate-stagger"
            style={{ '--index': index } as React.CSSProperties}
          >
            {(() => {
              const link = `/doors/${d.slug}`;
              const canVisit = unlockAll || d.state === 'open' || d.state === 'today';
              const classes = [
                'relative grid grid-cols-[1fr_auto] items-center min-h-24 h-full border border-black bg-transparent text-black',
                'transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-black',
                'p-[var(--shell-gap)]',
                d.state === 'locked' ? 'opacity-75' : 'border-2',
                d.state === 'today' ? 'ring-1 ring-black' : '',
              ].join(' ');
              const stateLabel = d.state === 'open' ? 'Unlocked' : d.state === 'today' ? 'Opens today' : 'Locked';
              const ariaLabel = `Door ${String(d.number).padStart(2, '0')} - ${d.title} - ${d.label} (${stateLabel})`;
              const content = (
                <>
                  <div className="grid gap-[var(--shell-gap)]">
                    <p className="m-0 text-2xl tracking-[0.2em] group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                      {String(d.number).padStart(2, '0')}
                    </p>
                    { (d.state === 'open' || d.state === 'today') ? (
                      <p className="text-[0.7rem] uppercase tracking-[0.15em] font-bold leading-tight group-hover:text-white max-w-[24ch]">
                        {d.title.replace(/^Door \d+ - /, '')}
                      </p>
                    ) : (
                      <time className="text-[0.7rem] uppercase tracking-[0.2em] text-black/70 group-hover:text-white/80" dateTime={d.iso}>
                        {d.label}
                      </time>
                    )}
                  </div>
                  <div className="text-right grid justify-items-end gap-[var(--shell-gap)]">
                    <span className="inline-grid place-items-center h-5 px-3 border border-black text-[0.6rem] uppercase tracking-[0.25em] group-hover:border-white group-hover:text-white">
                      {d.state === 'open' ? 'UNLOCKED' : d.state === 'today' ? 'TODAY' : 'LOCKED'}
                    </span>
                    <span aria-hidden className="tracking-[0.3em] transition-transform group-hover:translate-x-0.5 group-hover:text-white">
                      {d.state === 'locked' ? '-' : '→'}
                    </span>
                  </div>
                </>
              );
              return canVisit ? (
                <a href={link} aria-label={ariaLabel} className={classes}>
                  {content}
                </a>
              ) : (
                <div className={classes} aria-disabled="true" aria-label={ariaLabel}>
                  {content}
                </div>
              );
            })()}
          </li>
        ))}
      </ol>

      <section className="grid gap-[var(--shell-gap)]">
        <FooterLinks />
      </section>
    </section>
    </>
  );
}
