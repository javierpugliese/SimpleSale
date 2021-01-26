<template>
  <div class="virtuals">
    <!-- Toolbar -->
    <v-toolbar :color="!planogramList ? 'grey darken-4' : '#1F96A3'" dark>
      <v-scale-transition>
        <v-app-bar-nav-icon v-if="!planogramList">
          <v-icon>fas fa-mobile-alt</v-icon>
        </v-app-bar-nav-icon>
        <v-btn v-else-if="planogramList" @click="planogramList = false" icon>
          <v-icon>fas fa-times</v-icon>
        </v-btn>
      </v-scale-transition>
      <v-scroll-y-transition>
        <v-toolbar-title> Gestión de Planogramas </v-toolbar-title>
      </v-scroll-y-transition>
      <v-autocomplete
        v-model="productId"
        :items="products"
        label="Producto"
        maxlength="50"
        class="mt-6"
        clearable
        outlined
        small-chips
        :allow-overflow="false"
        :autofocus="true"
        :cache-items="true"
        @change="getProduct"
        :loading="loading"
        :disabled="loading"
      ></v-autocomplete>
      <v-spacer></v-spacer>
      <v-scale-transition>
        <v-btn
          v-if="!planogramList && !searchMode"
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#55AA99'"
          @click="planogramList = true"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          :disabled="loading"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-th-list
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Ver lista" : "" }}
        </v-btn>
      </v-scale-transition>
    </v-toolbar>

    <!-- Planogram management -->
    <v-row v-if="!planogramList">
      <!-- Product files list -->
      <v-col cols="12" md="2">
        <v-row class="d-flex flex-column" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Archivos del producto
            </v-sheet>
          </v-col>
          <v-col
            v-for="(pf, index) in product.archivos"
            :key="`productFile-${index}`"
            cols="12"
            class="d-flex flex-column"
          >
            <v-sheet color="333333">
              <v-img
                :lazy-src="require('@/assets/no-disponible.jpg')"
                :src="pf.url || require('@/assets/no-disponible.jpg')"
                alt=" "
                :contain="true"
                class="__background-small white--text ma-2"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
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
            </v-sheet>
          </v-col>
        </v-row>
      </v-col>

      <!-- Chosen files list -->
      <v-col cols="12" md="2">
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
                    $ {{ product.precio }}
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
      </v-col>

      <!-- Planogram preview -->
      <v-col cols="12" md="3">
        <v-row class="d-flex flex-column" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Planograma
            </v-sheet>
          </v-col>
          <v-col cols="12">
            <div
              v-bind:style="{
                width: `${getPlanogramWidth}px`,
                height: `${getPlanogramHeight}px`,
                position: 'relative',
                'z-index': 10,
              }"
            >
              <object
                :data="require('@/assets/fondo.jpg')"
                :width="getPlanogramWidth"
                :height="getPlanogramHeight"
                style="position: absolute; z-index: 100 !important; top: 0; left; 0"
              >
                <param name="wmode" value="transparent" />
              </object>

              <vue-draggable-resizable
                v-for="(shelf, index) in shelves"
                v-bind:key="`shelf-${index}`"
                :w="getPlanogramWidth"
                :h="+shelf.max_height"
                axis="y"
                :resizable="false"
                :draggable="shelf_active"
                :lock-aspect-ratio="false"
                :grid="[grid.planogram.x, grid.planogram.y]"
                :z="101"
                :parent="true"
                :active="shelf_active"
                :handles="['tm', 'mr']"
                class-name-dragging="shelf__dragging"
              >
                <!-- <div slot="mr" class="ml-16">
                  <v-sheet color="secondary" class="text-h6 text-center pa-5">
                    Vista Previa
                  </v-sheet>
                  😀
                </div> -->
                <div
                  class="d-flex justify-content-center"
                  :style="{ height: `${shelf.max_height}px` }"
                >
                  <!-- Shelf products -->
                  <vue-draggable-resizable
                    v-for="(product, index) in 4"
                    v-bind:key="`product-${index}`"
                    :w="40"
                    :h="40"
                    :min-width="40"
                    :min-height="40"
                    :resizable="true"
                    :draggable="true"
                    :lock-aspect-ratio="true"
                    :grid="[grid.shelf.x, grid.shelf.y]"
                    :z="102"
                    :parent="true"
                    @activated="shelf_active = false"
                    @deactivated="shelf_active = true"
                    class-name-dragging="shelf__dragging"
                  >
                    <div
                      class="d-flex justify-content-center"
                      :style="{ height: `40px` }"
                    >
                      <v-img
                        :src="require('@/assets/no-disponible.jpg')"
                        :contain="true"
                        height="40"
                        max-height="40"
                        width="40"
                        max-width="40"
                      ></v-img>
                    </div>
                  </vue-draggable-resizable>

                  <!-- Shelf base -->
                  <v-sheet
                    class="align-self-end"
                    :width="getPlanogramWidth"
                    :height="defaultShelfHeight"
                    :color="getRGBA(shelf.color)"
                  ></v-sheet>
                </div>
              </vue-draggable-resizable>
            </div>
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
          <v-row dense>
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
                label="Tamaño máximo manipulable (px)"
                outlined
                clearable
                required
                :disabled="true"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4"></v-col>
            <v-btn @click="addShelf" color="success">Agregar estante</v-btn>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import VueDraggableResizable from "vue-draggable-resizable";
