<template>
  <div class="minimal-page">
    <header class="page-header">
      <NuxtLink to="/" class="back-button">← Back to Home</NuxtLink>
      <h1>Minimal Example</h1>
      <p>Basic video call with essential features</p>
    </header>

    <div class="content">
      <div class="form-section" v-if="!connected">
        <div class="form-card">
          <h2>Connect</h2>
          <input v-model="url" placeholder="Server URL" class="input" />
          <input v-model="accessToken" placeholder="Access Token" class="input" />
          <button @click="connect" class="btn-connect">Join Room</button>
        </div>
      </div>

      <ClientOnly>
        <div v-if="connected" class="room-section">
          <LiveKitRoom
            :server-url="url"
            :token="accessToken"
            :connect="true"
            :video="true"
            :audio="true"
            @disconnected="onDisconnected"
          >
            <div class="video-grid">
              <div
                v-for="track in videoTracks"
                :key="`${track.participant.identity}-${track.source}`"
                class="video-item"
              >
                <VideoTrack :track-ref="track" />
                <div class="name-tag">
                  {{ track.participant.identity }}
                </div>
              </div>
            </div>

            <div class="controls-bar">
              <button @click="disconnect" class="btn-disconnect">Leave</button>
            </div>

            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Track } from 'livekit-client';
import { LiveKitRoom, VideoTrack, RoomAudioRenderer, useTracks } from '@livekit/components-vue';

const url = ref('');
const accessToken = ref('');
const connected = ref(false);

const videoTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

const connect = () => {
  if (url.value && accessToken.value) {
    connected.value = true;
  }
};

const disconnect = () => {
  connected.value = false;
};

const onDisconnected = () => {
  connected.value = false;
};

useSeoMeta({
  title: 'Minimal Example - LiveKit Nuxt',
});
</script>

<style scoped>
.minimal-page {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.back-button {
  display: inline-block;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
}

.form-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.form-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-card h2 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-connect {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-connect:hover {
  background: #2563eb;
}

.room-section {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.video-item {
  position: relative;
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.name-tag {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.controls-bar {
  text-align: center;
}

.btn-disconnect {
  padding: 0.75rem 2rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-disconnect:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
