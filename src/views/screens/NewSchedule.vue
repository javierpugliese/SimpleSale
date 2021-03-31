<template>
  <v-container id="new-schedule">
    <v-row>
      <v-col cols="6">
        <div class="text-h5">Períodos</div>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model="startDate"
          :value="moment_startDate"
          label="Fecha de activación"
          readonly
          filled
          dense
          hide-details
        >
        </v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model="endDate"
          :value="moment_endDate"
          label="Fecha de finalización"
          readonly
          filled
          dense
          hide-details
        >
        </v-text-field>
      </v-col>
      <v-col cols="2" class="d-flex align-center justify-end">
        <v-btn color="success" :disabled="!startDate || !endDate" block x-large>
          Agregar
          <v-icon class="ml-2">fas fa-arrow-circle-down</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex flex-column">
        <v-card
          v-for="(date, index) in dates"
          :key="index"
          height="auto"
          color="#424242"
          class="my-3"
        >
          <v-card-title>
            {{ formatDate(date.startDate) }}
            -
            {{ formatDate(date.endDate) }}
            <v-sheet
              v-if="date.persistent"
              v-text="`PERSISTENTE`"
              class="text-overline text-center px-3 ml-3"
              style="border-radius: 16px"
              color="info"
            >
            </v-sheet>
            <v-spacer></v-spacer>
            <v-btn color="red" text> Eliminar </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text v-if="!date.persistent && date.hours.length">
            <div class="text-h6">Horarios</div>
            <div class="d-flex flex-row">
              <v-sheet
                v-for="(hour, pos) in date.hours"
                :key="pos"
                color="success"
                width="250"
                class="mx-3"
              >
                <div class="text-overline">
                  {{ hour.start }} - {{ hour.end }}
                </div>
                <v-btn color="danger" icon>
                  <v-icon>fas fa-times</v-icon>
                </v-btn>
              </v-sheet>
            </div>
          </v-card-text>
          <v-divider></v-divider>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import moment from "moment";
export default {
  name: "NewSchedule",
  components: {},
  props: {},
  data: () => ({
    startDate: "",
    endDate: "",
    dates: [
      {
        startDate: new Date(),
        endDate: new Date(),
        persistent: true,
        hours: [
          { start: "8:00", end: "12:00" },
          { start: "13:00", end: "16:30" },
          { start: "18:00", end: "00:00" },
        ],
      },
      {
        startDate: new Date(),
        endDate: new Date(),
        persistent: false,
        hours: [
          { start: "8:00", end: "12:00" },
          { start: "13:00", end: "16:30" },
          { start: "18:00", end: "00:00" },
        ],
        days: ["L", "M", "X", "J", "V", "S", "D"],
      },
    ],
  }),
  watch: {},
  computed: {
    moment_startDate() {
      return this.startDate ? moment(this.startDate).format("DD/MM/YYYY") : "";
    },
    moment_endDate() {
      return this.startDate ? moment(this.startDate).format("DD/MM/YYYY") : "";
    },
  },
  methods: {
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
  },
  mounted: () => ({}),
};
</script>
<style scoped>
</style>