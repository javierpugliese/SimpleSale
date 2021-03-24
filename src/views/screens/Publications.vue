<template>
  <div class="publications">
    <v-container>
      <!-- Snackbar as alert -->
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
        :items="publications"
        :loading="loading"
        @click:row="editItem"
        loading-text="Cargando..."
        :sort-by.sync="sortBy"
        :sort-desc="true"
        class="elevation-1 table-cursor"
        striped
        :fixed-header="true"
        :calculate-widths="true"
        :disable-pagination="true"
        :hide-default-footer="true"
        show-select
        v-model="publicationsSelected"
      >
        <template v-slot:item.archivo="{ item }">
          <v-img
            :lazy-src="require('@/assets/no-disponible.jpg')"
            class="__datatable_img my-2"
            alt=" "
            :contain="true"
            :aspect-ratio="16 / 9"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            style="border: 1px solid white"
            :src="
              getProductImage(item) || require('@/assets/no-disponible.jpg')
            "
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="info"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </template>

        <template v-slot:item.creado="{ item }">
          {{ parseDate(item.creado) }}
        </template>

        <template v-slot:item.modificado="{ item }">
          {{ parseDate(item.modificado) }}
        </template>

        <template v-slot:top>
          <v-toolbar>
            <v-toolbar-title>Lista de Publicaciones</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-scale-transition v-if="publicationsSelected.length">
              <div class="text-overline">
                {{ publicationsSelected.length }} seleccionado(s)
              </div>
            </v-scale-transition>
            <v-scale-transition v-if="publicationsSelected.length">
              <v-btn
                color="red"
                dense
                class="mx-2"
                :loading="loading"
                :disabled="loading"
                @click="deleteItems"
              >
                <v-icon class="mr-2">fas fa-trash-alt</v-icon>
                Eliminar seleccionados
              </v-btn>
            </v-scale-transition>
            <v-dialog
              v-model="dialog"
              width="60%"
              persistent
              overlay-color="blue"
              overlay-opacity="0.2"
              scrollable
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="my-3"
                  v-bind="attrs"
                  v-on="on"
                  :loading="loading"
                >
                  <v-icon class="mr-2">fas fa-plus</v-icon>
                  Nueva publicación
                </v-btn>
              </template>
              <v-card height="auto">
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-container>
                    <v-row dense no-gutters>
                      <v-col cols="12" sm="6">
                        <v-row>
                          <v-col cols="12">
                            <div class="text-h6">Datos de la publicación</div>
                          </v-col>
                        </v-row>
                        <v-row no-gutters dense>
                          <v-col cols="12" sm="6">
                            <!-- Form publication -->
                            <v-row dense no-gutters>
                              <v-col cols="12">
                                <v-text-field
                                  v-model="editedItem.nombre"
                                  label="Nombre"
                                  maxlength="50"
                                  outlined
                                  clearable
                                  dense
                                  single-line
                                  hide-details
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12">
                                <v-radio-group v-model="publishType">
                                  <v-radio
                                    label="Publicar fondo"
                                    color="primary"
                                    :value="true"
                                  ></v-radio>
                                  <v-radio
                                    label="Publicar planograma"
                                    color="primary"
                                    :value="false"
                                  ></v-radio
                                ></v-radio-group>
                              </v-col>
                              <v-col cols="12">
                                <!-- Gallery dialog -->
                                <v-dialog
                                  v-if="publishType"
                                  v-model="dialogGallery"
                                  width="85%"
                                  overlay-color="blue"
                                  overlay-opacity="0.2"
                                  scrollable
                                  persistent
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      color="success"
                                      dark
                                      block
                                      v-bind="attrs"
                                      v-on="on"
                                      :disabled="loading"
                                      :loading="loading"
                                    >
                                      <v-icon class="pr-2">
                                        fas fa-mouse-pointer
                                      </v-icon>
                                      Elegir fondo
                                    </v-btn>
                                  </template>

                                  <v-card height="auto">
                                    <v-card-title>
                                      Asignar un fondo a la publicación
                                    </v-card-title>
                                    <v-divider></v-divider>
                                    <v-card-text>
                                      <!-- Gallery component -->
                                      <simple-gallery
                                        :paginationFixed="false"
                                        @fileSelected="getChildData"
                                      >
                                      </simple-gallery>
                                    </v-card-text>
                                    <v-divider></v-divider>
                                    <v-card-actions>
                                      <v-spacer></v-spacer>
                                      <v-btn
                                        color="info"
                                        text
                                        @click="closeGallery"
                                        :disabled="loading || requesting"
                                        :loading="loading || requesting"
                                      >
                                        Cerrar
                                      </v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </v-dialog>
                              </v-col>
                              <v-col cols="12">
                                <v-autocomplete
                                  v-if="!publishType"
                                  v-model="editedItem.tipoPromocion"
                                  :items="[]"
                                  label="Planograma"
                                  maxlength="50"
                                  clearable
                                  outlined
                                  small-chips
                                  dense
                                  single-line
                                ></v-autocomplete>
                              </v-col>
                            </v-row>
                          </v-col>
                          <!-- Preview background -->
                          <v-col cols="12" sm="6">
                            <v-img
                              width="135"
                              height="240"
                              :contain="true"
                              class="mx-auto"
                              :src="backgroundData.url"
                              alt=" "
                              style="
                                border: 1px solid whitesmoke;
                                background-color: #d3d3d3;
                              "
                            >
                              <v-btn
                                v-if="backgroundData.url && !(editedIndex > -1)"
                                icon
                                style="position: absolute; top: 0; right: 0"
                                @click="clearBgData"
                              >
                                <v-icon color="red"> fas fa-times </v-icon>
                              </v-btn>
                            </v-img>
                          </v-col>
                        </v-row>
                      </v-col>
                      <ScheduleForm></ScheduleForm>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="info" text @click="close"> Cancelar </v-btn>
                  <v-btn
                    color="red"
                    v-if="editedIndex > -1 && editedId > -1"
                    text
                    @click="dialogDelete = true"
                  >
                    Eliminar
                  </v-btn>
                  <v-btn
                    color="success"
                    @click="save"
                    :disabled="loading || requesting || !editedItem.nombre"
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
                  ¿Eliminar esta publicación?
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
          <v-row dense class="my-3">
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="searchItem.nombre"
                label="Buscar por nombre"
                placeholder="Nombre..."
                class="mx-2"
                maxlength="50"
                filled
                clearable
                dense
                @click:clear="initialize"
                @input="search"
                @paste="search"
                @keyup.esc="initialize"
                :hide-details="true"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
        </template>
        <template v-slot:no-data>
          No hay publicaciones disponibles
          <v-btn class="ml-3" color="primary" @click="initialize">
            Recargar
          </v-btn>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
