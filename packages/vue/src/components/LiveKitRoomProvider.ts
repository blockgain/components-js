import { defineComponent, type PropType } from 'vue';
import { Room } from 'livekit-client';
import { useProvideRoomContext } from '../composables/useRoomContext';

export const LiveKitRoomProvider = defineComponent({
  name: 'LiveKitRoomProvider',
  props: {
    room: {
      type: Object as PropType<Room>,
      required: true,
    },
  },
  setup(props, { slots }) {
    useProvideRoomContext(props.room);
    return () => slots.default && slots.default(props.room);
  },
});
