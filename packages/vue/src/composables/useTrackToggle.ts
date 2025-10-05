import type { CaptureOptionsBySource, ToggleSource } from '@livekit/components-core';
import { setupMediaToggle, setupManualToggle, log } from '@livekit/components-core';
import type { TrackPublishOptions } from 'livekit-client';
import { computed, ref, watchEffect, type Ref } from 'vue';
import { useObservableState } from './useObservableState';
import { useRoomContext } from './useRoomContext';

export interface UseTrackToggleProps<T extends ToggleSource> {
  source: T;
  onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
  initialState?: boolean;
  captureOptions?: CaptureOptionsBySource<T>;
  publishOptions?: TrackPublishOptions;
  onDeviceError?: (error: Error) => void;
}

export interface UseTrackToggleReturn {
  toggle: (forceState?: boolean) => Promise<void | boolean | undefined>;
  enabled: Ref<boolean>;
  pending: Ref<boolean>;
  className: string;
}

export function useTrackToggle<T extends ToggleSource>(
  props: UseTrackToggleProps<T>,
): UseTrackToggleReturn {
  const room = useRoomContext();
  const track = computed(() => room.value?.localParticipant?.getTrackPublication(props.source));

  const userInteractionRef = ref(false);

  const { toggle, className, pendingObserver, enabledObserver } = computed(() =>
    room.value
      ? setupMediaToggle<T>(
          props.source,
          room.value,
          props.captureOptions,
          props.publishOptions,
          props.onDeviceError,
        )
      : setupManualToggle(),
  ).value;

  const pending = useObservableState(pendingObserver, false);
  const enabled = useObservableState(
    enabledObserver,
    props.initialState ?? !!track.value?.isEnabled,
  );

  watchEffect(() => {
    if (props.onChange) {
      props.onChange(enabled.value, userInteractionRef.value);
    }
    userInteractionRef.value = false;
  });

  watchEffect((onCleanup) => {
    let mounted = true;
    onCleanup(() => {
      mounted = false;
    });

    if (props.initialState !== undefined && mounted) {
      log.debug('forcing initial toggle state', props.source, props.initialState);
      toggle(props.initialState);
    }
  });

  const handleToggle = (forceState?: boolean) => {
    userInteractionRef.value = true;
    return toggle(forceState)
      .then((result) => {
        userInteractionRef.value = false;
        return result;
      })
      .catch((error) => {
        userInteractionRef.value = false;
        throw error;
      });
  };

  return {
    toggle: handleToggle,
    enabled,
    pending,
    className,
  };
}
