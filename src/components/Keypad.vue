<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { css, cx } from 'styled-system/css';
import * as s from '@/console/styles';

type Door = { n: string; title: string; blurb: string; glyph: string; state: 'open' | 'today' | 'locked'; href: string };

const props = defineProps<{ doors: Door[]; featured: string; nextDoor: string | null; nextAt: string | null; now: string }>();

const clock = ref(new Date(props.now).getTime());
const hover = ref<Door | null>(null);
const shown = ref('');
let tick: ReturnType<typeof setInterval> | undefined;
let scramble: ReturnType<typeof setInterval> | undefined;

const featured = computed(() => props.doors.find((d) => d.n === props.featured) ?? props.doors[0]!);
const rest = computed(() => props.doors.filter((d) => d.n !== featured.value.n));

const two = (v: number) => String(v).padStart(2, '0');
const left = computed(() => {
  if (!props.nextAt) return '';
  const total = Math.max(0, Math.floor((new Date(props.nextAt).getTime() - clock.value) / 1000));
  const days = Math.floor(total / 86400);
  const time = `${two(Math.floor((total % 86400) / 3600))}:${two(Math.floor((total % 3600) / 60))}:${two(total % 60)}`;
  return days > 0 ? `${days}d ${time}` : time;
});

function show(door: Door | null) {
  if (hover.value?.n === door?.n) return;
  clearInterval(scramble);
  hover.value = door;
  if (!door) return;
  const target = door.title;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = target;
    return;
  }
  const glyphs = 'ABCDEFGHJKLMNPRSTUVXYZ0123456789';
  let frame = 0;
  scramble = setInterval(() => {
    frame++;
    const keep = Math.floor((target.length * frame) / 8);
    let text = target.slice(0, keep);
    for (let i = keep; i < target.length; i++) text += target[i] === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)];
    shown.value = text;
    if (frame >= 8) clearInterval(scramble);
  }, 30);
}

function arrows(event: KeyboardEvent) {
  const step = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
  if (!step || !(event.currentTarget instanceof HTMLElement)) return;
  const keys = [...event.currentTarget.querySelectorAll<HTMLElement>('a')];
  const next = keys[keys.indexOf(document.activeElement as HTMLElement) + step];
  if (next) {
    event.preventDefault();
    next.focus();
  }
}

onMounted(() => {
  clock.value = Date.now();
  tick = setInterval(() => (clock.value = Date.now()), 1000);
});
onBeforeUnmount(() => {
  clearInterval(tick);
  clearInterval(scramble);
});

