import { createMediaDeviceObserver } from "@livekit/components-core";
import { useObservable } from "@vueuse/rxjs";

export function useMediaDevices({ kind, onError }) {
  const deviceObserver = createMediaDeviceObserver(kind, onError);

  const devices = useObservable(deviceObserver, {
    initialValue: [],
  });

  return devices;
}
