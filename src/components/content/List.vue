<script setup lang="ts">
import { css } from 'styled-system/css';

const list = css({ my: '18px', display: 'flex', flexDir: 'column', gap: '12px' });
</script>

<template>
  <ul :class="list"><slot /></ul>
</template>
