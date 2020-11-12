/* eslint-disable */
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
      return import(/* webpackChunkName: "products" */ "../views/products/Products.vue");
    }
  },
  {
    path: "/agregar-producto",
    name: "ProductsAddOne",
    component: function () {
      return import(/* webpackChunkName: "products-add-one" */ "../views/products/ProductsAddOne.vue");
    }
  },
  {
    path: "/pantallas",
    name: "Screens",
    component: function () {
      return import(/* webpackChunkName: "screens" */ "../views/screens/Screens.vue");
    }
  },
  {
    path: "/pantallas/gondolas",
    name: "AdScreens",
    component: function () {
      return import(/* webpackChunkName: "ads" */ "../views/screens/Ads.vue");
    }
  },
  {
    path: "/pantallas/gondolas",
    name: "Virtuals",
    component: function () {
      return import(/* webpackChunkName: "virtuals" */ "../views/screens/Virtuals.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas",
    name: "TableMaintenance",
    component: function () {
      return import(/* webpackChunkName: "table-maintenance" */ "../views/table_maintenance/TableMaintenance.vue");
    }
  },
  {
    path: "/fabricantes",
    name: "Manufacturers",
    component: function () {
      return import(/* webpackChunkName: "manufacturers" */ "../views/table_maintenance/Manufacturers.vue");
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
