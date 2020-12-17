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
        @click:row="editItem"
        loading-text="Cargando..."
        sort-by="nombre"
        class="elevation-1"
        :disable-pagination="true"
        :hide-default-footer="true"
      >
        <template v-slot:item.imagen>
          <v-img
            class="my-2"
            :src="require('@/assets/no-disponible.jpg')"
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
                    <v-sheet class="pa-5" color="blue-grey darken-4">
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
                            :disabled="editedId > -1"
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
                            v-model="editedItem.categorias"
                            :items="categories"
                            label="Categorías"
                            maxlength="50"
                            multiple
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
                          <v-autocomplete
                            v-model="editedItem.atributos"
                            :items="attributes"
                            label="Atributos"
                            maxlength="50"
                            multiple
                            clearable
                            outlined
                            small-chips
                          >
                          </v-autocomplete>
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
                      <v-row>
                        <v-col cols="12">
                          <v-combobox
                            v-model="editedItem.etiquetas"
                            :delimiters="delimiters"
                            label="Etiquetas"
                            prepend-icon="fas fa-tags"
                            chips
                            small-chips
                            deletable-chips
                            clearable
                            outlined
                            multiple
                            append-icon=""
                          >
                          </v-combobox>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-combobox
                            v-model="editedItem.codigosDeBarra"
                            label="Códigos de Barra"
                            :delimiters="delimiters"
                            prepend-icon="fas fa-barcode"
                            chips
                            small-chips
                            deletable-chips
                            clearable
                            outlined
                            multiple
                            append-icon=""
                          >
                          </v-combobox>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-file-input
                            v-model="files"
                            counter
                            label="Archivos (imagenes o videos)"
                            accept=".jpg, .mp4"
                            multiple
                            placeholder="Seleccione archivos..."
                            prepend-icon="fas fa-paperclip"
                            outlined
                            :show-size="1000"
                          >
                            <template v-slot:selection="{ index, text }">
                              <v-chip
                                v-if="index < 2"
                                color="info"
                                dark
                                label
                                small
                              >
                                {{ text }}
                              </v-chip>

                              <span
                                v-else-if="index === 2"
                                class="overline grey--text text--darken-3 mx-2"
                              >
                                +{{ files.length - 2 }} Archivo(s)
                              </span>
                            </template>
                          </v-file-input>

                          <!-- <v-row v-else dense>
                            <v-col
                              v-for="card in cards"
                              :key="card.title"
                              :cols="card.flex"
                            >
                            <v-col cols="4">
                              <v-card>
                                <v-img
                                  :src="require('@/assets/no-disponible.jpg')"
                                  alt=" "
                                  :contain="true"
                                  class="white--text align-end"
                                  gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                                  max-height="240"
                                  max-width="240"
                                >
                                </v-img>

                                <v-card-actions>
                                  <v-spacer></v-spacer>

                                  <v-btn icon>
                                    <v-icon color="success"
                                      >fas fa-upload</v-icon
                                    >
                                  </v-btn>

                                  <v-btn icon>
                                    <v-icon color="red"
                                      >fas fa-trash-alt</v-icon
                                    >
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-col>
                          </v-row> -->
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="info" text @click="close"> Cancelar </v-btn>
                  <v-btn
                    color="red"
                    v-if="editedIndex > -1 && editedId > -1"
                    text
                    @click="deleteItemConfirm"
                  >
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
                  producto?</v-card-title
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
        <template v-slot:footer>
          <v-row
            class="pa-2"
            no-gutters
            dense
            style="border-top: 1px solid #343434"
          >
            <v-col cols="12" sm="4" class="d-flex justify-start align-center">
              <v-select
                v-model="itemsPerPage"
                :items="itemsPerPageItems"
                filled
                outlined
                label="Filas por página"
                :hide-details="true"
                :loading="loading"
                :disabled="loading"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4" class="d-flex justify-center align-center">
              <v-pagination
                v-model="page"
                :length="pages"
                :total-visible="7"
                @input="goToPage"
                elevation="3"
                color="#343434"
              ></v-pagination>
            </v-col>
            <v-col cols="12" sm="4" class="d-flex justify-end align-center">
              <p v-show="!loading" class="text-overline text-dark my-auto">
                Mostrando {{ itemsPerPage }} de {{ totalRecords }} resultados.
              </p>
            </v-col>
          </v-row>
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
    loading: false,
    page: 1,
    pages: 1,
    itemsPerPage: 5,
    totalRecords: 0,
    search: "",
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
        value: "tipoArticulo.nombre",
      },
      {
        text: "Última Modificación",
        align: "start",
        sortable: true,
        value: "modificado",
      },
    ],
    products: [],
    manufacturers: [],
    productTypes: [],
    categories: [],
    attributes: [],
    files: [],
    itemsPerPageItems: [
      { text: "5 filas", value: 5 },
      { text: "10 filas", value: 10 },
      { text: "15 filas", value: 15 },
      { text: "30 filas", value: 30 },
      { text: "50 filas", value: 50 },
      { text: "100 filas", value: 100 },
    ],
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
      categorias: [],
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
      categorias: [],
      idFabricante: -1,
      idTipo: -1,
      atributos: [],
      codigosDeBarra: [],
    },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
  }),

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    itemsPerPage() {
      this.initialize();
    },
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Producto" : "Editar Producto";
    },
  },

  methods: {
    goToPage(value) {
      this.page = value;
      this.initialize();
    },
    previousPage() {
      this.page--;
      this.initialize();
    },
    nextPage() {
      this.page++;
      this.initialize();
    },
    async initialize() {
      this.loading = true;
      this.products = [];

      const products = this.$http.get("Articulos", {
        params: { pageNumber: this.page, pageSize: this.itemsPerPage },
      });
      const manufacturers = this.$http.get("Fabricantes");
      const productTypes = this.$http.get("TiposArticulo");
      const categories = this.$http.get("CategoriasArticulo");
      const attributeTypes = this.$http.get("TiposDeAtributo");

      const promises = [
        products,
        manufacturers,
        productTypes,
        categories,
        attributeTypes,
      ];

      await this.$http
        .all(promises)
        .then(
          this.$http.spread((...responses) => {
            const productsRes = responses[0];
            const manufacturersRes = responses[1];
            const productTypesRes = responses[2];
            const categoriesRes = responses[3];
            const attrTypesRes = responses[4];

            if (productsRes && productsRes.data.list) {
              this.products = productsRes.data.list;
              this.pages = productsRes.data.totalPages;
              this.totalRecords = productsRes.data.totalRecords;
            }
            if (manufacturersRes && manufacturersRes.data) {
              this.manufacturers = manufacturersRes.data.map((m) => ({
                text: m.nombre,
                value: m.id,
              }));
            }
            if (productTypesRes && productTypesRes.data) {
              this.productTypes = productTypesRes.data.map((pt) => ({
                text: pt.nombre,
                value: pt.id,
              }));
            }
            if (categoriesRes && categoriesRes.data) {
              this.categories = categoriesRes.data.map((c) => ({
                text: c.nombre,
                value: c.id,
              }));
            }
            if (attrTypesRes && attrTypesRes.data) {
              let list = attrTypesRes.data;
              let attributes = [];

              for (let at of list) {
                if (at.atributos && at.atributos.length > 0) {
                  attributes.push(
                    Object.assign({}, { header: at.nombre.toUpperCase() })
                  );
                  attributes.push(Object.assign({}, { divider: true }));
                  for (let a of at.atributos) {
                    attributes.push(
                      Object.assign(
                        {},
                        {
                          text: a.nombre,
                          value: a.id,
                        }
                      )
                    );
                  }
                }
              }
              this.attributes = attributes;
            }
          })
        )
        .catch((errors) => {
          console.log(errors);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.editedItem.idTipo = item.tipoArticulo.id || -1;
      this.editedItem.idFabricante = item.fabricante.id || -1;
      this.editedItem.categorias = item.categorias.map((c) => c.id) || [];
      this.editedItem.atributos = item.atributos.map((a) => a.id) || [];
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.editedItem.idTipo = item.tipoArticulo.id || -1;
      this.editedItem.idFabricante = item.fabricante.id || -1;
      this.editedItem.categorias = item.categorias.map((c) => c.id) || [];
      this.editedItem.atributos = item.atributos.map((a) => a.id) || [];
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
  mounted: function () {
    this.initialize();
  },
};
</script>
<style scoped>
td:hover {
  cursor: pointer !important;
}
</style>