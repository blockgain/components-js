<script lang="ts" setup>
import { toRef, computed, reactive } from 'vue';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useMaybeTrackRefContext } from '../../composables/useTrackRefContext';
import { useBarAnimator } from '../../composables/useBarAnimator';
import { useMultibandTrackVolume } from '../../composables/useTrackVolume';
import type { AgentState } from '../../composables/useVoiceAssistant';

export interface BarVisualizerOptions {
  maxHeight?: number;
  minHeight?: number;
}

export interface BarVisualizerProps {
  state?: AgentState;
  barCount?: number;
  trackRef?: TrackReferenceOrPlaceholder;
  options?: BarVisualizerOptions;
}

const sequencerIntervals = new Map<AgentState, number>([
  ['connecting', 2000],
  ['initializing', 2000],
  ['listening', 500],
  ['thinking', 150],
]);

const props = withDefaults(defineProps<BarVisualizerProps>(), {
  barCount: 15,
  options: () => ({ minHeight: 20, maxHeight: 100 }),
});

const getSequencerInterval = (
  state: AgentState | undefined,
  barCount: number,
): number | undefined => {
  if (state === undefined) {
    return 1000;
  }
  let interval = sequencerIntervals.get(state);
  if (interval) {
    switch (state) {
      case 'connecting':
        // case 'thinking':
        interval /= barCount;
        break;

      default:
        break;
    }
  }
  return interval;
};

const trackRef = toRef(() => props.trackRef);
const state = toRef(() => props.state);
const barCount = toRef(() => props.barCount);
const minHeight = toRef(() => props.options?.minHeight ?? 20);
const maxHeight = toRef(() => props.options?.maxHeight ?? 100);

const trackReference = computed(() => trackRef.value ?? useMaybeTrackRefContext()?.value);

const trackVolumeOptions = reactive({
  bands: barCount,
  loPass: 100,
  hiPass: 200,
});

const volumeBands = useMultibandTrackVolume(trackReference, trackVolumeOptions);

const animatorInterval = computed(() => getSequencerInterval(state.value, barCount.value) ?? 100);

const highlightedIndices = useBarAnimator(state, barCount, animatorInterval);
</script>

<template>
  <div :data-lk-va-state="state" class="lk-audio-bar-visualizer">
    <template v-for="(volume, idx) in volumeBands" :key="idx">
      <slot
        v-if="$slots.default"
        :data-lk-highlighted="highlightedIndices.includes(idx)"
        :data-lk-bar-index="idx"
        :style="{
          height: `${Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))}%`,
        }"
        :class="'lk-audio-bar'"
      />
      <span
        v-else
        :data-lk-highlighted="highlightedIndices.includes(idx)"
        :data-lk-bar-index="idx"
        :class="['lk-audio-bar', { 'lk-highlighted': highlightedIndices.includes(idx) }]"
        :style="{
          // TODO transform animations would be more performant, however the border-radius gets distorted when using scale transforms. a 9-slice approach (or 3 in this case) could work
          // transform: `scale(1, ${Math.min(maxHeight, Math.max(minHeight, volume))}`,
          height: `${Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))}%`,
        }"
      />
    </template>
  </div>
</template>

<style>
:root {
  --lk-theme-color: #06b6d4;
  --lk-va-bar-gap: 20px;
  --lk-va-bar-width: 30px;
  --lk-va-bar-border-radius: 32px;
  --lk-fg: var(--lk-theme-color);
  --lk-drop-shadow: var(--lk-theme-color) 0px 0px 18px;
  --lk-va-bar-bg: hsla(0, 0%, 53%, 0.2);
  --lk-bg: transparent;
  --lk-bg-control: transparent;
  --lk-accent-bg: var(--lk-theme-color);
}

.lk-audio-visualizer {
  width: 100%;
  height: 100%;
  min-height: 160px;
  background: var(--lk-bg-control);
  aspect-ratio: 16/9;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.lk-audio-visualizer > rect {
  fill: var(--lk-accent-bg);
  transition: transform 0.1s cubic-bezier(0.19, 0.02, 0.09, 1);
}

.lk-audio-visualizer > path {
  stroke: var(--lk-accent-bg);
  transition: 0.1s cubic-bezier(0.19, 0.02, 0.09, 1);
}

.lk-audio-bar-visualizer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--lk-bg);
  gap: var(--lk-va-bar-gap, 24px);
}

.lk-audio-bar-visualizer > .lk-audio-bar {
  transform-origin: 'center';
  height: 100%;
  width: var(--lk-va-bar-width, 12px);
  border-radius: var(--lk-va-bar-border-radius, 32px);
  background-color: var(--lk-va-bar-bg, hsla(0, 0%, 53%, 0.2));
  transition: background-color 0.25s ease-out;
}

.lk-audio-bar-visualizer > .lk-audio-bar.lk-highlighted,
.lk-audio-bar-visualizer > [data-lk-highlighted='true'],
.lk-audio-bar-visualizer[data-lk-va-state='speaking'] > .lk-audio-bar {
  background-color: var(--lk-fg, #888);
  transition: none;
}

.lk-audio-bar-visualizer[data-lk-va-state='thinking'] {
  transition: background-color 0.15s ease-out;
}
</style>
