import { computed } from 'vue';
import { connectionStateObserver } from '@livekit/components-core';
import { useEnsureRoom } from './useRoomContext';
import type { ConnectionState, Room } from 'livekit-client';
import { useObservableState } from './useObservableState';

export function useConnectionState(room?: Room) {
  const r = useEnsureRoom(room);
  const observable = computed(() => connectionStateObserver(r.value!));
  const connectionState = useObservableState<ConnectionState>(observable, r.value!.state);
  return connectionState;
}
