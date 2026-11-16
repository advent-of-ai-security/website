<script setup lang="ts">
import { computed } from 'vue';
import { css, cx } from 'styled-system/css';
import * as s from '@/console/styles';
import { anchorize } from '@/utils/anchorize';

const props = defineProps<{ title: string; meta?: string; noPadding?: boolean }>();
const id = computed(() => anchorize(props.title));

const head = css({ position: 'sticky', top: '24px', display: 'flex', flexDir: 'column', gap: '6px', mdDown: { position: 'static' } });
const anchor = css({ textDecoration: 'none', _hover: { textDecoration: 'underline', textDecorationThickness: '1px', textUnderlineOffset: '6px' } });
const body = css({ pt: '29px', pb: '40px', mdDown: { pt: '20px', pb: '28px' } });
const lab = css({
  display: 'flex',
  flexDir: 'column',
  gap: '1px',
  '& .inset': { background: 'read', p: '22px 24px 26px', fontSize: '18px', lineHeight: 1.6, color: 'body' },
  '& .small': { fontSize: '15px', lineHeight: 1.5 },
  '& .muted': { color: 'mute2' },
});
</script>

<template>
  <section v-if="noPadding" :id="id" :class="lab">
    <div :class="s.tile({ tone: 'readout' })">
      <h2 :class="s.h2">{{ title }}</h2>
    </div>
    <slot />
  </section>
  <section v-else :id="id" :class="s.g3">
    <div :class="s.tile()">
      <div :class="head">
        <h2 :class="s.h2"><a :href="`#${id}`" :class="anchor">{{ title }}</a></h2>
        <span v-if="meta" :class="s.label">{{ meta.charAt(0) + meta.slice(1).toLowerCase() }}</span>
      </div>
    </div>
    <div :class="cx(s.tile(), s.s2, body)">
      <div :class="s.prose"><slot /></div>
    </div>
  </section>
</template>
