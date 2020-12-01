import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
//import VueDraggableResizable from 'vue-draggable-resizable';

//Vue.component('vue-draggable-resizable', VueDraggableResizable);

Vue.config.productionTip = false;

const axiosInstance = axios.create({
  baseURL: "https://touch-test-app.azurewebsites.net/",
  timeout: 20000
});

axiosInstance.interceptors.request.use(
  config => {
    console.log(
      `${config.method.toUpperCase()} request sent to ${config.baseURL}${config.url} at ${new Date()}`
    ); /* Log method, complete url and datetime */
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

Vue.prototype.$http = axiosInstance;

new Vue({
  router,
  store,
  vuetify,
  render: function (h) {
    return h(App);
  }
}).$mount("#app");
