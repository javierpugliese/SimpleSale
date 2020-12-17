<template>
  <div class="gallery">
    <v-toolbar :color="!multiSelect ? 'grey darken-4' : '#1F96A3'" dark>
      <v-scale-transition>
        <v-app-bar-nav-icon v-if="!multiSelect">
          <v-icon>fas fa-image</v-icon>
        </v-app-bar-nav-icon>
        <v-btn v-else-if="multiSelect" @click="multiSelect = false" icon>
          <v-icon>fas fa-times</v-icon>
        </v-btn>
      </v-scale-transition>
      <v-scroll-y-transition>
        <v-toolbar-title>
          {{ multiSelect ? `${selection.length} seleccionado(s)` : "Galería" }}
        </v-toolbar-title>
      </v-scroll-y-transition>
      <v-spacer></v-spacer>
      <v-scale-transition>
        <v-btn
          v-if="!multiSelect && !searchMode"
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#55AA99'"
          @click="dialog = true"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          :disabled="loading"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-cloud-upload-alt
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Nuevo Archivo" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-scale-transition>
        <v-btn
          v-if="!multiSelect && !searchMode"
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#FFA440'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          @click="
            selection = [];
            multiSelect = true;
          "
          class="mx-1"
          :disabled="loading"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-object-group
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Selección Múltiple" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-scale-transition>
        <v-btn
          v-if="multiSelect"
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#E85111'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          @click="selectAll"
          :disabled="loading"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-check-double
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Marcar todos" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-scale-transition>
        <v-btn
          v-if="multiSelect"
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#F31E01'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          :disabled="loading || selection.length <= 0"
          @click="dialogDelete = true"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-trash-alt
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Eliminar" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-expand-x-transition>
        <v-text-field
          v-show="searchMode"
          v-model="search"
          class="mt-auto mx-1"
          placeholder="Buscar"
          filled
          outlined
          clearable
          :disabled="loading"
        ></v-text-field>
      </v-expand-x-transition>
      <v-scale-transition>
        <v-btn
          class="mx-1"
          @click="searchMode = !searchMode"
          :icon="!searchMode"
          :fab="searchMode"
          :outlined="searchMode"
        >
          <v-icon>fas fa-search</v-icon>
        </v-btn>
      </v-scale-transition>
    </v-toolbar>

    <v-scale-transition>
      <v-snackbar v-model="snackbar" :color="snackbarColor" top right>
        {{ snackbarText }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>
    </v-scale-transition>

    <v-row dense>
      <v-col class="d-flex flex-row flex-wrap flex-grow-1">
        <div v-if="loading" class="d-flex flex-row flex-wrap flex-grow-1">
          <v-skeleton-loader
            class="mx-3 my-1"
            v-for="(n, index) in 50"
            :key="index"
            :width="fileWidth"
            :height="fileHeight"
            type="image"
          ></v-skeleton-loader>
        </div>
        <div
          class="d-flex justify-center ma-10"
          v-else-if="!loading && backgrounds.length <= 0"
          style="width: 100vw"
        >
          <v-sheet
            color="secondary"
            class="d-flex flex-column text-h6 text-center pa-5"
          >
            No hay resultados disponibles.
            <div class="d-flex justify-center flex-row mt-3">
              <v-btn class="mx-1" color="info" @click="previousPage">
                <v-icon>fas fa-angle-left</v-icon></v-btn
              >
              <v-btn class="mx-1" color="primary" @click="initialize">
                <v-icon>fas fa-refresh</v-icon> Recargar</v-btn
              >
              <v-btn class="mx-1" color="info" @click="nextPage">
                <v-icon>fas fa-angle-right</v-icon></v-btn
              >
            </div>
          </v-sheet>
        </div>
        <v-img
          v-else
          v-for="file in backgrounds"
          :key="`background-${file.id}`"
          class="ma-3 background"
          :src="file.url || require('@/assets/no-disponible.jpg')"
          :height="fileHeight"
          :width="fileWidth"
          :max-height="fileHeight"
          :max-width="fileWidth"
          @click="multiSelect ? undefined : editItem(file)"
          style="position: relative; z-index: 0"
        >
          <v-checkbox
            v-show="multiSelect"
            v-model="selection"
            color="whitesmoke"
            label=""
            :value="file.idArchivoOriginal"
            style="position: absolute; z-index: 1; top: 0; right: 0"
          ></v-checkbox>
        </v-img>
      </v-col>
      <v-col cols="12" style="position: fixed; bottom: 0">
        <v-pagination
          v-model="page"
          :length="pages"
          :total-visible="7"
          @input="goToPage"
        ></v-pagination>
      </v-col>
    </v-row>

    <v-dialog
      v-model="dialog"
      :max-width="`80vh`"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      hide-overlay
      scrollable
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-sheet class="pa-5" color="blue-grey darken-4">
            <v-row dense>
              <v-col cols="12" class="mx-auto">
                <v-row dense>
                  <v-col cols="12" v-if="editedIndex > -1">
                    <v-text-field
                      v-model="editedItem.nombre"
                      label="Nombre"
                      counter="50"
                      maxlength="50"
                      outlined
                      clearable
                      required
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-file-input
                      v-if="editedIndex > -1"
                      v-model="file"
                      counter
                      label="Archivo (imagen o video)"
                      accept=".jpg, .mp4"
                      placeholder="Seleccione archivos..."
                      prepend-icon=""
                      outlined
                      :show-size="1000"
                      @change="onFileUpload"
                    >
                      <template v-slot:selection="{ index, text }">
                        <v-chip v-if="index < 2" color="info" dark label small>
                          {{ text }}
                        </v-chip>
                      </template>
                    </v-file-input>
                    <v-file-input
                      v-else
                      v-model="files"
                      counter
                      label="Archivos (imagenes o videos)"
                      accept=".jpg, .mp4"
                      placeholder="Examinar..."
                      prepend-icon=""
                      outlined
                      multiple
                      :show-size="1000"
                    >
                      <template v-slot:selection="{ index, text }">
                        <v-chip v-if="index < 2" color="info" dark label small>
                          {{ text }}
                        </v-chip>

                        <span
                          v-else-if="index === 2"
                          class="overline text--darken-3 mx-2"
                        >
                          +{{ files.length - 2 }} Archivo(s)
                        </span>
                      </template>
                    </v-file-input>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" class="mx-auto" v-if="editedIndex > -1">
                <v-img
                  v-if="editedIndex > -1 && editedItem.url.endsWith('.jpg')"
                  :src="editedItem.url"
                  :lazy-src="require('@/assets/no-disponible.jpg')"
                  :aspect-ratio="16 / 9"
                  :width="bgWidth"
                  :height="bgHeight"
                  class="grey lighten-2"
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="info"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
                <div v-else-if="!editedIndex > 0">
                  <v-btn @click="alert('Ver original')" icon>
                    <v-icon>fas fa-paperclip</v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-sheet>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" text @click="close"> Cancelar </v-btn>
          <v-btn
            color="red"
            text
            @click="deleteItem"
            v-if="editedIndex > -1"
            :disabled="loading"
          >
            Eliminar
          </v-btn>
          <v-btn
            color="success"
            @click="save"
            :loading="loading"
            :disabled="loading"
          >
            <v-icon class="mr-2"> fas fa-save </v-icon>
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="headline"
          >¿Está seguro de que quiere eliminar este/os archivo/s?</v-card-title
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete"
            >Cancelar</v-btn
          >
          <v-btn
            color="blue darken-1"
            @click="multiSelect ? deleteItems() : deleteItemConfirm()"
            :loading="loading"
          >
            Aceptar
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Gallery",
  components: {},
  data: () => ({
    page: 1,
    pages: 1,
    pageSize: 10,
    totalRecords: 0,
    loading: false,
    multiSelect: false,
    searchMode: false,
    search: "",
    selection: [],
    fileType: -1,
    backgrounds: [],
    file: null,
    files: [],
    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedId: -1,
    editedItem: {
      nombre: "",
      size: "",
      url: "",
      idArchivoOriginal: -1,
      creado: null,
      modificado: null,
      eliminado: false,
    },
    defaultItem: {
      nombre: "",
      size: "",
      url: "",
      idArchivoOriginal: -1,
      creado: null,
      modificado: null,
      eliminado: false,
    },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Fondo" : "Editar Fondo";
    },
    fileWidth() {
      return 135;
    },
    fileHeight() {
      return 240;
    },
    bgHeight() {
      return Math.ceil(window.innerHeight * 0.65);
    },
    bgWidth() {
      return Math.ceil((this.bgHeight / 16) * 9);
    },
    modalWidth() {
      return Math.ceil(window.innerWidth / 0.8);
    },
  },

  watch: {
    page(val) {
      console.log(val);
    },
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    backgrounds(val) {
      console.log("backgrounds", val);
    },
  },

  mounted() {
    this.initialize();
  },

  methods: {
    goToPage(value) {
      this.page = value;
      this.initialize();
    },
    previousPage() {
      this.page--;
      this.initialize();
    },
    nextPage() {
      this.page++;
      this.initialize();
    },
    selectAll() {
      this.selection = [];
      this.selection = [...this.backgrounds.map((bg) => +bg.idArchivoOriginal)];
    },
    onFileUpload(file) {
      this.file = file;
    },
    async initialize() {
      this.fileType = -1;
      this.backgrounds = [];
      this.loading = true;

      const fileType = await this.$http.get("TipoArchivos/nombre/Fondo");
      if (fileType && fileType.data) {
        this.fileType = fileType.data[0].id;
        if (this.fileType > 0) {
          await this.$http
            .get(`Archivos/Tipo/`, {
              params: {
                idTipo: +this.fileType,
                pageNumber: this.page,
                pageSize: this.pageSize,
              },
            })
            .then((res) => {
              if (res && res.data) {
                const data = res.data.list;
                this.pages = res.data.totalPages;
                this.backgrounds = data.map(function (m) {
                  for (let x of m.miniaturas) if (x.size === "Small") return x;
                });
              }
            })
            .catch((error) => {
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
              }
              console.log(error.config);
            });
        }
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.backgrounds.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.dialog = true;
    },

    deleteItem() {
      /* this.editedIndex = this.backgrounds.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1; */
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      await this.$http
        .delete(`Archivos/${this.editedId}`, this.editedItem)
        .then((res) => {
          if (res) {
            this.snackbarText = "Se eliminó el fondo exitosamente.";
            this.snackbarColor = "success";
            this.snackbar = true;
          }
        })
        .catch((err) => {
          if (err) {
            console.log(err);
            this.snackbarText = "¡ERROR! No se pudo eliminar el fondo.";
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

    async deleteItems() {
      let i = 0,
        promises = [];
      let arr = this.selection.length;
      if (arr) {
        for (i; i < arr; i++) {
          let prom = this.$http.delete(`Archivos/${this.selection[i]}`);
          promises.push(prom);
        }
        if (promises.length) {
          this.loading = true;
          this.closeDelete();
          this.selection = [];
          this.multiSelect = false;
          await this.$http
            .all(promises)
            .then(
              this.$http.spread((...responses) => {
                let i = 0;
                let res = responses.length;
                for (i; i < res; i++) {
                  console.log(res[i]);
                }
              })
            )
            .catch((errors) => console.log(errors))
            .finally(() => {
              this.loading = false;
            });
          this.initialize();
        }
      }
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
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.files = [];
        this.file = null;
      });
    },

    async save() {
      if (this.editedIndex > -1 && this.editedId > -1) {
        Object.assign(this.backgrounds[this.editedIndex], this.editedItem);
        this.loading = true;
        await this.$http
          .put(`Articulos/${this.editedId}`, this.editedItem)
          .then((res) => {
            if (res) {
              this.snackbarText = "Se actualizó el fondo exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el fondo.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        let postFormData;
        let f = 0,
          promises = [];
        let files = this.files.length;
        if (files) {
          for (f; f < files; f++) {
            postFormData = new FormData();
            postFormData.append("idTipo", +this.fileType);
            postFormData.append("small", true);
            postFormData.append("medium", true);
            postFormData.append("large", false);
            postFormData.append("descripcion", "any");
            postFormData.append("file", this.files[f]);
            promises.push(this.$http.post("Archivos", postFormData));
          }

          if (promises.length) {
            this.loading = true;
            this.close();
            await this.$http
              .all(promises)
              .then(
                this.$http.spread((...responses) => {
                  let i = 0;
                  let res = responses.length;
                  for (i; i < res; i++) {
                    console.log(res[i]);
                  }
                })
              )
              .catch((errors) => console.log(errors))
              .finally(() => {
                this.loading = false;
              });
          }
        }

        /*  await this.$http
          .post("Archivos", postFormData)
          .then((res) => {
            if (res) {
              this.snackbarText = "Se agregó el fondo exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            console.log(err);
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el fondo.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .then(() => {
            this.loading = false;
          }); */
      }
      this.initialize();
    },
  },
};
</script>
<style scoped>
.background:hover {
  cursor: pointer;
}
</style>