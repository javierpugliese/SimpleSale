<template>
  <div class="file-types">
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
        :items="fileTypes"
        :loading="loading"
        :items-per-page="-1"
        loading-text="Cargando..."
        sort-by="nombre"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Tipos de Archivo</v-toolbar-title>
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
                  Nuevo Tipo de Archivo
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
                          label="Nombre del Tipo de Archivo"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="success" @click="save">
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline"
                  >¿Está seguro de que quiere eliminar este tipo de
                  pantalla?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete"
                    >Cancelar</v-btn
                  >
                  <v-btn color="blue darken-1" @click="deleteItemConfirm"
                    >Aceptar</v-btn
                  >
                  <v-spacer></v-spacer>
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
          <v-btn color="primary" @click="initialize">
            Recargar
          </v-btn>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "FileTypes",
  components: {},
  data: () => ({
    breadcrumbs: [
      {
        text: "Mantenimiento de Tablas",
        disabled: false,
        href: "/mantenimiento-de-tablas"
      },
      { text: "Tipos de Archivo", disabled: true }
    ],
    headers: [
      {
        text: "Nombre",
        align: "start",
        sortable: true,
        value: "nombre"
      },
      { text: "Acciones", value: "actions", align: "end", sortable: false }
    ],
    loading: false,
    fileTypes: [],

    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedItem: {
      nombre: ""
    },
    editedId: -1,
    defaultItem: {
      nombre: ""
    },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black"
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "Nuevo Tipo de Archivo"
        : "Editar Tipo de Archivo";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.fileTypes = [];
      this.loading = true;
      await this.$http
        .get("TipoArchivos")
        .then(res => {
          if (res && res.data) this.fileTypes = res.data;
        })
        .catch(err => console.log(err))
        .then(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.editedIndex = this.fileTypes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.fileTypes.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      await this.$http
        .delete(`TipoArchivos/${this.editedId}`, this.editedItem)
        .then(res => {
          if (res) {
            this.snackbarText = "Se eliminó el tipo de archivo exitosamente.";
            this.snackbarColor = "success";
            this.snackbar = true;
          }
        })
        .catch(err => {
          if (err) {
            console.log(err);
            this.snackbarText =
              "¡ERROR! No se pudo eliminar al tipo de archivo.";
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
        Object.assign(this.fileTypes[this.editedIndex], this.editedItem);
        await this.$http
          .put(`TipoArchivos/${this.editedId}`, this.editedItem)
          .then(res => {
            if (res) {
              this.snackbarText =
                "Se actualizó el tipo de archivo exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch(err => {
            if (err) {
              this.snackbarText =
                "¡ERROR! No se pudo guardar el tipo de archivo.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        await this.$http
          .post("TipoArchivos", this.editedItem)
          .then(res => {
            if (res) {
              this.snackbarText = "Se agregó el tipo de archivo exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch(err => {
            console.log(err);
            if (err) {
              this.snackbarText =
                "¡ERROR! No se pudo guardar el tipo de archivo.";
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
    }
  }
};
</script>