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
    path: "/sponsors",
    name: "Sponsors",
    component: function () {
      return import(/* webpackChunkName: "sponsors" */ "../views/products/Sponsors.vue");
    }
  },
  {
    path: "/login",
    name: "Login",
    component: function () {
      return import(/* webpackChunkName: "login" */ "../views/Login.vue");
    }
  },
  {
    path: "/pantallas/publicaciones",
    name: "Publications",
    component: function () {
      return import(/* webpackChunkName: "publications" */ "../views/screens/Publications.vue");
    }
  },
  {
    path: "/pantallas/planogramas",
    name: "Planograms",
    component: function () {
      return import(/* webpackChunkName: "planograms" */ "../views/screens/Planograms.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/fabricantes",
    name: "Manufacturers",
    component: function () {
      return import(/* webpackChunkName: "manufacturers" */ "../views/table_maintenance/Manufacturers.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/tipos-de-pantalla",
    name: "ScreenTypes",
    component: function () {
      return import(/* webpackChunkName: "screen-types" */ "../views/table_maintenance/ScreenTypes.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/tipos-de-archivo",
    name: "FileTypes",
    component: function () {
      return import(/* webpackChunkName: "file-types" */ "../views/table_maintenance/FileTypes.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/tipos-de-producto",
    name: "ProductTypes",
    component: function () {
      return import(/* webpackChunkName: "product-types" */ "../views/table_maintenance/ProductTypes.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/tipos-de-atributo",
    name: "AttributeTypes",
    component: function () {
      return import(/* webpackChunkName: "attribute-types" */ "../views/table_maintenance/AttributeTypes.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/zonas",
    name: "Zones",
    component: function () {
      return import(/* webpackChunkName: "zones" */ "../views/table_maintenance/Zones.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/sectores",
    name: "Sectors",
    component: function () {
      return import(/* webpackChunkName: "sectors" */ "../views/table_maintenance/Sectors.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/provincias",
    name: "Provinces",
    component: function () {
      return import(/* webpackChunkName: "provinces" */ "../views/table_maintenance/Provinces.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/categorias",
    name: "Categories",
    component: function () {
      return import(/* webpackChunkName: "categories" */ "../views/table_maintenance/Categories.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/localidades",
    name: "Locations",
    component: function () {
      return import(/* webpackChunkName: "locations" */ "../views/table_maintenance/Locations.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/barrios",
    name: "Neighborhoods",
    component: function () {
      return import(/* webpackChunkName: "neighborhoods" */ "../views/table_maintenance/Neighborhoods.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/atributos",
    name: "Attributes",
    component: function () {
      return import(/* webpackChunkName: "attributes" */ "../views/table_maintenance/Attributes.vue");
    }
  },
  {
    path: "/mantenimiento-de-tablas/regiones",
    name: "Regions",
    component: function () {
      return import(/* webpackChunkName: "regions" */ "../views/table_maintenance/Regions.vue");
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
