<template>
  <div class="simple-page">
    <header class="page-header">
      <NuxtLink to="/" class="back-button">← Back to Home</NuxtLink>
      <h1>Simple Video Conference</h1>
      <p>Full-featured video conference with minimal setup</p>
    </header>

    <div class="connection-form" v-if="!isConnected">
      <div class="form-card">
        <h2>Join Room</h2>
        <form @submit.prevent="handleConnect">
          <div class="form-group">
            <label for="serverUrl">Server URL</label>
            <input
              id="serverUrl"
              v-model="serverUrl"
              type="text"
              placeholder="wss://your-server.livekit.cloud"
              required
            />
          </div>

          <div class="form-group">
            <label for="token">Access Token</label>
            <input
              id="token"
              v-model="token"
              type="text"
              placeholder="Your access token"
              required
            />
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="videoEnabled" />
              Enable Video
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="audioEnabled" />
              Enable Audio
            </label>
          </div>

          <button type="submit" class="connect-button">Connect to Room</button>
        </form>

        <div class="info-box">
          <p><strong>Need a token?</strong></p>
          <p>
            Get free test tokens at
            <a href="https://cloud.livekit.io" target="_blank">LiveKit Cloud</a>
          </p>
        </div>
      </div>
    </div>

    <ClientOnly>
      <LiveKitRoom
        v-if="isConnected"
        :server-url="serverUrl"
        :token="token"
        :connect="true"
        :video="videoEnabled"
        :audio="audioEnabled"
        @connected="onConnected"
        @disconnected="onDisconnected"
      >
        <div class="room-container">
          <RoomAudioRenderer />

          <div class="participants-grid">
            <div
              v-for="trackRef in tracks"
              :key="`${trackRef.participant.identity}-${trackRef.source}`"
              class="participant-tile"
            >
              <VideoTrack :track-ref="trackRef" class="video-track" />
              <div class="participant-info">
                <span class="participant-name">
                  {{ trackRef.participant.identity }}
                </span>
              </div>
            </div>
          </div>

          <div class="controls">
            <button @click="handleDisconnect" class="disconnect-button">Leave Room</button>
          </div>
        </div>
      </LiveKitRoom>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Track } from 'livekit-client';
import { LiveKitRoom, RoomAudioRenderer, VideoTrack, useTracks } from '@livekit/components-vue';

const serverUrl = ref('');
const token = ref('');
const videoEnabled = ref(true);
const audioEnabled = ref(true);
const isConnected = ref(false);

const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

const handleConnect = () => {
  if (serverUrl.value && token.value) {
    isConnected.value = true;
  }
};

const handleDisconnect = () => {
  isConnected.value = false;
};

const onConnected = () => {
  console.log('Connected to room');
};

const onDisconnected = () => {
  console.log('Disconnected from room');
  isConnected.value = false;
};

useSeoMeta({
  title: 'Simple Conference - LiveKit Nuxt Example',
});
</script>

<style scoped>
.simple-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.page-header {
  text-align: center;
  color: white;
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

.connection-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.form-card h2 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input[type='text'] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input[type='text']:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input[type='checkbox'] {
  margin-right: 0.5rem;
}

.connect-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.connect-button:hover {
  transform: translateY(-2px);
}

.info-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0f4ff;
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
}

.info-box a {
  color: #667eea;
  font-weight: 600;
}

.room-container {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 16px;
  padding: 2rem;
  min-height: 70vh;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.participant-tile {
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video-track {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
}

.participant-name {
  color: white;
  font-weight: 600;
}

.controls {
  text-align: center;
}

.disconnect-button {
  padding: 1rem 2rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.disconnect-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.8rem;
  }

  .participants-grid {
    grid-template-columns: 1fr;
  }
}
</style>