const five = css({ display: 'grid', gap: '1px', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', mdDown: { gridTemplateColumns: 'minmax(0, 1fr)' } });
const span3 = css({ gridColumn: 'span 3', mdDown: { gridColumn: 'auto' } });
const span2 = css({ gridColumn: 'span 2', mdDown: { gridColumn: 'auto' } });
const hero = css({ display: 'flex', flexDir: 'column', justifyContent: 'flex-end', gap: '20px', pt: '56px', pb: '34px', mdDown: { pt: '32px', pb: '22px' } });
const readout = css({ display: 'flex', flexDir: 'column', justifyContent: 'space-between', gap: '10px', minH: '150px', mdDown: { minH: '104px' } });
const keypad = css({
  display: 'grid',
  gap: '1px',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gridAutoRows: '150px',
  mdDown: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridAutoRows: 'minmax(112px, auto)' },
});
const enter = css({ gridColumn: '4 / 6', gridRow: '1 / 4', p: '22px 24px 26px', mdDown: { gridColumn: '1 / -1', gridRow: 'auto', order: -1, minH: '232px', p: '18px' } });
const small = css({ p: '18px 24px 20px', mdDown: { p: '12px' } });
const smallNum = css({ fontSize: '84px', ml: '-4px', mdDown: { fontSize: '48px', ml: '-2px' } });
const smallTitle = css({ fontSize: '16px', lineHeight: '20px', fontWeight: 500, mdDown: { fontSize: '13px', lineHeight: '16px' } });
const lockedNote = css({ fontSize: '15px', lineHeight: '20px', color: 'ink2', mdDown: { fontSize: '13px', lineHeight: '16px' } });
const bigNum = css({ fontSize: 'clamp(160px, 21vw, 300px)', ml: '-12px' });
const bigTitle = css({ fontSize: '28px', lineHeight: 1.1, fontWeight: 300, letterSpacing: '-0.02em', maxW: '12ch' });
const action = css({ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 500, pb: '4px' });
const rowTop = css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' });
const rowEnd = css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' });
const ledLabel = css({ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: 'yellowInk' });
const legend = css({ display: 'flex', flexWrap: 'wrap', gap: '16px 28px' });
const legendItem = css({ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: '1 1 190px', fontSize: '15px', lineHeight: 1.45, color: 'ink2', '& b': { fontWeight: 500, color: 'ink' } });
const icon = css({ flex: 'none' });
const lock = '<rect x="6" y="12" width="16" height="12" rx="2"/><path d="M10 12V9a4 4 0 0 1 8 0v3"/>';
</script>

<template>
  <section :class="five">
    <div :class="cx(s.tile(), span3, hero)">
      <h1 :class="s.display">Ten doors into how LLM apps break.</h1>
      <p :class="s.lede">One OWASP LLM Top 10 risk a day, from 1 to 10 December. Every door ends in a lab against a small language model running in your own browser.</p>
    </div>
    <div :class="cx(s.tile({ tone: 'screen' }), span2, readout)" aria-hidden="true">
      <template v-if="hover">
        <span data-label :class="s.label">Door {{ hover.n }}</span>
        <span :class="s.col"><span :class="s.big">{{ shown }}</span><span data-label :class="s.small">{{ hover.blurb }}</span></span>
      </template>
      <template v-else-if="nextDoor">
        <span data-label :class="s.label">Door {{ nextDoor }} opens in</span>
        <span :class="s.timer">{{ left }}</span>
      </template>
      <template v-else>
        <span data-label :class="s.label">2026 edition</span>
        <span :class="s.big">All ten doors are open.</span>
      </template>
    </div>
  </section>

  <section aria-label="Doors" :class="keypad" @mouseleave="show(null)" @keydown="arrows">
    <a
      v-for="door in rest"
      :key="door.n"
      :href="door.href"
      data-key
      :aria-label="door.state === 'locked' ? `Door ${door.n}, locked. ${door.blurb}` : undefined"
      :class="cx(s.key({ tone: door.state === 'locked' ? 'locked' : 'plain', tall: true }), small)"
      @mouseenter="show(door)"
      @focus="show(door)"
    >
      <span :class="rowTop">
        <span data-num :class="cx(s.num, smallNum)">{{ door.n }}</span>
        <svg data-glyph aria-hidden="true" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" v-html="door.state === 'locked' ? lock : door.glyph" />
      </span>
      <span v-if="door.state === 'locked'" :class="lockedNote">{{ door.blurb.replace(' at 00:00 UTC.', '') }}</span>
      <span v-else :class="smallTitle">{{ door.title }}</span>
    </a>

    <a
      :href="featured.href"
      data-key
      :class="cx(s.key({ tone: 'today', tall: true }), enter)"
      @mouseenter="show(featured)"
      @focus="show(featured)"
    >
      <span :class="s.between">
        <span :class="ledLabel"><span :class="s.led({ tone: 'live' })" aria-hidden="true"></span>{{ featured.state === 'today' ? 'Today' : featured.state === 'open' ? 'Latest door' : 'First door' }}</span>
        <svg data-glyph aria-hidden="true" width="30" height="30" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" v-html="featured.state === 'locked' ? lock : featured.glyph" />
      </span>
      <span data-num :class="cx(s.num, bigNum)">{{ featured.n }}</span>
      <span :class="rowEnd">
        <span :class="bigTitle">{{ featured.state === 'locked' ? featured.blurb.replace(' at 00:00 UTC.', '') : featured.title }}</span>
        <span v-if="featured.state !== 'locked'" :class="action">Enter<svg data-arrow aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h12M10 4l5 5-5 5" /></svg></span>
      </span>
    </a>
  </section>

  <section aria-label="What a door holds" :class="five">
    <div :class="cx(s.tile({ tone: 'readout' }), span3, legend)">
      <p :class="legendItem">
        <svg :class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h8a3 3 0 0 1 3 3v14a2.5 2.5 0 0 0-2.5-2.5H4z" /><path d="M24 6h-6a3 3 0 0 0-3 3v14a2.5 2.5 0 0 1 2.5-2.5H24z" /></svg>
        <span><b>Read.</b> What the risk is and where it has already hurt someone.</span>
      </p>
      <p :class="legendItem">
        <svg :class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="14" r="8" /><path d="M14 2v6M14 20v6M2 14h6M20 14h6" /></svg>
        <span><b>Attack.</b> Prompt a real model until it leaks, lies or does what it should not.</span>
      </p>
      <p :class="legendItem">
        <svg :class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3 4 6.5V13c0 5.5 4 9.5 10 12 6-2.5 10-6.500 10-12V6.5z" /><path d="m9.5 14 3 3 6-6.5" /></svg>
        <span><b>Defend.</b> Press a defence in and send the same attack again.</span>
      </p>
    </div>
    <a href="/2025" data-key :class="cx(s.key({ pad: true, row: true }), span2)">
      <span :class="s.col"><span :class="s.h3">2025 edition</span><span :class="s.small">Last December's ten doors, all open, with what moved in the 2026 list.</span></span>
      <svg data-arrow aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h12M10 4l5 5-5 5" /></svg>
    </a>
  </section>
</template>
