<script setup lang="ts">
import { css } from 'styled-system/css';

const list = css({ my: '18px', display: 'flex', flexDir: 'column', borderBottom: '1px solid rgba(22,24,29,.14)' });
</script>

<template>
  <ol :class="list"><slot /></ol>
</template>
