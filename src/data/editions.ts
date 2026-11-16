import { startOfDayUTC } from '@/utils/dates';

export type DoorState = 'open' | 'today' | 'locked';

export type DoorInfo = {
  n: string;
  title: string;
  blurb: string;
  glyph: string;
  date: Date;
};

const dec = (year: number, day: number) => new Date(Date.UTC(year, 11, day));

export const doors2026: DoorInfo[] = [
  {
    n: '01',
    title: 'Prompt Injection',
    blurb: 'Instructions and data share one stream, so input can rewrite the rules.',
    glyph: '<path d="M3 14h12M11 10l4 4-4 4"/><path d="M19 5h5v18h-5"/>',
    date: dec(2026, 1),
  },
  {
    n: '02',
    title: 'Sensitive Information Disclosure',
    blurb: 'Private data reaches people who were never cleared to see it.',
    glyph: '<path d="M2 14s4.5-7 12-7 12 7 12 7-4.5 7-12 7S2 14 2 14z"/><circle cx="14" cy="14" r="3"/>',
    date: dec(2026, 4),
  },
  {
    n: '03',
    title: 'Excessive Agency',
    blurb: 'The model holds more tools, permissions or autonomy than its task needs.',
    glyph: '<circle cx="6" cy="14" r="3"/><path d="M9 14h6M15 14l7-8M15 14l7 8M15 14h8"/>',
    date: dec(2026, 6),
  },
  {
    n: '04',
    title: 'Supply Chain',
    blurb: 'Models, adapters and datasets arrive from sources nobody verified.',
    glyph: '<rect x="2" y="10" width="11" height="8" rx="4"/><rect x="15" y="10" width="11" height="8" rx="4"/><path d="M10 14h8"/>',
    date: dec(2026, 9),
  },
  {
    n: '05',
    title: 'Data and Model Poisoning',
    blurb: 'Tampered training or retrieval data plants behaviour that waits for a trigger.',
    glyph: '<path d="M14 3s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/><path d="M11 17a3 3 0 0 0 3 3"/>',
    date: dec(2026, 11),
  },
  {
    n: '06',
    title: 'Unbounded Consumption',
    blurb: 'Nothing caps how much inference one caller can burn.',
    glyph: '<path d="M4 21a10 10 0 1 1 20 0"/><path d="M14 21l5-9"/>',
    date: dec(2026, 14),
  },
  {
    n: '07',
    title: 'Misinformation',
    blurb: 'Confident, wrong output gets trusted and acted on.',
    glyph: '<path d="M4 5h20v14H13l-5 4v-4H4z"/><path d="M11.5 10a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1.2-1.5 2M14 16.5v.3"/>',
    date: dec(2026, 16),
  },
  {
    n: '08',
    title: 'Hidden Context Exposure',
    blurb: 'Whatever sits in the model context can be read back out.',
    glyph: '<path d="M14 4 3 10l11 6 11-6z"/><path d="M3 16l11 6 11-6" stroke-dasharray="2 3"/>',
    date: dec(2026, 19),
  },
  {
    n: '09',
    title: 'Vector and Embedding Weaknesses',
    blurb: 'Similarity search decides what the model sees, and it can be steered.',
    glyph: '<circle cx="6" cy="20" r="2"/><circle cx="14" cy="8" r="2"/><circle cx="22" cy="17" r="2"/><path d="M7.2 18.3 12.8 9.7M15.7 9.2l5 6.3"/>',
    date: dec(2026, 21),
  },
  {
    n: '10',
    title: 'Improper Output Handling',
    blurb: 'Model output is passed to a browser, shell or database without checks.',
    glyph: '<path d="M10 7 3 14l7 7M18 7l7 7-7 7M16 5l-4 18"/>',
    date: dec(2026, 24),
  },
];

export const recap2025 = [
  { n: '01', title: 'Prompt Injection', blurb: 'Instructions and data share one stream, so input can rewrite the rules.', now: 1 },
  { n: '02', title: 'Sensitive Information Disclosure', blurb: 'Private data reaches people who were never cleared to see it.', now: 2 },
  { n: '03', title: 'Supply Chain', blurb: 'Models, adapters and datasets arrive from sources nobody verified.', now: 4 },
  { n: '04', title: 'Data and Model Poisoning', blurb: 'Tampered training or retrieval data plants behaviour that waits for a trigger.', now: 5 },
  { n: '05', title: 'Improper Output Handling', blurb: 'Model output is passed to a browser, shell or database without checks.', now: 10 },
  { n: '06', title: 'Excessive Agency', blurb: 'The model holds more tools, permissions or autonomy than its task needs.', now: 3 },
  { n: '07', title: 'System Prompt Leakage', blurb: 'Secrets and rules written into the prompt can be read back out. Renamed in 2026.', now: 8 },
  { n: '08', title: 'Vector and Embedding Weaknesses', blurb: 'Similarity search decides what the model sees, and it can be steered.', now: 9 },
  { n: '09', title: 'Misinformation', blurb: 'Confident, wrong output gets trusted and acted on.', now: 7 },
  { n: '10', title: 'Unbounded Consumption', blurb: 'Nothing caps how much inference one caller can burn.', now: 6 },
];

export function doorState(date: Date, unlockAll: boolean, now = new Date()): DoorState {
  if (unlockAll) return 'open';
  const today = startOfDayUTC(now).getTime();
  const day = startOfDayUTC(date).getTime();
  if (day < today) return 'open';
  return day === today ? 'today' : 'locked';
}

export function longDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
