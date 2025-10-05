import { Track } from 'livekit-client';
import {
  isSourcesWithOptions,
  isSourceWitOptions,
  log,
  trackReferencesObservable,
} from '@livekit/components-core';
import { computed, shallowRef, watchEffect, toValue, type ComputedRef, type MaybeRef } from 'vue';
import { useEnsureRoom } from './useRoomContext.js';
import type {
  SourcesArray,
  TrackReference,
  TrackReferenceOrPlaceholder,
  TrackSourceWithOptions,
  TrackReferencePlaceholder,
} from '@livekit/components-core';
import type { Participant, Room, RoomEvent } from 'livekit-client';

export type UseTracksOptions = {
  updateOnlyOn?: MaybeRef<RoomEvent[]>;
  onlySubscribed?: MaybeRef<boolean>;
  room?: MaybeRef<Room>;
};

export type UseTracksReturnType<T> = T extends Track.Source[]
  ? TrackReference[]
  : T extends TrackSourceWithOptions[]
    ? TrackReferenceOrPlaceholder[]
    : never;

export function useTracks<T extends SourcesArray = Track.Source[]>(
  sources: MaybeRef<T> = [
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
    Track.Source.Unknown,
  ] as T,
  options: UseTracksOptions = {},
): ComputedRef<UseTracksReturnType<T>> {
  const room = useEnsureRoom(toValue(options?.room));
  const trackReferences = shallowRef<TrackReference[]>([]);
  const participants = shallowRef<Participant[]>([]);

  const sourcesComputed = computed(() =>
    toValue(sources).map((s: Track.Source | TrackSourceWithOptions) =>
      isSourceWitOptions(s) ? s.source : s,
    ),
  );

  watchEffect((onCleanup) => {
    const room_ = room.value;
    const sources_ = sourcesComputed.value;
    const onlySubscribed = toValue(options.onlySubscribed);
    const updateOnlyOn = toValue(options.updateOnlyOn);

    if (!room_) {
      return;
    }

    const subscription = trackReferencesObservable(room_, sources_, {
      additionalRoomEvents: updateOnlyOn,
      onlySubscribed: onlySubscribed,
    }).subscribe(({ trackReferences: t, participants: p }) => {
      log.debug('setting track bundles', t, p);
      trackReferences.value = t;
      participants.value = p;
    });

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  const maybeTrackReferences = computed(() => {
    const sources_ = toValue(sources);
    if (isSourcesWithOptions(sources_)) {
      const requirePlaceholder = requiredPlaceholders(sources_, participants.value);
      const trackReferencesWithPlaceholders: TrackReferenceOrPlaceholder[] = Array.from(
        trackReferences.value,
      );
      participants.value.forEach((participant: Participant) => {
        if (requirePlaceholder.has(participant.identity)) {
          const sourcesToAddPlaceholder = requirePlaceholder.get(participant.identity) ?? [];
          sourcesToAddPlaceholder.forEach((placeholderSource: Track.Source) => {
            if (
              trackReferences.value.find(
                ({ participant: p, publication }: TrackReference) =>
                  participant.identity === p.identity && publication.source === placeholderSource,
              )
            ) {
              return;
            }
            log.debug(
              `Add ${placeholderSource} placeholder for participant ${participant.identity}.`,
            );
            const placeholder: TrackReferencePlaceholder = {
              participant,
              source: placeholderSource,
            };
            trackReferencesWithPlaceholders.push(placeholder);
          });
        }
      });
      return trackReferencesWithPlaceholders;
    } else {
      return trackReferences.value;
    }
  });

  return maybeTrackReferences as ComputedRef<UseTracksReturnType<T>>;
}

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

export function requiredPlaceholders<T extends SourcesArray>(
  sources: T,
  participants: Participant[],
): Map<Participant['identity'], Track.Source[]> {
  const placeholderMap = new Map<Participant['identity'], Track.Source[]>();
  if (isSourcesWithOptions(sources)) {
    const sourcesThatNeedPlaceholder = sources
      .filter((sourceWithOption) => sourceWithOption.withPlaceholder)
      .map((sourceWithOption) => sourceWithOption.source);

    participants.forEach((participant) => {
      const sourcesOfSubscribedTracks = participant
        .getTrackPublications()
        .map((pub) => pub.track?.source)
        .filter((trackSource): trackSource is Track.Source => trackSource !== undefined);
      const placeholderNeededForThisParticipant = Array.from(
        difference(new Set(sourcesThatNeedPlaceholder), new Set(sourcesOfSubscribedTracks)),
      );
      // If the participant needs placeholder add it to the placeholder map.
      if (placeholderNeededForThisParticipant.length > 0) {
        placeholderMap.set(participant.identity, placeholderNeededForThisParticipant);
      }
    });
  }
  return placeholderMap;
}
