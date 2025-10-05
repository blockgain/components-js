import { shallowRef, watch, toValue, type ShallowRef, type MaybeRef } from 'vue';
import type { Observable } from 'rxjs';

export function useObservableState<T>(
  observable: MaybeRef<Observable<T> | undefined>,
  startWith: T,
): ShallowRef<T> {
  const state = shallowRef<T>(startWith);
  watch(
    () => toValue(observable),
    (obs, _oldObs, onCleanup) => {
      state.value = startWith;
      // observable state doesn't run in SSR
      if (typeof window === 'undefined' || !obs) return;
      const subscription = obs.subscribe((value: T) => (state.value = value));
      onCleanup(() => subscription.unsubscribe());
    },
    {
      immediate: true,
    },
  );
  return state;
}
