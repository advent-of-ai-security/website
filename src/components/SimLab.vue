<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { css, cx } from 'styled-system/css';
import * as s from '@/console/styles';
import { sim2025 } from '@/labs/sim2025';

const props = defineProps<{ door: string }>();
const lab = sim2025[props.door]!;

const picked = ref(lab.scenarios.find((sc) => sc.attack)?.id ?? lab.scenarios[0]!.id);
const active = reactive<Record<string, boolean>>({});

const scenario = computed(() => lab.scenarios.find((sc) => sc.id === picked.value)!);
const blocker = computed(() => {
  const id = scenario.value.blockedBy.find((d) => active[d]);
  return id ? lab.defences.find((d) => d.id === id) : undefined;
});
const verdict = computed(() => (!scenario.value.attack ? lab.normalVerdict : blocker.value ? lab.blockedVerdict : lab.leakVerdict));
const output = computed(() => (blocker.value ? lab.blockedOutput.replace('{defence}', blocker.value.label) : scenario.value.output));
const tone = computed(() => (!scenario.value.attack ? 'screenMute' : blocker.value ? 'lilac' : 'pink'));

const head = css({ display: 'flex', flexDir: 'column', gap: '4px' });
const labelled = css({ display: 'flex', flexDir: 'column', gap: '6px' });
const picks = css({ display: 'flex', flexWrap: 'wrap', gap: '8px' });
const inputs = css({ display: 'flex', flexDir: 'column', gap: '12px' });
const inputText = css({ background: 'field', boxShadow: 'inset 0 0 0 1px {colors.seam}', p: '12px 16px', fontSize: '15px', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' });
const left = css({ display: 'flex', flexDir: 'column', gap: '16px' });
const latch = css({ flex: 1, minH: '96px' });
const screen = css({ display: 'flex', flexDir: 'column', gap: '10px', minH: '150px' });
const status = css({ display: 'flex', alignItems: 'center', gap: '10px' });
const verdictText = css({ fontSize: '13px', letterSpacing: '0.01em' });
</script>

<template>
  <div :class="s.stack">
    <div :class="s.g3">
      <div :class="cx(s.tile(), s.s2, left)">
        <div :class="head">
          <h3 :id="`pick-${door}`" :class="s.h3">1. Pick a scenario</h3>
          <p :class="s.small">{{ scenario.description }}</p>
        </div>
        <div role="radiogroup" :aria-labelledby="`pick-${door}`" :class="picks">
          <button
            v-for="sc in lab.scenarios"
            :key="sc.id"
            type="button"
            role="radio"
            data-key
            :aria-checked="sc.id === picked"
            :class="s.key({ outline: true, tone: sc.id === picked ? 'dark' : 'plain' })"
            @click="picked = sc.id"
          >
            {{ sc.label }}
          </button>
        </div>
        <div :class="inputs">
          <div v-for="input in scenario.inputs" :key="input.label" :class="labelled">
            <span :class="s.label">{{ input.label }}</span>
            <p :class="inputText">{{ input.value }}</p>
          </div>
        </div>
      </div>
      <div :class="s.stack">
        <button
          v-for="defence in lab.defences"
          :key="defence.id"
          type="button"
          role="switch"
          data-key
          :aria-checked="!!active[defence.id]"
          :title="defence.tooltip"
          :class="cx(s.key({ pad: true, tall: true, on: !!active[defence.id] }), latch)"
          @click="active[defence.id] = !active[defence.id]"
        >
          <span :class="s.between">
            <span :class="s.h3">{{ defence.label }}</span>
            <span :class="s.state" aria-hidden="true">{{ active[defence.id] ? 'On' : 'Off' }}<span data-bar :class="s.bar"></span></span>
          </span>
          <span data-label :class="s.label">{{ defence.description }}</span>
        </button>
      </div>
    </div>
    <div role="status" :class="cx(s.tile({ tone: 'screen' }), screen)">
      <span :class="status">
        <span :class="verdictText" :style="{ color: `var(--colors-${tone})` }">{{ verdict }}</span>
      </span>
      <p :class="s.out">{{ output }}</p>
    </div>
    <div :class="s.tile({ tone: 'readout' })">
      <span data-label :class="s.label">Simulation with fixed responses. No model runs here; the 2026 labs use a real one.</span>
    </div>
  </div>
</template>
