import Vue from "vue";
import VueRouter from "vue-router";
import Gallery from "../views/Gallery.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Gallery",
    component: Gallery
  },
  {
    path: "/productos",
    name: "Products",
    component: function () {
      return import(/* webpackChunkName: "products" */ "../views/Products.vue");
    }
  },
  {
    path: "/pantallas",
    name: "Screens",
    component: function () {
      return import(/* webpackChunkName: "screens" */ "../views/Screens.vue");
    }
  },
  {
    path: "/pantallas/gondolas",
    name: "AdScreens",
    component: function () {
      return import(/* webpackChunkName: "ad-screens" */ "../views/AdScreens.vue");
    }
  },
  {
    path: "/pantallas/gondolas",
    name: "ShelveScreens",
    component: function () {
      return import(/* webpackChunkName: "shelve-screens" */ "../views/ShelveScreens.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas",
    name: "TableMaintenance",
    component: function () {
      return import(/* webpackChunkName: "table-maintenance" */ "../views/TableMaintenance.vue");
    }
  }
  //{
  //path: "/about",
  //name: "About",
  // route level code-splitting
  // this generates a separate chunk (about.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  //component: function () {
  //return import(/* webpackChunkName: "about" */ "../views/About.vue");
  //}
  //}
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
