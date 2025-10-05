<template>
  <div class="custom-page">
    <header class="page-header">
      <NuxtLink to="/" class="back-button">← Back to Home</NuxtLink>
      <h1>Custom Layout</h1>
      <p>Build your own UI with Vue composables</p>
    </header>

    <div class="content">
      <div v-if="!isConnected" class="connect-section">
        <div class="connect-card">
          <h2>Join Room</h2>
          <input v-model="serverUrl" placeholder="Server URL" class="input" />
          <input v-model="token" placeholder="Token" class="input" />
          <button @click="handleConnect" class="btn-primary">Connect</button>
        </div>
      </div>

      <ClientOnly>
        <div v-if="isConnected" class="room-layout">
          <LiveKitRoom
            :server-url="serverUrl"
            :token="token"
            :connect="true"
            :video="true"
            :audio="true"
            @connected="onConnected"
            @disconnected="onDisconnected"
          >
            <div class="layout-container">
              <!-- Sidebar with participant list -->
              <aside class="sidebar">
                <h3>Participants ({{ participants.length }})</h3>
                <div class="participant-list">
                  <div
                    v-for="participant in participants"
                    :key="participant.identity"
                    class="participant-item"
                    :class="{ 'is-speaking': participant.isSpeaking }"
                  >
                    <div class="avatar">
                      {{ participant.identity.charAt(0).toUpperCase() }}
                    </div>
                    <div class="participant-details">
                      <div class="name">{{ participant.identity }}</div>
                      <div class="status">
                        <span v-if="participant.isSpeaking" class="speaking-indicator">
                          🎤 Speaking
                        </span>
                        <span v-else class="idle">Idle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <!-- Main video area -->
              <main class="main-content">
                <div class="video-container">
                  <div
                    v-for="trackRef in cameraTracks"
                    :key="`${trackRef.participant.identity}-${trackRef.source}`"
                    class="video-wrapper"
                  >
                    <VideoTrack :track-ref="trackRef" class="video" />
                    <div class="video-overlay">
                      <span class="video-label">
                        {{ trackRef.participant.identity }}
                      </span>
                    </div>
                  </div>

                  <div v-if="cameraTracks.length === 0" class="no-video">
                    <p>No video tracks available</p>
                    <p class="hint">Enable your camera to start</p>
                  </div>
                </div>

                <!-- Control bar -->
                <div class="control-bar">
                  <div class="control-group">
                    <button class="control-btn" title="Microphone">🎤</button>
                    <button class="control-btn" title="Camera">📹</button>
                    <button class="control-btn" title="Screen Share">🖥️</button>
                  </div>
                  <button @click="handleDisconnect" class="btn-danger">Leave Room</button>
                </div>
              </main>

              <!-- Stats panel -->
              <aside class="stats-panel">
                <h3>Room Info</h3>
                <div class="stat-item">
                  <div class="stat-label">Connection</div>
                  <div class="stat-value success">
                    {{ connectionState }}
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Tracks</div>
                  <div class="stat-value">
                    {{ allTracks.length }}
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Local Participant</div>
                  <div class="stat-value">
                    {{ localParticipant?.identity || 'N/A' }}
                  </div>
                </div>
              </aside>
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
import {
  LiveKitRoom,
  VideoTrack,
  RoomAudioRenderer,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-vue';

const serverUrl = ref('');
const token = ref('');
const isConnected = ref(false);

const participants = useParticipants();
const localParticipant = useLocalParticipant();
const connectionState = useConnectionState();

const cameraTracks = useTracks([Track.Source.Camera]);
const allTracks = useTracks([
  Track.Source.Camera,
  Track.Source.Microphone,
  Track.Source.ScreenShare,
]);

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
  title: 'Custom Layout - LiveKit Nuxt',
});
</script>

<style scoped>
.custom-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
  padding: 2rem;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
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
  max-width: 1600px;
  margin: 0 auto;
}

.connect-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.connect-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.connect-card h2 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.room-layout {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  overflow: hidden;
}

.layout-container {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  grid-template-rows: 1fr;
  height: calc(100vh - 200px);
  min-height: 600px;
}

.sidebar {
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar h3 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.participant-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s;
}

.participant-item.is-speaking {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.participant-details {
  flex: 1;
}

.name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.status {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.speaking-indicator {
  color: #3b82f6;
  font-weight: 600;
}

.main-content {
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
}

.video-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
}

.video-wrapper {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
}

.video-label {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.no-video {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 4rem;
}

.no-video p {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.hint {
  font-size: 0.9rem !important;
  opacity: 0.7;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.control-group {
  display: flex;
  gap: 0.75rem;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.btn-danger {
  padding: 0.75rem 2rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-danger:hover {
  background: #dc2626;
}

.stats-panel {
  background: rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-panel h3 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.stat-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.stat-value.success {
  color: #10b981;
}

@media (max-width: 1200px) {
  .layout-container {
    grid-template-columns: 200px 1fr 200px;
  }
}

@media (max-width: 968px) {
  .layout-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .sidebar,
  .stats-panel {
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 200px;
  }
}
</style>
