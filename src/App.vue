<template>
  <v-app>

    <v-navigation-drawer v-model="drawer" v-if="logged" temporary app>
      <v-list-item class="px-2 py-1">
        <v-list-item-avatar>
          <v-avatar color="blue-grey lighten-1">
            <v-icon dark> fas fa-user </v-icon>
          </v-avatar>
        </v-list-item-avatar>

        <v-list-item-title class="ml-2">Usuario</v-list-item-title>

        <v-btn icon @click.stop="drawer = !drawer">
          <v-icon>fas fa-angle-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          :to="item.link"
        >
          <v-list-item-icon>
            <v-icon class="mx-auto">{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-group
          v-for="group in groups"
          :key="group.title"
          active-class="group__active"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-icon>
              <v-icon class="mx-auto">{{ group.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="group.title"></v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="child in group.items"
            :key="child.title"
            link
            :to="child.link"
            active-class="child__active"
          >
            <v-list-item-content>
              <v-list-item-title v-text="child.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn color="#E85111" to="/login/" large block>
            Cerrar sesión
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar v-if="logged" app dark>
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <!-- <v-img
          alt="Isologo de SimpliSales"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        /> -->

        <v-img
          alt="Logotipo de SimpliSales"
          class="shrink"
          contain
          min-width="100"
          src="@/assets/SimpliSales_mail_firma-01.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container :fluid="logged">
        <!-- If using vue-router -->
        <router-view v-if="logged"></router-view>
        <div v-else>
          <login @logged="isLogged"></login>
        </div>
      </v-container>
    </v-main>

    <Notifications_status/>

    <!-- <v-footer app>
    </v-footer> -->
  </v-app>
</template>

<script>

import moment from "moment";
import Login from "./views/Login.vue";
import Notifications_status from "./components/Notifications_status.vue";

moment.locale("es");
export default {
  name: "App",

  components: { Login, Notifications_status },

  data: () => ({
    logged: false,
    drawer: false,
    mini: true,
    items: [{ title: "Galería", icon: "fas fa-image", link: "/" }],
    groups: [
      /** Products (sponsors, promos) */
      {
        title: "Productos",
        icon: "fas fa-tag",
        link: "/pantallas",
        items: [
          {
            title: "Listado",
            icon: "",
            link: "/productos",
          },
          {
            title: "Promociones",
            icon: "",
            link: "/promociones",
          },
          {
            title: "Sponsors",
            icon: "",
            link: "/sponsors",
          },
        ],
      },
      /** Screens */
      {
        title: "Pantallas",
        icon: "fas fa-mobile-alt",
        link: "/pantallas",
        items: [
          {
            title: "Publicaciones",
            icon: "",
            link: "/publicaciones",
          },
          {
            title: "Planogramas",
            icon: "",
            link: "/planogramas",
          },
        ],
      },
      /** Table maintenance */
      {
        title: "Tablas",
        icon: "fas fa-tools",
        link: "/mantenimiento-de-tablas",
        items: [
          {
            title: "Atributos",
            icon: "",
            link: "/mantenimiento-de-tablas/atributos",
          },
          {
            title: "Tipos de Atributo",
            icon: "",
            link: "/mantenimiento-de-tablas/tipos-de-atributo",
          },
          {
            title: "Categorías",
            icon: "",
            link: "/mantenimiento-de-tablas/categorias",
          },
          {
            title: "Tipos de Archivo",
            icon: "",
            link: "/mantenimiento-de-tablas/tipos-de-archivo",
          },
          {
            title: "Localidades",
            icon: "",
            link: "/mantenimiento-de-tablas/localidades",
          },
          {
            title: "Fabricantes",
            icon: "",
            link: "/mantenimiento-de-tablas/fabricantes",
          },
          {
            title: "Barrios",
            icon: "",
            link: "/mantenimiento-de-tablas/barrios",
          },
          {
            title: "Tipos de Producto",
            icon: "",
            link: "/mantenimiento-de-tablas/tipos-de-producto",
          },
          {
            title: "Provincias",
            icon: "",
            link: "/mantenimiento-de-tablas/provincias",
          },
          {
            title: "Regiones",
            icon: "",
            link: "/mantenimiento-de-tablas/regiones",
          },
          {
            title: "Tipos de Pantalla",
            icon: "",
            link: "/mantenimiento-de-tablas/tipos-de-pantalla",
          },
          {
            title: "Sectores",
            icon: "",
            link: "/mantenimiento-de-tablas/sectores",
          },
          {
            title: "Zonas",
            icon: "",
            link: "/mantenimiento-de-tablas/zonas",
          },
        ],
      },
    ],
  }),
  methods: {
    isLogged(bool) {
      console.log("isLogged", bool);
      if (bool == true) this.logged = true;
      else {
        this.logged = false;
        return;
      }
    },
  },
};
</script>
<style>
.table-cursor tbody tr:hover {
  cursor: pointer;
}
.group__active {
  color: #fff !important;
  caret-color: #fff !important;
}
.child__active {
  color: #fff !important;
  caret-color: #fff !important;
  background-color: #666666;
}
tbody tr:nth-of-type(odd) {
  background-color: rgba(255, 255, 255, 0.05);
}
.required label::after {
  content: "*";
}
</style>