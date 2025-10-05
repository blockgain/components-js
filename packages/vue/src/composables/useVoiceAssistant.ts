import { computed, reactive } from 'vue';
import { ConnectionState, ParticipantKind, Track } from 'livekit-client';
import type { RemoteParticipant } from 'livekit-client';
import type { TrackReference } from '@livekit/components-core';
import { useParticipantTracks } from './useParticipantTracks';
import { useRemoteParticipants } from './useRemoteParticipants';
import { useConnectionState } from './useConnectionStatus';
import { useParticipantAttributes } from './useParticipantAttributes';

export type AgentState =
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'thinking'
  | 'speaking';

export interface VoiceAssistant {
  agent: RemoteParticipant | undefined;
  state: AgentState;
  audioTrack: TrackReference | undefined;
  videoTrack: TrackReference | undefined;
  // agentTranscriptions: ReceivedTranscriptionSegment[];
  agentAttributes: RemoteParticipant['attributes'] | undefined;
}

const state_attribute = 'lk.agent.state';

export function useVoiceAssistant(): VoiceAssistant {
  const remoteParticipants = useRemoteParticipants();

  const agent = computed(() =>
    remoteParticipants.value.find(
      (p: RemoteParticipant) =>
        p.kind === ParticipantKind.AGENT && !('lk.publish_on_behalf' in p.attributes),
    ),
  );

  const worker = computed(() =>
    remoteParticipants.value.find(
      (p: RemoteParticipant) =>
        p.kind === ParticipantKind.AGENT &&
        p.attributes['lk.publish_on_behalf'] === agent.value?.identity,
    ),
  );

  const agentIdentity = computed(() => agent.value?.identity);
  const workerIdentity = computed(() => worker.value?.identity);

  const agentTracks = useParticipantTracks(
    [Track.Source.Microphone, Track.Source.Camera],
    agentIdentity,
  );

  const workerTracks = useParticipantTracks(
    [Track.Source.Microphone, Track.Source.Camera],
    workerIdentity,
  );

  const audioTrack = computed(
    () =>
      agentTracks.value.find((t) => t.source === Track.Source.Microphone) ??
      workerTracks.value.find((t) => t.source === Track.Source.Microphone),
  );

  const videoTrack = computed(
    () =>
      agentTracks.value.find((t) => t.source === Track.Source.Camera) ??
      workerTracks.value.find((t) => t.source === Track.Source.Camera),
  );

  const connectionState = useConnectionState();
  const attributeState = useParticipantAttributes({
    participant: agent,
  });

  const agentAttributes = computed(() => attributeState.value.attributes);

  const state = computed(() => {
    if (connectionState.value === ConnectionState.Disconnected) {
      return 'disconnected';
    } else if (
      connectionState.value === ConnectionState.Connecting ||
      !agent.value ||
      !agentAttributes.value?.[state_attribute]
    ) {
      return 'connecting';
    } else {
      return agentAttributes.value[state_attribute] as AgentState;
    }
  });

  return reactive({
    agent,
    state,
    audioTrack,
    videoTrack,
    agentAttributes,
  });
}
