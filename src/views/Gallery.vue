<template>
  <div class="gallery">
    <v-toolbar :color="!multiSelect ? 'grey darken-4' : '#1F96A3'" dark>
      <v-scale-transition>
        <v-btn v-if="multiSelect" @click="multiSelect = false" icon>
          <v-icon>fas fa-times</v-icon>
        </v-btn>
      </v-scale-transition>
      <v-scroll-y-transition>
        <v-toolbar-title>
          {{
            selection.length ? `${selection.length} seleccionados` : "Galería"
          }}
        </v-toolbar-title>
      </v-scroll-y-transition>
      <v-spacer></v-spacer>
      <v-scale-transition>
        <v-btn
          v-if="!multiSelect"
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
          v-if="!multiSelect"
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#FFA440'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          @click="multiSelect = true"
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
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#F31E01'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          :disabled="loading || selection.length <= 0"
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
            class="ma-3"
            v-for="(n, index) in 50"
            :key="index"
            :width="fileWidth"
            :height="fileHeight"
            type="image"
          ></v-skeleton-loader>
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
          @click="editItem(file)"
        ></v-img>
      </v-col>
    </v-row>

    <v-dialog
      v-model="dialog"
      :max-width="`80vh`"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      hide-overlay
      scrollable
    >
      <!-- <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark class="my-3" v-bind="attrs" v-on="on" large>
          <v-icon class="mr-2">fas fa-plus</v-icon>
          Nuevo Fondo
        </v-btn>
      </template> -->
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-sheet class="pa-5" color="blue-grey darken-4">
            <v-row dense>
              <v-col cols="auto" class="mx-auto">
                <v-row dense>
                  <v-col cols="12">
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
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="auto" class="mx-auto">
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
                <div v-else-if="!editedIndex > 0">Ver original</div>
                <!-- <object
                  class="pr-auto d-flex"
                  :type="
                    editedItem.url.endsWith('.jpg')
                      ? 'image/jpg'
                      : editedItem.url.endsWith('.mp4')
                      ? 'video/mp4'
                      : ''
                  "
                  :data="
                    editedItem.urls || require('@/assets/navidad.mp4')
                  "
                  :width="bgWidth"
                  :height="bgHeight"
                >
                  <param name="wmode" value="transparent" />
                </object> -->
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
          >¿Está seguro de que quiere eliminar este archivo?</v-card-title
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete"
            >Cancelar</v-btn
          >
          <v-btn
            color="blue darken-1"
            @click="deleteItemConfirm"
            :loading="loading"
            >Aceptar</v-btn
          >
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
    loading: false,
    multiSelect: false,
    searchMode: false,
    search: "",
    selection: [],
    fileType: -1,
    backgrounds: [],
    file: null,
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
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  mounted() {
    this.initialize();
  },

  methods: {
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
              },
            })
            .then((res) => {
              if (res && res.data) {
                const data = res.data;
                this.backgrounds = data.filter((x) => x.size == "Small");
                console.log("backgrounds", this.backgrounds);
              }
            })
            .catch((error) => {
              console.log(error.toJSON());
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
      });
    },

    async save() {
      this.loading = true;
      if (this.editedIndex > -1 && this.editedId > -1) {
        Object.assign(this.backgrounds[this.editedIndex], this.editedItem);
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
        const postFormData = new FormData();
        postFormData.append("idTipo", +this.fileType);
        postFormData.append("small", true);
        postFormData.append("medium", true);
        postFormData.append("large", false);
        postFormData.append("file", this.file);

        await this.$http
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
          });
      }
      this.close();
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