import moment from "moment";
import ScheduleForm from "../../components/ScheduleForm.vue";
import SimpleGallery from "../../components/SimpleGallery.vue";
export default {
  name: "Publications",
  components: {
    ScheduleForm,
    SimpleGallery,
  },
  data: () => ({
    loading: false,
    requesting: false,
    sortBy: "creado",
    headers: [
      {
        text: "Vista Previa",
        align: "start",
        sortable: false,
        value: "archivo",
      },
      {
        text: "Nombre",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      {
        text: "Fecha de creación",
        align: "start",
        sortable: true,
        value: "creado",
      },
      {
        text: "Fecha de modificación",
        align: "start",
        sortable: true,
        value: "modificado",
      },
    ],
    dialog: false,
    dialogDelete: false,
    dialogGallery: false,
    modal: false,
    publications: [],
    publicationsSelected: [],
    editedIndex: -1,
    editedId: -1,
    backgroundId: -1,
    backgroundData: {},
    editedItem: {
      nombre: "",
    },
    defaultItem: {
      nombre: "",
    },
    searchItem: {
      nombre: "",
    },
    searchTimeout: null,
    searchItemDefault: { nombre: "" },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    promoTypeValue: 0,
    screenBackgroundSrc: "",
    publishType: true,
    dates: [],
  }),

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    editedIndex(val) {
      console.log("editedIndex", val);
    },
    editedId(val) {
      console.log("editedIndex", val);
    },
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "Nueva Publicación"
        : "Editar Publicación";
    },
  },

  methods: {
    clearBgData() {
      this.backgroundId = -1;
      this.backgroundData = {};
    },
    closeGallery() {
      this.dialogGallery = false;
      this.$nextTick = () => {
        this.backgroundId = -1;
        this.backgroundData = {};
      };
    },
    async search() {
      if (this.searchItem.nombre.length > 3) {
        this.loading = true;
        this.publications = [];
        clearTimeout(this.searchTimeout);
        let endpoint = `Publicaciones/nombre/${this.searchItem.nombre.trim()}`;
        this.searchTimeout = setTimeout(() => {
          this.$http
            .get(endpoint)
            .then((res) => {
              if (res && res.data && res.data.length) {
                let array = res.data;
                let i = 0;
                let arr = array.length;
                for (i; i < arr; i++) {
                  this.publications.push(array[i]);
                }
              }
            })
            .catch((err) => {
              console.log("error", err);
            })
            .finally(() => {
              this.loading = false;
            });
        }, 1000);
      }
    },
    async deleteItems() {
      let ids = this.publicationsSelected.map((item) => item.id);
      let x = 0;
      let arr = ids.length;
      if (arr) {
        this.loading = true;
        for (x; x < arr; x++) {
          await this.$http.delete(`Publicaciones/${ids[x]}`);
        }
        this.loading = false;
        this.initialize();
      } else return;
    },
    getChildData(object) {
      console.log("Received data:", object);
      if (typeof object === "object") {
        if (object.id && object.url) {
          this.backgroundId = +object.id;
          this.backgroundData = object;
        }
        this.dialogGallery = false;
      }
    },
    /** Removes duplicate keys in array */
    removeArrDuplicates(array) {
      return [...new Set(array)];
    },
    /* Parse Date to readable locale 'es' format*/
    parseDate(date) {
      if (date) return moment(date).format("LLL");
      else return "Sin modificaciones.";
    },
    /* Return file from product. Displays in datatable */
    getProductImage(item) {
      if (item.archivo) {
        if (item.archivo.miniaturas) {
          let miniaturas = item.archivo.miniaturas.filter(
            (m) => m.size == "Small"
          );
          return miniaturas[0].url;
        }
        return item.archivo.url;
      } else return false;
    },
    /* Init */
    async initialize() {
      this.loading = true;
      this.publications = [];
      this.publicationsSelected = [];
      Object.assign(this.searchItem, this.searchItemDefault);

      const publications = this.$http.get("Publicaciones");

      const promises = [publications];

      await this.$http
        .all(promises)
        .then(
          this.$http.spread((...responses) => {
            const publicationsRes = responses[0];
            if (publicationsRes && publicationsRes.data) {
              this.publications = publicationsRes.data;
            }
          })
        )
        .catch((errors) => {
          console.log(errors);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.editedIndex = this.publications.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.backgroundId = item.id || -1;
      if (item.archivo) {
        this.backgroundData = Object.assign({}, item.archivo);
      } else this.backgroundData = {};
      this.dialog = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      this.dialog = false;
      this.dialogDelete = false;
      await this.$http
        .delete(`Publicaciones/${this.editedId}`)
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
    /* Close main dialog */
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.backgroundId = -1;
        this.backgroundData = {};
      });
    },

    /* Close delete dialog */
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
        this.backgroundId = -1;
        this.backgroundData = {};
      });
    },

    /* Request api to insert or update*/
    async save() {
      if (this.editedIndex > -1 && this.editedId > -1) {
        this.loading = true;
        await this.$http
          .put(
            `Publicaciones/${this.editedId}`,
            Object.assign(
              {},
              {
                nombre: this.editedItem.nombre.trim(),
                idArchivo: this.backgroundId,
              }
            )
          )
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
        this.loading = true;
        if (this.backgroundId > -1) {
          await this.$http
            .post(
              "Publicaciones",
              Object.assign(
                {},
                {
                  nombre: this.editedItem.nombre.trim(),
                  idArchivo: this.backgroundId,
                }
              )
            )
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
            .finally(() => (this.loading = false));
        } else {
          this.snackbarText =
            "Seleccione un fondo o gondola antes de publicar.";
          this.snackbarColor = "warning";
          this.snackbar = true;
        }
      }
      this.close();
      this.initialize();
    },
  },
  mounted: function () {
    this.initialize();
  },
};
</script>
<style scoped>
.__datatable_img {
  position: relative;
  max-height: 50px;
  max-width: 50px;
  min-height: 50px;
  min-width: 50px;
}
</style>