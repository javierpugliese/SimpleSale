import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import vdr from "./components/vdr_gorkys_modified/components/vue-draggable-resizable.vue";
import "./components/vdr_gorkys_modified/components/vue-draggable-resizable.css";

Vue.config.productionTip = false;

//axios.defaults.baseURL = "https://touch-test-app.azurewebsites.net/";
axios.defaults.baseURL = "http://200.10.96.221:8080/";
//axios.defaults.withCredentials = true;

const USERNAME = "simplisale";
const PASSWORD = "vt4gdm¡n-";

/* axios.defaults.auth = {
  username: USERNAME,
  password: PASSWORD
} */

const token = `${USERNAME}:${PASSWORD}`;
const encodedToken = Buffer.from(token).toString('base64');
//const headers = { 'Authorization': 'Basic '+ encodedToken };
const authorization = 'Basic ' + encodedToken;
//axios.defaults.headers.common['Authorization'] = authorization;

//axios.defaults.headers.common['Authorization'] = authorization;
//axios.defaults.headers.common['Access-Control-Allow-Origin'] = "*";

axios.interceptors.request.use(
  config => {
    console.log(
      `${config.method.toUpperCase()} request sent to ${config.baseURL}${config.url} at ${new Date()}`
    );
    console.log('Authorization', authorization)
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

Vue.prototype.$http = axios;

Vue.component('vdr', vdr);

new Vue({
  router,
  store,
  vuetify,
  render: function (h) {
    return h(App);
  }
}).$mount("#app");