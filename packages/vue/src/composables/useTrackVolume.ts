import { ref, watch, toValue, type MaybeRef } from 'vue';
import type { LocalAudioTrack, RemoteAudioTrack, AudioAnalyserOptions } from 'livekit-client';
import { Track, createAudioAnalyser } from 'livekit-client';
import {
  type TrackReference,
  isTrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-core';

export function useTrackVolume(
  trackOrTrackReference?: MaybeRef<LocalAudioTrack | RemoteAudioTrack | TrackReference>,
  options: MaybeRef<AudioAnalyserOptions> = {
    fftSize: 32,
    smoothingTimeConstant: 0,
  },
) {
  const volume = ref<number>(0);

  watch(
    [() => toValue(trackOrTrackReference), () => toValue(options)],
    ([trackOrRef, currentOptions]: [any, AudioAnalyserOptions], _oldVal, onCleanup) => {
      const track = isTrackReference(trackOrRef)
        ? <LocalAudioTrack | RemoteAudioTrack | undefined>trackOrRef.publication.track
        : trackOrRef;

      if (!track || !track.mediaStream) {
        volume.value = 0;
        return;
      }

      const { cleanup, analyser } = createAudioAnalyser(track, currentOptions);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const a = dataArray[i];
          sum += a * a;
        }
        volume.value = Math.sqrt(sum / dataArray.length) / 255;
      };

      const interval = setInterval(updateVolume, 1000 / 30);

      onCleanup(() => {
        cleanup();
        clearInterval(interval);
      });
    },
    { immediate: true, deep: true },
  );

  return volume;
}

const normalizeFrequencies = (frequencies: Float32Array) => {
  const normalizeDb = (value: number) => {
    const minDb = -100;
    const maxDb = -10;
    let db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100;
    db = Math.sqrt(db);

    return db;
  };

  // Normalize all frequency values
  return frequencies.map((value) => {
    if (value === -Infinity) {
      return 0;
    }
    return normalizeDb(value);
  });
};

export interface MultiBandTrackVolumeOptions {
  bands?: number;
  loPass?: number;
  hiPass?: number;
  updateInterval?: number;
  analyserOptions?: AnalyserOptions;
}

const multibandDefaults = {
  bands: 5,
  loPass: 100,
  hiPass: 600,
  updateInterval: 32,
  analyserOptions: { fftSize: 2048 },
} as const satisfies MultiBandTrackVolumeOptions;

export function useMultibandTrackVolume(
  trackOrTrackReference?: MaybeRef<
    LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder | undefined
  >,
  options: MaybeRef<MultiBandTrackVolumeOptions> = {},
) {
  const frequencyBands = ref<Array<number>>([]);

  watch(
    [() => toValue(trackOrTrackReference), () => toValue(options)],
    ([trackOrRef, currentOptions]: [any, MultiBandTrackVolumeOptions], _oldVal, onCleanup) => {
      const track =
        trackOrRef instanceof Track
          ? trackOrRef
          : <LocalAudioTrack | RemoteAudioTrack | undefined>trackOrRef?.publication?.track;

      const opts = { ...multibandDefaults, ...currentOptions };

      if (!track || !track.mediaStream) {
        frequencyBands.value = new Array(opts.bands).fill(0);
        return;
      }

      const { analyser, cleanup } = createAudioAnalyser(
        track as LocalAudioTrack | RemoteAudioTrack,
        opts.analyserOptions,
      );

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const updateVolume = () => {
        analyser.getFloatFrequencyData(dataArray);
        let frequencies: Float32Array = new Float32Array(dataArray.length);
        for (let i = 0; i < dataArray.length; i++) {
          frequencies[i] = dataArray[i];
        }
        frequencies = frequencies.slice(opts.loPass, opts.hiPass);

        const normalizedFrequencies = normalizeFrequencies(frequencies); // is this needed ?
        const chunkSize = Math.ceil(normalizedFrequencies.length / opts.bands); // we want logarithmic chunking here
        const chunks: Array<number> = [];
        for (let i = 0; i < opts.bands; i++) {
          const summedVolumes = normalizedFrequencies
            .slice(i * chunkSize, (i + 1) * chunkSize)
            .reduce((acc, val) => (acc += val), 0);
          chunks.push(summedVolumes / chunkSize);
        }

        frequencyBands.value = chunks;
      };

      const interval = setInterval(updateVolume, opts.updateInterval);

      onCleanup(() => {
        cleanup();
        clearInterval(interval);
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );

  return frequencyBands;
}

export interface AudioWaveformOptions {
  barCount?: number;
  volMultiplier?: number;
  updateInterval?: number;
}

const waveformDefaults = {
  barCount: 120,
  volMultiplier: 5,
  updateInterval: 20,
} as const satisfies AudioWaveformOptions;

export function useAudioWaveform(
  trackOrTrackReference?: MaybeRef<
    LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder
  >,
  options: MaybeRef<AudioWaveformOptions> = {},
) {
  const aggregateWave = ref(new Float32Array());
  const timeRef = ref(performance.now());
  const updates = ref(0);
  const bars = ref<number[]>([]);

  watch(
    [() => toValue(trackOrTrackReference), () => toValue(options)],
    ([trackOrRef, currentOptions]: [any, AudioWaveformOptions], _oldVal, onCleanup) => {
      const track =
        trackOrRef instanceof Track
          ? trackOrRef
          : <LocalAudioTrack | RemoteAudioTrack | undefined>trackOrRef?.publication?.track;

      const opts = { ...waveformDefaults, ...currentOptions };

      if (!track || !track.mediaStream) {
        bars.value = [];
        return;
      }

      const { analyser, cleanup } = createAudioAnalyser(
        track as LocalAudioTrack | RemoteAudioTrack,
        {
          fftSize: getFFTSizeValue(opts.barCount),
        },
      );

      const bufferLength = getFFTSizeValue(opts.barCount);
      const dataArray = new Float32Array(bufferLength);

      const onUpdate = (wave: Float32Array) => {
        bars.value = Array.from(
          filterData(wave, opts.barCount).map((v) => Math.sqrt(v) * opts.volMultiplier),
        );
      };

      const update = () => {
        updateWaveform = requestAnimationFrame(update);
        analyser.getFloatTimeDomainData(dataArray);
        aggregateWave.value.map((v, i) => v + dataArray[i]);
        updates.value += 1;

        if (performance.now() - timeRef.value >= opts.updateInterval) {
          const newData = dataArray.map((v) => v / updates.value);
          onUpdate(newData);
          timeRef.value = performance.now();
          updates.value = 0;
        }
      };

      let updateWaveform = requestAnimationFrame(update);

      onCleanup(() => {
        cleanup();
        cancelAnimationFrame(updateWaveform);
      });
    },
    { immediate: true, deep: true },
  );

  return { bars };
}

function getFFTSizeValue(x: number) {
  if (x < 32) return 32;
  else return pow2ceil(x);
}

function pow2ceil(v: number) {
  let p = 2;
  while ((v >>= 1)) {
    p <<= 1;
  }
  return p;
}

function filterData(audioData: Float32Array, numSamples: number) {
  const blockSize = Math.floor(audioData.length / numSamples); // the number of samples in each subdivision
  const filteredData = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const blockStart = blockSize * i; // the location of the first sample in the block
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(audioData[blockStart + j]); // find the sum of all the samples in the block
    }
    filteredData[i] = sum / blockSize; // divide the sum by the block size to get the average
  }
  return filteredData;
}
