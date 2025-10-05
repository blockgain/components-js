import type { Room } from 'livekit-client';
import { inject, provide, shallowRef, type InjectionKey, type ShallowRef } from 'vue';

export type RoomContext = ShallowRef<Room | undefined>;

const RoomContextKey: InjectionKey<RoomContext> = Symbol('livekit-room-context');

function useProvideRoomContext(initialValue: Room): RoomContext {
  const context = shallowRef<Room | undefined>(initialValue);
  provide(RoomContextKey, context);
  return context;
}

function useRoomContextRaw(): RoomContext | undefined {
  return inject(RoomContextKey, undefined);
}

export { useProvideRoomContext, useRoomContextRaw };

export function useMaybeRoomContext(): RoomContext | undefined {
  try {
    return useRoomContextRaw();
  } catch {
    return undefined;
  }
}

export function useRoomContext(): RoomContext {
  const ctx = useMaybeRoomContext();
  if (!ctx) {
    throw new Error('Please call `useProvideRoomContext` on the appropriate parent component');
  }
  return ctx;
}

export function useEnsureRoom(room?: Room): RoomContext {
  if (room) {
    return shallowRef(room);
  }

  return useRoomContext();
}
