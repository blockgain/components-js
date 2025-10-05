<template>
  <div class="minimal-page">
    <div class="controls" v-if="!connected">
      <h1>Minimal Example</h1>
      <p class="subtitle">Enter your LiveKit credentials to connect</p>
      <input
        v-model="roomUrl"
        type="text"
        placeholder="wss://your-server.livekit.cloud"
        class="input"
      />
      <input v-model="roomToken" type="text" placeholder="Your access token" class="input" />
      <button @click="handleConnect" class="btn btn-primary">Connect</button>
      <router-link to="/" class="btn btn-secondary">Back to Home</router-link>
    </div>

    <div v-if="connected && room" class="room-container">
      <h2>You're connected!</h2>
      <div class="room-info">
        <p>
          Room: <strong>{{ room.name }}</strong>
        </p>
        <p>
          State: <strong>{{ room.state }}</strong>
        </p>
      </div>
      <button @click="handleDisconnect" class="btn btn-disconnect">Disconnect</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLiveKitRoom } from '@livekit/components-vue';

const roomUrl = ref('');
const roomToken = ref('');
const connected = ref(false);

const { room } = useLiveKitRoom({
  serverUrl: roomUrl,
  token: roomToken,
  connect: connected,
  audio: true,
  video: true,
});

const handleConnect = () => {
  if (roomUrl.value && roomToken.value) {
    connected.value = true;
  } else {
    alert('Please enter both server URL and token');
  }
};

const handleDisconnect = () => {
  if (room.value) {
    room.value.disconnect();
  }
  connected.value = false;
};
</script>

<style scoped>
.minimal-page {
  width: 100%;
  min-height: 100vh;
  background: #0f0f0f;
  color: white;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  gap: 1rem;
}

.controls h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #888;
  margin-bottom: 2rem;
}

.input {
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #333;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  outline: none;
}

.input:focus {
  border-color: #667eea;
}

.btn {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}

.btn:hover {
  background: #5568d3;
}

.btn-disconnect {
  background: #dc3545;
  margin-top: 2rem;
}

.btn-disconnect:hover {
  background: #c82333;
}

.room-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
}

.room-container h2 {
  margin-bottom: 2rem;
  font-size: 2rem;
}

.participants {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
}

.participant {
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.participant video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
