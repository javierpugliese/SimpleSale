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
        :items="[]"
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

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Lista de Planogramas</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog
              v-model="dialog"
              fullscreen
              hide-overlay
              transition="dialog-bottom-transition"
              scrollable
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
                  to="/pantallas/planogramas/editor"
                >
                  <v-icon class="mr-2">fas fa-location-arrow</v-icon>
                  Ir al editor
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <!-- Form -->
                      <v-col cols="6">
                        <v-row>
                          <v-col cols="6">
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
                          <v-col
                            cols="6"
                            class="d-flex justify-center justify-sm-start"
                          >
                            <v-switch
                              v-model="editedItem.hastaAgotarStock"
                              label="¿Válida hasta agotar stock?"
                            >
                            </v-switch>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="6">
                            <v-autocomplete
                              v-model="editedItem.tipoPromocion"
                              :items="promoTypes"
                              label="Tipo"
                              maxlength="50"
                              clearable
                              outlined
                              small-chips
                            ></v-autocomplete>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model.number="promoTypeValue"
                              label="Valor de descuento"
                              value="0.00"
                              outlined
                              clearable
                              required
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="6">
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
                                  label="Fecha de inicio ~ Fecha de finalización"
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
                                <v-btn
                                  text
                                  color="primary"
                                  @click="modal = false"
                                >
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
                          <v-col cols="6">
                            <v-text-field
                              v-model.number="editedItem.cantidadMinima"
                              label="Cantidad mínima de entidades aplicables"
                              outlined
                              clearable
                              required
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12">
                            <div class="text-h6">Entidades aplicables</div>
                          </v-col>
                          <v-col cols="6">
                            <v-autocomplete
                              v-model="applicableManufacturers"
                              :items="manufacturers"
                              label="Fabricantes"
                              maxlength="50"
                              multiple
                              clearable
                              outlined
                              small-chips
                            ></v-autocomplete>
                          </v-col>
                          <v-col cols="6">
                            <v-autocomplete
                              v-model="applicableCategories"
                              :items="categories"
                              label="Categorías"
                              maxlength="50"
                              multiple
                              clearable
                              outlined
                              small-chips
                            ></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12">
                            <div class="text-h6">Destinatarios aplicables</div>
                          </v-col>
                          <v-col cols="6">
                            <v-autocomplete
                              v-model="applicableProvinces"
                              :items="provinces"
                              label="Provincias"
                              maxlength="50"
                              multiple
                              clearable
                              outlined
                              small-chips
                            ></v-autocomplete>
                          </v-col>
                          <v-col cols="6">
                            <v-autocomplete
                              v-model="applicableRegions"
                              :items="regions"
                              label="Regiones"
                              maxlength="50"
                              multiple
                              clearable
                              outlined
                              small-chips
                            ></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="6">
                            <v-autocomplete
                              v-model="applicableClients"
                              :items="clients"
                              label="Farmacías"
                              maxlength="50"
                              multiple
                              clearable
                              outlined
                              small-chips
                            ></v-autocomplete>
                          </v-col>
                          <v-col cols="6">
                            <v-autocomplete
                              v-model="applicableClientGroups"
                              :items="clientGroups"
                              label="Grupos de farmacias"
                              maxlength="50"
                              multiple
                              clearable
                              outlined
                              small-chips
                            ></v-autocomplete>
                          </v-col>
                        </v-row>
                      </v-col>
                      <!-- Choosen products or entities -->
                      <v-col cols="6"> </v-col>
                    </v-row>
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
                  ¿Eliminar esta promoción?
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
        text: "Nombre",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      {
        text: "Tipo",
        align: "start",
        sortable: true,
        value: "tipoPromocion.nombre",
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
    ],
    products: [],
    productTypes: [],
    attributes: [],
    attributeTypes: [],
    promoTypes: [],

    applicableManufacturers: [],
    manufacturers: [],
    applicableCategories: [],
    categories: [],
    applicableProvinces: [],
    provinces: [],
    applicableRegions: [],
    regions: [],
    applicableClients: [],
    clients: [],
    applicableClientGroups: [],
    clientGroups: [],

    delimiters: [",", ".", "-", "/", " "],
    dialog: false,
    dialogDelete: false,
    modal: false,
    editedIndex: -1,
    editedId: -1,
    editedItem: {
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
    snackbar: false,
    snackbarText: "",
    snackbarColor: "black",
    promoTypeValue: 0,
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
      return this.editedIndex === -1 ? "Nueva Promoción" : "Editar Promoción";
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
      this.products = [];
      this.manufacturers = [];
      this.categories = [];
      this.attributeTypes = [];

      const products = this.$http.get("Articulos", {
        params: { pageNumber: this.page, pageSize: this.itemsPerPage },
      });
      const manufacturers = this.$http.get("Fabricantes");
      const productTypes = this.$http.get("TiposArticulo");
      const categories = this.$http.get("CategoriasArticulo");
      const attributeTypes = this.$http.get("TiposDeAtributo");

      const promises = [
        products,
        manufacturers,
        productTypes,
        categories,
        attributeTypes,
      ];

      await this.$http
        .all(promises)
        .then(
          this.$http.spread((...responses) => {
            const productsRes = responses[0];
            const manufacturersRes = responses[1];
            const productTypesRes = responses[2];
            const categoriesRes = responses[3];
            const attrTypesRes = responses[4];

            if (productsRes && productsRes.data.list) {
              this.products = productsRes.data.list;
              this.pages = productsRes.data.totalPages;
              this.totalRecords = productsRes.data.totalRecords;
            }
            if (manufacturersRes && manufacturersRes.data) {
              this.manufacturers = manufacturersRes.data.map((m) => ({
                text: m.nombre,
                value: m.id,
              }));
            }
            if (productTypesRes && productTypesRes.data) {
              this.productTypes = productTypesRes.data.map((pt) => ({
                text: pt.nombre,
                value: pt.id,
              }));
            }
            if (categoriesRes && categoriesRes.data) {
              this.categories = categoriesRes.data.map((c) => ({
                text: c.nombre,
                value: c.id,
              }));
            }
            if (attrTypesRes && attrTypesRes.data) {
              let list = attrTypesRes.data;
              let attributes = [];

              for (let at of list) {
                if (at.atributos && at.atributos.length > 0) {
                  attributes.push(
                    Object.assign({}, { header: at.nombre.toUpperCase() })
                  );
                  attributes.push(Object.assign({}, { divider: true }));
                  for (let a of at.atributos) {
                    attributes.push(
                      Object.assign(
                        {},
                        {
                          text: a.nombre,
                          value: a.id,
                        }
                      )
                    );
                  }
                }
              }
              this.attributes = attributes;
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
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedId = item.id || -1;
      if (item.tipoArticulo) {
        this.editedItem.tipoArticulo = item.tipoArticulo.id;
      } else this.editedItem.tipoArticulo = -1;
      if (item.fabricante) {
        this.editedItem.idFabricante = item.fabricante.id;
      } else this.editedItem.idFabricante = -1;

      // removeArrDuplicates prevents key duplicates in component render
      if (item.categorias && item.categorias.length) {
        this.editedItem.categorias = this.removeArrDuplicates(
          item.categorias.map((c) => c.id)
        );
      } else this.editedItem.categorias = [];
      if (item.atributos && item.atributos.length) {
        this.editedItem.atributos = this.removeArrDuplicates(
          item.atributos.map((a) => a.id)
        );
      } else this.editedItem.atributos = [];
      if (item.codigosDeBarra && item.codigosDeBarra.length) {
        this.editedItem.codigosDeBarra = this.removeArrDuplicates(
          item.codigosDeBarra.map((b) => b.ean)
        );
      } else this.editedItem.codigosDeBarra = [];
      this.dialog = true;
    },

    async deleteItemConfirm() {
      this.loading = true;
      this.dialog = false;
      this.dialogDelete = false;
      await this.$http
        .delete(`Articulos/${this.editedId}`)
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
            `Articulos/${this.editedId}`,
            Object.assign(
              {},
              {
                nombre: this.editedItem.nombre,
                sku: this.editedItem.sku,
                precio: this.editedItem.precio,
                activo: this.editedItem.activo,
                etiquetas: this.editedItem.etiquetas,
                descripcion: this.editedItem.descripcion,
                descripcionLarga: this.editedItem.descripcionLarga,
                prospecto: this.editedItem.prospecto,
                categorias: this.editedItem.categorias,
                atributos: this.editedItem.atributos,
                idFabricante: this.editedItem.idFabricante,
                idTipo: this.editedItem.tipoArticulo,
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
        await this.$http
          .post(
            "Articulos",
            Object.assign(
              {},
              {
                nombre: this.editedItem.nombre,
                sku: this.editedItem.sku,
                precio: this.editedItem.precio,
                activo: this.editedItem.activo,
                etiquetas: this.editedItem.etiquetas,
                descripcion: this.editedItem.descripcion,
                descripcionLarga: this.editedItem.descripcionLarga,
                prospecto: this.editedItem.prospecto,
                categorias: this.editedItem.categorias,
                atributos: this.editedItem.atributos,
                codigosDeBarra: this.editedItem.codigosDeBarra,
                idFabricante: this.editedItem.idFabricante,
                idTipo: this.editedItem.tipoArticulo,
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