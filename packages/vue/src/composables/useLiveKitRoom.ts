import { log } from '@livekit/components-core';
import type {
  DisconnectReason,
  RoomOptions,
  RoomConnectOptions,
  AudioCaptureOptions,
  VideoCaptureOptions,
  ScreenShareCaptureOptions,
} from 'livekit-client';
import { Room, MediaDeviceFailure, RoomEvent } from 'livekit-client';
import {
  ref,
  shallowRef,
  watch,
  watchEffect,
  onBeforeUnmount,
  markRaw,
  toValue,
  type MaybeRef,
} from 'vue';

/**
 *
 * @internal
 * used to stringify room options to detect dependency changes for react hooks.
 * Replaces processors and e2ee options with strings.
 */
export function roomOptionsStringifyReplacer(key: string, val: unknown) {
  if (key === 'processor' && val && typeof val === 'object' && 'name' in val) {
    return val.name;
  }
  if (key === 'e2ee' && val) {
    return 'e2ee-enabled';
  }
  return val;
}

const defaultRoomOptions = {
  connect: true,
  audio: false,
  video: false,
};

export interface LiveKitRoomProps {
  serverUrl: MaybeRef<string>;
  token: MaybeRef<string>;
  audio?: MaybeRef<AudioCaptureOptions | boolean>;
  video?: MaybeRef<VideoCaptureOptions | boolean>;
  screen?: MaybeRef<ScreenShareCaptureOptions | boolean>;
  connect?: MaybeRef<boolean>;
  options?: MaybeRef<RoomOptions>;
  connectOptions?: MaybeRef<RoomConnectOptions | undefined>;
  room?: MaybeRef<Room | undefined>;
  simulateParticipants?: MaybeRef<number | undefined>;
  onConnected?: () => void;
  onDisconnected?: (reason?: DisconnectReason) => void;
  onError?: (error: Error) => void;
  onMediaDeviceFailure?: (failure?: MediaDeviceFailure, kind?: MediaDeviceKind) => void;
  onEncryptionError?: (error: Error) => void;
}

export function useLiveKitRoom(opts: LiveKitRoomProps) {
  const props = { ...defaultRoomOptions, ...opts };

  const {
    token,
    serverUrl,
    options,
    room: passedRoom,
    connectOptions,
    connect,
    audio,
    video,
    screen,
    onConnected,
    onDisconnected,
    onError,
    onMediaDeviceFailure,
    onEncryptionError,
    simulateParticipants,
  } = props;

  if (toValue(options) && toValue(passedRoom)) {
    log.warn(
      'when using a manually created room, the options object will be ignored. set the desired options directly when creating the room instead.',
    );
  }

  const room = shallowRef<Room | undefined>();
  const shouldConnect = ref(toValue(connect));

  watch(
    () =>
      [
        toValue(passedRoom),
        JSON.stringify(toValue(options), roomOptionsStringifyReplacer),
      ] as const,
    (newValues, oldValues) => {
      const [_passedRoom, _optionsString] = newValues;
      const _oldPassedRoom = oldValues?.[0];
      const _oldOptionsString = oldValues?.[1];

      if (_passedRoom) {
        if (_passedRoom === _oldPassedRoom && room.value) return;

        if (room.value) {
          log.info('disconnecting on onmount (replacing with passedRoom)');
          room.value.disconnect();
        }

        room.value = markRaw(_passedRoom);
        return;
      }

      if (_optionsString === _oldOptionsString && room.value) return;

      if (room.value) {
        log.info('disconnecting on onmount (recreating room from options)');
        room.value.disconnect();
      }

      room.value = markRaw(new Room(toValue(options)));
    },
    { immediate: true },
  );

  watchEffect((onCleanup) => {
    const _room = toValue(room);
    const _audio = toValue(audio);
    const _video = toValue(video);
    const _screen = toValue(screen);

    if (!_room) return;

    const onSignalConnected = () => {
      const localP = _room.localParticipant;

      log.debug('trying to publish local tracks');
      Promise.all([
        localP.setMicrophoneEnabled(!!_audio, typeof _audio !== 'boolean' ? _audio : undefined),
        localP.setCameraEnabled(!!_video, typeof _video !== 'boolean' ? _video : undefined),
        localP.setScreenShareEnabled(!!_screen, typeof _screen !== 'boolean' ? _screen : undefined),
      ]).catch((e) => {
        log.warn(e);
        onError?.(e as Error);
      });
    };

    const handleMediaDeviceError = (e: Error, kind?: MediaDeviceKind) => {
      const mediaDeviceFailure = MediaDeviceFailure.getFailure(e);
      onMediaDeviceFailure?.(mediaDeviceFailure, kind);
    };
    const handleEncryptionError = (e: Error) => {
      onEncryptionError?.(e);
    };
    const handleDisconnected = (reason?: DisconnectReason) => {
      onDisconnected?.(reason);
    };
    const handleConnected = () => {
      onConnected?.();
    };

    _room
      .on(RoomEvent.SignalConnected, onSignalConnected)
      .on(RoomEvent.MediaDevicesError, handleMediaDeviceError)
      .on(RoomEvent.EncryptionError, handleEncryptionError)
      .on(RoomEvent.Disconnected, handleDisconnected)
      .on(RoomEvent.Connected, handleConnected);

    onCleanup(() => {
      _room
        .off(RoomEvent.SignalConnected, onSignalConnected)
        .off(RoomEvent.MediaDevicesError, handleMediaDeviceError)
        .off(RoomEvent.EncryptionError, handleEncryptionError)
        .off(RoomEvent.Disconnected, handleDisconnected)
        .off(RoomEvent.Connected, handleConnected);
    });
  });

  watchEffect(() => {
    const _connect = toValue(connect);
    const _token = toValue(token);
    const _connectOptions = toValue(connectOptions);
    const _room = toValue(room);
    const _serverUrl = toValue(serverUrl);
    const _simulateParticipants = toValue(simulateParticipants);

    if (!_room) return;

    if (_simulateParticipants) {
      _room.simulateParticipants({
        participants: {
          count: _simulateParticipants,
        },
        publish: {
          audio: true,
          useRealTracks: true,
        },
      });
      return;
    }

    if (_connect) {
      shouldConnect.value = true;
      log.debug('connecting');
      if (!_token) {
        log.debug('no token yet');
        return;
      }
      if (!_serverUrl) {
        log.warn('no livekit url provided');
        onError?.(Error('no livekit url provided'));
        return;
      }
      _room.connect(_serverUrl, _token, _connectOptions).catch((e) => {
        log.warn(e);
        if (shouldConnect.value === true) {
          onError?.(e as Error);
        }
      });
    } else {
      log.debug('disconnecting because connect is false');
      shouldConnect.value = false;
      _room.disconnect();
    }
  });

  onBeforeUnmount(() => {
    log.info('disconnecting on onmount');
    room.value?.disconnect();
  });

  return {
    room,
  };
}
