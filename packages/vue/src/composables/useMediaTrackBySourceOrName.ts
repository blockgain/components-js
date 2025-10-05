import { shallowRef, computed, watch, toValue, mergeProps, type MaybeRef } from 'vue';
import type { TrackIdentifier } from '@livekit/components-core';
import { getTrackByIdentifier, setupMediaTrack, log } from '@livekit/components-core';

export interface UseMediaTrackOptions {
  element?: MaybeRef<HTMLMediaElement> | null;
  props?: MaybeRef<Record<string, any>>;
}

export function useMediaTrackBySourceOrName(
  observerOptions: MaybeRef<TrackIdentifier>,
  options: UseMediaTrackOptions = {},
) {
  const publication = shallowRef(getTrackByIdentifier(toValue(observerOptions)));

  const isMuted = computed(() => publication.value?.isMuted);
  const isSubscribed = computed(() => publication.value?.isSubscribed);
  const track = computed(() => publication.value?.track);
  const orientation = computed<'landscape' | 'portrait'>(() => {
    const pub = publication.value;
    if (pub?.dimensions?.width && pub.dimensions.height) {
      return pub.dimensions.width > pub.dimensions.height ? 'landscape' : 'portrait';
    }
    return 'landscape';
  });

  const mediaTrackSetup = computed(() => setupMediaTrack(toValue(observerOptions)));

  const className = computed(() => mediaTrackSetup.value.className);
  const trackObserver = computed(() => mediaTrackSetup.value.trackObserver);

  watch(
    trackObserver,
    (obs, _oldObs, onCleanup) => {
      if (!obs) return;
      const subscription = obs.subscribe((pub: any) => {
        log.debug('update track from observable', pub);
        publication.value = pub;
      });
      onCleanup(() => {
        subscription.unsubscribe();
      });
    },
    { immediate: true },
  );

  watch(
    [track, () => toValue(options.element)],
    ([newTrack, newEl]: [any, any], [oldTrack, oldEl]: [any, any], onCleanup) => {
      if (oldTrack && oldEl) {
        oldTrack.detach(oldEl);
      }
      if (
        newTrack &&
        newEl &&
        !(toValue(observerOptions).participant.isLocal && newTrack?.kind === 'audio')
      ) {
        newTrack.attach(newEl);
      }
      onCleanup(() => {
        if (newTrack && newEl) {
          newTrack.detach(newEl);
        }
      });
    },
    { immediate: true },
  );

  const elementProps = computed(() => {
    const pub = publication.value;
    return mergeProps(toValue(options.props) ?? {}, {
      className: className.value,
      'data-lk-local-participant': toValue(observerOptions).participant.isLocal,
      'data-lk-source': pub?.source,
      ...(pub?.kind === 'video' && {
        'data-lk-orientation': orientation.value,
      }),
    });
  });

  return {
    publication,
    isMuted,
    isSubscribed,
    track,
    elementProps,
  };
}
