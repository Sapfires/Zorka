import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import VueRouter from 'vue-router';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

// Подключаем Vuetify и Vue Router
Vue.use(Vuetify);
Vue.use(VueRouter);

// Создаем и монтируем Vue приложение
new Vue({
  render: h => h(App),
  router, // Подключаем маршруты
  store,
  vuetify: new Vuetify() // Подключаем Vuetify
}).$mount('#app');
