<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary app>
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
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn color="red" large block> Cerrar sesión </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app dark>
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
      <v-container fluid>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- <v-footer app>
    </v-footer> -->
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data: () => ({
    drawer: false,
    mini: true,
    items: [
      { title: "Galería", icon: "fas fa-image", link: "/" },
      { title: "Productos", icon: "fas fa-tag", link: "/productos" },
      { title: "Pantallas", icon: "fas fa-mobile-alt", link: "/pantallas" },
      {
        title: "Mantenimiento de Tablas",
        icon: "fas fa-tools",
        link: "/mantenimiento-de-tablas",
      },
    ],
  }),
};
</script>