import "vue-draggable-resizable/dist/VueDraggableResizable.css";
// @ is an alias to /src

export default {
  name: "Virtuals",
  components: { VueDraggableResizable },
  data: () => ({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
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
      pile: {
        show: true,
        x: 1,
        y: 1,
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
    planogramList: false,
    searchMode: false,
    search: "",
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
  methods: {
    sendToShelf(index) {
      let i = index;
      console.log("sendToShelf", index, this.shelves[i]);
    },
    showMenu(e, product) {
      e.preventDefault();
      console.log("MENU DATA: ", product);
      this.menu = false;
      this.menu_x = e.clientX;
      this.menu_y = e.clientY;
      this.$nextTick(() => {
        this.menu = true;
      });
    },
    getRGBA(rgba) {
      const color = rgba;
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    },
    handleBackground(type, path = "") {
      if (type === "image") {
        const asset = require("@/assets/fondo.jpg" || path);
        let h = window.innerHeight * 0.75;
        let w = (h / 16) * 9;
        const image = new Image();
        image.src = asset;
        image.width = w + 1;
        image.height = h + 1;
        image.onload = () => {
          /* document.getElementById(
            "planogram"
          ).style.backgroundImage = `url('${image.src}')`; */
          return image.src;
        };
      } else if (type === "video") {
        console.log("is video");
      }
    },
    handleImage: function (path) {
      console.log("path", path);
      let h = window.innerHeight * 0.75;
      let w = (h / 16) * 9;
      const asset = require("@/assets/no-disponible.jpg");
      const image = new Image();
      image.src = asset;
      image.width = w + 1;
      image.height = h + 1;
      console.log("img", image);
      image.onload = () => {
        console.log("img loaded", image.width, image.height);
      };
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
              }
            )
          );
        } else alert("No hay más espacio disponible.");
      } else
        alert(
          `El minimo de altura del estante debe ser de ${this.planogram.minimalShelfSpace}px`
        );
    },
    async getProduct() {
      Object.assign(this.product, this.default_product);
      if (this.productId) {
        let endpoint = `Articulos/${this.productId}`;
        await this.$http
          .get(endpoint)
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
  created: async function () {
    this.loading = true;
    this.products = [];
    await this.$http
      .get("Simple")
      .then((res) => {
        if (res && res.data.list) {
          this.products = res.data.list.map((p) =>
            Object.assign({}, { text: p.nombre, value: p.id })
          );
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        this.loading = false;
      });
  },
  mounted: function () {
    //this.handleImage();
    this.handleBackground("image");
  },
};
</script>
<style>
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