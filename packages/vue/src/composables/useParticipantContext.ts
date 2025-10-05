import type { Participant } from 'livekit-client';
import {
  inject,
  provide,
  shallowRef,
  type InjectionKey,
  type ShallowRef,
  computed,
  toValue,
  type MaybeRef,
  type ComputedRef,
} from 'vue';

export type ParticipantContext = ShallowRef<Participant | undefined>;

const ParticipantContextKey: InjectionKey<ParticipantContext> = Symbol(
  'livekit-participant-context',
);

function useProvideParticipantContext(initialValue: Participant): ParticipantContext {
  const context = shallowRef<Participant | undefined>(initialValue);
  provide(ParticipantContextKey, context);
  return context;
}

function useParticipantContextRaw(): ParticipantContext | undefined {
  return inject(ParticipantContextKey, undefined);
}

export { useParticipantContextRaw, useProvideParticipantContext };

export function useMaybeParticipantContext(): ParticipantContext | undefined {
  return useParticipantContextRaw();
}

export function useParticipantContext(): ParticipantContext {
  return useParticipantContextRaw() ?? shallowRef(undefined);
}

export function useResolveParticipant(
  participantRef?: MaybeRef<Participant | undefined>,
): ComputedRef<Participant | undefined> {
  const participantFromContext = useMaybeParticipantContext();

  return computed(() => {
    const participantFromProp = toValue(participantRef);
    if (participantFromProp) {
      return participantFromProp;
    }

    const participantFromCtx = participantFromContext?.value;
    if (participantFromCtx) {
      return participantFromCtx;
    }

    return undefined;
  });
}

export function useEnsureParticipant(
  participantRef?: MaybeRef<Participant | undefined>,
): ComputedRef<Participant> {
  const resolvedParticipant = useResolveParticipant(participantRef);

  return computed(() => {
    const p = resolvedParticipant.value;
    if (!p) {
      throw new Error(
        'Participant could not be found in props or context. Please ensure that a participant is provided.',
      );
    }
    return p;
  });
}
