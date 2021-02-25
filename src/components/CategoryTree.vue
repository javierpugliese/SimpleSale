<template>
  <v-treeview
    v-model="selection"
    :items="categories"
    selectable
    selection-type="independent"
    hoverable
    return-object
    open-all
  ></v-treeview>
</template>

<script>
export default {
  name: "CategoryTree",
  data: () => ({
    selection: [],
    categories: [],
  }),
  watch: {
    selection(val) {
      console.log("selection", val);
      this.$emit("onSelected", val);
    },
    categories(val) {
      console.log("categories", val);
    },
  },
  computed: {},
  methods: {
    recursion(array, key) {
      if (array.length && typeof key === "string") {
        let r = 0;
        let arr = array.length;
        let tree = [];
        for (r; r < arr; r++) {
          if (array[r][key]) {
            const treeObject = Object.assign(
              {},
              { id: array[r].id, name: array[r].nombre }
            );
            treeObject.children = this.recursion(array[r].subcategorias, key);
            tree.push(treeObject);
          } else continue;
        }
        return tree;
      }
    },
    async initialize() {
      this.loading = true;
      this.selection = [];
      this.categories = [];

      await this.$http
        .get("CategoriasArticulo")
        .then((res) => {
          if (res && res.data && res.data.length) {
            let filteredData = res.data.filter((c) => c.idCategoriaPadre <= 0);
            console.log("filteredData", filteredData);
            this.categories = this.recursion(filteredData, "subcategorias");
          }
        })
        .catch((err) => {
          console.log("error", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted: function () {
    this.initialize();
  },
};
</script>

<style scoped>
</style>