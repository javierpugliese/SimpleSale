<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <div class="text-h6">Categorías disponibles</div>
      </v-col>
      <v-col cols="6" class="d-flex justify-end">
        <v-dialog
          v-model="dialogSearch"
          width="30%"
          overlay-color="blue"
          overlay-opacity="0.2"
          scrollable
          persistent
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="secondary"
              dark
              class="mx-2"
              v-bind="attrs"
              v-on="on"
              :loading="loading"
            >
              <v-icon class="mr-2">fas fa-search</v-icon>
              Buscar
            </v-btn>
          </template>
          <v-card height="auto">
            <v-card-title>
              <span class="headline">Opciones de búsqueda</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-container>
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      v-model="searchItem.nombre"
                      label="Nombre"
                      maxlength="50"
                      outlined
                      clearable
                      dense
                      single-line
                      :hide-details="true"
                      @click:clear="
                        search = false;
                        initialize();
                      "
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="info" text large @click="dialogSearch = false">
                Cerrar
              </v-btn>
              <v-btn
                color="success"
                large
                @click="
                  search = true;
                  initialize();
                  closeSearch();
                "
                :disabled="
                  loading ||
                  (!searchItem.nombre || searchItem.nombre.length < 4
                    ? true
                    : false)
                "
                :loading="loading"
              >
                Aplicar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <v-row>
      <v-col cols="12">
        <v-treeview
          v-model="selection"
          :items="categories"
          selectable
          selection-type="independent"
          hoverable
          return-object
          open-all
        ></v-treeview>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "CategoryTree",
  data: () => ({
    loading: false,
    search: false,
    selection: [],
    categories: [],
    dialogSearch: false,
    searchItem: {
      nombre: "",
    },
    defaultSearchItem: {
      nombre: "",
    },
  }),
  watch: {
    selection(val) {
      console.log("selection", val);
      this.$emit("onSelected", [...val]);
    },
    categories(val) {
      console.log("categories", val);
    },
    search(val) {
      console.log("search", val);
    },
  },
  computed: {},
  methods: {
    closeSearch() {
      this.dialogSearch = false;
      this.$nextTick(() => {
        this.searchItem = Object.assign({}, this.defaultSearchItem);
      });
    },
    recursion(array, key) {
      if (array.length && typeof key === "string") {
        let r = 0;
        let arr = array.length;
        let tree = [];
        for (r; r < arr; r++) {
          if (array[r][key]) {
            const treeObject = Object.assign(
              {},
              { id: array[r].id, name: array[r].nombre }
            );
            treeObject.children = this.recursion(array[r].subcategorias, key);
            tree.push(treeObject);
          } else continue;
        }
        return tree;
      }
    },
    async initialize() {
      this.loading = true;
      this.selection = [];
      this.categories = [];

      let endpointGetAll = "CategoriasArticulo";
      let endpointSearch = `${endpointGetAll}/nombre/${this.searchItem.nombre}`;

      let endpoint = !this.search ? endpointGetAll : endpointSearch;

      await this.$http
        .get(endpoint)
        .then((res) => {
          if (res && res.data && res.data.length) {
            let filteredData = res.data.filter((c) => c.idCategoriaPadre <= 0);
            console.log("filteredData", filteredData);
            this.categories = this.recursion(filteredData, "subcategorias");
          }
        })
        .catch((err) => {
          console.log("error", err);
        })
        .finally(() => {
          this.loading = false;
          this.search = false;
        });
    },
  },
  mounted: function () {
    this.initialize();
  },
};
</script>

<style scoped>
</style>