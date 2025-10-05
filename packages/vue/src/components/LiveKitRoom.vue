<template>
  <div v-bind="$attrs">
    <LiveKitRoomProvider v-if="room" :room="room">
      <slot />
    </LiveKitRoomProvider>
  </div>
</template>

<script lang="ts" setup>
import { LiveKitRoomProvider } from './LiveKitRoomProvider';
import type { DisconnectReason, MediaDeviceFailure } from 'livekit-client';
import { useLiveKitRoom, type LiveKitRoomProps } from '../composables/useLiveKitRoom';

const props = withDefaults(defineProps<LiveKitRoomProps>(), {
  audio: false,
  video: false,
  screen: false,
  connect: true,
});

const emit = defineEmits<{
  connected: [];
  disconnected: [reason?: DisconnectReason];
  error: [error: Error];
  mediaDeviceFailure: [failure?: MediaDeviceFailure, kind?: MediaDeviceKind];
  encryptionError: [error: Error];
}>();

const { room } = useLiveKitRoom({
  ...props,
  onConnected: () => emit('connected'),
  onDisconnected: (reason?: DisconnectReason) => emit('disconnected', reason),
  onError: (error: Error) => emit('error', error),
  onMediaDeviceFailure: (failure?: MediaDeviceFailure, kind?: MediaDeviceKind) =>
    emit('mediaDeviceFailure', failure, kind),
  onEncryptionError: (error: Error) => emit('encryptionError', error),
});
</script>
