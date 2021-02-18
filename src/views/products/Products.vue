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

      <v-scale-transition>
        <v-snackbar
          v-model="uploading"
          color="#333333"
          :timeout="-1"
          :multi-line="true"
          top
          right
        >
          <p class="text-button text-center">Subiendo archivo(s)...</p>
          <v-progress-linear
            v-model="fileTotalProgress"
            height="50"
            color="#55AA99"
          >
            <div class="d-flex flex-column justify-center my-3">
              <strong class="text-overline">{{ fileName }}</strong>
              <strong class="text-center"
                >{{ Math.ceil(fileTotalProgress) }}%</strong
              >
            </div>
          </v-progress-linear>
        </v-snackbar>
      </v-scale-transition>

      <v-data-table
        :headers="headers"
        :items="products"
        :loading="loading"
        @click:row="editItem"
        loading-text="Cargando..."
        sort-by="nombre"
        class="elevation-1 table-cursor"
        :disable-pagination="true"
        :hide-default-footer="true"
      >
        <template v-slot:item.imagen="{ item }">
          <v-img
            :lazy-src="require('@/assets/no-disponible.jpg')"
            class="__background-small my-2"
            :src="
              getProductImage(item) || require('@/assets/no-disponible.jpg')
            "
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="info"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </template>

        <template v-slot:item.modificado="{ item }">
          {{ parseDate(item) }}
        </template>

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Productos</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog
              v-model="dialogSearch"
              width="60%"
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
                  large
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

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model="searchItem.nombre"
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
                          v-model="searchItem.sku"
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
                          v-model="searchItem.ean"
                          label="Código EAN"
                          counter="13"
                          maxlength="13"
                          outlined
                          clearable
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="4">
                        <v-autocomplete
                          v-model="searchItem.idTipoArticulo"
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
                          v-model="searchItem.idFabricante"
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
                          v-model="searchItem.idCategoria"
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
                      <v-col cols="12" sm="4">
                        <v-autocomplete
                          v-model="searchItem.atributos"
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
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="info" text large @click="dialogSearch = false">
                    Cerrar
                  </v-btn>
                  <v-btn
                    color="success"
                    large
                    @click="dialogSearch = false"
                    :disabled="loading"
                  >
                    Aplicar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!-- Modal form product -->
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
                  class="mx-2"
                  v-bind="attrs"
                  v-on="on"
                  large
                  :loading="loading"
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
                              label="¿Habilitar producto?"
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
                            v-model.number="editedItem.precio"
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
                            v-model="editedItem.tipoArticulo"
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
                        <v-col cols="12" class="d-flex flex-column">
                          <v-alert class="mt-n6" dense type="warning">
                            Subida de Archivos: Imagenes en formato JPG,
                            dimensiones máximas 1000x1000. Videos en formato
                            MP4, máximo 50MB.
                          </v-alert>
                          <v-file-input
                            v-model="files"
                            counter
                            label="Subir archivos"
                            accept=".jpg, .mp4"
                            multiple
                            placeholder="Seleccione archivos..."
                            prepend-icon="fas fa-paperclip"
                            outlined
                            :show-size="1000"
                            @change="onFileUpload($event)"
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
                                class="overline grey--text text--ligthen-3 mx-2"
                              >
                                +{{ files.length - 2 }} Archivo(s)
                              </span>
                            </template>
                          </v-file-input>
                          <p
                            v-if="files.length"
                            class="text-overline warning--text"
                          >
                            Archivos que se subirán
                          </p>

                          <div
                            class="d-flex flex-wrap justify-start"
                            style="align-items: flex-start"
                          >
                            <v-img
                              v-for="(i, index) in filesURLs"
                              :key="`fileURL-${index}`"
                              :src="i || require('@/assets/no-disponible.jpg')"
                              alt=" "
                              :contain="true"
                              class="__background-small white--text ma-2"
                              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                            >
                              <v-btn
                                icon
                                large
                                style="position: absolute; top: 0; right: 0"
                                @click="removeFile(index)"
                              >
                                <v-icon color="red"> fas fa-times </v-icon>
                              </v-btn>
                            </v-img>
                          </div>
                          <p
                            v-if="
                              (editedId > -1 || editedIndex > -1) &&
                              editedItem.archivos &&
                              editedItem.archivos.length
                            "
                            class="text-overline warning--text"
                          >
                            Archivos del producto
                          </p>
                          <v-alert
                            v-else-if="editedId > -1 || editedIndex > -1"
                            dense
                            type="info"
                          >
                            El producto no tiene archivos.
                          </v-alert>
                          <div
                            class="d-flex flex-wrap justify-start"
                            style="align-items: flex-start"
                          >
                            <v-img
                              v-for="(i, index) in editedItem.archivos"
                              :key="`productFile-${index}`"
                              :lazy-src="require('@/assets/no-disponible.jpg')"
                              :src="
                                i.url || require('@/assets/no-disponible.jpg')
                              "
                              alt=" "
                              :contain="true"
                              class="__background-small white--text ma-2"
                              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                            >
                              <v-btn
                                icon
                                large
                                style="position: absolute; top: 0; right: 0"
                                @click="removeFileFromProduct(index)"
                              >
                                <v-icon color="red"> fas fa-times </v-icon>
                              </v-btn>
                              <template v-slot:placeholder>
                                <v-row
                                  class="fill-height ma-0"
                                  align="center"
                                  justify="center"
                                >
                                  <v-progress-circular
                                    indeterminate
                                    color="info"
                                  ></v-progress-circular>
                                </v-row>
                              </template>
                            </v-img>
                          </div>
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
                    @click="dialogDelete = true"
                  >
                    Eliminar
                  </v-btn>
                  <v-btn color="success" @click="save" :disabled="loading">
                    <v-icon class="mr-2"> fas fa-save </v-icon>
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">
                  ¿Eliminar este producto?
                </v-card-title>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" @click="deleteItemConfirm">
                    Aceptar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:no-data>
          No hay productos disponibles
          <v-btn class="ml-3" color="primary" @click="initialize">
            Recargar
          </v-btn>
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
                label="Productos por página"
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
              <p
                v-show="!loading && products.length"
                class="text-overline text-dark my-auto pr-3"
              >
                {{
                  itemsPerPage > totalRecords
                    ? `Mostrando ${totalRecords} resultados.`
                    : `Mostrando ${itemsPerPage} de ${totalRecords} resultados.`
                }}
              </p>
            </v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
