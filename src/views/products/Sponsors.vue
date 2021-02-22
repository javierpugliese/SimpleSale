<template>
  <div class="sponsors">
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
        :items="sponsors"
        :loading="loading"
        @click:row="editItem"
        loading-text="Cargando..."
        sort-by="nombre"
        class="elevation-1 table-cursor"
        :disable-pagination="true"
        :hide-default-footer="true"
      >
        <template v-slot:item.fechaInicio="{ item }">
          {{ parseDate(item.fechaInicio) }}
        </template>

        <template v-slot:item.fechaFin="{ item }">
          {{ parseDate(item.fechaInicio) }}
        </template>

        <template v-slot:item.modificado="{ item }">
          {{ parseDate(item.modificado) }}
        </template>

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Sponsors</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <!-- Search dialog -->
            <v-scale-transition>
              <v-dialog
                v-model="dialogSearch"
                width="60%"
                overlay-color="blue"
                overlay-opacity="0.2"
                scrollable
                persistent
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="secondary"
                    dark
                    large
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
                            v-model="searchItem.idFabricante"
                            :items="manufacturers"
                            label="Fabricante"
                            maxlength="50"
                            clearable
                            outlined
                            small-chips
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-autocomplete
                            v-model="searchItem.idArticulo"
                            :items="products"
                            label="Producto"
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
                    <v-btn
                      color="info"
                      text
                      large
                      @click="dialogSearch = false"
                    >
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
            <v-dialog
              v-model="dialog"
              width="60%"
              :fullscreen="$vuetify.breakpoint.xsOnly"
              :hide-overlay="$vuetify.breakpoint.xsOnly"
              scrollable
              overlay-color="blue"
              overlay-opacity="0.2"
              persistent
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="my-3"
                  v-bind="attrs"
                  v-on="on"
                  large
                  :loading="loading"
                >
                  <v-icon class="mr-2">fas fa-plus</v-icon>
                  Nuevo sponsor
                </v-btn>
              </template>
              <v-card height="auto">
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-sheet class="pa-5" color="blue-grey darken-4">
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="editedItem.nombre"
                            label="Nombre"
                            counter="50"
                            maxlength="50"
                            outlined
                            clearable
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-autocomplete
                            v-model="editedItem.idFabricante"
                            :items="manufacturers"
                            label="Fabricante"
                            maxlength="50"
                            clearable
                            outlined
                            small-chips
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-autocomplete
                            v-model="editedItem.idArticulo"
                            :items="products"
                            label="Producto"
                            maxlength="50"
                            clearable
                            outlined
                            small-chips
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-dialog
                            ref="dialogInitDate"
                            v-model="modalInitDate"
                            :return-value.sync="editedItem.fechaInicio"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                :value="moment_initDateFormatted"
                                label="Fecha de inicio"
                                readonly
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="editedItem.fechaInicio"
                              scrollable
                            >
                              <v-spacer></v-spacer>
                              <v-btn
                                text
                                color="primary"
                                @click="modalInitDate = false"
                              >
                                Cancelar
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.dialogInitDate.save(
                                    editedItem.fechaInicio
                                  )
                                "
                              >
                                Aceptar
                              </v-btn>
                            </v-date-picker>
                          </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-dialog
                            ref="dialogEndDate"
                            v-model="modalEndDate"
                            :return-value.sync="editedItem.fechaFin"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                :value="moment_endDateFormatted"
                                label="Fecha de finalización"
                                readonly
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="editedItem.fechaFin"
                              scrollable
                            >
                              <v-spacer></v-spacer>
                              <v-btn
                                text
                                color="primary"
                                @click="modalEndDate = false"
                              >
                                Cancelar
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.dialogEndDate.save(editedItem.fechaFin)
                                "
                              >
                                Aceptar
                              </v-btn>
                            </v-date-picker>
                          </v-dialog>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-dialog
                            ref="dialog2"
                            v-model="modal2"
                            :return-value.sync="time"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="time"
                                label="Hora de inicio"
                                outlined
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="modal2"
                              v-model="time"
                              full-width
                            >
                              <v-spacer></v-spacer>
                              <v-btn
                                text
                                color="primary"
                                @click="modal2 = false"
                              >
                                Cancelar
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.dialog2.save(time)"
                              >
                                Aceptar
                              </v-btn>
                            </v-time-picker>
                          </v-dialog>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-dialog
                            ref="dialog3"
                            v-model="modal3"
                            :return-value.sync="time1"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="time1"
                                label="Hora de finalización"
                                readonly
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="modal3"
                              v-model="time1"
                              full-width
                            >
                              <v-spacer></v-spacer>
                              <v-btn
                                text
                                color="primary"
                                @click="modal3 = false"
                              >
                                Cancel
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.dialog3.save(time1)"
                              >
                                Aceptar
                              </v-btn>
                            </v-time-picker>
                          </v-dialog>
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-container>
                </v-card-text>

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
                  <v-btn color="success" @click="save" :disabled="loading">
                    <v-icon class="mr-2"> fas fa-save </v-icon>
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline">
                  ¿Eliminar este sponsor?
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
        <template v-slot:no-data>
          No hay sponsors disponibles
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
// @ is an alias to /src
export default {
  name: "Sponsors",
  components: {},
  data: () => ({
    loading: false,
    search: "",
    headers: [
      {
        text: "Nombre",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      {
        text: "Fecha de inicio",
        align: "start",
        sortable: true,
        value: "fechaInicio",
      },
      {
        text: "Fecha de finalización",
        align: "start",
        sortable: true,
        value: "fechaFin",
      },
      {
        text: "Hora de inicio",
        align: "start",
        sortable: true,
        value: "horaInicio",
      },
      {
        text: "Hora de finalización",
        align: "start",
        sortable: true,
        value: "horaFin",
      },
      {
        text: "Fecha de modificación",
        align: "start",
        sortable: true,
        value: "modificado",
      },
    ],

    sponsors: [],
    products: [],
    manufacturers: [],

    delimiters: [",", ".", "-", "/", " "],
    dialog: false,
    dialogDelete: false,
    dialogSearch: false,
    editedIndex: -1,
    editedId: -1,

    editedItem: {
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
      idArticulo: -1,
      idFabricante: -1,
    },
    defaultItem: {
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
      idArticulo: -1,
      idFabricante: -1,
    },
    searchItem: { nombre: "", idArticulo: -1, idFabricante: -1 },
    searchItemDefault: { nombre: "", idArticulo: -1, idFabricante: -1 },
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    dates: [],
    modal: false,
    modal2: false,
    modal3: false,
    modalInitDate: false,
    initDate: "",
    modalEndDate: false,
    endDate: "",
    time: "",
    time1: "",
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
      return this.editedIndex === -1 ? "Nuevo Sponsor" : "Editar Sponsor";
    },
    moment_initDateFormatted() {
      return this.editedItem.fechaInicio
        ? moment(this.editedItem.fechaInicio).format("DD/MM/YYYY")
        : "";
    },
    moment_endDateFormatted() {
      return this.editedItem.fechaFin
        ? moment(this.editedItem.fechaFin).format("DD/MM/YYYY")
        : "";
    },
  },

  methods: {
    /** Removes duplicate keys in array */
    removeArrDuplicates(array) {
      return [...new Set(array)];
    },
    /* Parse Date to readable locale 'es' format*/
    parseDate(date) {
      if (date) return moment(date).format("LLL");
      else return "Sin modificaciones.";
    },
    /* Init */
    async initialize() {
      this.loading = true;
      this.sponsors = [];
      this.products = [];
      this.manufacturers = [];

      const sponsors = this.$http.get("Sponsoreos");
      const products = this.$http.get("Simple", {
        params: { pageNumber: 1, pageSize: 100000 },
      });
      const manufacturers = this.$http.get("Fabricantes");

      const promises = [sponsors, products, manufacturers];

      await this.$http
        .all(promises)
        .then(
          this.$http.spread((...responses) => {
            const sponsorsRes = responses[0];
            const productsRes = responses[1];
            const manufacturersRes = responses[2];

            if (sponsorsRes && sponsorsRes.data)
              this.sponsors = sponsorsRes.data;

            if (productsRes && productsRes.data.list) {
              this.products = productsRes.data.list.map((p) =>
                Object.assign({}, { text: p.nombre, value: p.id })
              );
            }

            if (manufacturersRes && manufacturersRes.data) {
              this.manufacturers = manufacturersRes.data.map((m) => ({
                text: m.nombre,
                value: m.id,
              }));
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
      this.editedIndex = this.sponsors.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.dialog = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      this.dialog = false;
      this.dialogDelete = false;
      await this.$http
        .delete(`Sponsoreos/${this.editedId}`)
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
      });
    },

    /* Close delete dialog */
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedId = -1;
      });
    },

    /* Request api to insert or update*/
    async save() {
      if (this.editedIndex > -1 && this.editedId > -1) {
        this.loading = true;
        await this.$http
          .put(
            `Sponsoreos/${this.editedId}`,
            Object.assign({}, this.editedItem)
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
        await this.$http
          .post(
            "Sponsoreos",
            Object.assign(
              {},
              {
                nombre: this.editedItem.nombre,
                fechaInicio: this.editedItem.fechaInicio, // needs formatting
                fechaFin: this.editedItem.fechaFin, // idem
                horaInicio: this.editedItem.horaInicio,
                horaFin: this.editedItem.horaFin,
                idArticulo: this.editedItem.idArticulo,
                idFabricante: this.editedItem.idFabricante,
              }
            )
            /* Object.assign({}, this.editedItem) */
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