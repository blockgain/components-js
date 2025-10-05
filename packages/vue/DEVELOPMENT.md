# LiveKit Vue Components - Development Guide

## Overview

LiveKit Vue Components paketi, LiveKit React paketinden esinlenerek Vue 3 için geliştirilmiş bir kütüphanedir.

## Proje Yapısı

```
packages/vue/
├── src/
│   ├── components/          # Vue bileşenleri
│   │   ├── LiveKitRoom.vue
│   │   ├── VideoConference.vue
│   │   ├── ParticipantTile.vue
│   │   ├── VideoTrack.vue
│   │   └── ParticipantName.vue
│   ├── composables/         # Vue composables (React hooks karşılığı)
│   │   ├── useLiveKitRoom.ts
│   │   ├── useRoom.ts
│   │   ├── useParticipants.ts
│   │   ├── useTracks.ts
│   │   └── useConnectionState.ts
│   └── index.ts
├── package.json
├── vite.config.ts
└── tsconfig.json

examples/vue/
├── src/
│   ├── pages/
│   │   ├── Home.vue          # Ana sayfa
│   │   ├── Simple.vue        # Tam özellikli örnek
│   │   └── Minimal.vue       # Minimal örnek
│   ├── App.vue
│   └── main.ts
└── package.json
```

## Kurulum ve Geliştirme

### 1. Bağımlılıkları Yükleyin

```bash
pnpm install
```

### 2. Core ve Styles Paketlerini Build Edin

```bash
cd packages/core && pnpm build
cd ../styles && pnpm build
```

### 3. Vue Paketini Build Edin

```bash
cd packages/vue && pnpm build
```

### 4. Örnek Uygulamayı Çalıştırın

```bash
cd examples/vue && pnpm dev
```

Uygulama `http://localhost:3001` adresinde çalışacaktır.

## Temel Kullanım

### 1. Basit Video Konferans

```vue
<template>
  <LiveKitRoom :server-url="serverUrl" :token="token" :connect="true" :video="true" :audio="true">
    <VideoConference />
  </LiveKitRoom>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LiveKitRoom, VideoConference } from '@livekit/components-vue';
import '@livekit/components-styles';

const serverUrl = ref('wss://your-server.livekit.cloud');
const token = ref('your-access-token');
</script>
```

### 2. Özel Bileşenler ile

```vue
<template>
  <LiveKitRoom :server-url="serverUrl" :token="token" :connect="true">
    <div class="custom-layout">
      <div v-for="trackRef in tracks" :key="`${trackRef.participant.identity}-${trackRef.source}`">
        <VideoTrack :track="trackRef.publication.track" />
        <ParticipantName :participant="trackRef.participant" />
      </div>
    </div>
  </LiveKitRoom>
</template>

<script setup lang="ts">
import { LiveKitRoom, VideoTrack, ParticipantName, useTracks } from '@livekit/components-vue';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

const serverUrl = 'wss://your-server.livekit.cloud';
const token = 'your-access-token';

const tracks = useTracks([Track.Source.Camera]);
</script>
```

## Composables (Vue Hooks)

### useLiveKitRoom

Bir LiveKit odasına bağlanır ve oda nesnesini döndürür.

```typescript
const { room, className } = useLiveKitRoom({
  serverUrl: 'wss://...',
  token: 'token',
  connect: true,
  audio: true,
  video: true,
});
```

### useParticipants

Odadaki tüm katılımcıları döndürür.

```typescript
const participants = useParticipants();
```

### useTracks

Odadaki track'leri filtreler ve döndürür.

```typescript
const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
```

### useRoom

Context'ten mevcut oda nesnesini alır.

```typescript
const room = useRoom();
```

### useConnectionState

Odanın bağlantı durumunu döndürür.

```typescript
const connectionState = useConnectionState();
const isConnected = useIsConnected();
```

## Bileşenler

### LiveKitRoom

Ana oda bileşeni. Tüm alt bileşenlere context sağlar.

**Props:**

- `serverUrl`: LiveKit sunucu URL'si
- `token`: Erişim token'ı
- `connect`: Otomatik bağlanma (varsayılan: true)
- `audio`: Ses yayını (varsayılan: false)
- `video`: Video yayını (varsayılan: false)

**Events:**

- `@connected`: Bağlantı başarılı
- `@disconnected`: Bağlantı kesildi
- `@error`: Hata oluştu

### VideoConference

Hazır video konferans UI'ı.

### VideoTrack

Video/audio track render eder.

**Props:**

- `track`: Track nesnesi
- `source`: Track kaynağı

### ParticipantTile

Katılımcı kartı.

**Props:**

- `participant`: Katılımcı nesnesi
- `trackRef`: Track referansı

### ParticipantName

Katılımcı adını gösterir.

**Props:**

- `participant`: Katılımcı nesnesi

## Test Etme

LiveKit Cloud üzerinden ücretsiz bir hesap oluşturabilir ve test token'ları alabilirsiniz:
https://cloud.livekit.io

Veya LiveKit CLI ile lokal token oluşturabilirsiniz:

```bash
livekit-cli token create \
  --api-key <api-key> \
  --api-secret <api-secret> \
  --join --room <room-name> \
  --identity <user-identity> \
  --valid-for 24h
```

## Özellikler

✅ Vue 3 Composition API
✅ TypeScript desteği
✅ Reactive state yönetimi
✅ Hazır UI bileşenleri
✅ Özelleştirilebilir composables
✅ LiveKit Core ile tam entegrasyon
✅ SSR uyumlu

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Apache-2.0

## Kaynaklar

- [LiveKit Docs](https://docs.livekit.io)
- [LiveKit Client SDK](https://github.com/livekit/client-sdk-js)
- [Vue 3 Docs](https://vuejs.org)
