<template>
  <v-col cols="12" sm="6">
    <v-row>
      <v-col cols="12">
        <div class="text-h6">Fechas y horarios aplicables</div>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="6">
        <v-dialog
          ref="dialogInitDate"
          v-model="modalInitDate"
          :return-value.sync="editedScheduleItem.fechaInicio"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="moment_initDateFormatted"
              label="Fecha de inicio"
              readonly
              outlined
              dense
              hide-details
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="editedScheduleItem.fechaInicio"
            scrollable
            dense
            :allowed-dates="disablePastDates"
            @input="saveInitDate"
          >
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="modalInitDateClose">
              Cerrar
            </v-btn>
          </v-date-picker>
        </v-dialog>
      </v-col>
      <v-col cols="12" sm="6">
        <v-dialog
          ref="dialogEndDate"
          v-model="modalEndDate"
          :return-value.sync="editedScheduleItem.fechaFin"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="moment_endDateFormatted"
              label="Fecha de finalización"
              readonly
              outlined
              dense
              :disabled="!editedScheduleItem.fechaInicio"
              hide-details
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="editedScheduleItem.fechaFin"
            @input="saveEndDate"
            :allowed-dates="disablePastEndDates"
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="modalEndDateClose">
              Cancelar
            </v-btn>
          </v-date-picker>
        </v-dialog>
      </v-col>
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
              dense
              single-line
              hide-details
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-time-picker
            v-if="modal2"
            v-model="time"
            :allowed-minutes="allowedMinutes"
            format="24hr"
            @click:minute="
              $refs.dialog2.save(time);
              modal2Close();
            "
            full-width
          >
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="modal2Close"> Cerrar </v-btn>
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
              dense
              single-line
              hide-details
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-time-picker
            v-if="modal3"
            v-model="time1"
            :allowed-minutes="allowedMinutes"
            format="24hr"
            @click:minute="
              $refs.dialog3.save(time1);
              modal3Close();
            "
            full-width
          >
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="modal3Close"> Cerrar </v-btn>
          </v-time-picker>
        </v-dialog>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="text-h6 text-left">Destinos aplicables</div>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="6">
        <v-autocomplete
          v-model="editedScheduleItem.provinces"
          :items="provinces"
          label="Provincias"
          maxlength="50"
          multiple
          clearable
          outlined
          small-chips
          dense
          single-line
          hide-details
          @change="getLocations"
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" sm="6">
        <v-autocomplete
          v-model="editedScheduleItem.locations"
          :items="syncedLocations"
          label="Localidades"
          maxlength="50"
          multiple
          clearable
          outlined
          small-chips
          dense
          single-line
          hide-details
        ></v-autocomplete>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="editedScheduleItem.regions"
          :items="regions"
          label="Regiones"
          maxlength="50"
          multiple
          clearable
          outlined
          small-chips
          dense
          single-line
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="editedScheduleItem.zones"
          :items="zones"
          label="Zonas"
          maxlength="50"
          multiple
          clearable
          outlined
          small-chips
          dense
          single-line
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="editedScheduleItem.sectors"
          :items="sectors"
          label="Sectores"
          maxlength="50"
          multiple
          clearable
          outlined
          small-chips
          dense
          single-line
        ></v-autocomplete>
      </v-col>
    </v-row>
  </v-col>
