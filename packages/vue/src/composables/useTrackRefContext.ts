import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { inject, provide, shallowRef, type InjectionKey, type ShallowRef } from 'vue';

export type TrackRefContext = ShallowRef<TrackReferenceOrPlaceholder | undefined>;

const TrackRefContextKey: InjectionKey<TrackRefContext> = Symbol('livekit-track-ref-context');

function useProvideTrackRefContext(
  ref: TrackReference | TrackReferenceOrPlaceholder,
): TrackRefContext {
  const context = shallowRef<TrackReferenceOrPlaceholder | undefined>(ref);
  provide(TrackRefContextKey, context);
  return context;
}

function useTrackRefContextRaw(): TrackRefContext | undefined {
  return inject(TrackRefContextKey, undefined);
}

export { useProvideTrackRefContext, useTrackRefContextRaw };

export function useMaybeTrackRefContext(): TrackRefContext | undefined {
  try {
    return useTrackRefContextRaw();
  } catch {
    return undefined;
  }
}

export function useTrackRefContext(): TrackRefContext {
  const context = useMaybeTrackRefContext();

  if (!context) {
    throw new Error('Please call `useProvideTrackRefContext` on the appropriate parent component');
  }

  return context;
}

export function useEnsureTrackRef(trackRef?: TrackReferenceOrPlaceholder): TrackRefContext {
  if (trackRef) {
    return shallowRef(trackRef);
  }

  return useTrackRefContext();
}
