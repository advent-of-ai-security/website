import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: true,
  include: ['./src/**/*.{ts,astro,vue,mdx}'],
  outdir: 'styled-system',
  theme: {
    extend: {
      tokens: {
        colors: {
          ink: { value: '#16181D' },
          ink2: { value: '#3A3F48' },
          body: { value: '#24272D' },
          mute: { value: '#5B626D' },
          mute2: { value: '#4A505A' },
          seam: { value: '#23262C' },
          read: { value: '#FBFCFD' },
          readout: { value: '#E2E7ED' },
          inert: { value: '#D5DBE3' },
          keyTop: { value: '#F9FAFC' },
          keyBot: { value: '#EEF1F5' },
          field: { value: '#EEF1F5' },
          yellow: { value: '#E2B714' },
          yellowDown: { value: '#CFA50A' },
          yellowInk: { value: '#2B2400' },
          screen: { value: '#23262C' },
          screenInk: { value: '#F1F3F6' },
          screenMute: { value: '#B9C0CA' },
          lockNum: { value: '#5F6570' },
          led: { value: '#8A909B' },
          red: { value: '#D8343A' },
          redDeep: { value: '#B3242A' },
          blue: { value: '#4456D6' },
          pink: { value: '#FFC2C5' },
          lilac: { value: '#C9D0FF' },
          ground1: { value: '#ECEFF3' },
          ground2: { value: '#DDE3EA' },
        },
        fonts: {
          sans: { value: "var(--font-hanken), 'Hanken Grotesk', system-ui, sans-serif" },
        },
        easings: {
          out: { value: 'cubic-bezier(.16,1,.3,1)' },
        },
      },
      keyframes: {
        breathe: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        deny: {
          '0%, 100%': { translate: '0' },
          '20%': { translate: '-4px' },
          '40%': { translate: '4px' },
          '60%': { translate: '-3px' },
          '80%': { translate: '2px' },
        },
        chase: {
          '0%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '40%': { opacity: '1', transform: 'translateY(-3px)' },
        },
        rollin: { from: { transform: 'translateY(70%)', opacity: '0', filter: 'blur(6px)' } },
        hit: { from: { background: '#FF6B72', color: '#16181D' } },
        blink: { to: { visibility: 'hidden' } },
        stamp: { from: { transform: 'scale(1.2)', opacity: '0', filter: 'blur(3px)' } },
        thud: { from: { transform: 'translateY(4px)' } },
        pop: { from: { transform: 'scale(0.4)' } },
      },
    },
  },
  globalCss: {
    body: { margin: 0, background: 'ground2', color: 'ink', fontFamily: 'sans', fontFeatureSettings: "'tnum' 1" },
    '::selection': { background: 'ink', color: 'read' },
    'p:empty': { display: 'none' },
    ':focus-visible': { outline: '2px solid token(colors.ink)', outlineOffset: '3px' },
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': { animation: 'none !important', transitionDuration: '0.01ms !important' },
    },
  },
});
