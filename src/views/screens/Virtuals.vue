<template>
  <div class="virtuals">
    <v-row>
      <v-col cols="12" md="2">
        <div class="d-flex flex-column px-5" style="height: 100%">
          <v-img
            :src="require('@/assets/no-disponible.png')"
            :contain="true"
            class="my-2"
            height="128"
            max-height="128"
            width="128"
            max-width="128"
          ></v-img>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <!-- Planograma -->
        <div
          :style="{
            position: 'relative',
            width: getPlanogramWidth,
            height: getPlanogramHeight,
            background: grid.planogram.show
              ? `linear-gradient(-90deg, #000 0.1px, transparent 0.6px)
              repeat scroll 0% 0% / ${grid.planogram.x}px ${grid.planogram.x}px, 
              white linear-gradient(#000 0.1px, transparent 0.6px)
              repeat scroll 0% 0% / ${grid.planogram.y}px ${grid.planogram.y}px`
              : 'none',
            'z-index': 100,
          }"
        >
          <!-- Aca va un for de los estantes -->
          <vue-draggable-resizable
            v-for="(shelf, index) in shelves"
            v-bind:key="`shelf-${index}`"
            :w="planogram.width"
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
              <!-- Aca va un for de los estantes -->
              <vue-draggable-resizable
                v-for="(product, index) in 4"
                v-bind:key="`product-${index}`"
                :w="40"
                :h="40"
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
                :width="planogram.width"
                :height="defaultShelfHeight"
                :color="getRGBA(shelf.color)"
                >{{ index + 1 }}</v-sheet
              >
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
      <v-col cols="12" md="4">
        <v-row>
          <v-col cols="12" sm="4">
            <v-switch
              v-model="grid.planogram.show"
              label="Mostrar grilla general"
              outlined
              clearable
              required
            ></v-switch>
          </v-col>
        </v-row>
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
      width: 400,
      height: 700,
      availableSpace: 700,
    },
    shelf_item: {
      baseColor: { r: 0, g: 0, b: 0, a: 1 },
      maxHeight: 100,
    },
    shelf_active: true,
    shelves: [],
  }),
  computed: {
    defaultShelfHeight() {
      return (this.planogram.height / 100) * 0.8;
    },
    getPlanogramWidth() {
      return `${this.planogram.width}px`;
    },
    getPlanogramHeight() {
      return `${this.planogram.height}px`;
    },
  },
  methods: {
    getRGBA(rgba) {
      const color = rgba;
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    },
    handleImage: function (path) {
      console.log("path", path);

      const asset = require("@/assets/no-disponible.png");
      const image = new Image();
      image.src = asset;
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
  mounted: function () {
    this.handleImage();
  },
};
</script>
<style>
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