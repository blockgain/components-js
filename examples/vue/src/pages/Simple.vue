<template>
  <div class="simple-page">
    <div class="controls" v-if="!roomConnected">
      <h1>Join a LiveKit Room</h1>
      <input v-model="serverUrl" type="text" placeholder="Server URL (wss://...)" class="input" />
      <input v-model="token" type="text" placeholder="Access Token" class="input" />
      <button @click="handleConnect" class="btn btn-primary">Connect</button>
      <router-link to="/" class="btn btn-secondary">Back to Home</router-link>
    </div>

    <div v-if="roomConnected" class="room-container">
      <div class="room-header">
        <h2>Connected to Room</h2>
        <button @click="handleDisconnect" class="btn btn-danger">Disconnect</button>
      </div>

      <div class="room-info">
        <p v-if="room">
          Room: <strong>{{ room.name }}</strong> | State: <strong>{{ room.state }}</strong>
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLiveKitRoom } from '@livekit/components-vue';

const serverUrl = ref('');
const token = ref('');
const roomConnected = ref(false);
const error = ref<string | null>(null);

// Use LiveKit room composable
const { room } = useLiveKitRoom({
  serverUrl,
  token,
  connect: roomConnected,
  audio: true,
  video: true,
});

// Watch for room state changes
watch(room, (newRoom) => {
  if (newRoom) {
    console.log('Room connected:', newRoom.name);
  }
});

const handleConnect = () => {
  if (!serverUrl.value || !token.value) {
    error.value = 'Please enter both server URL and token';
    return;
  }

  error.value = null;
  roomConnected.value = true;
};

const handleDisconnect = () => {
  try {
    if (room.value) {
      room.value.disconnect();
    }
    roomConnected.value = false;
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to disconnect';
  }
};
</script>

<style scoped>
.simple-page {
  width: 100%;
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  padding: 2rem;
}

.controls h1 {
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #333;
  border-radius: 8px;
  background: #2a2a2a;
  color: white;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #667eea;
}

.input::placeholder {
  color: #666;
}

.btn {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #333;
  color: white;
}

.btn-secondary:hover {
  background: #444;
}

.btn-danger {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
}

.btn-danger:hover {
  background: #c82333;
}

.room-container {
  padding: 2rem;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333;
}

.room-header h2 {
  color: #667eea;
  margin: 0;
}

.room-info {
  background: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.room-info p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.room-info strong {
  color: #667eea;
}

.error {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>
