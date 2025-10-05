<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <slot name="activator" :props="props">
        <v-btn v-bind="props">Device Change</v-btn>
      </slot>
    </template>
    <v-list>
      <template v-if="kind">
        <MediaDeviceSelect
          :initial-selection="initialSelection"
          :kind="kind"
          :track="tracks?.[kind]"
          :request-permissions="needPermissions"
          @active-device-change="(deviceId: string) => handleActiveDeviceChange(kind!, deviceId)"
          @device-list-change="setDevices"
        />
      </template>

      <template v-else>
        <v-list-subheader>Audio inputs</v-list-subheader>
        <MediaDeviceSelect
          kind="audioinput"
          :track="tracks?.audioinput"
          :request-permissions="needPermissions"
          @active-device-change="
            (deviceId: string) => handleActiveDeviceChange('audioinput', deviceId)
          "
          @device-list-change="setDevices"
        />

        <v-list-subheader>Video inputs</v-list-subheader>
        <MediaDeviceSelect
          kind="videoinput"
          :track="tracks?.videoinput"
          :request-permissions="needPermissions"
          @active-device-change="
            (deviceId: string) => handleActiveDeviceChange('videoinput', deviceId)
          "
          @device-list-change="setDevices"
        />
      </template>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { log } from '@livekit/components-core';
import MediaDeviceSelect from './controls/MediaDeviceSelect.vue';
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';

export interface MediaDeviceMenuProps {
  kind?: MediaDeviceKind;
  initialSelection?: string;
  tracks?: Partial<Record<MediaDeviceKind, LocalAudioTrack | LocalVideoTrack | undefined>>;
  /**
   * this will call getUserMedia if the permissions are not yet given to enumerate the devices with device labels.
   * in some browsers multiple calls to getUserMedia result in multiple permission prompts.
   * It's generally advised only flip this to true, once a (preview) track has been acquired successfully with the
   * appropriate permissions.
   *
   * @see {@link PreJoin}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices | MDN enumerateDevices}
   */
  requestPermissions?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<MediaDeviceMenuProps>(), {
  requestPermissions: false,
  disabled: false,
});

const emit = defineEmits<{
  activeDeviceChange: [kind: MediaDeviceKind, deviceId: string];
}>();

// Reactive state
const devices = ref<MediaDeviceInfo[]>([]);
const needPermissions = ref(props.requestPermissions);

// Methods
const handleActiveDeviceChange = (kind: MediaDeviceKind, deviceId: string) => {
  log.debug('handle device change');
  emit('activeDeviceChange', kind, deviceId);
};

const setDevices = (newDevices: MediaDeviceInfo[]) => {
  devices.value = newDevices;
};
</script>

<style scoped></style>
