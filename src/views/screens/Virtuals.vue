<template>
  <div class="virtuals">
    <v-row>
      <v-col cols="12" md="3">
        <v-row>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-left pa-5">
              Productos
            </v-sheet>
          </v-col>
        </v-row>
        <!-- <div class="products__column">
          <v-autocomplete
            v-model="productId"
            :items="products"
            label="Seleccione"
            maxlength="50"
            clearable
            outlined
            small-chips
            style="position: sticky; top: 0"
          ></v-autocomplete>
          <div>
            <v-card
              v-for="product in products"
              :key="product.id"
              :ripple="false"
              class="portrait"
              @contextmenu="
                shelves.length > 0
                  ? showMenu($event, Object.assign({}, product))
                  : ''
              "
            >
              <v-img
                :src="require('@/assets/no-disponible.png')"
                :contain="true"
                class="mx-auto my-2"
                style="z-index: 0 !important"
                height="128"
                max-height="128"
                width="128"
                max-width="128"
              ></v-img
            ></v-card>
            <v-menu
              v-model="menu"
              :position-x="menu_x"
              :position-y="menu_y"
              absolute
              offset-y
            >
              <v-sheet color="secondary" class="text-h6 text-left pa-2">
                Enviar a estante:
              </v-sheet>
              <v-list>
                <v-list-item
                  v-for="(n, index) in shelves"
                  :key="index"
                  @click="sendToShelf(index)"
                  mandatory
                >
                  <v-list-item-title>Estante {{ index }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div> -->
      </v-col>
      <v-col cols="12" lg="3" class="d-flex justify-center">
        <!-- Planograma -->
        <v-row>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-5">
              Vista Previa
            </v-sheet>
          </v-col>
          <v-col cols="12"></v-col>
          <v-col cols="12" class="d-flex justify-center">
            <div
              v-bind:style="{
                width: `${getPlanogramWidth}px`,
                height: `${getPlanogramHeight}px`,
                position: 'relative',
                'z-index': 10,
              }"
            >
              <object
                :data="require('@/assets/navidad.mp4')"
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
                :lock-aspect-ratio="true"
                :grid="[grid.planogram.x, grid.planogram.y]"
                :z="101"
                :parent="true"
                :active="shelf_active"
                class-name-dragging="shelf__dragging"
              >
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
                        :src="require('@/assets/no-disponible.png')"
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
                <!-- <p>
          Estante<br />
          X: {{ x }} / Y: {{ y }} - Width: {{ width }} / Height: {{ height }}
        </p> -->
                <!-- <v-img
          :src="require('@/assets/no-disponible.png')"
          :contain="true"
          height="44"
          max-height="44"
          width="44"
          max-width="44"
        ></v-img> -->
              </vue-draggable-resizable>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" lg="6">
        <v-row>
          <v-col cols="12">
            <v-sheet color="secondary" class="text-h6 text-center pa-5">
              Ajustes del Planograma
            </v-sheet>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
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
            ></v-text-field>
          </v-col>
          <v-btn @click="addShelf" color="success">Agregar estante</v-btn>
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
      availableSpace: 700,
    },
    shelf_item: {
      baseColor: { r: 0, g: 0, b: 0, a: 1 },
      maxHeight: 100,
    },
    shelf_active: true,
    productId: -1,
    loading: false,

    menu: false,
    menu_x: 0,
    menu_y: 0,

    products: [],

    shelves: [],
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
      const asset = require("@/assets/no-disponible.png");
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
      console.log("available space", this.planogram.availableSpace);
      if (this.planogram.availableSpace > 40) {
        this.planogram.availableSpace =
          this.planogram.availableSpace - this.shelf_item.maxHeight;
        console.log("available space now", this.planogram.availableSpace);
        const obj = {
          color: this.shelf_item.baseColor,
          max_height: this.shelf_item.maxHeight,
        };
        this.shelves.push(obj);
      } else alert("No hay más espacio disponible.");
    },
  },
  created: async function () {
    this.loading = true;
    this.products = [];
    await this.$http
      .get("Simple")
      .then((res) => {
        if (res && res.data) {
          this.products = res.data.map(function (p) {
            return { text: p.nombre, value: p.id };
          });
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
.products__column {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 700px;
  border: 1px solid #eeeeee;
  overflow-y: scroll;
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