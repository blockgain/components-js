// Components - direct exports
export { default as LiveKitRoom } from './components/LiveKitRoom.vue';
export { default as RoomAudioRenderer } from './components/RoomAudioRenderer.vue';
export { default as MediaDeviceMenu } from './components/MediaDeviceMenu.vue';
export { default as MediaDeviceSelect } from './components/controls/MediaDeviceSelect.vue';
export { default as VideoTrack } from './components/participant/VideoTrack.vue';
export { default as AudioTrack } from './components/participant/AudioTrack.vue';
export { default as BarVisualizer } from './components/participant/BarVisualizer.vue';
export * from './components/LiveKitRoomProvider';

// Composables
export * from './composables';

// Re-exports from core
export { setLogLevel, setLogExtension, isTrackReference } from '@livekit/components-core';
export type {
  ChatMessage,
  ReceivedChatMessage,
  MessageDecoder,
  MessageEncoder,
  LocalUserChoices,
  TrackReference as CoreTrackReference,
  TrackReferenceOrPlaceholder,
  ParticipantClickEvent,
  ParticipantIdentifier,
  PinState,
  WidgetState,
  GridLayoutDefinition,
  TextStreamData,
} from '@livekit/components-core';
