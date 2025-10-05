<template>
  <v-list ref="listRef" :class="className" slim density="comfortable">
    <v-list-item
      v-for="(device, index) in devices"
      :key="device.deviceId"
      :id="device.deviceId"
      :active="isActive(device.deviceId, activeDeviceId, index)"
      :aria-selected="isActive(device.deviceId, activeDeviceId, index)"
      role="option"
      @click="handleActiveDeviceChange(device.deviceId)"
    >
      <template #prepend>
        <v-icon
          v-if="isActive(device.deviceId, activeDeviceId, index)"
          color="primary"
          icon="mdi-check"
        />
        <v-icon v-else color="transparent" icon="mdi-check" />
      </template>
      <v-list-item-title
        class="text-subtitle-2"
        :class="{
          'text-primary': isActive(device.deviceId, activeDeviceId, index),
        }"
      >
        {{ device.label }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="device.deviceId === 'default'" class="text-caption">
        Sistem varsayılanı
      </v-list-item-subtitle>
    </v-list-item>
    <slot />
  </v-list>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { RoomEvent, type LocalAudioTrack, type LocalVideoTrack } from 'livekit-client';
import { useMaybeRoomContext } from '../../composables/useRoomContext';
import { useMediaDeviceSelect } from '../../composables/useMediaDeviceSelect';

export interface MediaDeviceSelectProps {
  kind: MediaDeviceKind;
  initialSelection?: string;
  /** will force the browser to only return the specified device
   * will call `onDeviceSelectError` with the error in case this fails
   */
  exactMatch?: boolean;
  track?: LocalAudioTrack | LocalVideoTrack;
  /**
   * this will call getUserMedia if the permissions are not yet given to enumerate the devices with device labels.
   * in some browsers multiple calls to getUserMedia result in multiple permission prompts.
   * It's generally advised only flip this to true, once a (preview) track has been acquired successfully with the
   * appropriate permissions.
   *
   * @see {@link MediaDeviceMenu}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices | MDN enumerateDevices}
   */
  requestPermissions?: boolean;
}

const props = withDefaults(defineProps<MediaDeviceSelectProps>(), {
  exactMatch: true,
  requestPermissions: false,
});

const emit = defineEmits<{
  activeDeviceChange: [deviceId: string];
  deviceListChange: [devices: MediaDeviceInfo[]];
  deviceSelectError: [error: Error];
  error: [error: Error];
}>();

// Template ref
const listRef = ref<HTMLUListElement>();

// Get room context
const room = useMaybeRoomContext();

// Previous active device ID tracking
const previousActiveDeviceId = ref<string>('default');

// Error handler
const handleError = (e: Error) => {
  if (room?.value) {
    // awkwardly emit the event from outside of the room, as we don't have other means to raise a MediaDeviceError
    room.value.emit(RoomEvent.MediaDevicesError, e);
  }
  emit('error', e);
};

// Use media device select hook
const { devices, activeDeviceId, setActiveMediaDevice, className } = useMediaDeviceSelect({
  kind: props.kind,
  room,
  track: props.track,
  requestPermissions: props.requestPermissions,
  onError: handleError,
});

// Computed properties
const hasDefault = computed(
  () => !!devices.value.find((info) => info.label.toLowerCase().startsWith('default')),
);

// Methods
const isActive = (deviceId: string, activeDeviceId: string, index: number) => {
  return (
    deviceId === activeDeviceId ||
    (!hasDefault.value && index === 0 && activeDeviceId === 'default')
  );
};

const handleActiveDeviceChange = async (deviceId: string) => {
  try {
    await setActiveMediaDevice(deviceId, { exact: props.exactMatch });
  } catch (e) {
    if (e instanceof Error) {
      emit('deviceSelectError', e);
    } else {
      throw e;
    }
  }
};

onMounted(() => {
  if (props.initialSelection !== undefined) {
    setActiveMediaDevice(props.initialSelection);
  }
});

// Watchers
watch(
  devices,
  (newDevices) => {
    emit('deviceListChange', newDevices);
  },
  { immediate: true },
);

watch(
  activeDeviceId,
  (newActiveDeviceId) => {
    if (newActiveDeviceId !== previousActiveDeviceId.value) {
      emit('activeDeviceChange', newActiveDeviceId);
    }
    previousActiveDeviceId.value = newActiveDeviceId;
  },
  { immediate: true },
);
</script>

<style scoped>
.lk-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lk-list li {
  padding: 4px 0;
}

.lk-list li[data-lk-active='true'] {
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.05);
}

.lk-button {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
}

.lk-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
