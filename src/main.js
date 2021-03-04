import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import VueWorker from 'vue-worker';
//import vdr from 'vue-draggable-resizable-gorkys';
import vdr from "./components/vdr_gorkys_modified/components/vue-draggable-resizable.vue";
import "./components/vdr_gorkys_modified/components/vue-draggable-resizable.css";
//import 'vue-draggable-resizable-gorkys/dist/VueDraggableResizable.css';

//import VueDraggableResizable from 'vue-draggable-resizable';

//Vue.component('vue-draggable-resizable', VueDraggableResizable);

Vue.config.productionTip = false;

/* const axiosInstance = axios.create({
  baseURL: "https://touch-test-app.azurewebsites.net/",
  timeout: 20000
});

axiosInstance.interceptors.request.use(
  config => {
    console.log(
      `${config.method.toUpperCase()} request sent to ${config.baseURL}${config.url} at ${new Date()}`
    );
    return config;
  },
  error => {
    return Promise.reject(error);
  }
); */

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

// Registra una directiva personalizada global llamada `v-focus`
Vue.directive('inserted', {
  // Cuando el elemento enlazado se inserta en el DOM...
  inserted: function (el) {
    // Enfoca el elemento
    //el.focus();

    // Log element
    console.log("Inserted element:", el)
  }
})

new Vue({
  router,
  store,
  vuetify,
  render: function (h) {
    return h(App);
  }
}).$mount("#app");