<template>
  <div id="__results-box" class="__result-box">
    <v-text-field
      v-model="searchItem.nombre"
      label="Buscar productos"
      maxlength="50"
      class="ma-3"
      style="margin-bottom: 16px"
      outlined
      clearable
      dense
      single-line
      :hide-details="true"
      @click:clear="products = []"
      @input="
        products = [];
        search();
      "
    >
    </v-text-field>
    <div id="__results" class="mx-3">
      <div v-for="(product, index) in products" :key="index">
        <!-- TODO: v-if="product.archivos", non-if for test -->
        <v-list-item style="background-color: #424242" class="my-1 py-2">
          <v-img
            :lazy-src="require('@/assets/no-disponible.jpg')"
            class="__product-img mr-3"
            alt=" "
            :contain="true"
            :aspect-ratio="1 / 1"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            style="border: 1px solid white"
            :src="
              product.archivos
                ? product.archivos[0].url
                : null || require('@/assets/no-disponible.jpg')
            "
          >
          </v-img>

          <v-list-item-content>
            <v-list-item-title>
              {{ product.nombre }} - $<strong>{{ product.precio }}</strong>
            </v-list-item-title>
            <v-list-item-subtitle>
              <strong>SKU</strong> {{ product.sku }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn
              depressed
              small
              @click="
                $emit(`itemSelected`, {
                  product: product.archivos[0],
                  pos: index,
                })
              "
            >
              Enviar a estante
              <v-icon small color="orange darken-4" class="ml-1" right>
                fas fa-external-link-alt
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </div>
    </div>
    <v-progress-circular
      v-if="loading"
      style="position: relative; z-index: 100; bottom: 0; left: 45%"
      :size="70"
      :width="7"
      color="primary"
      indeterminate
    ></v-progress-circular>
  </div>
</template>
<script>
export default {
  name: "ProductListInfiniteScroll",
  data: () => ({
    loading: false,
    page: 1,
    pages: 1,
    itemsPerPage: 10,
    totalRecords: 0,
    searchTimeout: null,
    menu: false,
    menu_x: 0,
    menu_y: 0,
    searchItem: {
      nombre: "",
    },
    defaultSearchItem: {
      nombre: "",
    },
    products: [],
    productBeingStored: {},
  }),
  watch: {},
  computed: {},
  methods: {
    showMenu(e, product, pos) {
      this.menu = false;
      this.menu_x = e.clientX;
      this.menu_y = e.clientY;
      this.productBeingStored = Object.assign({}, { ...product, index: pos });
      this.$nextTick(() => {
        this.menu = true;
      });
    },
    goToPage(value) {
      this.page = value;
      this.search();
    },
    previousPage() {
      this.page--;
      this.search();
    },
    nextPage() {
      this.page++;
      this.search();
    },
    async search() {
      clearTimeout(this.searchTimeout);
      let endpoint = `Articulos/Filtrados`;
      this.searchTimeout = setTimeout(() => {
        this.loading = true;
        this.$http
          .post(
            endpoint,
            { nombre: this.searchItem.nombre },
            {
              params: { pageNumber: this.page, pageSize: this.itemsPerPage },
            }
          )
          .then((res) => {
            if (res && res.data && res.data.list.length) {
              let array = res.data.list;
              let i = 0;
              let arr = array.length;
              for (i; i < arr; i++) {
                this.products.push(array[i]);
              }
              //this.products = res.data.list;
              this.pages = res.data.totalPages;
              this.totalRecords = res.data.totalRecords;
            }
          })
          .catch((err) => {
            console.log("error", err);
          })
          .finally(() => {
            this.loading = false;
          });
      }, 1250);
    },
    async initialize() {
      this.loading = true;
      this.products = [];
    },
  },
  mounted: function () {
    const listElm = document.querySelector("#__results-box");
    listElm.style.height = `${Math.ceil(window.innerHeight * 0.75)}px`;
    listElm.style.maxHeight = listElm.style.height;
    listElm.addEventListener("scroll", () => {
      if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight) {
        this.nextPage();
      }
    });
  },
};
</script>
<style scoped>
.__result-box {
  overflow: auto;
  width: 100%;
  background-color: #272727;
  padding-bottom: 16px;
}

.__result-item {
  height: 100px;
  border: 1px green solid;
}

.__product-img {
  position: relative;
  max-height: 50px;
  max-width: 50px;
  min-height: 50px;
  min-width: 50px;
}
</style>