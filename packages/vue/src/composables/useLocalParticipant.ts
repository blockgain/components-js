import { ref, shallowRef, watch, toValue, type MaybeRef } from 'vue';
import type { ParticipantMedia } from '@livekit/components-core';
import { observeParticipantMedia } from '@livekit/components-core';
import type { TrackPublication, LocalParticipant, Room } from 'livekit-client';
import { useEnsureRoom } from './useRoomContext';

export interface UseLocalParticipantOptions {
  room?: MaybeRef<Room | undefined>;
}

export function useLocalParticipant(options: UseLocalParticipantOptions = {}) {
  const room = useEnsureRoom(toValue(options.room));

  const localParticipant = shallowRef<LocalParticipant>(room.value!.localParticipant);
  const isMicrophoneEnabled = ref(localParticipant.value.isMicrophoneEnabled);
  const isCameraEnabled = ref(localParticipant.value.isCameraEnabled);
  const isScreenShareEnabled = ref(localParticipant.value.isScreenShareEnabled);
  const lastMicrophoneError = ref(localParticipant.value.lastMicrophoneError);
  const lastCameraError = ref(localParticipant.value.lastCameraError);
  const microphoneTrack = shallowRef<TrackPublication | undefined>(undefined);
  const cameraTrack = shallowRef<TrackPublication | undefined>(undefined);

  const handleUpdate = (media: ParticipantMedia<LocalParticipant>) => {
    isCameraEnabled.value = media.isCameraEnabled;
    isMicrophoneEnabled.value = media.isMicrophoneEnabled;
    isScreenShareEnabled.value = media.isScreenShareEnabled;
    cameraTrack.value = media.cameraTrack;
    microphoneTrack.value = media.microphoneTrack;
    lastMicrophoneError.value = media.participant.lastMicrophoneError;
    lastCameraError.value = media.participant.lastCameraError;
    localParticipant.value = media.participant;
  };

  watch(
    () => room.value,
    (newRoom: Room | undefined, _oldRoom: Room | undefined, onCleanup) => {
      if (!newRoom) return;

      const listener = observeParticipantMedia(newRoom.localParticipant).subscribe(handleUpdate);

      onCleanup(() => {
        listener.unsubscribe();
      });
    },
    { immediate: true },
  );

  return {
    isMicrophoneEnabled,
    isScreenShareEnabled,
    isCameraEnabled,
    microphoneTrack,
    cameraTrack,
    lastMicrophoneError,
    lastCameraError,
    localParticipant,
  };
}
