<template>
  <div class="planogram-list">
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
        :items="planograms"
        :loading="loading"
        @click:row="editItem"
        loading-text="Cargando..."
        sort-by="nombre"
        class="elevation-1 table-cursor"
        :disable-pagination="true"
        :hide-default-footer="true"
      >
        <template v-slot:item.modificado="{ item }">
          {{ parseDate(item.modificado) }}
        </template>

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Planogramas</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-scale-transition>
              <v-dialog
                v-model="dialogSearch"
                width="30%"
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
                    disabled
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
                        <v-col cols="12">
                          <v-text-field
                            v-model="searchItem.nombre"
                            label="Nombre"
                            counter="50"
                            maxlength="50"
                            outlined
                            clearable
                            single-line
                            dense
                          ></v-text-field>
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
              width="%50"
              overlay-color="blue"
              overlay-opacity="0.2"
              scrollable
              persistent
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="my-3"
                  v-bind="attrs"
                  v-on="on"
                  :loading="loading"
                  to="/pantallas/planogramas/editor"
                >
                  <v-icon class="mr-2">fas fa-location-arrow</v-icon>
                  Ir al editor
                </v-btn>
              </template>
              <v-card height="auto">
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container> </v-container>
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
                  ¿Eliminar este planograma?
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
          No hay promociones disponibles
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
  name: "PlanogramList",
  components: {},
  data: () => ({
    loading: false,
    search: "",
    headers: [
      {
        text: "Título",
        align: "start",
        sortable: true,
        value: "titulo",
      },
      {
        text: "Fecha de finalización",
        align: "start",
        sortable: true,
        value: "modificado",
      },
    ],

    planograms: [],
    products: [],

    delimiters: [",", ".", "-", "/", " "],
    dialog: false,
    dialogDelete: false,
    dialogSearch: false,
    modal: false,
    editedIndex: -1,
    editedId: -1,
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    editedItem: {
      nombre: "",
      titulo: "",
    },
    defaultItem: {
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
      hastaAgotarStock: false,
      porcentajeDescuento: 0,
      cantidadMinima: 1,
      montoDescuento: 0,
      idTipo: -1,
      idTipoItem: -1,
      items: [],
      destinatarios: [],
    },
    searchItem: { nombre: "" },
    defaultSearchItem: { nombre: "" },
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
      return this.editedIndex === -1 ? "Nuevo Planograma" : "Editar Planograma";
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
      this.planograms = [];

      const planograms = this.$http.get("Gondolas");

      const promises = [planograms];

      await this.$http
        .all(promises)
        .then(
          this.$http.spread((...responses) => {
            const planogramsRes = responses[0];

            if (planogramsRes && planogramsRes.data)
              this.planograms = planogramsRes.data;
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
      this.editedIndex = this.planograms.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.dialog = true;
      this.$router.push({
        name: "PlanogramListById",
        params: { id: this.editedId.toString() },
      });
    },

    async deleteItemConfirm() {
      this.loading = true;
      this.dialog = false;
      this.dialogDelete = false;
      await this.$http
        .delete(`Gondolas/${this.editedId}`)
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
      this.close();
      this.initialize();
    },
  },
  mounted: function () {
    this.initialize();
  },
};
</script>