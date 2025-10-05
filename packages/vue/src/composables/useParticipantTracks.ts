import { shallowRef, computed, watch, toValue, type ShallowRef, type MaybeRef } from 'vue';
import type { Track } from 'livekit-client';
import { participantTracksObservable, type TrackReference } from '@livekit/components-core';
import { useRemoteParticipants } from './useRemoteParticipants';
import { useMaybeParticipantContext } from './useParticipantContext';

export function useParticipantTracks(
  sources: MaybeRef<Track.Source[]>,
  participantIdentity?: MaybeRef<string | undefined>,
): ShallowRef<TrackReference[]> {
  const participantContext = useMaybeParticipantContext();
  const remoteParticipants = useRemoteParticipants({ updateOnlyOn: [] });
  const trackRefs = shallowRef<TrackReference[]>([]);

  const participant = computed(() => {
    const identity = toValue(participantIdentity);
    if (identity) {
      return remoteParticipants.value.find((p) => p.identity === identity);
    }
    return toValue(participantContext);
  });

  // todo participant object deep watch performance problem
  watch(
    [participant, () => toValue(sources)],
    ([p, currentSources]: [any, Track.Source[]], _oldVal, onCleanup) => {
      if (!p) {
        trackRefs.value = [];
        return;
      }

      const observable = participantTracksObservable(p, {
        sources: currentSources,
      });

      const subscription = observable.subscribe((tracks: TrackReference[]) => {
        trackRefs.value = tracks;
      });

      onCleanup(() => {
        subscription.unsubscribe();
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );

  return trackRefs;
}
