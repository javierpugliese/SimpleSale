import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import VueWorker from 'vue-worker';
import vdr from "./components/vdr_gorkys_modified/components/vue-draggable-resizable.vue";
import "./components/vdr_gorkys_modified/components/vue-draggable-resizable.css";

Vue.config.productionTip = false;

axios.defaults.baseURL = "https://touch-test-app.azurewebsites.net/";

axios.interceptors.request.use(
  config => {
    console.log(
      `${config.method.toUpperCase()} request sent to ${config.baseURL}${config.url} at ${new Date()}`
    );
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

Vue.prototype.$http = axios;

Vue.use(VueWorker, "$worker");
Vue.component('vdr', vdr);

new Vue({
  router,
  store,
  vuetify,
  render: function (h) {
    return h(App);
  }
}).$mount("#app");