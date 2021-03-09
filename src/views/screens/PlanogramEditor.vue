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
                :class-name="showShelfClass ? 'vdr' : ' '"
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
                axis="y"
                @dragging="
                  (left, top) => getProportionalHeight(index, shelf, left, top)
                "
                @created="
                  (left, top) => getProportionalHeight(index, shelf, left, top)
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
                  axis="both"
                  @dragging="
                    (left, top) =>
                      getProportionalHeightChild(
                        index,
                        pos,
                        product,
                        false,
                        left,
                        top
                      )
                  "
                  @created="
                    (left, top) =>
                      getProportionalHeightChild(
                        index,
                        pos,
                        product,
                        true,
                        left,
                        top
                      )
                  "
                  @resizing="
                    (x, y, width, height) =>
                      setNewSizes(index, pos, product, x, y, width, height)
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
                    v-model="shelf_item.maxHeight"
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
                v-model="shelf_item.baseColor"
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
    product_x: 0,
    product_y: 0,
    product_w: 0,
    product_h: 0,
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
    showShelfClass: true,
    productId: -1,
    loading: false,
    loadingSearch: false,
    requesting: false,
    searchTimeout: null,
    productBeingStored: {},

    menu: false,
    menu_x: 0,
    menu_y: 0,

    offsets_x: [],

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
    productBeingStored(val) {
      console.log("[Observer] productBeingStored", val);
    },
  },
  methods: {
    setYOffset(sHeight, pHeight) {
      let space = sHeight - pHeight - this.defaultShelfHeight;
      console.log("setYOffset sH pH space", sHeight, pHeight, space);
      return space;
    },
    /* xOffset(sIndex, pIndex) {
      console.log("xOffset", sIndex, pIndex);

      let domElement = document.querySelector(`#_SP_VDR-${pIndex}`);

      let totalArray = this.shelves[sIndex].storedProducts;
      let total = totalArray.length;

      let x = 0,
        offsetFactor = pIndex + 2,
        totalFactor;

      for (x; x < total; offsetFactor++) {
        let exp = Math.trunc(this.getPlanogramWidth / offsetFactor);
        let sizeExp = Math.trunc(totalArray[x].size.w / 2);
        totalFactor = exp - sizeExp - 2;
        domElement.style.transform = `translate-x(${totalFactor}px)`;
      }
      console.log("totalFactor", totalFactor);
    }, */
    setNewSizes(index, pos, product, x, y, width, height) {
      console.log("RESIZING PRODUCT: ", product);
      console.log(
        "setNewSizes() args[index, pos, product, x, y, width, height] ",
        index,
        pos,
        product,
        x,
        y,
        width,
        height
      );
      this.product_x = x;
      this.product_y = y;
      this.product_w = width;
      this.product_h = height;

      console.log(
        "set reactiveProps[product_x, product_y, product_w ,product_h]: ",
        this.product_x,
        this.product_y,
        this.product_w,
        this.product_h
      );

      console.log(
        "this.shelves[index].storedProducts[pos]",
        this.shelves[index].storedProducts[pos]
      );
      console.log(
        "this.shelves[index].storedProducts[pos] before (w,h)",
        this.shelves[index].storedProducts[pos].size.w,
        this.shelves[index].storedProducts[pos].size.h
      );
      this.shelves[index].storedProducts[pos].size.w = this.product_w;
      this.shelves[index].storedProducts[pos].size.h = this.product_h;
      console.log(
        "this.shelves[index].storedProducts[pos] after (w,h)",
        this.shelves[index].storedProducts[pos].size.w,
        this.shelves[index].storedProducts[pos].size.h
      );
    },
    getProportionalHeight(pos, shelf, left, top) {
      console.log("left, top", left, top);
      console.log("pos", pos);
      console.log("shelf dragging", shelf);
      this.shelf_x = left;
      this.shelf_y = top;
      let formula = parseInt(
        ((this.shelf_y + +shelf.max_height) / this.getPlanogramHeight) * 100
      );
      if (!this.shelves[pos]["proportionalHeight"]) {
        this.shelves[pos]["proportionalHeight"] = formula;
      } else this.shelves[pos].proportionalHeight = formula;

      console.log("shelf after formula", this.shelves[pos]);
      console.log("formula", formula);
    },
    getProportionalHeightChild(
      index,
      pos,
      product,
      calcMarginsOffsets,
      left,
      top
    ) {
      console.log(
        "index, pos, left, top, product",
        index,
        pos,
        left,
        top,
        product
      );
      this.product_x = left;
      this.product_y = top;
      let pWidth = parseInt((this.product_x / this.getPlanogramWidth) * 100);
      let pHeight = parseInt(
        (this.product_y / this.shelves[index].max_height) * 100
      );
      const size = {
        pWidth: pWidth,
        pHeight: pHeight,
      };
      if (!this.shelves[index].storedProducts[pos]["proportionalSize"]) {
        this.shelves[index].storedProducts[pos]["proportionalSize"] = size;
      } else this.shelves[index].storedProducts[pos].proportionalSize = size;

      console.log(
        "product after formula",
        this.shelves[index].storedProducts[pos]
      );
      console.log("formulas (w, h)", pWidth, pHeight);

      // Auto margins and calculated offsets
      if (calcMarginsOffsets === true) {
        let totalArray = this.shelves[index].storedProducts;
        let total = totalArray.length;
        let sHeight = this.shelves[index].max_height;

        let x = 0,
          offsetFactor = total + 1,
          totalFactor;

        let exp = Math.trunc(this.getPlanogramWidth / offsetFactor);

        for (x; x < total; x++) {
          let sizeExp = Math.trunc(totalArray[x].size.w / 2);
          totalFactor = this.getPlanogramWidth - (x + 1) * exp - sizeExp;
          console.log("domEL", `_SP_VDR-${index}-${pos}`);
          let domElement = document.querySelector(`#_SP_VDR-${index}-${x}`);

          let y = Math.trunc(
            sHeight -
              totalArray[x].size.h -
              Math.trunc(this.defaultShelfHeight / 2)
          );

          domElement.style.transform = `translate(${totalFactor}px, ${y}px)`;

          console.log("totalFactor", totalFactor);
        }
      }
    },
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
      console.log("handleProduct", obj);
      this.showMenu(window.event, obj);
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
          return null;
        })
        .finally(() => {
          this.loading = false;
        });

      if (planogram) {
        var i = 0;
        let arr = this.shelves.length;

        // Array of Objects
        var ids = [];

        for (i; i < arr; i++) {
          var s = this.shelves[i];

          let shelfData = Object.assign(
            {},
            {
              color: `rgba(${s.color.r},${s.color.g},${s.color.b},${s.color.a})`,
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
                  alto: Math.trunc((p.size.h / this.getPlanogramHeight) * 1000),
                  ancho: Math.trunc((p.size.w / this.getPlanogramWidth) * 1000),
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
      image.src = this.productBeingStored.archivos[0].url;
      image.onload = () => {
        return image.src;
      };
      let max_w = Math.floor(this.getPlanogramWidth / 10);
      let max_h = Math.floor(this.shelves[pos].max_height / 2);
      let estimated_height = Math.ceil((max_w / image.width) * image.height);
      let size = Object.assign({}, { w: max_w, h: estimated_height });
      if (estimated_height > max_h) {
        let estimated_width = Math.ceil((max_h / image.height) * image.width);
        size = Object.assign({}, { w: estimated_width, h: max_h });
      }
      if (!this.productBeingStored["size"]) {
        this.productBeingStored["size"] = size;
      }
      this.shelves[pos].storedProducts.push(this.productBeingStored);
      console.log("shelves", this.shelves);
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
    getRGBA(rgba) {
      const color = rgba;
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;
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