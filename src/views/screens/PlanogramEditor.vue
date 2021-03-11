<template>
  <div class="planogram-editor">
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
              :w="planogramWidth"
              :h="planogramHeight"
              :parent="false"
              :debug="false"
              :min-width="planogramWidth"
              :min-height="planogramHeight"
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

              <!-- TODO: Integrate video component -->
              <video
                v-else-if="planogramSrc.match(/.(mp4)$/i)"
                class="planogram__background ma-0 pa-0"
              >
                <source :src="planogramSrc" type="video/mp4" />
                Su navegador no soporta la etiqueta de video HTML5.
              </video>

              <!-- Shelves  -->
              <vdr
                v-for="(shelf, index) in shelves"
                v-bind:key="`shelf-${index}`"
                :id="`vdr_shelf-${index}`"
                :class-name="showShelfClass ? 'vdr' : ' '"
                :w="planogramWidth"
                :h="+shelf.h"
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
                axis="y"
                @dragging="(left, top) => xy('Shelf', left, top)"
                @dragstop="
                  (left, top) =>
                    getProportionalHeight(index, shelf, false, left, top)
                "
                @created="
                  (left, top) =>
                    getProportionalHeight(index, shelf, true, left, top)
                "
              >
                <vdr
                  v-for="(product, pos) in shelf.storedProducts"
                  v-bind:key="`product-${pos}`"
                  v-bind:id="`_SP_VDR-${index}-${pos}`"
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
                  :handles="['tr']"
                  axis="x"
                  @dragging="(left, top) => xy('Shelf', left, top)"
                  @dragstop="
                    (left, top) =>
                      tweak_vdr(index, pos, product, true, left, top)
                  "
                  @created="
                    (left, top) =>
                      tweak_vdr(index, pos, product, true, left, top)
                  "
                  @resizestop="
                    (x, y, width, height) =>
                      tweakOnResize(index, pos, product, x, y, width, height)
                  "
                >
                  <div
                    class="d-flex justify-content-center ma-0"
                    :style="{ height: `100%`, 'max-width': `100%` }"
                  >
                    <img
                      class="shelf_img"
                      v-bind:src="
                        product.archivos[0].url ||
                        require('@/assets/no-disponible.jpg')
                      "
                    />
                  </div>
                </vdr>
                <!-- Shelf base -->
                <div class="d-flex ma-0" :style="{ height: `${shelf.h}px` }">
                  <v-sheet
                    class="align-self-end"
                    :width="planogramWidth"
                    :height="baseShelfHeight"
                    :color="rgba(shelf.color)"
                  >
                    <div class="shelf-actions-left text-overline text-center">
                      <div class="text-overline">{{ index }}</div>
                    </div>
                    <div class="shelf-actions-right">
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
                  </v-sheet>
                </div>
              </vdr>
            </vdr>
          </v-col>
        </v-row>
      </v-col>

      <!-- Planogram settings -->
      <v-col cols="12" md="5">
        <v-row class="d-flex flex-column justify-center" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Configuración del planograma
            </v-sheet>
          </v-col>
          <v-row dense>
            <v-col cols="12" class="d-flex flex-column">
              <div class="text-h6 text-left">Parámetros</div>
              <v-divider class="my-1"></v-divider>
            </v-col>
          </v-row>
          <v-row dense>
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
            <v-col cols="12" sm="6">
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
          </v-row>

          <v-row dense>
            <v-col cols="6">
              <div class="text-h6 text-left">Fondo</div>
            </v-col>
            <v-col cols="6" class="d-flex justify-end">
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
                    small
                    v-bind="attrs"
                    v-on="on"
                    width="50%"
                    :disabled="loading"
                    :loading="loading"
                  >
                    Elegir fondo
                  </v-btn>
                </template>

                <v-card height="auto">
                  <v-card-title>Elegir un fondo</v-card-title>
                  <v-card-text>
                    <Gallery :paginationFixed="false" @selected="getBackground">
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
            <v-col cols="12">
              <v-divider></v-divider>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="6">
              <div class="text-h6 text-left">Estantes</div>
            </v-col>
            <v-col cols="6" class="d-flex justify-end">
              <v-btn
                @click="addShelf"
                :disabled="loading"
                :loading="loading"
                color="#55AA99"
                dark
                small
                width="50%"
              >
                Agregar estante
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-divider></v-divider>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="6">
              <div class="text-overline">Opciones</div>
            </v-col>
            <v-col cols="6">
              <div class="text-overline">Color</div>
            </v-col>
          </v-row>

          <v-row dense class="mt-2">
            <v-col cols="12" sm="6">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="shelf_h"
                    label="Altura estante"
                    outlined
                    clearable
                    dense
                    single-line
                    :hide-details="true"
                    :disabled="false"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="d-flex align-center"> </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12">
                  <v-switch
                    v-model="showShelfClass"
                    label="Mostrar límites de los estantes."
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="6">
              <v-color-picker
                v-model="shelf_color"
                label="Color de la base"
                dot-size="25"
                hide-mode-switch
                mode="rgba"
              ></v-color-picker>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="6">
              <v-btn
                large
                block
                color="success"
                :disabled="loading"
                :loading="loading"
                @click="save"
              >
                <v-icon class="mr-2">fas fa-save</v-icon>
                Guardar planograma
              </v-btn>
            </v-col>
          </v-row>
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
    shelf_h: Math.trunc(window.innerHeight * 0.75 * 0.15),
    shelf_w: 0,
    shelf_color: { r: 0, g: 0, b: 0, a: 1 },
    product_x: 0,
    product_y: 0,
    product_w: 0,
    product_h: 0,

    // Planogram
    space_y: Math.trunc(window.innerHeight * 0.75),

    shelf_active: true,
    showShelfClass: true,
    loading: false,
    loadingSearch: false,
    requesting: false,
    searchTimeout: null,
    productBeingStored: {},

    menu: false,
    menu_x: 0,
    menu_y: 0,

    products: [],
    shelves: [],
    searchMode: false,
    search: "",
    file: null,
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
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
  }),
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
    productBeingStored(val) {
      console.log("[Observer] productBeingStored", val);
    },
    space_y(val) {
      console.log("[Observer] space_y", val);
    },
    shelf_x(val) {
      console.log("[Observer] shelf_x", val);
    },
    shelf_y(val) {
      console.log("[Observer] shelf_y", val);
    },
    shelf_h(val) {
      console.log("[Observer] shelf_h", val);
    },
    product_x(val) {
      console.log("[Observer] product_x", val);
    },
    product_y(val) {
      console.log("[Observer] product_y", val);
    },
    product_w(val) {
      console.log("[Observer] product_w", val);
    },
    product_h(val) {
      console.log("[Observer] product_h", val);
    },
  },
  computed: {
    planogramHeight() {
      let val = Math.trunc(window.innerHeight * 0.75);
      console.log("[Computed] planogramHeight", val);
      return val;
    },
    planogramWidth() {
      let val = Math.trunc((this.planogramHeight / 16) * 9);
      console.log("[Computed] planogramWidth", val);
      return val;
    },
    baseShelfHeight() {
      let val = Math.trunc((this.planogramHeight / 100) * 0.8);
      console.log("[Computed] baseShelfHeight", val);
      return val;
    },
    minShelfHeight() {
      let val = Math.trunc(window.innerHeight * 0.75 * 0.15);
      console.log("[Computed] minShelfHeight", val);
      return val;
    },
  },
  methods: {
    xy(type, left, top) {
      if (typeof type === "string") {
        if (type == "Shelf") {
          this.shelf_x = left;
          this.shelf_y = top;
        } else if (type == "Product") {
          this.product_x = left;
          this.product_y = top;
        }
      }
    },
    getProportionalHeight(pos, shelf, calcMarginsOffsets, left, top) {
      this.shelf_x = left;
      this.shelf_y = top;

      // Calculate margins and offsets
      if (calcMarginsOffsets === true) {
        let totalArray = this.shelves;
        let total = totalArray.length;

        let x = 0,
          offsetFactor = total + 1,
          totalFactor;

        let exp = Math.trunc(this.planogramHeight / offsetFactor);

        for (x; x < total; x++) {
          totalFactor =
            this.planogramHeight - (x + 1) * exp - this.shelves[x].h;

          let domElement = document.querySelector(`#vdr_shelf-${x}`);

          domElement.style.transform = `translate(0px, ${totalFactor}px)`;

          this.shelf_y = totalFactor;

          console.log("Positioned y at:", totalFactor);

          // Fixes negative values in some rare cases
          if (this.shelf_x <= 0) this.shelf_x = left + Math.abs(left);
          if (this.shelf_y <= 0) this.shelf_y = top + Math.abs(top);

          let pHeight = parseInt(
            ((this.shelf_y + +shelf.h) / this.planogramHeight) * 100
          );

          if (!this.shelves[x]["proportionalHeight"]) {
            this.shelves[x]["proportionalHeight"] = pHeight;
          } else this.shelves[x].proportionalHeight = pHeight;

          console.log("proportionalHeight (h)", pHeight);

          let sync = {
            x: {
              left: this.shelf_x,
              right: 0,
            },
            y: {
              top: this.shelf_y,
              bottom: 0,
            },
          };

          if (!this.shelves[pos]["lastSync"]) {
            this.shelves[pos]["lastSync"] = sync;
          } else this.shelves[pos].lastSync = sync;

          console.log("lastSync", sync);
        }
      }
    },
    tweak_vdr(index, pos, product, calcMarginsOffsets, left, top) {
      this.product_x = left;
      this.product_y = top;

      if (typeof product === "object") {
        if (product["size"]) {
          this.product_w = product.size.w;
          this.product_h = product.size.h;
        }
      }

      // Calculate margins and offsets
      if (calcMarginsOffsets === true) {
        let totalArray = this.shelves[index].storedProducts;
        let total = totalArray.length;
        let sHeight = this.shelves[index].h;

        let x = 0,
          offsetFactor = total + 1,
          totalFactor;

        let exp = Math.trunc(this.planogramWidth / offsetFactor);

        for (x; x < total; x++) {
          let sizeExp = Math.trunc(totalArray[x].size.w / 2);
          totalFactor = this.planogramWidth - (x + 1) * exp - sizeExp;

          let domElement = document.querySelector(`#_SP_VDR-${index}-${x}`);

          let y = Math.trunc(
            sHeight -
              totalArray[x].size.h -
              Math.trunc(this.baseShelfHeight / 2)
          );

          domElement.style.transform = `translate(${totalFactor}px, ${y}px)`;

          this.product_x = totalFactor;
          this.product_y = y;

          console.log("Positioned x at:", totalFactor);
          console.log("Positioned y at:", y);
        }
      }

      // Fixes negative values in some rare cases
      if (this.product_x <= 0) this.product_x = left + Math.abs(left);
      if (this.product_y <= 0) this.product_y = top + Math.abs(top);

      let pWidth = parseInt((this.product_x / this.planogramWidth) * 100);
      let pHeight = parseInt((this.product_y / this.shelves[index].h) * 100);

      const size = {
        pWidth: pWidth,
        pHeight: pHeight,
      };

      let storedProduct = this.shelves[index].storedProducts[pos];

      if (!storedProduct["proportionalSize"]) {
        storedProduct["proportionalSize"] = size;
      } else storedProduct.proportionalSize = size;

      console.log("proportionalSize (w, h)", pWidth, pHeight);
    },
    tweakOnResize(index, pos, x, y, width, height) {
      this.product_x = x;
      this.product_y = y;
      this.product_w = width;
      this.product_h = height;

      let storedProduct = this.shelves[index].storedProducts[pos];
      storedProduct.size.w = Math.ceil(this.product_w);
      storedProduct.size.h = Math.ceil(this.product_h);

      let w = storedProduct.size.w;
      let h = storedProduct.size.h;

      console.log("Resize result (w, h):", w, h);
    },
    removeShelf(index) {
      let pos = this.shelves.indexOf(this.shelves[index]);
      this.space_y = this.space_y + this.shelves[pos].h;
      this.shelves.splice(pos, 1);
    },
    handleProduct(obj) {
      console.log("handleProduct", obj);
      this.showMenu(window.event, obj);
    },
    getBackground(val) {
      console.log("backgroundId", val);
      if (val > 0) this.backgroundId = +val;
    },
    async save() {
      this.loading = true;
      const planogram = await this.$http
        .post(
          "Gondolas",
          Object.assign(
            {},
            {
              nombre: this.editedItem.nombre,
              titulo: this.editedItem.titulo,
              idFondo: +this.backgroundId,
            }
          )
        )
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
          return null;
        });

      if (planogram) {
        var i = 0;
        let arr = this.shelves.length;

        // Array of Objects
        var ids = [];

        for (i; i < arr; i++) {
          var s = this.shelves[i];
          let color = `rgba(${s.color.r}, ${s.color.g}, ${
            s.color.b
          }, ${parseInt(s.color.a).toFixed(2)})`;
          let shelfData = Object.assign(
            {},
            {
              color: color,
              altura: +s.proportionalHeight,
              orden: i,
              idGondola: planogram,
            }
          );

          await this.$http.post("Estantes", shelfData).then((response) => {
            if (response && response.data) {
              const obj = { id: +response.data.idObjeto, index: i };
              console.log("shelf obj then", obj);
              ids.push(obj);
            }
          });
        }

        if (ids.length) {
          // each shelf id

          for (let _id of ids) {
            var payloadProducts = [];

            let products = this.shelves[_id.index].storedProducts;
            for (let a = 0; a < products.length; a++) {
              let p = products[a];
              let data = Object.assign(
                {},
                {
                  idEstante: +_id.id,
                  idArticulo: p.id,
                  nombre: p.nombre,
                  origenX: p.proportionalSize.pWidth,
                  origenY: p.proportionalSize.pHeight,
                  cantidadX: 1,
                  cantidadY: 1,
                  alto: Math.trunc((p.size.h / this.planogramHeight) * 1000),
                  ancho: Math.trunc((p.size.w / this.planogramWidth) * 1000),
                }
              );
              payloadProducts.push(data);
            }

            // send shelf products to api
            await this.$http.post(`Estantes/${_id.id}/Articulos`, {
              articulos: payloadProducts,
            });
          } // end for ids
        }
      }
      this.loading = false;
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
    sendToShelf(pos) {
      const image = new Image();
      image.src = this.productBeingStored.archivos[0].url;
      image.onload = () => {
        return image.src;
      };
      let max_w = Math.trunc(this.planogramWidth / 10);
      let max_h = Math.trunc(this.shelves[pos].h / 2);
      let estimated_height = Math.trunc((max_w / image.width) * image.height);
      let size = Object.assign({}, { w: max_w, h: estimated_height });
      if (estimated_height > max_h) {
        let estimated_width = Math.trunc((max_h / image.height) * image.width);
        size = Object.assign({}, { w: estimated_width, h: max_h });
      }
      if (!this.productBeingStored["size"]) {
        this.productBeingStored["size"] = size;
      }
      this.shelves[pos].storedProducts.push(this.productBeingStored);
      console.log("shelves", this.shelves);
      this.$nextTick(() => {
        this.menu = false;
      });
    },
    showMenu(e, obj) {
      this.menu = false;
      this.menu_x = e.clientX;
      this.menu_y = e.clientY;
      this.productBeingStored = Object.assign({}, obj);
      this.$nextTick(() => {
        this.menu = true;
      });
    },
    rgba(object) {
      if (typeof object === "object") {
        const c = object;
        if (c["r"] && c["g"] && c["b"] && c["a"] >= 0) {
          return `rgba(${c.r}, ${c.g}, ${c.b}, ${parseInt(c.a).toFixed(2)})`;
        }
      }
      return;
    },
    addShelf() {
      if (this.shelf_h >= this.minShelfHeight) {
        if (this.space_y > this.minShelfHeight) {
          this.space_y = this.space_y - this.shelf_h;
          const obj = {
            color: this.shelf_color,
            h: this.shelf_h,
            storedProducts: [],
          };
          this.shelves.push(obj);
        } else alert("No hay más espacio disponible.");
      } else
        alert(
          `El mínimo de altura del estante debe ser de ${this.minShelfHeight}px`
        );
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

.shelf-actions-left {
  position: absolute;
  bottom: 0;
  right: 102%;
  border: 1px solid yellow;
  width: 30px;
}
.shelf-actions-right {
  position: absolute;
  bottom: 0;
  left: 102%;
  border: 1px solid yellow;
  width: 30px;
}
</style>