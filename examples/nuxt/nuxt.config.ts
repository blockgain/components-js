// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['@livekit/components-styles/styles.css'],

  ssr: false, // LiveKit is client-side only

  vite: {
    optimizeDeps: {
      include: ['livekit-client'],
    },
  },
});