import moment from "moment";
// @ is an alias to /src
export default {
  name: "Products",
  components: {},
  data: () => ({
    loading: false,
    uploading: false,
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
    filesURLs: [],
    itemsPerPageItems: [
      { text: "5 productos", value: 5 },
      { text: "10 productos", value: 10 },
      { text: "25 productos", value: 25 },
      { text: "50 productos", value: 50 },
      { text: "100 productos", value: 100 },
    ],
    attributeTypes: [],
    delimiters: [",", ".", "-", "/", " "],
    dialog: false,
    dialogDelete: false,
    dialogSearch: false,
    editedIndex: -1,
    editedId: -1,
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
      tipoArticulo: -1,
      atributos: [],
      codigosDeBarra: [],
      archivos: [],
    },
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
      tipoArticulo: -1,
      atributos: [],
      codigosDeBarra: [],
      archivos: [],
    },
    searchItem: {
      nombre: "",
      sku: "",
      ean: "",
      idFabricante: -1,
      idCategoria: -1,
      idTipoArticulo: -1,
      atributos: [],
    },
    searchItemDefault: {
      nombre: "",
      sku: "",
      ean: "",
      idFabricante: -1,
      idCategoria: -1,
      idTipoArticulo: -1,
      atributos: [],
    },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    fileTotalProgress: 0,
    fileName: "",
    fileType: -1,
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
    fileTotalProgress(val) {
      if (val >= 100) {
        this.fileName = "";
        val = 0;
      }
    },
    editedIndex(val) {
      console.log("editedIndex", val);
    },
    editedId(val) {
      console.log("editedIndex", val);
    },
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Producto" : "Editar Producto";
    },
  },

  methods: {
    /** Removes duplicate keys in array */
    removeArrDuplicates(array) {
      return [...new Set(array)];
    },
    /* Parse Date to readable locale 'es' format*/
    parseDate(item) {
      if (item.modificado) return moment(item.modificado).format("LLL");
      else return "Sin modificaciones.";
    },
    /* Return file from product. Displays in datatable */
    getProductImage(item) {
      if (item.archivos && item.archivos.length > 0)
        return item.archivos[0].url;
      else return false;
    },
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
    /* Validations when uploading files */
    async onFileUpload(files) {
      this.filesURLs = [];
      let i = 0;
      let arr = files.length;
      if (arr < 10) {
        for (i; i < arr; i++) {
          let url = URL.createObjectURL(files[i]);
          this.filesURLs.push(url);
        }
      } else {
        this.files = [];
        alert("Máximo de 10 archivos");
      }
    },
    /* Remove file from input file */
    removeFile(pos) {
      this.files.splice(pos, 1);
      this.filesURLs.splice(pos, 1);
    },
    /* Request api to delete a file */
    async removeFileFromProduct(pos) {
      try {
        let file = this.editedItem.archivos[pos];
        let productId = file.id;
        let ep = `Archivos/${productId}`;
        let req = this.$http.delete(ep);
        await req;
        this.editedItem.archivos.splice(pos, 1);
        this.snackbarText = "Se eliminó el archivo del producto.";
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (error) {
        this.snackbarText =
          "Ocurrió un error al eliminar el archivo del producto.";
        this.snackbarColor = "danger";
        this.snackbar = true;
      }
    },
    /* Init */
    async initialize() {
      this.loading = true;
      this.products = [];
      this.manufacturers = [];
      this.categories = [];
      this.attributeTypes = [];

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
      if (item.tipoArticulo) {
        this.editedItem.tipoArticulo = item.tipoArticulo.id;
      } else this.editedItem.tipoArticulo = -1;
      if (item.fabricante) {
        this.editedItem.idFabricante = item.fabricante.id;
      } else this.editedItem.idFabricante = -1;

      // removeArrDuplicates prevents key duplicates in component render
      if (item.categorias && item.categorias.length) {
        this.editedItem.categorias = this.removeArrDuplicates(
          item.categorias.map((c) => c.id)
        );
      } else this.editedItem.categorias = [];
      if (item.atributos && item.atributos.length) {
        this.editedItem.atributos = this.removeArrDuplicates(
          item.atributos.map((a) => a.id)
        );
      } else this.editedItem.atributos = [];
      if (item.codigosDeBarra && item.codigosDeBarra.length) {
        this.editedItem.codigosDeBarra = this.removeArrDuplicates(
          item.codigosDeBarra.map((b) => b.ean)
        );
      } else this.editedItem.codigosDeBarra = [];
      this.dialog = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      this.dialog = false;
      this.dialogDelete = false;
      await this.$http
        .delete(`Articulos/${this.editedId}`)
        .then((res) => {
          if (res) {
            this.snackbarText = "Se eliminó el producto exitosamente.";
            this.snackbarColor = "success";
            this.snackbar = true;
          }
        })
        .catch((err) => {
          if (err) {
            console.log(err);
            this.snackbarText = "¡ERROR! No se pudo eliminar el producto.";
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
    /* Close main dialog */
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.files = [];
        this.filesURLs = [];
      });
    },

    /* Close delete dialog */
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.files = [];
        this.filesURLs = [];
      });
    },

    /* Request api to insert or update*/
    async save() {
      let productId;
      if (this.editedIndex > -1 && this.editedId > -1) {
        //Object.assign(this.products[this.editedIndex], this.editedItem);
        this.loading = true;
        await this.$http
          .put(
            `Articulos/${this.editedId}`,
            Object.assign(
              {},
              {
                nombre: this.editedItem.nombre,
                sku: this.editedItem.sku,
                precio: this.editedItem.precio,
                activo: this.editedItem.activo,
                etiquetas: this.editedItem.etiquetas,
                descripcion: this.editedItem.descripcion,
                descripcionLarga: this.editedItem.descripcionLarga,
                prospecto: this.editedItem.prospecto,
                categorias: this.editedItem.categorias,
                atributos: this.editedItem.atributos,
                idFabricante: this.editedItem.idFabricante,
                idTipo: this.editedItem.tipoArticulo,
              }
            )
          )
          .then((res) => {
            if (res) {
              this.snackbarText = "Se actualizó el producto exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el producto.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.loading = true;
        await this.$http
          .post(
            "Articulos",
            Object.assign(
              {},
              {
                nombre: this.editedItem.nombre,
                sku: this.editedItem.sku,
                precio: this.editedItem.precio,
                activo: this.editedItem.activo,
                etiquetas: this.editedItem.etiquetas,
                descripcion: this.editedItem.descripcion,
                descripcionLarga: this.editedItem.descripcionLarga,
                prospecto: this.editedItem.prospecto,
                categorias: this.editedItem.categorias,
                atributos: this.editedItem.atributos,
                codigosDeBarra: this.editedItem.codigosDeBarra,
                idFabricante: this.editedItem.idFabricante,
                idTipo: this.editedItem.tipoArticulo,
              }
            )
          )
          .then((res) => {
            if (res) {
              this.snackbarText = "Se agregó el producto exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;

              productId = res.data.idObjeto;
            }
          })
          .catch((err) => {
            console.log(err);
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el producto.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .finally(() => (this.loading = false));
      }
      if (productId > 0 || this.editedIndex > -1) {
        const fileType = await this.$http.get("TipoArchivos/nombre/Producto");
        if (fileType && fileType.data) {
          this.fileType = fileType.data[0].id;
        }
        if (this.fileType > 0) {
          let fd;
          let i = 0;
          let arr = this.files.length;
          for (i; i < arr; i++) {
            fd = new FormData();
            console.log("asd", productId, this.editedId);
            if (productId > 0 && this.editedIndex < 0) {
              fd.set("idArticulo", productId);
            } else if (this.editedIndex > -1) {
              fd.set("idArticulo", this.editedId);
            }

            fd.set("idTipo", this.fileType);
            fd.set("Small", false);
            fd.set("Medium", false);
            fd.set("Large", false);
            fd.set("file", this.files[i]);
            let filename = this.files[i].name;
            this.uploading = true;
            this.loading = true;
            await this.$http
              .post("Archivos/Articulos", fd, {
                onUploadProgress: (progressEvent) => {
                  this.fileName = filename;
                  this.fileTotalProgress = parseInt(
                    Math.ceil(
                      (progressEvent.loaded / progressEvent.total) * 100
                    )
                  );
                },
              })
              .finally(() => {
                this.uploading = false;
                this.loading = false;
              });
          }
        }
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
.__background-small {
  position: relative;
  max-height: 20vh;
  max-width: 20vh;
  min-height: 20vh;
  min-width: 20vh;
}
</style>