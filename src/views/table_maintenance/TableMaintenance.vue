<template>
  <div class="table-maintenance">
    <!-- Make a Component TODO-->
    <v-row dense>
      <v-col v-for="(item, i) in items" :key="i" cols="auto">
        <v-card class="px-5 py-3" color="blue-grey darken-4" dark>
          <div class="d-flex flex-sm-column">
            <v-card-actions>
              <v-btn large text :to="item.link">
                {{ item.title }}
              </v-btn>
            </v-card-actions>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "TableMaintenance",
  components: {},

  data: () => ({
    items: [
      { title: "Sectores", link: "/mantenimiento-de-tablas/sectores" },
      { title: "Zonas", link: "/mantenimiento-de-tablas/zonas" },
      { title: "Regiones", link: "/mantenimiento-de-tablas/regiones" },
      { title: "Barrios", link: "/mantenimiento-de-tablas/barrios" },
      { title: "Localidades", link: "/mantenimiento-de-tablas/localidades" },
      { title: "Provincias", link: "/mantenimiento-de-tablas/provincias" },
      { title: "Fabricantes", link: "/mantenimiento-de-tablas/fabricantes" },
      {
        title: "Tipos de Pantalla",
        link: "/mantenimiento-de-tablas/tipos-de-pantalla"
      },
      {
        title: "Tipos de Archivo",
        link: "/mantenimiento-de-tablas/tipos-de-archivo"
      },
      {
        title: "Tipos de Producto",
        link: "/mantenimiento-de-tablas/tipos-de-producto"
      },
      {
        title: "Tipos de Atributo",
        link: "/mantenimiento-de-tablas/tipos-de-atributo"
      },
      { title: "Atributos", link: "/mantenimiento-de-tablas/atributos" },
      { title: "Categorías", link: "/mantenimiento-de-tablas/categorias" }
    ]
  })
};
</script>
