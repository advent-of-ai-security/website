<script setup lang="ts">
import { css } from 'styled-system/css';

defineProps<{ n: number }>();
const item = css({ display: 'flex', gap: '20px', alignItems: 'baseline', py: '14px', borderTop: '1px solid rgba(22,24,29,.14)' });
const figure = css({ flex: 'none', minW: '28px', fontSize: '24px', fontWeight: 300, lineHeight: 1, color: 'ink' });
const body = css({ minW: 0 });
</script>

<template>
  <li :class="item">
    <span :class="figure">{{ n }}</span>
    <div :class="body"><slot /></div>
  </li>
</template>
