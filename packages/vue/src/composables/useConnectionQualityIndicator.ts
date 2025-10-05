import { computed, type MaybeRef } from 'vue';
import { setupConnectionQualityIndicator } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { useObservableState } from './useObservableState';
import { useEnsureParticipant } from './useParticipantContext';

export interface ConnectionQualityIndicatorOptions {
  participant?: MaybeRef<Participant | undefined>;
}

export function useConnectionQualityIndicator(options: ConnectionQualityIndicatorOptions = {}) {
  const p = useEnsureParticipant(options.participant);

  const setup = computed(() => setupConnectionQualityIndicator(p.value));

  const className = computed(() => setup.value.className);
  const connectionQualityObserver = computed(() => setup.value.connectionQualityObserver);

  const quality = useObservableState(connectionQualityObserver, p.value.connectionQuality);

  return {
    quality,
    className,
  };
}
