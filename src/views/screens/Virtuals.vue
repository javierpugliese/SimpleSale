<template>
  <div class="virtuals">
    <v-row>
      <v-col cols="12"> Configurar Planograma </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="planogram.width"
          label="Ancho (pixeles)"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="planogram.height"
          label="Alto (pixeles)"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="grid.planogram.x"
          label="Grilla horizontal general"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="grid.planogram.y"
          label="Grilla vertical general"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
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
          v-model="shelf_item.baseHeight"
          label="Tamaño de la base (px)"
          outlined
          clearable
          required
        ></v-text-field>
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
    <!-- <div>
        <vue-draggable-resizable
          class-name="my-class"
          class-name-resizing="my-resizing-class"
          class-name-dragging="my-dragging-class"
          class-name-active="my-active-class"
          class-name-handle="my-handle-class"
          :draggable="true"
          :resizable="true"
        >
          <p>You can drag me around and resize me as you wish.</p>
          <div slot="tl">😀</div>
          <div slot="tm">😀</div>
          <div slot="tr">😀</div>
          <div slot="mr">😀</div>
          <div slot="br">😀</div>
          <div slot="bm">😀</div>
          <div slot="bl">😀</div>
          <div slot="ml">😀</div>
        </vue-draggable-resizable>
      </div> -->

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
        :draggable="true"
        :lock-aspect-ratio="true"
        :grid="[grid.planogram.x, grid.planogram.y]"
        :parent="true"
        class-name-dragging="shelf__dragging"
      >
        <div
          class="d-flex justify-content-center"
          :style="{ height: `${shelf.max_height}px` }"
        >
          <v-sheet
            class="align-self-end"
            :width="planogram.width"
            :height="shelf.height"
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
    },
    shelf_item: {
      baseHeight: 10,
      baseColor: { r: 0, g: 0, b: 0, a: 1 },
      maxHeight: 100,
    },
    shelves: [
      /* {
        baseHeight: 20,
        baseColor: "rgba(190,40,0, 0.9)",
        maxHeight: 100,
      },
      {
        baseHeight: 20,
        baseColor: "rgba(0,128,0, 1)",
        maxHeight: 80,
      },
      {
        baseHeight: 30,
        baseColor: "rgba(0,0,255, 0.6)",
        maxHeight: 100,
      }, */
    ],
  }),
  computed: {
    /* handleShelfColor: {
      get() {
        return this[this.shelf_item.baseColor];
      },
      set(v) {
        this[this.shelf_item.baseColor] = v;
      },
    }, */
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
      const obj = {
        color: this.shelf_item.baseColor,
        height: this.shelf_item.baseHeight,
        max_height: this.shelf_item.maxHeight,
      };
      this.shelves.push(obj);
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