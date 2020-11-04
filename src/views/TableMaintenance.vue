<template>
  <div class="table-maintenance">
    <!-- Make a Component TODO-->
    <v-row dense>
      <v-col v-for="(item, i) in items" :key="i" cols="auto">
        <v-card :color="item.color" dark>
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="headline" v-text="item.title"></v-card-title>
              <v-card-actions>
                <v-btn class="ml-2 mt-5" outlined rounded small>
                  Navegar
                </v-btn>
              </v-card-actions>
            </div>

            <!-- Quitar -->

            <v-avatar class="ma-3" size="125" tile>
              <v-img :src="item.src"></v-img>
            </v-avatar>
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
      { title: "Pantallas", link: "/fabricantes" },
      { title: "Tipos de Pantalla", link: "/tipos-de-pantalla" },
      { title: "Tipos de Archivo", link: "/tipos-de-archivo" },
      { title: "Tipos de Producto", link: "/tipos-de-producto" },
      { title: "Tipos de Atributo", link: "/tipos-de-atributo" },
      { title: "Atributos", link: "/atributos" },
      { title: "Categorías de Producto", link: "/categorias-de-producto" }
    ]
  })
};
</script>
