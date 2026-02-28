import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  },
});

app.use(router);
app.mount('#app');
