import { ref, computed, watch, toValue, type MaybeRef } from 'vue';
import {
  createMediaDeviceObserver,
  setupDeviceSelector,
  log,
  type SetMediaDeviceOptions,
} from '@livekit/components-core';
import { Room, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client';
import { useMaybeRoomContext } from './useRoomContext';
import { useObservableState } from './useObservableState';

export interface UseMediaDeviceSelectProps {
  kind: MaybeRef<MediaDeviceKind>;
  room?: MaybeRef<Room | undefined>;
  track?: MaybeRef<LocalAudioTrack | LocalVideoTrack | undefined>;
  requestPermissions?: MaybeRef<boolean | undefined>;
  onError?: (e: Error) => void;
}

export function useMediaDeviceSelect(props: UseMediaDeviceSelectProps) {
  const roomContext = useMaybeRoomContext();

  const roomFallback = computed(() => toValue(props.room) ?? toValue(roomContext) ?? new Room());

  const kind = computed(() => toValue(props.kind));

  const deviceObserver = computed(() =>
    createMediaDeviceObserver(kind.value, props.onError, toValue(props.requestPermissions)),
  );

  const devices = useObservableState(deviceObserver, [] as MediaDeviceInfo[]);

  const currentDeviceId = ref(roomFallback.value?.getActiveDevice(kind.value) ?? 'default');

  const deviceSelector = computed(() =>
    setupDeviceSelector(kind.value, roomFallback.value, toValue(props.track)),
  );

  watch(
    () => deviceSelector.value.activeDeviceObservable,
    (obs, _oldObs, onCleanup) => {
      if (!obs) return;

      const listener = obs.subscribe((deviceId: string) => {
        if (!deviceId) {
          return;
        }
        log.info('setCurrentDeviceId', deviceId);
        currentDeviceId.value = deviceId;
      });

      onCleanup(() => {
        listener.unsubscribe();
      });
    },
    { immediate: true },
  );

  const className = computed(() => deviceSelector.value.className);

  const setActiveMediaDevice = (id: string, options?: SetMediaDeviceOptions) => {
    return deviceSelector.value.setActiveMediaDevice(id, options);
  };

  return {
    devices,
    className,
    activeDeviceId: currentDeviceId,
    setActiveMediaDevice,
  };
}
