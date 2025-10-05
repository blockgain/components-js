import { ref, computed, watch, toValue, type Ref, type MaybeRef } from 'vue';
import {
  type TrackReferenceOrPlaceholder,
  getTrackReferenceId,
  mutedObserver,
} from '@livekit/components-core';
import type { Participant, Track } from 'livekit-client';
import { useEnsureParticipant } from './useParticipantContext';

export interface UseIsMutedOptions {
  participant?: MaybeRef<Participant | undefined>;
}

export function useIsMuted(trackRef: MaybeRef<TrackReferenceOrPlaceholder>): Ref<boolean>;
export function useIsMuted(
  sourceOrTrackRef: MaybeRef<TrackReferenceOrPlaceholder | Track.Source>,
  options: UseIsMutedOptions = {},
): Ref<boolean> {
  const isMuted = ref(false);

  const resolvedTrackRef = computed<TrackReferenceOrPlaceholder>(() => {
    const _sourceOrTrackRef = toValue(sourceOrTrackRef);
    const _participant = toValue(options.participant);
    const passedParticipant =
      typeof _sourceOrTrackRef === 'string' ? _participant : _sourceOrTrackRef.participant;
    const p = useEnsureParticipant(passedParticipant);
    if (typeof _sourceOrTrackRef === 'string') {
      return { participant: toValue(p), source: _sourceOrTrackRef };
    }
    return _sourceOrTrackRef;
  });

  watch(
    resolvedTrackRef,
    (
      newTrackRef: TrackReferenceOrPlaceholder,
      oldTrackRef: TrackReferenceOrPlaceholder | undefined,
      onCleanup,
    ) => {
      if (!newTrackRef) {
        isMuted.value = false;
        return;
      }

      if (oldTrackRef && getTrackReferenceId(newTrackRef) === getTrackReferenceId(oldTrackRef)) {
        return;
      }

      const listener = mutedObserver(newTrackRef).subscribe((muted) => {
        isMuted.value = muted;
      });

      onCleanup(() => {
        listener.unsubscribe();
      });
    },
    { immediate: true },
  );

  return isMuted;
}
