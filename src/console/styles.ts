import { css, cva } from 'styled-system/css';

const glow = (inner: string, outer: string) =>
  `radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), ${inner}, ${outer} 65%)`;

export const page = css({
  minH: '100vh',
  background: 'linear-gradient(180deg, {colors.ground1}, {colors.ground2})',
});
export const wrap = css({
  maxW: '1280px',
  minH: '100vh',
  mx: 'auto',
  p: '28px 24px 48px',
  display: 'flex',
  flexDir: 'column',
  gap: '28px',
  mdDown: { p: '16px 12px 32px', gap: '20px' },
});
export const top = css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px 16px' });
export const brand = css({ display: 'inline-flex', alignItems: 'center', minH: '44px', fontSize: '18px', fontWeight: 500, letterSpacing: '-0.01em', textDecoration: 'none' });
export const link = css({
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '3px',
  transition: 'text-underline-offset .25s {easings.out}',
  _hover: { textUnderlineOffset: '6px' },
});
export const foot = css({ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px 24px', px: '2px', fontSize: '13px', letterSpacing: '0.01em', color: 'mute2' });

export const well = css({
  background: 'seam',
  border: '1px solid {colors.seam}',
  borderRadius: '16px',
  display: 'flex',
  flexDir: 'column',
  gap: '1px',
  overflow: 'clip',
  boxShadow: '0 1px 2px rgba(40,50,70,.1), 0 36px 72px -30px rgba(40,50,70,.38)',
});
export const mid = css({ my: 'auto' });
export const g3 = css({ display: 'grid', gap: '1px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', mdDown: { gridTemplateColumns: 'minmax(0, 1fr)' } });
export const s2 = css({ gridColumn: 'span 2', mdDown: { gridColumn: 'auto' } });
export const stack = css({ display: 'flex', flexDir: 'column', gap: '1px', minW: 0 });
export const col = css({ display: 'flex', flexDir: 'column' });
export const between = css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', w: '100%' });
export const grow = css({ flex: 1 });

export const tile = cva({
  base: { minW: 0, p: '22px 24px 26px', mdDown: { p: '18px 18px 20px' } },
  variants: {
    tone: {
      read: { background: 'read' },
      readout: { background: 'readout', '& [data-label]': { color: 'mute2' } },
      inert: { background: 'inert', '& [data-label]': { color: 'mute2' } },
      screen: { background: 'screen', color: 'screenInk', '& [data-label]': { color: 'screenMute' } },
    },
  },
  defaultVariants: { tone: 'read' },
});

export const key = cva({
  base: {
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    cursor: 'pointer',
    display: 'block',
    textAlign: 'left',
    textDecoration: 'none',
    color: 'ink',
    background: 'linear-gradient(180deg, {colors.keyTop}, {colors.keyBot})',
    transition: 'transform .18s {easings.out}, background .18s, color .18s',
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      pointerEvents: 'none',
      opacity: 0,
      transition: 'opacity .3s',
      background: glow('#FFFFFF', 'rgba(255,255,255,0)'),
    },
    '&:hover::before': { opacity: 1 },
    _active: { transform: 'translateY(2px)', background: 'readout', transitionDuration: '.06s' },
    _focusVisible: { outline: '3px solid {colors.ink}', outlineOffset: '-6px' },
    '& [data-num]': { display: 'inline-block', transition: 'transform .35s {easings.out}' },
    '&:hover [data-num]': { transform: 'translateX(4px)' },
    '& [data-arrow]': { flex: 'none', transition: 'transform .3s {easings.out}' },
    '&:hover [data-arrow]': { transform: 'translateX(5px)' },
    '& [data-glyph]': { flex: 'none', transition: 'transform .35s {easings.out}' },
    '&:hover [data-glyph]': { transform: 'translate(-2px, 2px) scale(1.12)' },
  },
  variants: {
    tone: {
      plain: {},
      today: {
        background: 'yellow',
        _before: { background: glow('#F2D048', 'rgba(242,208,72,0)') },
        _active: { background: 'yellowDown' },
        '& [data-label]': { color: 'yellowInk' },
      },
      locked: {
        background: 'inert',
        _before: { background: glow('#E2E7ED', 'rgba(226,231,237,0)') },
        '& [data-num]': { color: 'lockNum' },
      },
      shut: {
        background: 'inert',
        cursor: 'default',
        _before: { display: 'none' },
        _active: { transform: 'none', background: 'inert', animation: 'deny .3s cubic-bezier(.36,.07,.19,.97)' },
        '& [data-num]': { color: 'lockNum' },
        '&:active [data-bar]': { background: 'red' },
      },
      dark: { background: 'screen', color: 'read', _before: { display: 'none' }, _active: { background: 'screen' }, _focusVisible: { outlineColor: 'read' } },
    },
    on: {
      true: { transform: 'translateY(2px)', background: 'inert', _before: { display: 'none' }, '& [data-bar]': { background: 'blue' } },
    },
    pad: { true: { p: '22px 24px 26px', mdDown: { p: '18px 18px 20px' } } },
    tall: { true: { display: 'flex', flexDir: 'column', justifyContent: 'space-between', gap: '16px' } },
    row: { true: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' } },
    outline: {
      true: { display: 'inline-flex', alignItems: 'center', gap: '10px', minH: '44px', px: '14px', borderRadius: '2px', fontSize: '15px', boxShadow: 'inset 0 0 0 1px {colors.seam}' },
    },
  },
  defaultVariants: { tone: 'plain' },
});

export const label = css({ fontSize: '13px', lineHeight: 1.4, letterSpacing: '0.01em', color: 'mute' });
export const small = css({ fontSize: '15px', lineHeight: 1.45, color: 'mute2' });
export const val = css({ fontSize: '18px', lineHeight: 1.3, fontWeight: 500 });
export const display = css({ fontSize: 'clamp(40px, 5.6vw, 78px)', lineHeight: 0.98, fontWeight: 300, letterSpacing: '-0.035em', textWrap: 'balance' });
export const h1 = css({ fontSize: 'clamp(34px, 4.4vw, 60px)', lineHeight: 1.02, fontWeight: 300, letterSpacing: '-0.03em', textWrap: 'balance' });
export const h2 = css({ fontSize: '32px', lineHeight: 1.1, fontWeight: 300, letterSpacing: '-0.02em' });
export const h3 = css({ fontSize: '18px', lineHeight: '22px', fontWeight: 500 });
export const lede = css({ fontSize: '18px', lineHeight: 1.5, color: 'ink2', maxW: '62ch' });
export const big = css({ fontSize: '24px', lineHeight: 1.2, letterSpacing: '-0.01em' });
export const num = css({ fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 0.9 });
export const timer = css({ fontWeight: 300, lineHeight: 1, fontSize: 'clamp(40px, 5vw, 68px)' });
export const hugeNum = css({ fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 0.9, fontSize: 'clamp(120px, 17vw, 232px)', ml: '-8px' });
export const digits = css({
  display: 'inline-flex',
  overflow: 'hidden',
  '& > span': { display: 'inline-block', animation: 'rollin .8s {easings.out} both' },
  '& > span:nth-child(2)': { animationDelay: '.09s' },
  '& > span:nth-child(3)': { animationDelay: '.18s' },
});

export const segs = css({ display: 'flex', gap: '1px', border: '1px solid {colors.seam}', background: 'seam', borderRadius: '2px', overflow: 'hidden' });
export const seg = css({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minH: '44px',
  px: '18px',
  fontSize: '15px',
  textDecoration: 'none',
  background: '#F4F6F9',
  transition: 'background .18s',
  _hover: { background: '#FFFFFF' },
  _focusVisible: { outline: '3px solid {colors.ink}', outlineOffset: '-6px' },
  '&[aria-current]': { background: 'inert', fontWeight: 500 },
  '&[aria-current] [data-led]': { background: 'ink' },
});
export const led = cva({
  base: { flex: 'none', display: 'inline-block', w: '6px', h: '6px', borderRadius: '50%', background: 'led' },
  variants: {
    tone: {
      off: {},
      ink: { background: 'ink' },
      live: { background: 'ink', animation: 'breathe 2.6s ease-in-out infinite' },
      red: { background: 'red' },
    },
  },
  defaultVariants: { tone: 'off' },
});
export const bar = css({ flex: 'none', w: '40px', h: '4px', background: 'led', transition: 'background .15s' });
export const state = css({ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 500 });

export const field = css({
  display: 'block',
  w: '100%',
  minH: '112px',
  flex: 1,
  resize: 'none',
  background: 'field',
  boxShadow: 'inset 0 0 0 1px {colors.seam}',
  p: '14px 16px',
  fontSize: '15px',
  lineHeight: 1.5,
  caretColor: '{colors.ink}',
});
export const out = css({ maxW: '78ch', fontSize: '18px', lineHeight: 1.65, whiteSpace: 'pre-wrap' });
export const hit = css({ p: '1px 4px', color: 'pink', background: 'rgba(255,107,114,.2)', animation: 'hit .7s {easings.out}' });
export const chip = css({ display: 'inline-block', p: '4px 12px 6px', fontSize: '28px', lineHeight: 1.2, fontWeight: 300, letterSpacing: '-0.01em', color: 'pink', background: 'rgba(255,107,114,.2)' });
export const caret = css({ display: 'inline-block', w: '8px', h: '1.05em', verticalAlign: 'text-bottom', background: 'screenInk', animation: 'blink 1s steps(2, start) infinite' });
export const stamp = css({ transformOrigin: 'left center', animation: 'stamp .45s {easings.out} both' });
export const thud = css({ animation: 'thud .4s {easings.out}' });
export const chase = css({
  display: 'flex',
  gap: '5px',
  '& > i': { w: '6px', h: '6px', borderRadius: '50%', background: 'ink', animation: 'chase .9s ease-in-out infinite' },
  '& > i:nth-child(2)': { animationDelay: '.15s' },
  '& > i:nth-child(3)': { animationDelay: '.3s' },
});
export const pips = css({ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '15px', fontWeight: 500 });
export const pip = cva({
  base: { w: '10px', h: '10px', boxShadow: 'inset 0 0 0 1px {colors.mute}' },
  variants: { hot: { true: { background: 'redDeep', boxShadow: 'none', animation: 'pop .45s {easings.out} both' } } },
});
export const load = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
  gap: '3px',
  '& > i': { h: '8px', boxShadow: 'inset 0 0 0 1px {colors.led}' },
  '& > i[data-on]': { background: 'ink', boxShadow: 'none' },
});
export const track = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(10, 14px)',
  gap: '3px',
  '& > i': { h: '14px', boxShadow: 'inset 0 0 0 1px #A9B0BA' },
  '& > i[data-was]': { boxShadow: 'inset 0 0 0 2px {colors.ink}' },
  '& > i[data-now]': { background: 'ink', boxShadow: 'none' },
});

export const prose = css({
  maxW: '66ch',
  fontSize: '18px',
  lineHeight: 1.62,
  color: 'body',
  '& p': { mb: '18px' },
  '& > :last-child': { mb: 0 },
  '& b, & strong': { fontWeight: 500, color: 'ink' },
  '& a': { textDecoration: 'underline', textDecorationThickness: '1px', textUnderlineOffset: '3px' },
  '& code': { fontSize: '0.9em', background: 'readout', px: '4px' },
  '& .sub': { mt: '24px', mb: '10px', fontSize: '13px', letterSpacing: '0.01em', color: 'mute', fontWeight: 500 },
  '& .small': { fontSize: '15px', lineHeight: 1.5 },
  '& .note': { mt: '4px', fontSize: '13px', color: 'mute' },
  '& .muted': { color: 'mute2' },
  '& .gap': { mt: '16px' },
  '& .stack > * + *': { mt: '16px' },
});
export const sr = css({ position: 'absolute', w: '1px', h: '1px', overflow: 'hidden', clipPath: 'inset(50%)' });
