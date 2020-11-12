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
      { title: "Sectores", link: "/sectores" },
      { title: "Zonas", link: "/zonas" },
      { title: "Regiones", link: "/regiones" },
      { title: "Barrios", link: "/barrios" },
      { title: "Localidades", link: "/localidades" },
      { title: "Provincias", link: "/provincias" },
      { title: "Fabricantes", link: "/fabricantes" },
      { title: "Tipos de Pantalla", link: "/tipos-de-pantalla" },
      { title: "Tipos de Archivo", link: "/tipos-de-archivo" },
      { title: "Tipos de Producto", link: "/tipos-de-producto" },
      { title: "Tipos de Atributo", link: "/tipos-de-atributo" },
      { title: "Atributos", link: "/atributos" },
      { title: "Categorías", link: "/categorias" }
    ]
  })
};
</script>
