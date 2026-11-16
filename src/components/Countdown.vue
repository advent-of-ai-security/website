<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import * as s from '@/console/styles';

const props = defineProps<{ at: string; now: string }>();
const clock = ref(new Date(props.now).getTime());
let tick: ReturnType<typeof setInterval> | undefined;

const two = (v: number) => String(v).padStart(2, '0');
const left = computed(() => {
  const total = Math.max(0, Math.floor((new Date(props.at).getTime() - clock.value) / 1000));
  const days = Math.floor(total / 86400);
  const time = `${two(Math.floor((total % 86400) / 3600))}:${two(Math.floor((total % 3600) / 60))}:${two(total % 60)}`;
  return days > 0 ? `${days}d ${time}` : time;
});

onMounted(() => {
  clock.value = Date.now();
  tick = setInterval(() => (clock.value = Date.now()), 1000);
});
onBeforeUnmount(() => clearInterval(tick));
</script>

<template>
  <span :class="s.timer">{{ left }}</span>
</template>
