<template>
  <audio ref="mediaEl" v-bind="elementProps" autoplay />
</template>

<script setup>
import { RemoteAudioTrack, RemoteTrackPublication } from 'livekit-client';
import { log } from '@livekit/components-core';
import { useMediaTrackBySourceOrName } from '../../composables/useMediaTrackBySourceOrName';

const props = defineProps({
  trackRef: {
    type: Object,
    required: true,
  },
  volume: {
    type: Number,
    required: false,
    default: 1,
  },
  muted: {
    type: Boolean,
    required: false,
    default: undefined,
  },
});

const emit = defineEmits(['subscriptionStatusChanged']);

const mediaEl = ref(null);
const trackRef = toRef(props, 'trackRef');

const {
  elementProps,
  isSubscribed,
  track,
  publication: pub,
} = useMediaTrackBySourceOrName(trackRef, {
  element: mediaEl,
  props,
});

watch(isSubscribed, () => {
  emit('subscriptionStatusChanged', !!isSubscribed);
});

watch(
  [() => props.volume, track],
  ([volume, track]) => {
    if (track === undefined || volume === undefined) {
      return;
    }
    if (track instanceof RemoteAudioTrack) {
      track.setVolume(volume);
    } else {
      log.warn('Volume can only be set on remote audio tracks.');
    }
  },
  { immediate: true },
);

watch(
  [() => props.muted, pub, track],
  ([muted, pub]) => {
    if (pub === undefined || muted === undefined) {
      return;
    }
    if (pub instanceof RemoteTrackPublication) {
      pub.setEnabled(!muted);
    } else {
      log.warn('Can only call setEnabled on remote track publications.');
    }
  },
  { immediate: true },
);
</script>
