import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

/**
 * Track element visibility using IntersectionObserver
 */
export function useElementVisibility(element: Ref<HTMLElement | null>): Ref<boolean> {
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!element.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        isVisible.value = entries[0].isIntersecting;
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(element.value);
  });

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return isVisible;
}
