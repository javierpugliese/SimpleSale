<template>
  <div class="planogram-editor">
    <!-- Toolbar -->
    <v-toolbar color="grey-darken-1" dark>
      <v-scale-transition>
        <v-app-bar-nav-icon>
          <v-icon>fas fa-mobile-alt</v-icon>
        </v-app-bar-nav-icon>
      </v-scale-transition>
      <v-scroll-y-transition>
        <v-toolbar-title> Editor de Planogramas </v-toolbar-title>
      </v-scroll-y-transition>
      <v-spacer></v-spacer>
      <v-scale-transition>
        <v-btn
          v-if="!searchMode"
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#55AA99'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          :disabled="loading"
          to="/pantallas/planogramas"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-th-list
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Ver lista" : "" }}
        </v-btn>
      </v-scale-transition>
    </v-toolbar>

    <!-- Snackbar http status messages -->
    <v-scale-transition>
      <v-snackbar v-model="snackbar" :color="snackbarColor" top right>
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>
    </v-scale-transition>

    <!-- Planogram management -->
    <v-row v-bind:style="{ position: `sticky`, top: `80px` }">
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :close-on-click="true"
        :position-x="menu_x"
        :position-y="menu_y"
      >
        <v-list v-if="shelves.length">
          <v-list-item disabled>
            <v-list-item-content>
              <v-list-item-title>Enviar a:</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            v-for="(s, index) in shelves"
            :key="`AvailableShelf-${index}`"
          >
            <v-list-item-content>
              <v-list-item-title>Estante {{ index }}</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn @click="sendToShelf(index)" icon>
                <v-icon>fas fa-arrow-alt-circle-right</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert
          v-else
          type="warning"
          color="#FFA440"
          icon="fas fa-exclamation-triangle"
        >
          No se encontraron estantes.
        </v-alert>
      </v-menu>

      <!-- Product details -->
      <!-- <v-col cols="12" md="2">
        <v-row class="d-flex flex-column" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Detalles del producto
            </v-sheet>
          </v-col>
          <v-col cols="12" class="d-flex flex-column">
            <v-list subheader three-line>
              <v-subheader>SKU {{ product.sku }}</v-subheader>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Nombre</v-list-item-title>
                  <v-list-item-subtitle class="text-overline">
                    {{ product.nombre }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Precio</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ product.precio ? `$${product.precio}` : `No asignado.` }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Descripción</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ product.descripcion }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Categorías</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      v-for="(c, index) in product.categorias"
                      :key="`category${c.id}-${index}`"
                      label
                      class="ma-1"
                      v-text="c.nombre.toUpperCase()"
                    >
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-col> -->

      <!-- Product files list -->
      <!-- <v-col cols="12" md="2">
        <v-row class="d-flex flex-column" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Archivos del producto
            </v-sheet>
          </v-col>
          <div
            class="mx-auto"
            :style="{
              'overflow-y': `scroll`,
              height: `${getPlanogramHeight}px`,
              width: 'calc(100% - 8px)',
              border: 'solid 1px #fff',
            }"
          >
            <v-col
              v-for="(pf, index) in product.archivos"
              :key="`productFile-${index}`"
              cols="12"
              class="d-flex flex-column"
            >
              <v-card color="333333" @click="showMenu($event, pf, index)">
                <v-img
                  :lazy-src="require('@/assets/no-disponible.jpg')"
                  :src="pf.url || require('@/assets/no-disponible.jpg')"
                  alt=" "
                  :contain="true"
                  class="__background-small white--text mx-auto"
                >
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
              </v-card>
            </v-col>
          </div>
        </v-row>
      </v-col> -->

      <v-col cols="12" sm="4">
        <v-row dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Plantillas y productos
            </v-sheet>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <ProductListInfiniteScroll @itemSelected="handleProduct" />
          </v-col>
        </v-row>
        <!-- <v-row dense>
          <v-col cols="12">
            <v-autocomplete
              :items="[]"
              label="Plantilla"
              maxlength="50"
              clearable
              outlined
              small-chips
              dense
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="searchProduct.nombre"
              label="Nombre"
              counter="50"
              maxlength="50"
              outlined
              clearable
              required
              dense
              @input="searchProducts"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <div style="height: 55vh; border: 1px solid white">
              <v-sheet
                color="#000"
                class="text-h6 text-center pa-3 fill-height"
              >
                <v-card
                  v-for="(product, index) in products"
                  :key="`product-${index}-${product.id}`"
                  height="48"
                >
                  <v-card-title v-text="product.nombre"></v-card-title>
                  <v-card-subtitle v-text="product.sku"></v-card-subtitle>
                  <v-card-text>
                    <v-container>
                      <div class="d-flex flex-column">
                        <div
                          v-for="(file, index) in product.archivos"
                          :key="`pFile-${index}-${file.id}`"
                        >
                          <v-img
                            v-if="file.url"
                            :src="
                              file.url || require('@/assets/no-disponible.jpg')
                            "
                          >
                          </v-img>
                        </div>
                      </div>
                    </v-container>
                  </v-card-text>
                  <v-card-actions></v-card-actions>
                </v-card>
              </v-sheet>
            </div>
          </v-col>
        </v-row> -->
      </v-col>

      <!-- Planogram preview -->
      <v-col cols="12" sm="3">
        <v-row class="d-flex flex-column" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Planograma
            </v-sheet>
          </v-col>
          <v-col cols="12" class="d-flex justify-center">
            <!-- Planogram -->
            <vdr
              :w="getPlanogramWidth"
              :h="getPlanogramHeight"
              :parent="false"
              :debug="false"
              :min-width="getPlanogramWidth"
              :min-height="getPlanogramHeight"
              :isConflictCheck="false"
              :snap="false"
              :draggable="false"
              :resizable="false"
              :z="100"
              :handles="[]"
              id="__PLANOGRAM_VDR"
            >
              <img
                v-if="planogramSrc && planogramSrc.match(/.(jpg|jpeg)$/i)"
                :src="planogramSrc"
                alt=" "
                class="planogram__background ma-0 pa-0"
              />
              <!-- <object
                v-else-if="planogramSrc.match(/.(mp4)$/i)"
                :data="planogramSrc"
                class="planogram__background ma-0 pa-0"
              >
                <param name="wmode" value="transparent" />
              </object> -->
              <video
                v-else-if="planogramSrc.match(/.(mp4)$/i)"
                class="planogram__background ma-0 pa-0"
              >
                <source :src="planogramSrc" type="video/mp4" />
                Su navegador no soporta la etiqueta de video HTML5.
              </video>
              <!-- shelves  -->
              <vdr
                v-for="(shelf, index) in shelves"
                v-bind:key="`shelf-${index}`"
                :id="`vdr_shelf-${index}`"
                :w="getPlanogramWidth"
                :h="+shelf.max_height"
                :resizable="false"
                :draggable="shelf_active"
                :lock-aspect-ratio="false"
                :grid="[1, 1]"
                :parent="true"
                :active="shelf_active"
                :handles="['tm', 'mr']"
                class-name-dragging="shelf__dragging"
                :debug="false"
                :isConflictCheck="true"
                :z="101"
                :snap="true"
                :snap-tolerance="4"
                @dragging="
                  (left, top) => getProportionalHeight(index, shelf, left, top)
                "
                @created="
                  (left, top) => getProportionalHeight(index, shelf, left, top)
                "
                v-inserted
              >
                <vdr
                  v-for="(product, pos) in shelf.storedProducts"
                  v-bind:key="`product-${pos}`"
                  :w="product.size.w"
                  :h="product.size.h"
                  :min-width="10"
                  :min-height="10"
                  :resizable="true"
                  :draggable="true"
                  :lock-aspect-ratio="true"
                  :grid="[1, 1]"
                  :parent="true"
                  @activated="shelf_active = false"
                  @deactivated="shelf_active = true"
                  class-name-dragging="shelf__dragging"
                  :isConflictCheck="true"
                  :debug="false"
                  :z="102"
                  :snap="true"
                  :snap-tolerance="2"
                  :handles="['tl', 'tr', 'bl', 'br']"
                >
                  <div
                    class="d-flex justify-content-center ma-0"
                    :style="{ height: `100%`, 'max-width': `100%` }"
                  >
                    <img
                      class="shelf_img"
                      v-bind:src="
                        product.url || require('@/assets/no-disponible.jpg')
                      "
                    />
                  </div>
                </vdr>
                <!-- Shelf base -->
                <div
                  class="d-flex ma-0"
                  :style="{ height: `${shelf.max_height}px` }"
                >
                  <v-sheet
                    class="align-self-end"
                    :width="getPlanogramWidth"
                    :height="defaultShelfHeight"
                    :color="getRGBA(shelf.color)"
                  >
                    <div
                      style="
                        position: absolute;
                        bottom: 0;
                        left: 102%;
                        border: 1px solid yellow;
                        width: 30px;
                      "
                    >
                      <v-btn
                        color="red"
                        @click="removeShelf(index)"
                        small
                        text
                        icon
                      >
                        <v-icon>fas fa-trash-alt</v-icon>
                      </v-btn>
                    </div>
                    <div
                      style="
                        position: absolute;
                        bottom: 0;
                        right: 102%;
                        border: 1px solid yellow;
                        width: 30px;
                      "
                      class="text-overline text-center"
                    >
                      <div class="text-overline">{{ index }}</div>
                    </div>
                  </v-sheet>
                </div>
              </vdr>
            </vdr>
          </v-col>
        </v-row>
      </v-col>

      <!-- Planogram settings -->
      <v-col cols="12" md="5">
        <v-row class="d-flex flex-column" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Configuración del planograma
            </v-sheet>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editedItem.nombre"
              label="Nombre"
              maxlength="50"
              outlined
              clearable
              dense
              single-line
              :hide-details="true"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-show="false">
            <v-text-field
              v-model="editedItem.titulo"
              label="Título"
              maxlength="50"
              outlined
              clearable
              dense
              single-line
              :hide-details="true"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-row>
              <v-col cols="12" sm="4">
                <v-color-picker
                  v-model="shelf_item.baseColor"
                  label="Color de la base"
                  dot-size="25"
                  hide-mode-switch
                  mode="rgba"
                ></v-color-picker>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="shelf_item.maxHeight"
                  label="Altura máxima del estante"
                  outlined
                  clearable
                  required
                  :disabled="false"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn
                  @click="addShelf"
                  :disabled="loading"
                  :loading="loading"
                  color="#55AA99"
                >
                  Agregar estante
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="7">
                <v-file-input
                  v-model="file"
                  counter
                  label="Archivo de fondo"
                  accept=".jpg, .mp4"
                  placeholder="Seleccione un archivo..."
                  prepend-icon=""
                  outlined
                  :show-size="1000"
                  @change="onFileUpload"
                >
                  <template v-slot:selection="{ index, text }">
                    <v-chip v-if="index < 2" color="info" dark label small>
                      {{ text }}
                    </v-chip>
                  </template>
                </v-file-input>
              </v-col>
              <v-col cols="1">
                <p class="text-h5 text-center">ó</p>
              </v-col>
              <v-col cols="4">
                <v-dialog
                  v-model="dialogGallery"
                  width="85%"
                  overlay-color="blue"
                  overlay-opacity="0.2"
                  scrollable
                  persistent
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="success"
                      dark
                      class="mx-2"
                      v-bind="attrs"
                      v-on="on"
                      :disabled="loading"
                      :loading="loading"
                    >
                      <v-icon class="pr-2">fas fa-hand-pointer</v-icon>
                      Elegir fondo
                    </v-btn>
                  </template>

                  <v-card height="auto">
                    <v-card-title>Elegir un fondo</v-card-title>
                    <v-card-text>
                      <Gallery
                        :paginationFixed="false"
                        @selected="getBackground"
                      >
                      </Gallery>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="info"
                        text
                        @click="
                          dialogGallery = false;
                          backgroundId = -1;
                          backgroundData = {};
                        "
                        :disabled="loading || requesting"
                        :loading="loading || requesting"
                      >
                        Cancelar
                      </v-btn>
                      <v-btn
                        color="success"
                        :disabled="loading || requesting"
                        :loading="loading || requesting"
                        @click="getBackgroundData"
                      >
                        Aplicar
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
            <v-row>
              <v-spacer></v-spacer>
              <v-col cols="4">
                <v-btn
                  large
                  block
                  color="success"
                  :disabled="loading"
                  :loading="loading"
                  @click="save"
                >
                  Guardar
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Gallery from "../Gallery.vue";
import ProductListInfiniteScroll from "../../components/ProductListInfiniteScroll.vue";
export default {
  name: "PlanogramEditor",
  components: { Gallery, ProductListInfiniteScroll },
  data: () => ({
    width: 40,
    height: 40,
    x: 0,
    y: 0,
    shelf_x: 0,
    shelf_y: 0,
    draggable: false,
    grid: {
      planogram: {
        show: true,
        x: 10,
        y: 10,
      },
      shelf: {
        show: true,
        x: 5,
        y: 5,
      },
    },
    planogram: {
      height: Math.ceil(window.innerHeight * 0.75),
      availableSpace: Math.ceil(window.innerHeight * 0.75),
      minimalShelfSpace: Math.ceil(window.innerHeight * 0.75 * 0.15),
    },
    shelf_item: {
      baseColor: { r: 0, g: 0, b: 0, a: 1 },
      maxHeight: Math.ceil(window.innerHeight * 0.75 * 0.15),
    },
    shelf_active: true,
    productId: -1,
    loading: false,
    loadingSearch: false,
    requesting: false,
    searchTimeout: null,

    menu: false,
    menu_x: 0,
    menu_y: 0,

    products: [],
    shelves: [],
    product: {
      nombre: "",
      precio: 0.0,
      sku: "",
      descripcion: "",
      categorias: [],
      archivos: [],
    },
    default_product: {
      nombre: "",
      precio: 0.0,
      sku: "",
      descripcion: "",
      categorias: [],
      archivos: [],
    },
    _showMenu: false,
    menuItems: [{ title: "test 1" }],
    searchMode: false,
    search: "",
    file: null,
    calculatedProductWidth: 0,
    calculatedProductHeight: 0,
    planogramSrc: "",
    dialogSearch: false,
    dialogGallery: false,
    backgroundId: -1,
    backgroundData: {},
    editedItem: {
      nombre: "",
      titulo: "",
      idFondo: -1,
    },
    defaultItem: {
      nombre: "",
      titulo: "",
      idFondo: -1,
    },
    searchProduct: {
      nombre: "",
      sku: "",
      ean: "",
      idFabricante: -1,
      idCategoria: -1,
      idTipoArticulo: -1,
      atributos: [],
    },
    searchProductDefault: {
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
  }),
  computed: {
    defaultShelfHeight() {
      return Math.ceil((this.planogram.height / 100) * 0.8);
    },
    getPlanogramWidth() {
      let w = Math.ceil((this.planogram.height / 16) * 9);
      console.log("plano w", w);
      return w;
    },
    getPlanogramHeight() {
      let h = this.planogram.height;
      console.log("plano h", h);
      return h;
    },
  },
  watch: {
    backgroundData(val) {
      console.log("backgroundData", val);
    },
    planogramSrc(val) {
      console.log("planogramSrc", val);
    },
    shelves(val) {
      console.log("[Observer] shelves", val);
    },
  },
  methods: {
    getProportionalHeight(pos, shelf, left, top) {
      console.log("left, top", left, top);
      console.log("pos", pos);
      console.log("shelf dragging", shelf);
      this.shelf_x = left;
      this.shelf_y = top;
      let formula =
        (this.shelf_y + +shelf.max_height) / this.getPlanogramHeight;
      if (!this.shelves[pos]["proportionalHeight"]) {
        this.shelves[pos]["proportionalHeight"] = formula;
      } else this.shelves[pos].proportionalHeight = formula;

      console.log("shelf after formula", this.shelves[pos]);
      console.log("formula", formula);
    },
    /* getShelfCoords(str) {
      let elem = document.querySelector(`#vdr_shelf-${str}`);

      console.log("elemDiv", elemDiv);

      let box = elem.getBoundingClientRect();

      const coords = {
        top: box.top + window.pageYOffset,
        right: box.right + window.pageXOffset,
        bottom: box.bottom + window.pageYOffset,
        left: box.left + window.pageXOffset,
      };
      console.log("coords", coords);

      return coords;
    }, */
    removeShelf(pos) {
      console.log("shelf number ", pos);
      console.log("shelf to be removed", this.shelves[pos]);
      console.log(
        "planogram availableSpace before",
        this.planogram.availableSpace
      );
      this.planogram.availableSpace =
        this.planogram.availableSpace + this.shelf_item.maxHeight;
      console.log(
        "planogram availableSpace after",
        this.planogram.availableSpace
      );
      this.shelves.splice(this.shelves.indexOf(this.shelves[pos]), 1);
    },
    handleProduct(obj) {
      console.log("handleProduct evt", obj);
      console.log("$event", window.event);
      this.showMenu(window.event, obj.product, obj.pos);
    },
    getBackground(val) {
      console.log("backgroundId", val);
      if (val > 0) this.backgroundId = +val;
    },
    async save() {
      this.loading = true;
      const planogramData = {
        nombre: this.editedItem.nombre,
        titulo: this.editedItem.nombre,
        idFondo: this.backgroundId,
      };
      const planogram = await this.$http
        .post("Gondolas", planogramData)
        .then((res) => {
          if (res) {
            this.snackbar = true;
            this.snackbarColor = "success";
            this.snackbarText = "Operación realizada exitosamente.";
            return +res.data.idObjeto;
          }
        })
        .catch((err) => {
          console.log("error", err);
          this.snackbar = true;
          this.snackbarColor = "black";
          this.snackbarText = "Operación cancelada.";
        })
        .finally(() => {
          this.loading = false;
        });

      console.log("planogram data", planogram);
      if (planogram) {
        console.log("PUSHING SHELVES TO PLANOGRAM");
        let promises = [];
        let i = 0;
        let arr = this.shelves.length;
        for (i; i < arr; i++) {
          let s = this.shelves[i];
          const shelfData = {
            color: `rgba(${s.color.r},${s.color.g},${s.color.b},${s.color.a})`,
            altura: (this.shelf_y + s.max_height) / this.getPlanogramHeight,
            orden: i,
            idGondola: planogram,
          };
          const req = this.$http.post("Estantes", shelfData);
          promises.push(req);
        }
        if (promises.length) {
          await this.$http.all(promises).then(
            this.$http.spread((...responses) => {
              let r = 0;
              let resArr = responses.length;
              for (r; r < resArr; r++) {
                console.log(`response ${r}:`, responses[r]);
              }
            })
          );
        }
      }
    },
    async getBackgroundData() {
      this.requesting = true;
      await this.$http
        .get(`Archivos/${+this.backgroundId}`)
        .then((res) => {
          if (res && res.data) {
            this.backgroundData = Object.assign({}, res.data);
            this.planogramSrc = this.backgroundData.url.toString();
          }
        })
        .catch((err) => {
          console.log("error", err);
          this.backgroundData = {};
        })
        .finally(() => {
          this.requesting = false;
          this.dialogGallery = false;
        });
    },
    async searchProducts() {
      clearTimeout(this.searchTimeout);
      this.products = [];
      let endpoint = `Articulos/Filtrados`;
      this.searchTimeout = setTimeout(() => {
        this.$http
          .post(endpoint, Object.assign({}, this.searchProduct))
          .then((res) => {
            if (res && res.data && res.data.length) {
              this.products = res.data;
            }
          })
          .catch((err) => {
            console.log("error", err);
          })
          .finally(() => {
            this.loading = false;
          });
      }, 1250);
    },
    onFileUpload(file_obj) {
      try {
        let url = URL.createObjectURL(file_obj);
        if (url) this.planogramSrc = url.toString();
      } catch (error) {
        console.log("Error reading file:", error);
        this.planogramSrc = "";
      }
      if (!this.file) this.planogramSrc = "";
    },
    sendToShelf(pos) {
      const image = new Image();
      image.src = this.productBeingStored.url;
      image.onload = () => {
        return image.src;
      };
      let max_w = Math.floor(this.getPlanogramWidth / 10);
      let max_h = Math.floor(this.shelf_item.maxHeight / 4);
      let estimated_height = Math.ceil((max_w / image.width) * image.height);
      let size = Object.assign({}, { w: max_w, h: estimated_height });
      if (estimated_height > max_h) {
        let estimated_width = Math.ceil((max_h / image.height) * image.width);
        size = Object.assign({}, { w: estimated_width, h: max_h });
      }
      this.shelves[pos].storedProducts.push(
        Object.assign(
          {},
          {
            ...this.productBeingStored,
            size,
          }
        )
      );
      console.log("shelves", this.shelves);
    },
    showMenu(e, product, pos) {
      this.menu = false;
      this.menu_x = e.clientX;
      this.menu_y = e.clientY;
      this.productBeingStored = Object.assign({}, { ...product, index: pos });
      this.$nextTick(() => {
        this.menu = true;
      });
    },
    getRGBA(rgba) {
      const color = rgba;
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    },
    onResize: function (x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    },
    onDrag: function (x, y) {
      this.x = x;
      this.y = y;
    },
    addShelf() {
      if (this.shelf_item.maxHeight >= this.planogram.minimalShelfSpace) {
        if (this.planogram.availableSpace > this.planogram.minimalShelfSpace) {
          this.planogram.availableSpace =
            this.planogram.availableSpace - this.shelf_item.maxHeight;
          this.shelves.push(
            Object.assign(
              {},
              {
                color: this.shelf_item.baseColor,
                max_height: this.shelf_item.maxHeight,
                storedProducts: [],
              }
            )
          );
          console.log("shelves", this.shelves);
        } else alert("No hay más espacio disponible.");
      } else
        alert(
          `El mínimo de altura del estante debe ser de ${this.planogram.minimalShelfSpace}px`
        );
    },
    async getProduct() {
      Object.assign(this.product, this.default_product);
      if (this.productId) {
        let endpoint = `Articulos/${this.productId}`;
        await this.$http
          .get(endpoint, {
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          })
          .then((res) => {
            if (res && res.data) {
              let product = res.data;
              this.product = Object.assign(
                {},
                {
                  nombre: product.nombre,
                  precio: product.precio,
                  sku: product.sku,
                  descripcion: product.descripcion,
                  archivos: product.archivos,
                  categorias: product.categorias,
                }
              );
            }
          })
          .catch((err) => {
            console.log("error", err);
          })
          .finally(() => {});
      }
    },
  },
  mounted: function () {
    this.loading = true;
    this.products = [];
    this.loading = false;
  },
};
</script>
<style>
.planogram__background {
  position: absolute;
  z-index: 100 !important;
  top: 0;
  left: 0;
  max-width: 100%;
  height: 100%;
}

.shelf_img {
  max-width: 100%;
  height: 100%;
}

.__background-small {
  position: relative;
  max-height: 20vh;
  max-width: 20vh;
  min-height: 20vh;
  min-width: 20vh;
}

.my-class {
  background-color: green;
  border: 1px solid red;
  -webkit-transition: background-color 200ms linear;
  -ms-transition: background-color 200ms linear;
  transition: background-color 200ms linear;
}

.shelf__dragging {
  cursor: move;
}
/* Fixes class dragging*/
.shelf__dragging:hover {
  cursor: move;
}

.my-dragging-class {
  background-color: red;
  border: 1px solid black;
}

.my-resizing-class {
  background-color: blue;
  border: 1px solid black;
  color: white;
}

.my-active-class {
  border: 1px solid black;
  -webkit-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
  box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
}

.my-handle-class {
  position: absolute;
  background-color: pink;
  border: 1px solid black;
  border-radius: 50%;
  height: 14px;
  width: 14px;
  box-model: border-box;
  -webkit-transition: all 300ms linear;
  -ms-transition: all 300ms linear;
  transition: all 300ms linear;
}

.my-handle-class-tl {
  top: -14px;
  left: -14px;
  cursor: nw-resize;
}

.my-handle-class-tm {
  top: -14px;
  left: 50%;
  margin-left: -7px;
  cursor: n-resize;
}

.my-handle-class-tr {
  top: -14px;
  right: -14px;
  cursor: ne-resize;
}

.my-handle-class-ml {
  top: 50%;
  margin-top: -7px;
  left: -14px;
  cursor: w-resize;
}

.my-handle-class-mr {
  top: 50%;
  margin-top: -7px;
  right: -14px;
  cursor: e-resize;
}

.my-handle-class-bl {
  bottom: -14px;
  left: -14px;
  cursor: sw-resize;
}

.my-handle-class-bm {
  bottom: -14px;
  left: 50%;
  margin-left: -7px;
  cursor: s-resize;
}

.my-handle-class-br {
  bottom: -14px;
  right: -14px;
  cursor: se-resize;
}

.my-handle-class-tl:hover,
.my-handle-class-tr:hover,
.my-handle-class-bl:hover,
.my-handle-class-br:hover {
  background-color: red;
  transform: scale(1.4);
}
</style>