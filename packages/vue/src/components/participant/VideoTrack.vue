<template>
  <video ref="mediaEl" v-bind="elementProps" muted @click="clickHandler"></video>
</template>

<script setup>
import { ref, watch, toValue } from 'vue';
import { useEnsureTrackRef } from '../../composables/useTrackRefContext';
import { useDebounce } from '../../composables/useDebounce';
import { useElementVisibility } from '../../composables/useElementVisibility';
import { RemoteTrackPublication } from 'livekit-client';
import { useMediaTrackBySourceOrName } from '../../composables/useMediaTrackBySourceOrName';

const props = defineProps({
  trackRef: {
    type: Object,
    required: true,
  },
  manageSubscription: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const emit = defineEmits(['subscriptionStatusChanged', 'click', 'trackClick']);

const mediaEl = ref(null);

const trackRef = useEnsureTrackRef(props.trackRef);
const isVisible = useElementVisibility(mediaEl);
const debouncedIsVisible = useDebounce(isVisible, 3000);

watch(
  [debouncedIsVisible, isVisible, () => toValue(trackRef), () => props.manageSubscription],
  ([debounced, visible, trackRef, manage]) => {
    if (manage && trackRef?.publication instanceof RemoteTrackPublication) {
      if (debounced === false && visible === false) {
        trackRef.publication.setSubscribed(false);
      } else if (visible === true) {
        trackRef.publication.setSubscribed(true);
      }
    }
  },
);

const {
  elementProps,
  publication: pub,
  isSubscribed,
} = useMediaTrackBySourceOrName(trackRef, {
  element: mediaEl,
  props,
});

watch(isSubscribed, (subscribed) => {
  emit('subscriptionStatusChanged', !!subscribed);
});

const clickHandler = (evt) => {
  emit('click', evt);
  emit('trackClick', {
    participant: trackRef.value?.participant,
    track: pub.value,
  });
};
</script>
