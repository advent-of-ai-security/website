import { useEffect, useMemo, useState } from 'react';
import { startOfDayUTC, isSameUTC, formatDateLabel, slugCollator } from '@/utils/dates';
import FooterLinks from './FooterLinks';
import Countdown from './Countdown';
import { List, Item } from './ui/List';


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

function formatCountdown(now: Date, target: Date): string | null {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}


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
    <section
      className="min-h-screen mx-auto w-full max-w-none 2xl:max-w-7xl p-[var(--shell-gap)] text-black [font-family:var(--font-plex-sans),'IBM_Plex_Sans',sans-serif] flex flex-col gap-[var(--shell-gap)]"
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
        <div className="shell-section__card border border-black bg-white">
          <header className="shell-section__header flex flex-wrap items-center justify-between border-b border-black text-[0.7rem] uppercase tracking-[0.16em] sm:text-[0.75rem] sm:tracking-[0.25em]">
            <span>Welcome - December 2025 Beta</span>
          </header>
            <div className="shell-section__body">
              <div className="space-y-6 text-[18px] leading-relaxed">
                <p className="m-0">
                  Welcome! Advent of AI Security 2025 is your guide to the <strong><a href="https://genai.owasp.org/llm-top-10/" target="_blank" rel="noopener noreferrer" className="underline hover:text-black/70 transition-colors">OWASP Top 10 for LLM Applications 2025</a></strong>.
                </p>
                <p className="m-0">
                  Each door reveals a different security vulnerability. Open them to discover what's inside.
                </p>
                <p className="m-0">
                  Designed for developers, security engineers, and AI practitioners building production LLM applications.
                </p>
              </div>
              <div className="mt-[var(--shell-gap)] pt-[var(--shell-gap)] border-t border-black/10">
                <p className="m-0 text-xs opacity-60 leading-relaxed">
                  All content was created with the assistance of AI and proofread by humans. <strong>Found an issue or want to share feedback? <a href="https://github.com/orgs/advent-of-ai-security/discussions" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity">Let me know</a>.</strong>
                </p>
              </div>
            </div>
        </div>
      </section>

      <ol className="grid lg:grid-cols-2 gap-[var(--shell-gap)]" role="list">
        {doors.map((d) => (
          <li
            key={d.slug}
            className="group"
          >
            {(() => {
              const canVisit = unlockAll || d.state === 'open' || d.state === 'today';
              const link = canVisit ? `/doors/${d.slug}` : '#';
              const classes = [
                'relative grid grid-cols-[1fr_auto] items-center min-h-24 h-full border border-black bg-transparent text-black',
                'transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-black',
                'p-[var(--shell-gap)]',
                d.state === 'locked' ? 'opacity-75' : 'border-2',
                d.state === 'today' ? 'ring-1 ring-black' : '',
              ].join(' ');
              const stateLabel = d.state === 'open' ? 'Unlocked' : d.state === 'today' ? 'Opens today' : 'Locked';
              const ariaLabel = d.state === 'locked'
                ? `Door ${String(d.number).padStart(2, '0')} - ${d.label} (Locked)`
                : `Door ${String(d.number).padStart(2, '0')} - ${d.title} - ${d.label} (${stateLabel})`;
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
                      <p className="m-0 text-[0.7rem] uppercase tracking-[0.2em] text-black group-hover:text-white">
                        <time dateTime={d.iso}>{d.label}</time>
                        {formatCountdown(now, d.date) && (
                          <span className="ml-2 text-black/70 group-hover:text-white/70 tabular-nums">
                            in {formatCountdown(now, d.date)}
                          </span>
                        )}
                      </p>
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
        <div className="shell-section__card border border-black bg-white">
          <header className="shell-section__header flex flex-wrap items-center justify-between border-b border-black text-[0.7rem] uppercase tracking-[0.16em] sm:text-[0.75rem] sm:tracking-[0.25em]">
            <span>Other Advent Resources</span>
          </header>
          <div className="shell-section__body">
            <List>
              <Item>
                <a href="https://adventofcode.com" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors underline">Advent of Code</a> - The original programming puzzle advent calendar (honorable mention)
              </Item>
              <Item>
                <a href="https://advent.cloudsecuritypodcast.tv" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors underline">Advent of Cloud Security</a> - 24 days of cloud security videos from the Cloud Security Podcast
              </Item>
              <Item>
                <a href="https://blog.securitybreak.io/genai-x-sec-advent-2025-edition-32c52ff753b4" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors underline">GenAI x Sec Advent</a> - Daily GenAI security use cases by Thomas Roccia (threat intel, PCAP analysis, RAG)
              </Item>
            </List>
          </div>
        </div>
      </section>

      <section className="grid gap-[var(--shell-gap)]">
        <FooterLinks />
      </section>
    </section>
  );
}
