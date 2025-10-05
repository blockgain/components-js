import { ref, computed, watchEffect, toValue, type Ref, type MaybeRef } from 'vue';
import type { AgentState } from './useVoiceAssistant';

export const generateListeningSequenceBar = (columns: number): number[][] => {
  const center = Math.floor(columns / 2);
  const noIndex = -1;

  return [[center], [noIndex]];
};

export const generateConnectingSequenceBar = (columns: number): number[][] => {
  const seq = [];

  for (let x = 0; x < columns; x++) {
    seq.push([x, columns - 1 - x]);
  }

  return seq;
};

export const useBarAnimator = (
  state: MaybeRef<AgentState | undefined>,
  columns: MaybeRef<number>,
  interval: MaybeRef<number>,
): Ref<number[]> => {
  const index = ref(0);
  const sequence = ref<number[][]>([[]]);

  watchEffect(() => {
    const currentState = toValue(state);
    const currentColumns = toValue(columns);

    if (currentState === 'thinking') {
      sequence.value = generateListeningSequenceBar(currentColumns);
    } else if (currentState === 'connecting' || currentState === 'initializing') {
      const s = [...generateConnectingSequenceBar(currentColumns)];
      sequence.value = s;
    } else if (currentState === 'listening') {
      sequence.value = generateListeningSequenceBar(currentColumns);
    } else if (currentState === undefined || currentState === 'speaking') {
      sequence.value = [new Array(currentColumns).fill(0).map((_, idx) => idx)];
    } else {
      sequence.value = [[]];
    }
    index.value = 0;
  });

  watchEffect((onCleanup) => {
    const currentInterval = toValue(interval);

    let startTime = performance.now();

    const animate = (time: DOMHighResTimeStamp) => {
      const timeElapsed = time - startTime;

      if (timeElapsed >= currentInterval) {
        index.value = index.value + 1;
        startTime = time;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    let animationFrame = requestAnimationFrame(animate);

    onCleanup(() => {
      cancelAnimationFrame(animationFrame);
    });
  });

  const currentSequence = computed(() => {
    const seq = sequence.value;
    if (seq.length > 0) {
      return seq[index.value % seq.length] || [];
    }
    return [];
  });

  return currentSequence;
};
