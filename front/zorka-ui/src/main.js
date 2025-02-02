import Vue from 'vue';
import App from './App.vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import VueRouter from 'vue-router';
import router from './router';
import store from './store';
import InfiniteScroll from 'vue-infinite-scroll';


Vue.config.productionTip = false;


Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(InfiniteScroll);

new Vue({
  render: h => h(App),
  router,
  store,
  vuetify: new Vuetify()
}).$mount('#app');
