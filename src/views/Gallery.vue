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
          {{
            multiSelect
              ? `${selection.length} seleccionado(s)`
              : "Galería de Fondos de Pantalla"
          }}
        </v-toolbar-title>
      </v-scroll-y-transition>
      <v-spacer></v-spacer>
      <v-scale-transition v-if="!multiSelect">
        <v-dialog
          v-model="dialogSearch"
          width="50%"
          overlay-color="blue"
          overlay-opacity="0.2"
          scrollable
          persistent
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="secondary"
              dark
              class="mx-2"
              v-bind="attrs"
              v-on="on"
              :loading="loading"
            >
              <v-icon class="mr-2">fas fa-search</v-icon>
              Buscar
            </v-btn>
          </template>
          <v-card height="auto">
            <v-card-title>
              <span class="headline">Opciones de búsqueda</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="searchItem.nombre"
                      label="Nombre"
                      counter="50"
                      maxlength="50"
                      outlined
                      clearable
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-autocomplete
                      v-model="searchItem.idTipo"
                      :items="fileTypes"
                      label="Tipo de archivo"
                      maxlength="50"
                      clearable
                      outlined
                      small-chips
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-dialog
                      ref="dialog"
                      v-model="dialogDates"
                      :return-value.sync="searchDates"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          :value="computedDateFormattedMomentjs"
                          clearable
                          label="Rango de Fechas"
                          readonly
                          prepend-icon="fas fa-calendar-alt"
                          no-title
                          outlined
                          v-bind="attrs"
                          v-on="on"
                          @click:clear="searchDates = []"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="searchDates" scrollable range>
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="primary"
                          @click="dialogDates = false"
                        >
                          Cancelar
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.dialog.save(searchDates)"
                        >
                          Aceptar
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="info" text large @click="dialogSearch = false">
                Cerrar
              </v-btn>
              <v-btn
                color="success"
                large
                @click="dialogSearch = false"
                :disabled="loading"
              >
                Aplicar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-scale-transition>
      <v-scale-transition v-if="!multiSelect">
        <v-btn
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#55AA99'"
          @click="dialog = true"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          :disabled="loading"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-cloud-upload-alt
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Subir archivo" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-scale-transition v-if="!multiSelect">
        <v-btn
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#FFA440'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          @click="
            selection = [];
            multiSelect = true;
          "
          class="mx-1"
          :disabled="loading || !backgrounds.length"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-object-group
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Selección Múltiple" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-scale-transition v-if="multiSelect">
        <v-btn
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
      <v-scale-transition v-if="multiSelect">
        <v-btn
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
    </v-toolbar>

    <!-- Snackbar http status messages -->
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

    <!-- Snackbar for file upload progress -->
    <v-scale-transition>
      <v-snackbar
        v-model="uploading"
        color="#333333"
        :timeout="-1"
        :multi-line="true"
        top
        right
      >
        <p class="text-button text-center">Subiendo archivo(s)...</p>
        <v-progress-linear
          v-model="fileTotalProgress"
          height="50"
          color="#55AA99"
        >
          <div class="d-flex flex-column justify-center my-3">
            <strong class="text-overline">
              {{ fileName.length > 40 ? truncateString(fileName) : fileName }}
            </strong>
            <strong class="text-center">
              {{ Math.ceil(fileTotalProgress) }}%
            </strong>
          </div>
        </v-progress-linear>
      </v-snackbar>
    </v-scale-transition>

    <!-- Dialog for file upload alert -->
    <v-dialog
      v-model="dialogUploading"
      width="50%"
      overlay-color="blue"
      overlay-opacity="0.2"
      scrollable
      persistent
    >
      <v-card height="auto">
        <v-card-title>
          <span class="headline">Subiendo archivos</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <div class="text-h3 text-center mb-3">
                  No cierre esta ventana o el navegador.
                </div>
                <v-progress-linear
                  striped
                  indeterminate
                  color="info"
                ></v-progress-linear>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" text large @click="dialogUploading = false">
            Entendido
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row dense>
      <v-col class="d-flex flex-row flex-wrap flex-grow-1 mb-16">
        <div v-if="loading" class="d-flex flex-row flex-wrap flex-grow-1">
          <v-skeleton-loader
            class="mx-3 my-1"
            v-for="(n, index) in 50"
            :key="index"
            :width="135"
            :height="240"
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
            <p class="text-overline">
              No hay resultados disponibles ó la página seleccionada no existe.
            </p>
            <v-btn
              large
              class="mx-1"
              color="primary"
              @click="
                {
                  (page = 1), initialize();
                }
              "
            >
              <v-icon class="mr-3">fas fa-sync-alt</v-icon>
              Recargar
            </v-btn>
          </v-sheet>
        </div>
        <v-img
          v-else
          v-for="file in backgrounds"
          :key="`background-${file.id}`"
          class="ma-3 background"
          :lazy-src="require('@/assets/no-disponible.jpg')"
          :src="file.url || require('@/assets/no-disponible.jpg')"
          :height="240"
          :width="135"
          :max-height="240"
          :max-width="135"
          @click="multiSelect ? undefined : editItem(file)"
          style="position: relative; z-index: 0"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular
                indeterminate
                color="info"
              ></v-progress-circular>
            </v-row>
          </template>

          <v-checkbox
            v-show="multiSelect"
            v-model="selection"
            color="whitesmoke"
            label=""
            :value="file.id"
            style="position: absolute; z-index: 1; top: 0; right: 0"
          ></v-checkbox>
        </v-img>
      </v-col>
      <v-col cols="12" class="__pagination">
        <v-row
          class="pa-2"
          no-gutters
          dense
          style="border-top: 1px solid #343434"
        >
          <v-col cols="12" sm="4" class="d-flex justify-start align-center">
            <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageItems"
              filled
              outlined
              label="Fondos por página"
              :hide-details="true"
              :loading="loading"
              :disabled="loading"
              @change="page = 1"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex justify-center align-center">
            <v-pagination
              v-model="page"
              :length="pages"
              :total-visible="7"
              @input="goToPage"
              elevation="3"
              color="#343434"
            ></v-pagination>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex justify-end align-center">
            <p
              v-show="!loading && backgrounds.length"
              class="text-overline text-dark my-auto pr-3"
            >
              {{
                itemsPerPage > totalRecords
                  ? `Mostrando ${totalRecords} resultados.`
                  : `Mostrando ${itemsPerPage} de ${totalRecords} resultados.`
              }}
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog
      v-model="dialog"
      width="40%"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      :hide-overlay="$vuetify.breakpoint.xsOnly"
      scrollable
      overlay-color="blue"
      overlay-opacity="0.2"
      persistent
    >
      <v-card height="auto">
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-sheet class="pa-5" color="blue-grey darken-4">
            <v-row dense>
              <v-col cols="12">
                <v-alert
                  v-model="fileUploadDetailsAlert"
                  class="text-caption py-1 px-5"
                  outlined
                  type="warning"
                  prominent
                  dismissible
                  border="left"
                  style="text-align: justify; text-justify: inter-word"
                >
                  <p class="text-overline">
                    - Imagenes 4k verticales (2160x3840), máximo 10MB (cada
                    individual), en formato JPG.
                  </p>
                  <p class="text-overline">
                    - Videos en formato MP4, máximo 250MB.
                  </p>
                  <p class="text-overline">- Máximo 10 archivos.</p>
                </v-alert>
              </v-col>
              <v-col :cols="editedIndex > -1 ? 8 : 12" class="d-flex">
                <v-row dense>
                  <v-col cols="12" v-if="editedIndex > -1">
                    <v-text-field
                      v-model="editedItem.nombre"
                      label="Nombre"
                      counter="50"
                      maxlength="50"
                      class="my-auto"
                      outlined
                      clearable
                      required
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" class="align-self-end">
                    <v-alert
                      v-if="fileAlerts.length"
                      outlined
                      type="error"
                      prominent
                      border="left"
                    >
                      <div
                        class="my-1"
                        v-for="(alert, index) in fileAlerts"
                        :key="index"
                      >
                        - {{ alert }}
                      </div>
                    </v-alert>
                    <v-alert
                      v-if="videoAlerts.length"
                      outlined
                      type="error"
                      prominent
                      border="left"
                    >
                      <div
                        class="my-1"
                        v-for="(alert, index) in videoAlerts"
                        :key="index"
                      >
                        - {{ alert }}
                      </div>
                    </v-alert>
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
                    <div v-else>
                      <!-- Image files -->
                      <v-file-input
                        v-model="files"
                        counter
                        label="Archivos (imagenes)"
                        accept=".jpg"
                        prepend-icon=""
                        outlined
                        multiple
                        @change="onFileUploadMultiple"
                        :disabled="loading || uploading"
                        :show-size="1000"
                      >
                        <template v-slot:selection="{ index, text }">
                          <v-chip
                            v-if="index < 2"
                            color="info"
                            dark
                            label
                            small
                          >
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

                      <!-- Preview before upload -->
                      <div
                        class="d-flex flex-wrap justify-start"
                        style="align-items: flex-start"
                      >
                        <v-img
                          v-for="(i, index) in filesURLs"
                          :key="index"
                          :src="i || require('@/assets/no-disponible.jpg')"
                          alt=" "
                          :contain="true"
                          class="white--text ma-2 __background-small"
                          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                        >
                          <v-btn
                            icon
                            large
                            style="position: absolute; top: 0; right: 0"
                            :disabled="loading || uploading"
                            @click="removeFile(index)"
                          >
                            <v-icon color="red"> fas fa-times </v-icon>
                          </v-btn>
                        </v-img>
                      </div>

                      <!-- Video files -->
                      <v-file-input
                        v-model="videoFiles"
                        counter
                        label="Archivos (videos)"
                        accept=".mp4"
                        prepend-icon=""
                        outlined
                        multiple
                        @change="onVideoUploadMultiple"
                        :disabled="loading || uploading"
                        :show-size="1000"
                      >
                        <template v-slot:selection="{ index, text }">
                          <v-chip
                            v-if="index < 2"
                            color="info"
                            dark
                            label
                            small
                          >
                            {{ text }}
                          </v-chip>

                          <span
                            v-else-if="index === 2"
                            class="overline text--darken-3 mx-2"
                          >
                            +{{ videoFiles.length - 2 }} Archivo(s)
                          </span>
                        </template>
                      </v-file-input>

                      <!-- Preview videos before upload -->
                      <!-- <div
                        class="d-flex flex-wrap justify-start"
                        style="align-items: flex-start"
                      >
                        <v-img
                          v-for="(i, index) in videoURLs"
                          :key="index"
                          :src="i || require('@/assets/no-disponible.jpg')"
                          alt=" "
                          :contain="true"
                          class="white--text ma-2 __background-small"
                          gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                        >
                          <v-btn
                            icon
                            large
                            style="position: absolute; top: 0; right: 0"
                            :disabled="loading || uploading"
                            @click="removeVideoFile(index)"
                          >
                            <v-icon color="red"> fas fa-times </v-icon>
                          </v-btn>
                        </v-img>
                      </div> -->
                    </div>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4" v-if="editedIndex > -1">
                <v-img
                  v-if="editedIndex > -1 && editedItem.url.endsWith('.jpg')"
                  :src="fileURL || `${editedItem.url}?${new Date()}`"
                  :lazy-src="require('@/assets/no-disponible.jpg')"
                  :aspect-ratio="16 / 9"
                  class="d-block mx-auto grey lighten-2 __background-medium"
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
                <!-- Show video here #######TODO -->
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
          <v-btn
            color="info"
            text
            @click="close"
            :disabled="loading || uploading"
          >
            Cerrar
          </v-btn>
          <v-btn
            color="red"
            text
            @click="dialogDelete = true"
            v-if="editedIndex > -1"
            :disabled="loading"
          >
            Eliminar
          </v-btn>
          <v-btn
            color="success"
            @click="save"
            :loading="loading"
            :disabled="
              loading ||
              (editedIndex > -1 && !file) ||
              (editedIndex < 0 && !files.length && !videoFiles.length)
            "
          >
            <v-icon class="mr-2"> fas fa-save </v-icon>
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="headline">
          ¿Eliminar este(os) archivo(s)?
        </v-card-title>
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
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from "moment";
window.onbeforeunload = () => {
  return "Asegúrese de que los archivos hayan terminado de cargarse antes de cerrar esta ventana.";
};
// @ is an alias to /src
export default {
  name: "Gallery",
  components: {},
  data: () => ({
    page: 1,
    pages: 1,
    itemsPerPage: 5,
    totalRecords: 0,
    loading: false,
    uploading: false,
    multiSelect: false,
    search: "",
    selection: [],
    fileType: -1,
    fileTypes: [
      { text: "Imagen", value: 0 },
      { text: "Video", value: 1 },
    ],
    backgrounds: [],
    file: null,
    files: [],
    dialog: false,
    dialogDelete: false,
    dialogSearch: false,
    dialogUploading: false,
    dialogDates: false,
    searchDates: [],
    editedIndex: -1,
    editedId: -1,
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    fileName: "",
    fileTotalProgress: 0,
    filesURLs: [],
    fileURL: "",
    fileAlerts: [],
    fileUploadDetailsAlert: true,
    videoFiles: [],
    videoAlerts: [],
    videoURLs: [],
    itemsPerPageItems: [
      { text: "5 fondos", value: 5 },
      { text: "10 fondos", value: 10 },
      { text: "25 fondos", value: 25 },
      { text: "50 fondos", value: 50 },
      { text: "100 fondos", value: 100 },
    ],
    editedItem: {
      nombre: "",
      url: "",
      idArchivoOriginal: -1,
    },
    defaultItem: {
      nombre: "",
      url: "",
      idArchivoOriginal: -1,
    },
    searchItem: {
      nombre: "",
      idTipo: -1,
    },
    searchItemDefault: {
      nombre: "",
      idTipo: -1,
    },
  }),

  watch: {
    /* 
    dialog(val) {
      val || this.close();
    }, */
    dialogDelete(val) {
      val || this.closeDelete();
    },
    itemsPerPage() {
      this.initialize();
    },
    fileTotalProgress(val) {
      if (val >= 100) {
        this.fileName = "Finalizando...";
        val = 0;
      }
    },
    uploading(val) {
      if (val === true) this.dialogUploading = true;
      else this.dialogUploading = false;
    },
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Fondo" : "Editar Fondo";
    },
    computedDateFormattedMomentjs() {
      if (this.searchDates) {
        let dates = [...this.searchDates];
        let date = 0;
        let arr = dates.length;
        for (date; date < arr; date++) {
          let formattedDate = moment(dates[date]).format("DD/MM/YYYY");
          dates[date] = formattedDate;
        }
        return dates.join(" ~ ");
      }
      return [];
    },
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
      this.selection = [...this.backgrounds.map((bg) => +bg.id)];
    },
    onFileUpload(file) {
      this.file = file;
      this.fileURL = "";
      this.fileAlerts = [];
      if (file) {
        var url = URL.createObjectURL(file);
        if (this.file.name.match(/.(jpg|jpeg)$/i)) {
          if (this.file.size > 10000000) {
            this.fileAlerts.push(
              `El archivo ${this.file.name} supera los 10MB.`
            );
            this.file = null;
            URL.revokeObjectURL(file);
          }
          let image = new Image();
          image.src = url;
          let filename = this.file.name;
          image.onload = () => {
            if (image.width == 2160 && image.height == 3840) {
              this.fileURL = url;
            } else {
              this.fileAlerts.push(
                `El archivo ${filename} no es una imagen 4k vertical (2160x3840).`
              );
              this.file = null;
              URL.revokeObjectURL(file);
            }
          };
        } else if (this.file.name.match(/.(mp4)$/i)) {
          if (this.file.size > 250000000) {
            this.fileAlerts(`El archivo ${this.file.name} supera los 250MB.`);
            this.file = null;
            URL.revokeObjectURL(file);
          }
        } else {
          this.fileAlerts.push(
            `El archivo ${this.file.name} no coincide con los formatos soportados.`
          );
          this.file = null;
          URL.revokeObjectURL(file);
        }
      } else {
        this.fileURL = "";
        this.file = null;
      }
    },
    onFileUploadMultiple(files) {
      this.files = files;
      this.filesURLs = [];
      this.fileAlerts = [];
      let arr = this.files.length;

      if (arr < 11) {
        for (var i = arr - 1; i >= 0; i--) {
          var index = this.files.indexOf(this.files[i]);
          if (this.files[i]) {
            let url = URL.createObjectURL(this.files[i]);
            if (this.files[i].name.match(/.(jpg|jpeg)$/i)) {
              if (this.files[i].size > 10000000) {
                this.fileAlerts.push(
                  `El archivo ${this.files[i].name} supera los 10MB.`
                );
                this.files.splice(index, 1);
                URL.revokeObjectURL(this.files[i]);
                continue;
              }
              let image = new Image();
              image.src = url;
              let filename = this.files[i].name;
              image.onload = () => {
                if (image.width == 2160 && image.height == 3840) {
                  this.filesURLs.push(url);
                } else {
                  this.fileAlerts.push(
                    `El archivo ${filename} no es una imagen 4k vertical (2160x3840).`
                  );
                  this.files.splice(index, 1);
                  URL.revokeObjectURL(this.files[i]);
                }
              };
            } else if (this.files[i].name.match(/.(mp4)$/i)) {
              if (this.files[i].size > 250000000) {
                this.fileAlerts(
                  `El archivo ${this.files[i].name} supera los 250MB.`
                );
                this.files.splice(index, 1);
                URL.revokeObjectURL(this.files[i]);
                continue;
              }
            } else {
              this.fileAlerts.push(
                `El archivo ${this.files[i].name} no coincide con los formatos soportados.`
              );
              this.files.splice(index, 1);
              URL.revokeObjectURL(this.files[i]);
            }
          }
        }
      } else {
        this.files = [];
        this.filesURLs = [];
        this.fileAlerts.push(`Máximo 10 archivos.`);
      }
    },
    onVideoUploadMultiple(files) {
      this.videoFiles = files;
      this.videoURLs = [];
      this.videoAlerts = [];
      let arr = this.videoFiles.length;

      if (arr < 4) {
        for (var i = arr - 1; i >= 0; i--) {
          var index = this.videoFiles.indexOf(this.videoFiles[i]);
          if (this.videoFiles[i]) {
            //let url = URL.createObjectURL(this.videoFiles[i]);
            if (this.videoFiles[i].name.match(/.(mp4)$/i)) {
              if (this.videoFiles[i].size > 250000000) {
                this.videoAlerts.push(
                  `El archivo ${this.videoFiles[i].name} supera los 250MB.`
                );
                this.videoFiles.splice(index, 1);
                URL.revokeObjectURL(this.videoFiles[i]);
                continue;
              }

              /*
              // VIDEO METADATA
              
              var mime = this.videoFiles[i].type;
              var rd = new FileReader();

              rd.onload = (e) => {
                var blob = new Blob([e.target.result], {
                  type: mime,
                });
                var url = URL.createObjectURL(blob);
                var video = document.createElement("video");

                video.preload = "metadata";

                video.addEventListener("loadedmetadata", () => {
                  if (video.duration <= 90) {
                    if (video.videoWidth >= 1080 && video.videoHeight >= 1920) {
                      this.videoURLs.push(url);
                    } else if (
                      video.videoWidth > 2160 ||
                      video.videoHeight > 3840
                    ) {
                      this.videoAlerts.push(
                        `El archivo ${this.videoFiles[i].name} supera las dimensiones máximas soportadas (2160x3840).`
                      );
                      this.videoFiles.splice(index, 1);
                    } else {
                      this.videoAlerts.push(
                        `El archivo ${this.videoFiles[i].name} no supera las dimensiones mínimas soportadas (1080x1920).`
                      );
                      this.videoFiles.splice(index, 1);
                    }
                  } else {
                    this.videoAlerts.push(
                      `El archivo ${this.videoFiles[i].name} tiene una duración superior a 90 segundos.`
                    );
                    this.videoFiles.splice(index, 1);
                  }
                  URL.revokeObjectURL(url);
                });
                video.src = url;
              };

              var chunk = this.videoFiles[i].slice(0, 500000);
              rd.readAsArrayBuffer(chunk); */
            } else {
              this.videoAlerts.push(
                `El archivo ${this.videoFiles[i].name} no coincide con los formatos soportados.`
              );
              this.videoFiles.splice(index, 1);
              URL.revokeObjectURL(this.videoFiles[i]);
            }
          }
        }
      } else {
        this.videoFiles = [];
        this.videoURLs = [];
        this.videoAlerts.push(`Máximo 3 videos.`);
      }
    },
    removeFile(pos) {
      this.files.splice(pos, 1);
      this.filesURLs.splice(pos, 1);
    },
    removeVideoFile(pos) {
      this.videoFiles.splice(pos, 1);
      this.videoURLs.splice(pos, 1);
    },
    truncateString(str, n) {
      return str.length > n ? str.substr(0, n - 1) + "&hellip;" : str;
    },
    async initialize() {
      this.fileType = -1;
      this.backgrounds = [];
      this.loading = true;
      this.uploading = false;
      this.file = null;
      this.files = [];
      this.filesURLs = [];
      this.fileTotalProgress = 0;
      this.fileUploadDetailsAlert = true;

      const fileType = await this.$http.get("TipoArchivos/nombre/Fondo");
      if (fileType && fileType.data) {
        this.fileType = fileType.data[0].id;
        if (this.fileType > 0) {
          await this.$http
            .get(`Archivos/SizeAndTipo/`, {
              params: {
                idTipo: +this.fileType,
                size: "Small",
                pageNumber: this.page,
                pageSize: this.itemsPerPage,
              },
            })
            .then((res) => {
              if (res && res.data) {
                this.page = res.data.pageNumber;
                this.pages = res.data.totalPages;
                this.totalRecords = res.data.totalRecords;
                this.backgrounds = res.data.list;
              }
            })
            .catch(() => {
              this.snackbarText =
                "¡ERROR! Ocurrió un error al obtener los resultados.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            });
        }
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.backgrounds.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.idArchivoOriginal || -1;
      this.file = null;
      this.fileUploadDetailsAlert = true;
      this.dialog = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      this.dialogDelete = false;
      await this.$http
        .delete(`Archivos/${this.editedId}`)
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
        this.files = [];
        this.file = null;
        this.fileAlerts = [];
        this.filesURLs = [];
        this.fileURL = "";
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
        this.fileAlerts = [];
        this.filesURLs = [];
        this.fileURL = "";
      });
    },

    async save() {
      this.loading = true;
      if (this.editedIndex > -1 && this.editedId > -1) {
        let putFd = new FormData();
        putFd.append("idTipo", +this.fileType);
        putFd.append("nombre", this.editedItem.nombre);
        putFd.append("descripcion", "any"); // delete later
        putFd.append("file", this.file);
        let filename = this.file.name;
        this.uploading = true;
        this.dialog = false;
        await this.$http
          .put(`Archivos/${this.editedId}`, putFd, {
            onUploadProgress: (progressEvent) => {
              this.fileName = filename;
              this.fileTotalProgress = parseInt(
                Math.round((progressEvent.loaded / progressEvent.total) * 100)
              );
            },
          })
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
            this.uploading = false;
            this.loading = false;
          });
      } else {
        let postFormData;
        let f = 0;
        let files = this.files.length;
        this.uploading = true;
        this.loading = true;
        this.dialog = false;
        if (files) {
          //this.close();
          for (f; f < files; f++) {
            postFormData = new FormData();
            postFormData.append("idTipo", +this.fileType);
            postFormData.append("small", true);
            postFormData.append("medium", true);
            postFormData.append("large", false);
            postFormData.append("descripcion", "any");
            postFormData.append("file", this.files[f]);
            let filename = this.files[f].name;
            await this.$http
              .post("Archivos", postFormData, {
                onUploadProgress: (progressEvent) => {
                  this.fileName = filename;
                  this.fileTotalProgress = parseInt(
                    Math.round(
                      (progressEvent.loaded / progressEvent.total) * 100
                    )
                  );
                },
              })
              .finally(() => {
                this.uploading = false;
                this.loading = false;
              });
          }
        }
      }
      this.close();
      this.initialize();
    },
  },
  mounted() {
    this.initialize();
  },
};
</script>
<style scoped>
.background:hover {
  cursor: pointer;
}
.__pagination {
  position: fixed;
  bottom: 0;
  background-color: #333333;
}
.__background-small {
  position: relative;
  max-height: 20vh;
  max-width: 20vh;
  min-height: 20vh;
  min-width: 20vh;
}
.__background-medium {
  position: relative;
  max-height: 40vh;
  max-width: 20vh;
  min-height: 40vh;
  min-width: 20vh;
}
</style>