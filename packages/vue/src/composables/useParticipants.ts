import type { Room, RoomEvent } from 'livekit-client';
import { computed, type MaybeRef } from 'vue';
import { useLocalParticipant } from './useLocalParticipant';
import { useRemoteParticipants } from './useRemoteParticipants';

export interface UseParticipantsOptions {
  updateOnlyOn?: MaybeRef<RoomEvent[] | undefined>;
  room?: MaybeRef<Room | undefined>;
}

export function useParticipants(options: UseParticipantsOptions = {}) {
  const remoteParticipants = useRemoteParticipants(options);
  const { localParticipant } = useLocalParticipant({ room: options.room });

  return computed(() => [
    ...(localParticipant.value ? [localParticipant.value] : []),
    ...(remoteParticipants.value || []),
  ]);
}
