import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import '@livekit/components-styles';
import './style.css';
import App from './App.vue';

// Import pages
import Home from './pages/Home.vue';
import Simple from './pages/Simple.vue';
import Minimal from './pages/Minimal.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/simple', component: Simple },
    { path: '/minimal', component: Minimal },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
