import { shallowRef, computed, watchEffect, toValue, type MaybeRef } from 'vue';
import { setupMediaTrack, getTrackByIdentifier } from '@livekit/components-core';
import { Track, TrackPublication } from 'livekit-client';
import type { TrackReferenceOrPlaceholder, TrackSource } from '@livekit/components-core';

export function useTrackRefBySourceOrName(source: MaybeRef<TrackSource<Track.Source>>) {
  const publication = shallowRef(getTrackByIdentifier(toValue(source)));

  const mediaTrackSetup = computed(() => setupMediaTrack(toValue(source)));

  watchEffect((onCleanup) => {
    const observer = mediaTrackSetup.value.trackObserver;
    const subscription = observer.subscribe((pub: TrackPublication | undefined) => {
      publication.value = pub;
    });

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  const trackRef = computed<TrackReferenceOrPlaceholder>(() => {
    const source_ = toValue(source);
    return {
      participant: source_.participant,
      source: source_.source ?? Track.Source.Unknown,
      publication: publication.value as TrackPublication,
    };
  });

  return trackRef;
}
