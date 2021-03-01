<template>
  <div class="categories">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet color="secondary">
            <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
          </v-sheet>
        </v-col>
      </v-row>

      <v-snackbar v-model="snackbar" :color="snackbarColor" top right>
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>

      <v-data-table
        :headers="headers"
        :items="categories"
        :loading="loading"
        :items-per-page="-1"
        :expanded.sync="expanded"
        show-expand
        loading-text="Cargando..."
        sort-by="nombre"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Categorías</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Nueva Categoría
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="editedItem.nombre"
                          label="Nombre de la Categoría"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-autocomplete
                          v-model="editedItem.idCategoriaPadre"
                          :items="filteredParentCategories"
                          label="Categoría Padre"
                          maxlength="50"
                          clearable
                          outlined
                          small-chips
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="success" @click="save"> Guardar </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">
                  ¿Está seguro de que quiere eliminar esta categoría?
                </v-card-title>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" @click="deleteItemConfirm">
                    Aceptar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" color="orange" @click="editItem(item)">
            fas fa-pencil-alt
          </v-icon>
          <v-icon small @click="deleteItem(item)" color="red">
            fas fa-trash-alt
          </v-icon>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize"> Recargar </v-btn>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <v-treeview
              :items="item.subcategorias"
              item-text="nombre"
              item-children="subcategorias"
              hoverable
            ></v-treeview>
          </td>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Categories",
  components: {},
  data: () => ({
    breadcrumbs: [
      {
        text: "Mantenimiento de Tablas",
        disabled: true,
      },
      { text: "Categorías", disabled: true },
    ],
    headers: [
      {
        text: "Nombre",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      { text: "Acciones", value: "actions", align: "end", sortable: false },
    ],
    loading: false,
    categories: [],
    parentCategories: [],
    filteredParentCategories: [],

    expanded: [],
    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedItem: {
      nombre: "",
      idCategoriaPadre: -1,
    },
    editedId: -1,
    defaultItem: {
      nombre: "",
      idCategoriaPadre: -1,
    },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva Categoría" : "Editar Categoría";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.categories = [];
      this.loading = true;
      await this.$http
        .get("CategoriasArticulo")
        .then((res) => {
          if (res && res.data) {
            this.categories = res.data;
            this.parentCategories = res.data.map((pc) => ({
              text: pc.nombre,
              value: pc.id,
            }));
          }
        })
        .catch((err) => console.log(err))
        .then(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.editedIndex = this.categories.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.filteredParentCategories = this.parentCategories;
      this.filteredParentCategories = this.filteredParentCategories.filter(
        (x) => x.value !== this.editedId
      );
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.categories.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      await this.$http
        .delete(`CategoriasArticulo/${this.editedId}`, this.editedItem)
        .then((res) => {
          if (res) {
            this.snackbarText = "Operación realizada exitosamente.";
            this.snackbarColor = "success";
            this.snackbar = true;
          }
        })
        .catch((err) => {
          if (err) {
            console.log(err);
            this.snackbarText = "¡ERROR! Operación cancelada.";
            this.snackbarColor = "danger";
            this.snackbar = true;
          }
        })
        .finally(() => {
          this.loading = false;
        });
      this.closeDelete();
      this.initialize();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
      });
    },

    async save() {
      this.loading = true;
      if (this.editedIndex > -1 && this.editedId > -1) {
        Object.assign(this.categories[this.editedIndex], this.editedItem);
        const data = { nombre: this.editedItem.nombre };
        if (this.editedItem.idCategoriaPadre > 0)
          data.idCategoriaPadre = this.editedItem.idCategoriaPadre;

        await this.$http
          .put(`CategoriasArticulo/${this.editedId}`, data)
          .then((res) => {
            if (res) {
              this.snackbarText = "Operación realizada exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            if (err) {
              this.snackbarText = "¡ERROR! Operación cancelada.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        const data = { nombre: this.editedItem.nombre };
        if (this.editedItem.idCategoriaPadre > 0)
          data.idCategoriaPadre = this.editedItem.idCategoriaPadre;
        await this.$http
          .post("CategoriasArticulo", data)
          .then((res) => {
            if (res) {
              this.snackbarText = "Operación realizada exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            console.log(err);
            if (err) {
              this.snackbarText = "¡ERROR! Operación cancelada.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .then(() => {
            this.loading = false;
          });
      }
      this.close();
      this.initialize();
    },
  },
};
</script>