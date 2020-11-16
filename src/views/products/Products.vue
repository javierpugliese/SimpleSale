<template>
  <div class="products">
    <v-container>
      <v-snackbar v-model="snackbar" :color="snackbarColor" top right>
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>

      <v-data-table
        :headers="headers"
        :items="products"
        :loading="loading"
        :items-per-page="-1"
        @click:row="editItem"
        loading-text="Cargando..."
        sort-by="nombre"
        class="elevation-1"
      >
        <template v-slot:item.imagen>
          <v-img
            class="my-2"
            :src="require('@/assets/no-disponible.png')"
            max-width="184"
          ></v-img>
        </template>

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Productos</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog
              v-model="dialog"
              fullscreen
              hide-overlay
              transition="dialog-bottom-transition"
              scrollable
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="my-3"
                  v-bind="attrs"
                  v-on="on"
                  large
                >
                  <v-icon class="mr-2">fas fa-plus</v-icon>
                  Nuevo Producto
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-sheet class="pa-5">
                      <v-row>
                        <v-col cols="12" sm="6" md="3">
                          <div class="d-flex justify-center justify-sm-start">
                            <v-switch
                              v-model="editedItem.activo"
                              label="¿Habilitar?"
                            ></v-switch>
                          </div>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model="editedItem.nombre"
                            label="Nombre"
                            counter="50"
                            maxlength="50"
                            outlined
                            clearable
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model="editedItem.sku"
                            label="SKU"
                            counter="50"
                            maxlength="50"
                            outlined
                            clearable
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model="editedItem.precio"
                            label="Precio"
                            prefix="$"
                            value="0.00"
                            outlined
                            clearable
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="4">
                          <v-autocomplete
                            v-model="editedItem.idTipo"
                            :items="productTypes"
                            label="Tipo"
                            maxlength="50"
                            clearable
                            outlined
                            small-chips
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-autocomplete
                            v-model="editedItem.idFabricante"
                            :items="manufacturers"
                            label="Fabricante"
                            maxlength="50"
                            clearable
                            outlined
                            small-chips
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-autocomplete
                            v-model="editedItem.idCategoria"
                            :items="categories"
                            label="Categoría"
                            maxlength="50"
                            clearable
                            outlined
                            small-chips
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="editedItem.descripcion"
                            label="Subtítulo"
                            counter="50"
                            maxlength="50"
                            outlined
                            clearable
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="editedItem.etiquetas"
                            label="Etiquetas"
                            outlined
                            clearable
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-textarea
                            v-model="editedItem.descripcionLarga"
                            label="Descripción"
                            rows="5"
                            outlined
                            clearable
                          ></v-textarea>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-textarea
                            v-model="editedItem.prospecto"
                            label="Prospecto"
                            rows="5"
                            outlined
                            clearable
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="info" text @click="close"> Cancelar </v-btn>
                  <v-btn color="red" text @click="deleteItemConfirm">
                    Eliminar
                  </v-btn>
                  <v-btn color="success" @click="save">
                    <v-icon class="mr-2"> fas fa-save </v-icon>
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline"
                  >¿Está seguro de que quiere eliminar este
                  atributo?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete"
                    >Cancelar</v-btn
                  >
                  <v-btn color="blue darken-1" @click="deleteItemConfirm"
                    >Aceptar</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize"> Recargar </v-btn>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Products",
  components: {},
  data: () => ({
    headers: [
      {
        text: "Vista Previa",
        align: "middle",
        sortable: false,
        value: "imagen",
      },
      {
        text: "Nombre",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      {
        text: "SKU",
        align: "start",
        sortable: true,
        value: "sku",
      },
      {
        text: "Precio",
        align: "start",
        sortable: true,
        value: "precio",
      },
      {
        text: "Fabricante",
        align: "start",
        sortable: true,
        value: "fabricante.nombre",
      },
      {
        text: "Tipo de Producto",
        align: "start",
        sortable: true,
        value: "tipoArticuloDto.nombre",
      },
      {
        text: "Última Modificación",
        align: "start",
        sortable: true,
        value: "modificado",
      },
    ],
    loading: false,
    products: [],
    manufacturers: [],
    productTypes: [],
    categories: [],

    attributeTypes: [],

    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedItem: {
      nombre: "",
      sku: "",
      precio: 0.0,
      activo: true,
      etiquetas: "",
      descripcion: "",
      descripcionLarga: "",
      prospecto: "",
      idCategoria: -1,
      idFabricante: -1,
      idTipo: -1,
    },
    editedId: -1,
    defaultItem: {
      nombre: "",
      sku: "",
      precio: 0.0,
      activo: true,
      etiquetas: "",
      descripcion: "",
      descripcionLarga: "",
      prospecto: "",
      idCategoria: -1,
      idFabricante: -1,
      idTipo: -1,
    },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Producto" : "Editar Producto";
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
        this.editedItem.idTipo = -1;
        this.editedItem.idFabricante = -1;
        this.editedItem.idCategoria = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.editedItem.idTipo = -1;
        this.editedItem.idFabricante = -1;
        this.editedItem.idCategoria = -1;
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
