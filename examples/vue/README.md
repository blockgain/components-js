# LiveKit Vue Examples

This example app demonstrates how to use `@livekit/components-vue` in a Vue 3 application.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A LiveKit server (cloud or self-hosted)
- Access tokens for authentication

### Installation

From the root of the monorepo:

```bash
pnpm install
```

### Building Dependencies

First, build the required packages:

```bash
# Build core package
cd packages/core
pnpm build

# Build styles
cd ../styles
pnpm build

# Build vue package
cd ../vue
pnpm build
```

### Running the Examples

From this directory:

```bash
pnpm dev
```

The app will be available at `http://localhost:3001`

## Examples

### Simple Example (`/simple`)

A full-featured video conference room with:

- Video and audio tracks
- Participant list
- Connection controls

### Minimal Example (`/minimal`)

A minimal implementation showing:

- Basic room connection
- Video rendering
- Participant names

## Getting LiveKit Credentials

To use these examples, you'll need:

1. **Server URL**: Your LiveKit server URL (e.g., `wss://your-project.livekit.cloud`)
2. **Access Token**: A valid access token for your room

### Getting a Token

You can generate tokens at:

- [LiveKit Cloud Console](https://cloud.livekit.io)
- Using the [LiveKit CLI](https://docs.livekit.io/guides/cli/)
- Using one of the [server SDKs](https://docs.livekit.io/server/generating-tokens/)

## Learn More

- [LiveKit Documentation](https://docs.livekit.io)
- [Vue Components Documentation](https://docs.livekit.io/client-sdk-js/)
- [LiveKit Client SDK](https://github.com/livekit/client-sdk-js)

## License

Apache-2.0
