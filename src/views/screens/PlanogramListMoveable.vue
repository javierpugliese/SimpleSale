<template>
  <div id="PlanogramListMoveable">
    <Moveable
      class="moveable"
      v-bind="moveable"
      @drag="handleDrag"
      @resize="handleResize"
      @scale="handleScale"
      @rotate="handleRotate"
      @warp="handleWarp"
      @pinch="handlePinch"
      v-bind:width="`200`"
    >
      <span>Vue Moveable</span>
      <!-- <Moveable
        class="moveable"
        :draggable="true"
        @drag="handleDrag"
      >
        <span style="border: 1px solid red">Vue Nested</span>
      </Moveable> -->
    </Moveable>
  </div>
</template>
<script>
import Moveable from "vue-moveable";

export default {
  name: "PlanogramListMoveable",
  components: {
    Moveable,
  },
  data: () => ({
    moveable: {
      draggable: true,
      throttleDrag: 0,
      resizable: false,
      throttleResize: 1,
      keepRatio: false,
      scalable: true,
      throttleScale: 0,
      rotatable: true,
      throttleRotate: 0,
      pinchable: true, // ["draggable", "resizable", "scalable", "rotatable"]
      origin: false,
    },
  }),
  methods: {
    handleDrag({ target, transform }) {
      console.log("onDrag left, top", transform);
      target.style.transform = transform;
    },
    handleResize({ target, width, height, delta }) {
      console.log("onResize", width, height);
      //delta[0] && (target.style.width = `${width}px`);
      //delta[1] && (target.style.height = `${height}px`);
      delta[0] && (target.style.width = `${400}px`);
      delta[1] && (target.style.height = `${100}px`);
    },
    handleScale({ target, transform, scale }) {
      console.log("onScale scale", scale);
      target.style.transform = transform;
    },
    handleRotate({ target, dist, transform }) {
      console.log("onRotate", dist);
      target.style.transform = transform;
    },
    handleWarp({ target, transform }) {
      console.log("onWarp", transform);
      target.style.transform = transform;
    },
    handlePinch({ target }) {
      console.log("onPinch", target);
    },
  },
};
</script>