<script setup lang="ts">
import { css } from 'styled-system/css';

const item = css({ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '14px', alignItems: 'start' });
const dash = css({ mt: '14px', w: '16px', h: '1px', background: 'ink' });
</script>

<template>
  <li :class="item">
    <span :class="dash" aria-hidden="true"></span>
    <div><slot /></div>
  </li>
</template>
