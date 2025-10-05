<template>
  <div class="home-page">
    <div class="container">
      <h1>LiveKit Vue Components Examples</h1>
      <p class="description">Choose an example to see LiveKit Vue components in action</p>

      <div class="examples-grid">
        <router-link to="/simple" class="example-card">
          <h2>Simple Example</h2>
          <p>A basic video conference room with full features</p>
        </router-link>

        <router-link to="/minimal" class="example-card">
          <h2>Minimal Example</h2>
          <p>Minimal implementation showing the basics</p>
        </router-link>
      </div>

      <div class="info-section">
        <h3>Getting Started</h3>
        <p>
          You'll need a LiveKit server URL and access token to connect. Visit
          <a href="https://livekit.io" target="_blank">livekit.io</a> to get started.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.container {
  max-width: 900px;
  width: 100%;
}

h1 {
  color: white;
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
}

.description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 3rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.example-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: #333;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.example-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.example-card h2 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.example-card p {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

.info-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  color: white;
}

.info-section h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.info-section p {
  font-size: 1rem;
  line-height: 1.6;
}

.info-section a {
  color: #ffd700;
  text-decoration: none;
  font-weight: 600;
}

.info-section a:hover {
  text-decoration: underline;
}
</style>
