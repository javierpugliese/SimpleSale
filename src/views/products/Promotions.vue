<template>
  <div class="promotions">
    <v-container>
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

      <v-toolbar color="#1F96A3" dark>
        <v-scroll-y-transition>
          <v-toolbar-title class="text-overline">Sponsors</v-toolbar-title>
        </v-scroll-y-transition>
        <v-spacer></v-spacer>
        <v-scale-transition>
          <v-btn
            small
            :color="$vuetify.breakpoint.xsOnly ? 'none' : '#55AA99'"
            @click="dialog = true"
            :icon="$vuetify.breakpoint.xsOnly ? true : false"
            class="mx-1"
            :disabled="loading"
          >
            <v-icon :class="$vuetify.breakpoint.xsOnly ? '' : 'mr-2'">
              fas fa-cloud-upload-alt
            </v-icon>
            {{ !$vuetify.breakpoint.xsOnly ? "Nuevo Sponsor" : "" }}
          </v-btn>
        </v-scale-transition>
      </v-toolbar>

      <v-dialog
        v-model="dialog"
        :fullscreen="$vuetify.breakpoint.xsOnly"
        hide-overlay
        scrollable
      >
        <v-card>
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
                      ref="dialog"
                      v-model="modal"
                      :return-value.sync="dates"
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
                          v-bind="attrs"
                          v-on="on"
                          @click:clear="dates = []"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="dates" scrollable range>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modal = false">
                          Cancelar
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.dialog.save(dates)"
                        >
                          Aceptar
                        </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12" sm="6"> </v-col>
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
                          label="Hora de Inicio"
                          prepend-icon="fas fa-clock"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-time-picker v-if="modal2" v-model="time" full-width>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modal2 = false">
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
                          label="Hora de Fin"
                          prepend-icon="fas fa-clock"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-time-picker v-if="modal3" v-model="time1" full-width>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="modal3 = false">
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
              v-if="editedIndex > -1"
              color="red"
              text
              @click="deleteItemConfirm"
            >
              Eliminar
            </v-btn>
            <v-btn color="success" @click="save">
              <v-icon class="mr-2"> fas fa-save </v-icon>
              Guardar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-card-title class="headline">
            ¿Está seguro de que quiere eliminar este sponsor?
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

      <div class="d-flex flex-column">
        <v-card
          v-for="s in sponsors"
          :key="s.id"
          class="my-3"
          elevation="2"
          outlined
          shaped
        >
          <v-card-title>
            {{ s.nombre || "Sponsor" }}
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>fas fa-ellipsis-v</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle>
            {{ moment(s.fechaInicio).format("L") }} -
            {{ moment(s.fechaFin).format("L") }}
          </v-card-subtitle>
          <v-card-text></v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script>
import moment from "moment";
// @ is an alias to /src
export default {
  name: "Promotions",
  components: {},
  data: () => ({
    loading: false,
    page: 1,
    pages: 1,
    itemsPerPage: 10,
    totalRecords: 0,
    search: "",
    dialog: false,
    dialogDelete: false,
    editedIndex: -1,
    editedId: -1,
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    editedItem: {
      nombre: "",
      fechaInicio: moment().format("L"),
      fechaFin: moment().format("L"),
      horaInicio: moment().format("LT"),
      horaFin: moment().format("LT"),
      idArticulo: -1,
    },
    defaultItem: {
      nombre: "",
      fechaInicio: moment().format("L"),
      fechaFin: moment().format("L"),
      horaInicio: moment().format("LT"),
      horaFin: moment().format("LT"),
      idArticulo: -1,
    },
    sponsors: [],
    products: [],
    dates: [],
    modal: false,
    modal2: false,
    modal3: false,
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
    dates(val) {
      console.log("DATES", val);
    },
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Sponsor" : "Editar Sponsor";
    },
    computedDateFormattedMomentjs() {
      if (this.dates) {
        let dates = [...this.dates];
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
    previousPage() {
      this.page--;
    },
    nextPage() {
      this.page++;
    },
    async initialize() {
      this.loading = true;
      this.sponsors = [];

      const data = this.$http.get("Sponsoreos");

      await data
        .then((res) => {
          if (res.data && res.data.length !== 0) {
            let sponsors = res.data;
            this.sponsors = sponsors;
          } else {
            return Promise.reject();
          }
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.editedIndex = this.sponsors.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.editedItem.idArticulo = item.articulo.id || -1;
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.sponsors.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      this.editedItem.idArticulo = item.articulo.id || -1;
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      const request = this.$http.delete(`Sponsoreos/${this.editedId}`);
      await request
        .then((res) => {
          if (res) {
            this.snackbarText = "Se eliminó el sponsor exitosamente.";
            this.snackbarColor = "success";
            this.snackbar = true;
          }
        })
        .catch((err) => {
          if (err) {
            console.log(err);
            this.snackbarText = "¡ERROR! No se pudo eliminar el sponsor.";
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
      let request;
      if (this.editedIndex > -1 && this.editedId > -1) {
        Object.assign(this.sponsors[this.editedIndex], this.editedItem);
        request = this.$http.put(
          `Sponsoreos/${this.editedId}`,
          this.editedItem
        );
        await request
          .then((res) => {
            if (res) {
              this.snackbarText = "Se actualizó el sponsor exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el sponsor.";
              this.snackbarColor = "danger";
              this.snackbar = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        request = this.$http.post("Sponsoreos", this.editedItem);
        await request
          .then((res) => {
            if (res) {
              this.snackbarText = "Se agregó el sponsor exitosamente.";
              this.snackbarColor = "success";
              this.snackbar = true;
            }
          })
          .catch((err) => {
            console.log(err);
            if (err) {
              this.snackbarText = "¡ERROR! No se pudo guardar el sponsor.";
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
  mounted() {
    this.initialize();
  },
};
</script>