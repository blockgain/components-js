import { shallowRef, watch, markRaw, toValue, type MaybeRef } from 'vue';
import type { RoomEvent, RemoteParticipant, Room } from 'livekit-client';
import { connectedParticipantsObserver } from '@livekit/components-core';
import { useEnsureRoom } from './useRoomContext.js';

export interface UseRemoteParticipantsOptions {
  updateOnlyOn?: MaybeRef<RoomEvent[] | undefined>;
  room?: MaybeRef<Room | undefined>;
}

export function useRemoteParticipants(options: UseRemoteParticipantsOptions = {}) {
  const room = useEnsureRoom(toValue(options.room));
  const participants = shallowRef<RemoteParticipant[]>([]);

  watch(
    [() => markRaw(room.value!), () => toValue(options.updateOnlyOn)],
    ([r, updateOnlyOn]: [Room, RoomEvent[] | undefined], _oldVal, onCleanup) => {
      const observable = connectedParticipantsObserver(r, {
        additionalRoomEvents: updateOnlyOn,
      });
      const subscription = observable.subscribe((p: RemoteParticipant[]) => {
        participants.value = p;
      });
      onCleanup(() => {
        subscription.unsubscribe();
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );

  return participants;
}
