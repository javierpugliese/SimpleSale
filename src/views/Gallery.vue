<template>
  <div class="gallery">
    <v-snackbar v-model="snackbar" :color="snackbarColor" top right>
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <v-row>
      <v-col cols="12">
        <v-sheet color="secondary" class="text-h6 text-left pa-5">
          Galería de Archivos
        </v-sheet>
      </v-col>
    </v-row>

    <v-switch v-model="mini">Mini</v-switch>

    <v-row dense>
      <v-col class="d-flex flex-row flex-wrap flex-grow-1">
        <v-img
          v-for="(n, index) in 50"
          :key="index"
          class="ma-3"
          :src="require('@/assets/no-disponible.png')"
          :height="fileHeight"
          :width="fileWidth"
          :max-height="fileHeight"
          :max-width="fileWidth"
        ></v-img>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Gallery",
  components: {},
  data: () => ({
    mini: false,

    loading: false,
    products: [],
    manufacturers: [],
    productTypes: [],
    categories: [],
    attributes: [],
    files: [],

    attributeTypes: [],
    delimiters: [",", ".", "-", "/", " "],
    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedItem: {
      nombre: "",
      sku: "",
      precio: 0.0,
      activo: true,
      etiquetas: [],
      descripcion: "",
      descripcionLarga: "",
      prospecto: "",
      idCategoria: -1,
      idFabricante: -1,
      idTipo: -1,
      atributos: [],
      codigosDeBarra: [],
    },
    editedId: -1,
    defaultItem: {
      nombre: "",
      sku: "",
      precio: 0.0,
      activo: true,
      etiquetas: [],
      descripcion: "",
      descripcionLarga: "",
      prospecto: "",
      idCategoria: -1,
      idFabricante: -1,
      idTipo: -1,
      atributos: [],
      codigosDeBarra: [],
    },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Producto" : "Editar Producto";
    },
    fileWidth() {
      return this.mini ? "108" : "216";
    },
    fileHeight() {
      return this.mini ? "192" : "384";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.products = [];
      this.loading = true;

      const products = this.$http.get("Articulos");
      const manufacturers = this.$http.get("Fabricantes");
      const productTypes = this.$http.get("TiposArticulo");
      const categories = this.$http.get("CategoriasArticulo");

      const promises = [products, manufacturers, productTypes, categories];

      await Promise.all(promises)
        .then((responses) => {
          const productsRes = responses[0];
          const manufacturersRes = responses[1];
          const productTypesRes = responses[2];
          const categoriesRes = responses[3];

          if (productsRes && productsRes.data) this.products = productsRes.data;
          if (manufacturersRes && manufacturersRes.data) {
            this.manufacturers = manufacturersRes.data.map((at) => ({
              text: at.nombre,
              value: at.id,
            }));
          }
          if (productTypesRes && productTypesRes.data) {
            this.productTypes = productTypesRes.data.map((at) => ({
              text: at.nombre,
              value: at.id,
            }));
          }
          if (categoriesRes && categoriesRes.data) {
            this.categories = categoriesRes.data.map((at) => ({
              text: at.nombre,
              value: at.id,
            }));
          }
        })
        .catch((errors) => {
          console.error(errors);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.editedItem.idTipo = item.tipoArticuloDto.id || -1;
      this.editedItem.idFabricante = item.fabricante.id || -1;
      this.editedItem.idCategoria = item.categoria.id || -1;
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.editedItem.idTipo = item.tipoArticuloDto.id || -1;
      this.editedItem.idFabricante = item.fabricante.id || -1;
      this.editedItem.idCategoria = item.categoria.id || -1;
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      await this.$http
        .delete(`Articulos/${this.editedId}`, this.editedItem)
        .then((res) => {
          if (res) {
            this.snackbarText = "Se eliminó el atributo exitosamente.";
            this.snackbarColor = "success";
            this.snackbar = true;
          }
        })
        .catch((err) => {
          if (err) {
            console.log(err);
            this.snackbarText = "¡ERROR! No se pudo eliminar el atributo.";
            this.snackbarColor = "danger";
            this.snackbar = true;
          }
        })
        .finally(() => {
          this.loading = false;
        });
      this.closeDelete();
      this.initialize();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
      });
    },

    async save() {
      this.loading = true;
      if (this.editedIndex > -1 && this.editedId > -1) {
        Object.assign(this.products[this.editedIndex], this.editedItem);
        await this.$http
          .put(`Articulos/${this.editedId}`, this.editedItem)
          .then((res) => {
            if (res) {
              this.snackbarText = "Se actualizó el atributo exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el atributo.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        await this.$http
          .post("Articulos", this.editedItem)
          .then((res) => {
            if (res) {
              this.snackbarText = "Se agregó el atributo exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            console.log(err);
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el atributo.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .then(() => {
            this.loading = false;
          });
      }
      this.close();
      this.initialize();
    },
  },
};
</script>
