import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import VueRouter from 'vue-router';
import router from './router'; // Если у вас есть файл router.js
import store from './store';   // Если вы используете Vuex
import InfiniteScroll from 'vue-infinite-scroll';


Vue.config.productionTip = false;

// Подключаем Vuetify и Vue Router
Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(InfiniteScroll);

// Создаем и монтируем Vue приложение
new Vue({
  render: h => h(App),
  router,  // Подключаем маршруты
  store,   // Подключаем Vuex (если используется)
  vuetify: new Vuetify()  // Подключаем Vuetify
}).$mount('#app');
