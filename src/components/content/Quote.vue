<script setup lang="ts">
import { css } from 'styled-system/css';

defineProps<{ source: string; href: string; minimal?: boolean }>();
const figure = css({ my: '18px', p: '16px 20px 18px', background: 'readout', fontSize: '16px', lineHeight: 1.55 });
const caption = css({ mt: '8px', fontSize: '13px', color: 'mute2' });
</script>

<template>
  <figure :class="figure">
    <blockquote><slot /></blockquote>
    <figcaption :class="caption">Source: <a :href="href" target="_blank" rel="noreferrer noopener">{{ source }}</a></figcaption>
  </figure>
</template>
