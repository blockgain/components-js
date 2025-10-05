import { ref, computed, watchEffect, toValue, type MaybeRef } from 'vue';
import { participantAttributesObserver } from '@livekit/components-core';
import { type Participant } from 'livekit-client';
import { useEnsureParticipant, useMaybeParticipantContext } from './useParticipantContext';
import { useObservableState } from './useObservableState';

export interface UseParticipantAttributesOptions {
  participant?: MaybeRef<Participant | undefined>;
}

export function useParticipantAttributes(options: UseParticipantAttributesOptions = {}) {
  const participantContext = useMaybeParticipantContext();
  const participant = computed(() => toValue(options.participant) ?? toValue(participantContext));

  const attributeObserver = computed(() => {
    const p = participant.value;
    // weird typescript constraint
    return p ? participantAttributesObserver(p) : participantAttributesObserver(p);
  });

  const attributeState = useObservableState<{
    changed?: Participant['attributes'];
    attributes?: Participant['attributes'];
  }>(attributeObserver, {
    changed: undefined,
    attributes: participant.value?.attributes,
  });

  return attributeState;
}

export function useParticipantAttribute(
  attributeKey: MaybeRef<string>,
  options: UseParticipantAttributesOptions = {},
) {
  const participant = useEnsureParticipant(toValue(options.participant));
  const attribute = ref(participant.value.attributes[toValue(attributeKey)]);

  watchEffect((onCleanup) => {
    const p = participant.value;
    const key = toValue(attributeKey);

    if (!p) {
      return;
    }

    attribute.value = p.attributes[key];

    const subscription = participantAttributesObserver(p).subscribe((val) => {
      if (val.changed[key] !== undefined) {
        attribute.value = val.attributes[key];
      }
    });

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  return attribute;
}
