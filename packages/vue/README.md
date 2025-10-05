# @livekit/components-vue

Vue 3 components for building LiveKit applications.

## Installation

```bash
npm install @blockgain/livekit-vue livekit-client
# or
pnpm add @blockgain/livekit-vue livekit-client
```

## Quick Start

```vue
<template>
  <LiveKitRoom :server-url="serverUrl" :token="token" :connect="true" @connected="handleConnected">
    <VideoConference />
  </LiveKitRoom>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LiveKitRoom, VideoConference } from '@livekit/components-vue';
import '@livekit/components-styles';

const serverUrl = ref('wss://your-livekit-server.com');
const token = ref('your-token');

const handleConnected = () => {
  console.log('Connected to room');
};
</script>
```

## Available Components

- `LiveKitRoom` - Main room component that provides context
- `VideoConference` - Pre-built video conference UI
- `ParticipantTile` - Display a single participant
- `VideoTrack` - Render video/audio tracks
- `ParticipantName` - Display participant name

## Available Composables

- `useLiveKitRoom()` - Connect to a LiveKit room
- `useRoom()` - Access current room instance
- `useParticipants()` - Get all participants
- `useLocalParticipant()` - Get local participant
- `useRemoteParticipants()` - Get remote participants
- `useTracks()` - Get track references
- `useTrack()` - Subscribe to a single track

## Example

Check out the [examples directory](../../examples/vue) for complete examples.

## Documentation

For complete documentation, visit [docs.livekit.io](https://docs.livekit.io).

## License

Apache-2.0
