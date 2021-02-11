<template>
  <div class="planograms">
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
    <v-row
      v-bind:style="{ position: `sticky`, top: `80px` }"
      v-if="!planogramList"
    >
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

      <!-- Product files list -->
      <v-col cols="12" md="2">
        <v-row class="d-flex flex-column" dense>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-3">
              Archivos del producto
            </v-sheet>
          </v-col>
          <div
            :style="{
              'overflow-y': `scroll`,
              height: `${getPlanogramHeight}px`,
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
      </v-col>

      <!-- Planogram preview -->
      <v-col cols="12" md="3">
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
            >
              <object
                :data="require('@/assets/fondo.jpg')"
                class="planogram__background ma-0 pa-0"
              >
                <param name="wmode" value="transparent" />
              </object>
              <!-- shelves  -->
              <vdr
                v-for="(shelf, index) in shelves"
                v-bind:key="`shelf-${index}`"
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
              >
                <vdr
                  v-for="(product, index) in shelf.storedProducts"
                  v-bind:key="`product-${index}`"
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
                  ></v-sheet>
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
                  label="Altura máxima manipulable"
                  outlined
                  clearable
                  required
                  :disabled="true"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn @click="addShelf" color="#55AA99">
                  Agregar estante
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="7">
                <v-file-input
                  v-model="file"
                  counter
                  label="Archivo (imagen o video)"
                  accept=".jpg, .mp4"
                  placeholder="Seleccione un archivo..."
                  prepend-icon=""
                  outlined
                  :show-size="1000"
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
                <v-btn
                  block
                  color="success"
                  :disabled="loading"
                  :loading="loading"
                >
                  <v-icon class="pr-2">fas fa-hand-pointer</v-icon>
                  Elegir desde Galeria
                </v-btn>
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
// @ is an alias to /src

export default {
  name: "Planograms",
  components: {},
  data: () => ({
    width: 40,
    height: 40,
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
    _showMenu: false,
    menuItems: [{ title: "test 1" }],
    searchMode: false,
    search: "",
    file: null,
    calculatedProductWidth: 0,
    calculatedProductHeight: 0,
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
  mounted: async function () {
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