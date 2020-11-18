<template>
  <div class="virtuals">
    <v-row>
      <v-col cols="12"> Configurar Planograma </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" sm="4" lg="2">
        <v-text-field
          v-model="planogram.width"
          label="Ancho (pixeles)"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
      <v-col cols="6" sm="4" lg="2">
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
      <v-col cols="6" sm="4" lg="2">
        <v-text-field
          v-model="planogram.padding_x"
          label="Separación horizontal (pixeles)"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
      <v-col cols="6" sm="4" lg="2">
        <v-text-field
          v-model="planogram.padding_y"
          label="Separación vertical (pixeles)"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" sm="4" lg="2">
        <v-text-field
          v-model="planogram.padding_x"
          label="Separación inicial (pixeles)"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
      <v-col cols="6" sm="4" lg="2">
        <v-text-field
          v-model="planogram.padding_y"
          label="Separación vertical (pixeles)"
          outlined
          clearable
          required
        ></v-text-field>
      </v-col>
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
    <div
      style="border: 1px solid red; background-color: gray; position: relative"
      :style="{ width: getPlanogramWidth, height: getPlanogramHeight }"
    >
      <vue-draggable-resizable
        :w="44"
        :h="44"
        :resizable="false"
        @dragging="onDrag"
        :lock-aspect-ratio="true"
        :grid="[10, 10]"
        :parent="true"
      >
        <p>
          Estante<br />
          X: {{ x }} / Y: {{ y }} - Width: {{ width }} / Height: {{ height }}
        </p>
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
    width: 44,
    height: 44,
    x: 0,
    y: 0,
    planogram: {
      width: 432,
      height: 768,
      padding_x: 0,
      padding_y: 0,
      grid: {
        main_x: 0,
        main_y: 0,
        shelves_x: 0,
        shelves_y: 0,
        piles_x: 0,
        piles_y: 0,
        products_x: 0,
        products_y: 0,
      },
      shelves: [
        {
          maxHeight: 155,
          piles: [
            {
              products: [
                {
                  total_x: 0,
                  total_y: 0,
                  data: [],
                },
              ],
            },
          ],
        },
      ],
    },
  }),
  computed: {
    getPlanogramWidth() {
      return `${this.planogram.width}px`;
    },
    getPlanogramHeight() {
      return `${this.planogram.height}px`;
    },
  },
  methods: {
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