<template>
  <div class="container">
    <header class="header">
      <img src="/livekit-components-logo.png" alt="LiveKit Logo" class="logo" />
      <h1>LiveKit Vue Components - Nuxt 3 Example</h1>
      <p class="subtitle">Real-time video and audio communication for Nuxt 3</p>
    </header>

    <main class="main">
      <div class="examples-grid">
        <NuxtLink to="/simple" class="example-card">
          <div class="card-icon">🎥</div>
          <h3>Simple Conference</h3>
          <p>Full-featured video conference with minimal setup</p>
        </NuxtLink>

        <NuxtLink to="/minimal" class="example-card">
          <div class="card-icon">⚡</div>
          <h3>Minimal Example</h3>
          <p>Basic video call with custom UI components</p>
        </NuxtLink>

        <NuxtLink to="/custom" class="example-card">
          <div class="card-icon">🎨</div>
          <h3>Custom Layout</h3>
          <p>Build your own UI with composables</p>
        </NuxtLink>
      </div>

      <section class="info-section">
        <h2>Getting Started</h2>
        <div class="info-grid">
          <div class="info-card">
            <h4>📦 Installation</h4>
            <pre><code>pnpm add @livekit/components-vue livekit-client</code></pre>
          </div>

          <div class="info-card">
            <h4>🚀 Quick Start</h4>
            <p>Wrap your app with LiveKitRoom and start building!</p>
          </div>

          <div class="info-card">
            <h4>🔧 Composables</h4>
            <p>Use Vue composables for fine-grained control</p>
          </div>

          <div class="info-card">
            <h4>🎨 Customizable</h4>
            <p>Fully customizable UI components and styling</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>
        Built with ❤️ using
        <a href="https://livekit.io" target="_blank">LiveKit</a> and
        <a href="https://nuxt.com" target="_blank">Nuxt 3</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'LiveKit Vue Components - Nuxt 3 Example',
  description: 'Real-time video and audio communication for Nuxt 3 applications',
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header {
  text-align: center;
  padding: 4rem 2rem 2rem;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.example-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.example-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.example-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.example-card p {
  opacity: 0.9;
  line-height: 1.6;
}

.info-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card h4 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
}

.info-card pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9rem;
}

.info-card code {
  color: #a5d6ff;
}

.footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer a {
  color: #a5d6ff;
  text-decoration: none;
  font-weight: 600;
}

.footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .examples-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
