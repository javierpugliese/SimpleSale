<template>
  <vdr
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
    @dragging="getProportionalHeight"
  >
  </vdr>
</template>
<script>
export default {
  name: "v-drr",
  props: {
    // Initial width
    w: {
      type: Number,
      required: true,
    },
    // Initial height
    h: {
      type: Number,
      required: true,
    },
    // Minimal width
    minWidth: {
      type: Number,
      required: false,
      default: 0,
    },
    // Minimal height
    minHeight: {
      type: Number,
      required: false,
      default: 0,
    },
    // Maximum width
    maxWidth: {
      type: Number,
      required: false,
      default: 0,
    },
    // Maximum height
    maxHeight: {
      type: Number,
      required: false,
      default: 0,
    },
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    preventDeactivation: {
      type: Boolean,
      required: false,
      default: false,
    },
    draggable: {
      type: Boolean,
      required: false,
      default: true,
    },
    resizable: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableNativeDrag: {
      type: Boolean,
      required: false,
      default: false,
    },
    dragHandle: {
      type: String,
      required: false,
      default: "drag-handle",
    },
    dragCancel: {
      type: String,
      required: false,
      default: "drag-cancel",
    },
    zIndex: {
      type: Number,
      required: false,
      default: 0,
    },
    handles: {
      type: Array,
      required: false,
      default: ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"],
    },
    // x, y, both
    axis: {
      type: String,
      required: false,
      default: "both",
    },
    grid: {
      type: Array,
      required: false,
      default: [1, 1],
    },
    x: {
      type: Number,
      required: false,
      default: 0,
    },
    y: {
      type: Number,
      required: false,
      default: 0,
    },
    // Cannot be dragged or resized outside its parent element
    parent: {
      type: Boolean,
      required: false,
      default: false,
    },
    disableUserSelect: {
      type: Boolean,
      required: false,
      default: true,
    },
    lockAspectRatio: {
      type: Boolean,
      required: false,
      default: false,
    },
    className: {
      type: String,
      required: false,
      default: "my-class",
    },
    classNameDragging: {
      type: String,
      required: false,
      default: "my-dragging-class",
    },
    classNameResizing: {
      type: String,
      required: false,
      default: "my-resizing-class",
    },
    classNameActive: {
      type: String,
      required: false,
      default: "my-active-class",
    },
    classNameHandle: {
      type: String,
      required: false,
      default: "my-handle-class",
    },
    // Enable conflict detection
    isConflictCheck: {
      type: Boolean,
      required: false,
      default: false,
    },
    // Enable element alignment
    snap: {
      type: Boolean,
      required: false,
      default: false,
    },
    // Alignment distance between the component and the element, in pixels (px)
    snapTolerance: {
      type: Number,
      required: false,
      default: 5,
    },
  },
  data: () => {},
  watch: () => {},
  computed: () => {},
  methods: () => {
    /* getChildRelativeCoords(childElem, parentElem){
      let parentPos = document.getElementById(`${childElem}`).getBoundingClientRect();
    let childPos = document.getElementById(`${parentElem}`).getBoundingClientRect();
    let relativePos = {};

    relativePos.top = childPos.top - parentPos.top
    relativePos.right = childPos.right - parentPos.right
    relativePos.bottom = childPos.bottom - parentPos.bottom
    relativePos.left = childPos.left - parentPos.left

    console.log(relativePos);
    } */
  },
  created: () => {},
  mounted: () => {},
};
</script>
<style scoped>
.my-class {
  background-color: green;
  border: 1px solid red;
  -webkit-transition: background-color 200ms linear;
  -ms-transition: background-color 200ms linear;
  transition: background-color 200ms linear;
}

.my-dragging-class {
  cursor: move;
}

/* Fixes class dragging*/
.my-dragging-class:hover {
  cursor: move;
}

/* Old my-dragging-class */
/* .my-dragging-class {
  background-color: red;
  border: 1px solid black;
} */

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