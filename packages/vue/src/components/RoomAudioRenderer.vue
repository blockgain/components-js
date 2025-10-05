<template>
  <div :style="{ display: 'none' }">
    <AudioTrack
      v-for="trackRef in filteredTracks"
      :key="getTrackReferenceId(trackRef)"
      :trackRef="trackRef"
      :volume="volume"
      :muted="muted"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Track } from 'livekit-client';
import { getTrackReferenceId } from '@livekit/components-core';
import AudioTrack from './participant/AudioTrack.vue';
import { useTracks } from '../composables/useTracks';

defineProps({
  volume: {
    type: Number,
    required: false,
    default: 1,
  },
  muted: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const tracks = useTracks(
  [Track.Source.Microphone, Track.Source.ScreenShareAudio, Track.Source.Unknown],
  {
    updateOnlyOn: [],
    onlySubscribed: true,
  },
);

const filteredTracks = computed(() =>
  tracks.value.filter(
    (ref: any) => !ref.participant.isLocal && ref.publication?.kind === Track.Kind.Audio,
  ),
);
</script>

<style></style>