</template>
<script>
import moment from "moment";
export default {
  name: "SheduleForm",
  data: () => ({
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
    provinces: [],
    locations: [],
    syncedLocations: [],
    regions: [],
    zones: [],
    sectors: [],
    allowedMinutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    editedScheduleItem: {
      provinces: [],
      locations: [],
      regions: [],
      zones: [],
      sectors: [],
      fechaInicio: "",
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
    },
    defaultScheduleItem: {
      provinces: [],
      locations: [],
      regions: [],
      zones: [],
      sectors: [],
      fechaInicio: "",
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
    },
  }),
  watch: {},
  computed: {
    moment_initDateFormatted() {
      return this.editedScheduleItem.fechaInicio
        ? moment(this.editedScheduleItem.fechaInicio).format("DD/MM/YYYY")
        : "";
    },
    moment_endDateFormatted() {
      return this.editedScheduleItem.fechaFin
        ? moment(this.editedScheduleItem.fechaFin).format("DD/MM/YYYY")
        : "";
    },
  },
  methods: {
    getLocations() {
      this.syncedLocations = this.locations.filter((x) =>
        this.editedScheduleItem.provinces.includes(+x.provinceId)
      );
    },
    async initialize() {
      this.loading = true;
      this.regions = [];
      this.zones = [];
      this.sectors = [];
      this.provinces = [];
      this.locations = [];
      this.syncLocations = [];

      const regionsReq = this.$http.get("Regiones");
      const zonesReq = this.$http.get("Zonas");
      const sectorsReq = this.$http.get("Sectores");
      const provincesReq = this.$http.get("Provincias");
      const locationsReq = this.$http.get("Localidades"); // TODO: Use province endpoint to filter

      const promises = [
        regionsReq,
        zonesReq,
        sectorsReq,
        provincesReq,
        locationsReq,
      ];

      await this.$http
        .all(promises)
        .then(
          this.$http.spread(async (...responses) => {
            const regionsRes = responses[0];
            const zonesRes = responses[1];
            const sectorsRes = responses[2];
            const provincesRes = responses[3];
            const locationsRes = responses[4];

            if (regionsRes && regionsRes.data) {
              this.regions = regionsRes.data.map((r) => ({
                text: r.nombre,
                value: r.id,
              }));
            }
            if (zonesRes && zonesRes.data) {
              this.zones = zonesRes.data.map((z) => ({
                text: z.nombre,
                value: z.id,
              }));
            }
            if (sectorsRes && sectorsRes.data) {
              this.sectors = sectorsRes.data.map((s) => ({
                text: s.nombre,
                value: s.id,
              }));
            }
            if (provincesRes && provincesRes.data) {
              this.provinces = await provincesRes.data.map((s) => ({
                text: s.nombre,
                value: s.id,
              }));
              if (locationsRes && locationsRes.data) {
                this.locations = locationsRes.data.map((s) => ({
                  text: s.nombre,
                  value: s.id,
                  provinceId: s.idProvincia,
                }));
              }
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
    saveInitDate() {
      let initDate = new Date(this.editedScheduleItem.fechaInicio)
        .toISOString()
        .substr(0, 10);

      if (this.editedScheduleItem.fechaFin) {
        let endDate = new Date(this.editedScheduleItem.fechaFin)
          .toISOString()
          .substr(0, 10);
        if (moment(initDate.toString()).isBefore(endDate.toString())) {
          this.$refs.dialogInitDate.save(this.editedScheduleItem.fechaInicio);
          this.modalInitDateClose();
          return;
        } else {
          this.editedScheduleItem.fechaFin = "";
        }
      }
      this.$refs.dialogInitDate.save(this.editedScheduleItem.fechaInicio);
      this.modalInitDateClose();
    },
    saveEndDate() {
      this.$refs.dialogEndDate.save(this.editedScheduleItem.fechaFin);
      this.modalEndDateClose();
    },
    disablePastDates(val) {
      let date = new Date().toISOString().substr(0, 10);
      return val >= date;
    },
    disablePastEndDates(val) {
      return (
        val >=
        new Date(this.editedScheduleItem.fechaInicio)
          .toISOString()
          .substr(0, 10)
      );
    },

    modalInitDateClose() {
      this.modalInitDate = false;
      this.$nextTick = () => {
        this.editedScheduleItem.fechaInicio = "";
      };
    },
    modalEndDateClose() {
      this.modalEndDate = false;
      this.$nextTick = () => {
        this.editedScheduleItem.fechaFin = "";
      };
    },
    modal2Close() {
      this.modal2 = false;
      this.$nextTick = () => {
        this.time = "";
        this.editedScheduleItem.horaInicio = "";
      };
    },
    modal3Close() {
      this.modal3 = false;
      this.$nextTick = () => {
        this.time1 = "";
        this.editedScheduleItem.horaFin = "";
      };
    },
  },
  mounted: function () {
    this.initialize();
  },
};
</script>
<style scoped>
</style>