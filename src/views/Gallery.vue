<template>
  <div class="gallery">
    <v-toolbar :color="!selectTool ? 'grey darken-4' : '#1F96A3'" dark>
      <v-scale-transition>
        <v-app-bar-nav-icon v-if="!selectTool">
          <v-icon>fas fa-image</v-icon>
        </v-app-bar-nav-icon>
        <v-btn v-else-if="selectTool" @click="selectTool = false" icon>
          <v-icon>fas fa-times</v-icon>
        </v-btn>
      </v-scale-transition>
      <v-scroll-y-transition>
        <v-toolbar-title>
          {{
            selectTool
              ? `${selection.length} seleccionado(s)`
              : "Galería de Fondos de Pantalla"
          }}
        </v-toolbar-title>
      </v-scroll-y-transition>
      <v-spacer></v-spacer>
      <v-scale-transition v-if="!selectTool">
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
              :disabled="loading"
            >
              <v-icon class="mr-2">fas fa-search</v-icon>
              Buscar
            </v-btn>
          </template>
          <v-card height="auto">
            <v-card-title>
              <span class="headline">Opciones de búsqueda</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-container fluid>
                <v-row dense>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="searchItem.nombre"
                      label="Nombre"
                      counter="50"
                      maxlength="50"
                      outlined
                      clearable
                      dense
                      :hide-details="true"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-autocomplete
                      v-model="searchItem.idTipoArchivo"
                      :items="fileTypes"
                      label="Tipo de archivo"
                      maxlength="50"
                      clearable
                      outlined
                      small-chips
                      dense
                      :hide-details="true"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-dialog
                      ref="dialogInitDate"
                      v-model="modalInitDate"
                      :return-value.sync="searchItem.fechaAltaInicio"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          :value="moment_initDateFormatted"
                          label="Fecha inicial de alta"
                          readonly
                          outlined
                          dense
                          hide-details
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="searchItem.fechaAltaInicio"
                        scrollable
                        dense
                        :allowed-dates="disableFutureDates"
                        @input="saveInitDate"
                      >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modalInitDateClose">
                          Cerrar
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-dialog
                      ref="dialogEndDate"
                      v-model="modalEndDate"
                      :return-value.sync="searchItem.fechaAltaFin"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          :value="moment_endDateFormatted"
                          label="Fecha final de alta"
                          readonly
                          outlined
                          dense
                          hide-details
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="searchItem.fechaAltaFin"
                        scrollable
                        dense
                        :allowed-dates="disableFutureDates"
                        @input="saveEndDate"
                      >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modalEndDateClose">
                          Cerrar
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="info" text large @click="dialogSearch = false">
                Cerrar
              </v-btn>
              <v-btn
                color="success"
                large
                @click="
                  searchMode = true;
                  initialize();
                "
                :disabled="loading"
              >
                Aplicar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-scale-transition>
      <v-scale-transition v-if="!selectTool">
        <v-btn
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#55AA99'"
          @click="showDialog"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          class="mx-1"
          :disabled="loading"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-cloud-upload-alt
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Subir" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-scale-transition v-if="!selectTool">
        <v-btn
          :color="$vuetify.breakpoint.xsOnly ? 'none' : '#FFA440'"
          :icon="$vuetify.breakpoint.xsOnly ? true : false"
          @click="
            selection = [];
            selectTool = true;
          "
          class="mx-1"
          :disabled="loading || !backgrounds.length"
        >
          <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
            fas fa-object-group
          </v-icon>
          {{ !$vuetify.breakpoint.xsOnly ? "Seleccionar" : "" }}
        </v-btn>
      </v-scale-transition>
      <v-scale-transition v-if="selectTool">
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
      <v-scale-transition v-if="selectTool">
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
      <v-scale-transition v-if="!selectTool">
        <slot name="toolbar"></slot>
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
          v-for="file in backgrounds"
          :key="`background-${file.id}`"
          class="ma-3 background"
          :lazy-src="require('@/assets/no-disponible.jpg')"
          :src="
            file.url.match(/.(mp4|webm)$/i)
              ? require('@/assets/video_unavailable.jpg')
              : file.url || require('@/assets/no-disponible.jpg')
          "
          :height="240"
          :width="135"
          :max-height="240"
          :max-width="135"
          @click="selectTool ? undefined : editItem(file)"
          style="position: relative; z-index: 0"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular
                :indeterminate="
                  file.url.match(/.(jpg|jpeg|webp)$/i) ? true : false
                "
                color="info"
              ></v-progress-circular>
            </v-row>
          </template>

          <div class="background__checkbox">
            <v-checkbox
              v-if="selectTool"
              v-model="selection"
              color="whitesmoke"
              :value="file.idArchivoOriginal || file.id"
              background-color="rgba(0, 0, 0, 0.5)"
            >
            </v-checkbox>
          </div>

          <v-tooltip color="#000" top>
            <template v-slot:activator="{ on, attrs }">
              <div class="background-title" v-bind="attrs" v-on="on">
                {{ file.nombre }}
              </div>
            </template>

            <span
              style="
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
                white-space: pre-wrap;
              "
            >
              {{ file.nombre }}
            </span>
          </v-tooltip>
        </v-img>
      </v-col>
    </v-row>
    <v-row
      :class="paginationFixed ? '__pagination pa-2' : '__bg-pagination pa-2'"
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
          dense
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
          width="30"
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

    <v-dialog
      v-model="dialog"
      width="50%"
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
                  dense
                  border="left"
                  type="info"
                >
                  Imagenes <strong>4K</strong> verticales (2160x3840), máximo
                  <strong>10MB</strong> por imagen, formato
                  <strong>JPG</strong>.
                </v-alert>
                <v-alert
                  v-model="fileUploadDetailsAlert"
                  dense
                  border="left"
                  type="info"
                >
                  Videos en formato <strong>MP4</strong>, máximo
                  <strong>250MB</strong> por video.
                </v-alert>
              </v-col>
              <v-col :cols="editedIndex > -1 ? 8 : 12" class="d-flex">
                <v-row dense>
                  <v-col cols="12" sm="6" class="align-self-end">
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
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="editedItem.nombre"
                  label="Nombre"
                  counter="50"
                  maxlength="50"
                  outlined
                  clearable
                  single-line
                  dense
                  :disabled="!file"
                >
                </v-text-field>
                <v-file-input
                  v-show="showFileInput"
                  v-model="file"
                  counter
                  label="Archivo"
                  accept=".jpg, .mp4"
                  placeholder="Elegir archivo..."
                  prepend-icon=""
                  outlined
                  single-line
                  dense
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
              <v-col cols="12" sm="4" class="d-flex justify-center">
                <div class="d-flex flex-column">
                  <v-img
                    :src="fileURL || `${editedItem.url}?${new Date()}`"
                    alt=" "
                    :contain="true"
                    :aspect-ratio="16 / 9"
                    :height="240"
                    :width="135"
                    :max-height="240"
                    :max-width="135"
                    class="d-block grey-lighten-2 white--text ma-0 p-0 __background-small"
                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                    style="border: 1px solid white"
                  >
                    <div style="position: absolute; top: 0; right: 0">
                      <v-btn
                        v-if="
                          editedIndex > -1 && editedId > -1 && !showFileInput
                        "
                        icon
                        :disabled="loading || uploading"
                        @click="showFileInput = true"
                      >
                        <v-icon color="warning"> fas fa-pencil-alt </v-icon>
                      </v-btn>
                      <v-btn
                        v-if="!(editedIndex > -1 && editedId > -1) && fileURL"
                        icon
                        :disabled="loading || uploading"
                        @click="
                          file = null;
                          fileURL = null;
                        "
                      >
                        <v-icon color="red"> fas fa-times </v-icon>
                      </v-btn>
                    </div>

                    <template v-slot:placeholder>
                      <v-row
                        v-if="fileURL"
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
                  <a
                    v-if="editedIndex > -1"
                    @click="showOriginal"
                    style="
                      background: rgba(0, 0, 0, 0.5);
                      text-decoration: none !important;
                      color: white;
                    "
                    class="text-center text-white pa-1 mx-auto"
                  >
                    VER ORIGINAL
                  </a>
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
            :disabled="loading || !file"
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
            @click="selectTool ? deleteItems() : deleteItemConfirm()"
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
export default {
  name: "Gallery",
  components: {},
  props: {
    // prop to control pagination style class
    paginationFixed: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    page: 1,
    pages: 1,
    itemsPerPage: 25,
    totalRecords: 0,
    loading: false,
    uploading: false,
    selectTool: false,
    searchTimeout: null,
    selection: [],
    fileType: -1,
    fileTypes: [],
    backgrounds: [],
    file: null,
    showFileInput: true,
    dialog: false,
    dialogDelete: false,
    dialogSearch: false,
    dialogUploading: false,
    modalInitDate: false,
    modalEndDate: false,
    searchDates: [],
    editedIndex: -1,
    editedId: -1,
    originalURL: "",
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    fileName: "",
    fileTotalProgress: 0,
    fileURL: "",
    fileAlerts: [],
    fileUploadDetailsAlert: true,
    videoAlerts: [],
    searchMode: false,
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
      idTipoArchivo: -1,
      fechaAltaInicio: "",
      fechaAltaFin: "",
      eliminado: false,
    },
    searchItemDefault: {
      nombre: "",
      idTipoArchivo: -1,
      fechaAltaInicio: "",
      fechaAltaFin: "",
      eliminado: false,
    },
  }),

  watch: {
    // watch nested properties
    "searchItem.fechaAltaInicio"(newVal, oldVal) {
      console.log("searchItem.fechaAltaInicio", newVal, oldVal);
    },
    "searchItem.fechaAltaFin"(newVal, oldVal) {
      console.log("searchItem.fechaAltaFin", newVal, oldVal);
    },
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
    editedId(val) {
      console.log("editedId", val);
    },
    editedIndex(val) {
      console.log("editedIndex", val);
    },
    fileType(val) {
      console.log("fileType", val);
    },
    selection(val) {
      console.log("selection", val);
    },
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Fondo" : "Editar Fondo";
    },
    moment_initDateFormatted() {
      return this.searchItem.fechaAltaInicio
        ? moment(this.searchItem.fechaAltaInicio).format("DD/MM/YYYY")
        : "";
    },
    moment_endDateFormatted() {
      return this.searchItem.fechaAltaFin
        ? moment(this.searchItem.fechaAltaFin).format("DD/MM/YYYY")
        : "";
    },
  },

  methods: {
    showDialog() {
      this.dialog = true;
      this.showFileInput = true;
    },
    async showOriginal() {
      let endpoint = `Archivos/${this.editedId}`;
      this.loading = true;
      await this.$http
        .get(endpoint)
        .then((res) => {
          if (res && res.data && res.status === 200) {
            window.open(res.data.url, "_blank");
          } else return Promise.reject("");
        })
        .catch((err) => {
          console.log("error", err);
        });
      this.loading = false;
    },
    saveInitDate() {
      this.$refs.dialogInitDate.save(this.searchItem.fechaAltaInicio);
      this.modalInitDateClose();
    },
    saveEndDate() {
      this.$refs.dialogEndDate.save(this.searchItem.fechaAltaFin);
      this.modalEndDateClose();
    },
    modalInitDateClose() {
      this.modalInitDate = false;
      this.$nextTick = () => {
        this.searchItem.fechaAltaInicio = "";
      };
    },
    modalEndDateClose() {
      this.modalEndDate = false;
      this.$nextTick = () => {
        this.searchItem.fechaAltaFin = "";
      };
    },
    disableFutureDates(val) {
      let date = new Date().toISOString().substr(0, 10);
      return val <= date;
    },
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
          this.fileURL = null;
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
    truncateString(str, n) {
      return str.length > n ? str.substr(0, n - 1) + "&hellip;" : str;
    },
    dialogSearchClose() {
      this.dialogSearch = false;
      this.$nextTick = () => {
        this.searchMode = false;
        this.searchItem = this.searchItemDefault;
      };
    },
    async initialize() {
      this.fileType = -1;
      this.backgrounds = [];
      this.loading = true;
      this.uploading = false;
      this.file = null;
      this.fileTotalProgress = 0;
      this.fileUploadDetailsAlert = true;
      this.page = 1;
      this.originalURL = "";
      if (!this.searchMode) this.fileTypes = [];

      // Get filetypes
      const filetypes = await this.$http.get("TipoArchivos");
      if (
        filetypes &&
        filetypes.data &&
        filetypes.data.length &&
        filetypes.status === 200
      ) {
        let filters = ["Fondo", "FondoVideo"]; // Change as project manager says
        let filteredFileTypes = [...filetypes.data].filter(
          (ft) => filters.includes(ft.nombre) && ft.eliminado === false
        );
        // Manual mapping
        let img = filteredFileTypes[0],
          video = filteredFileTypes[1];
        this.fileTypes = [
          { text: "Imagenes", value: img.id },
          { text: "Videos", value: video.id },
        ];
        // Defaults
        this.searchItem.idTipoArchivo = img.id;
        this.fileType = img.id;
      }

      const data = {};
      if (this.searchMode) {
        if (this.searchItem.nombre) data["nombre"] = this.searchItem.nombre;
        if (this.searchItem.idTipoArchivo > -1)
          data["idTipoArchivo"] = this.searchItem.idTipoArchivo;
        if (this.searchItem.fechaAltaInicio)
          data["fechaAltaInicio"] = this.searchItem.fechaAltaInicio;
        if (this.searchItem.fechaAltaFin)
          data["fechaAltaFin"] = this.searchItem.fechaAltaFin;
        data["eliminado"] = false;
      } else {
        Object.assign(data, {
          idTipoArchivo: +this.fileType,
          eliminado: false,
        });
      }

      await this.$http
        .post(`Archivos/Filtrados/`, data, {
          params: {
            pageNumber: this.page,
            pageSize: this.itemsPerPage,
          },
        })
        .then((res) => {
          if (res && res.data && res.status === 200) {
            this.page = res.data.pageNumber;
            this.pages = res.data.totalPages;
            this.totalRecords = res.data.totalRecords;
            this.backgrounds = res.data.list;

            let thumbsList = [];
            for (let bg of res.data.list) {
              if (bg.miniaturas && bg.miniaturas.length) {
                let t = bg.miniaturas.filter((b) => b.size === "Small");
                thumbsList.push(t[0]);
              } else {
                if (bg.url.match(/.(mp4|webm)$/i)) {
                  thumbsList.push(bg);
                }
              }
            }
            this.backgrounds = thumbsList;
            this.page = res.data.totalPages;
          } else return Promise.reject("");
        })
        .catch(() => {
          this.snackbarText =
            "¡ERROR! Ocurrió un error al obtener los resultados.";
          this.snackbarColor = "danger";
          this.snackbar = true;
        })
        .finally(() => {
          this.loading = false;
        });
      this.dialogSearchClose();
    },

    editItem(item) {
      this.editedIndex = this.backgrounds.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.idArchivoOriginal || -1;
      this.file = null;
      this.fileUploadDetailsAlert = true;
      this.showFileInput = false;
      this.dialog = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      this.dialogDelete = false;
      await this.$http
        .delete(`Archivos/${this.editedId}`)
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
          this.selectTool = false;
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
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
      this.editedId = -1;
      this.file = null;
      this.fileURL = "";
      this.fileAlerts = [];
      /* this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.file = null;
        this.fileURL = " ";
        this.fileAlerts = [];
      }); */
    },

    closeDelete() {
      this.dialogDelete = false;
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.file = null;
        this.fileURL = "";
        this.fileAlerts = [];
      });
    },

    async save() {
      this.loading = true;
      if (this.editedIndex > -1 && this.editedId > -1) {
        let putFd = new FormData();
        putFd.append("idTipo", +this.fileType);
        putFd.append("nombre", this.editedItem.nombre);
        var filename;
        if (this.file) {
          putFd.append("file", this.file);
          filename = this.file.name;
          this.uploading = true;
        }

        this.dialog = false;
        await this.$http
          .put(`Archivos/${this.editedId}`, putFd, {
            onUploadProgress: (progressEvent) => {
              if (filename) {
                this.fileName = filename;
                this.fileTotalProgress = parseInt(
                  Math.round((progressEvent.loaded / progressEvent.total) * 100)
                );
              }
            },
          })
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
            this.uploading = false;
            this.loading = false;
          });
      } else {
        this.uploading = true;
        this.loading = true;
        this.dialog = false;
        const fd = new FormData();
        fd.append("idTipo", +this.fileType);
        fd.append("nombre", this.editedItem.nombre);
        fd.append("small", true);
        fd.append("medium", true);
        fd.append("large", true);
        fd.append("file", this.file);
        let filename = this.file.name;
        await this.$http
          .post("Archivos", fd, {
            onUploadProgress: (pEvt) => {
              this.fileName = filename;
              this.fileTotalProgress = parseInt(
                Math.round((pEvt.loaded / pEvt.total) * 100)
              );
            },
          })
          .finally(() => {
            this.uploading = false;
            this.loading = false;
          });
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
.background__checkbox {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
}
.background__checkbox {
  margin-right: 0px !important; /* TODO: FIX LITTLE GAP */
}

.background-title {
  position: absolute;
  bottom: 0;
  background: rgb(0, 0, 0);
  background: rgba(0, 0, 0, 0.5); /* Black see-through */
  color: #f1f1f1;
  width: 100%;
  transition: 0.5s ease;
  color: white;
  font-size: 0.8rem;
  padding: 0.1rem;
  max-height: 3.5rem;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.background:hover {
  cursor: pointer;
}
.__pagination {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #333333;
}
.__bg-pagination {
  background-color: #333333;
}
.__background-small {
  position: relative;
  max-height: 170px;
  max-width: 20vh;
  min-height: 170px;
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