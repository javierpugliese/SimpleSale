<template>
  <div class="login">
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

    <v-card color="#424242" class="pa-5 mx-auto" height="auto">
      <v-card-title class="d-flex justify-center text-h4">
        ¡Bienvenido!
      </v-card-title>
      <v-card-subtitle class="d-flex justify-center">
        <v-img
          alt="Logotipo de SimpliSales"
          class="shrink"
          contain
          min-width="100"
          src="@/assets/SimpliSales_mail_firma-01.png"
          width="150"
        />
      </v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text class="d-flex flex-column">
        <v-text-field
          v-model="username"
          label="Usuario"
          max-length="32"
          filled
          :hide-details="true"
          :disabled="loading"
          :loading="loading"
        ></v-text-field>
        <v-text-field
          v-model="password"
          class="mt-3"
          max-length="32"
          filled
          :append-icon="showPwd ? 'fas fa-eye' : 'fas fa-eye-slash'"
          :type="showPwd ? 'text' : 'password'"
          label="Contraseña"
          counter
          @click:append="showPwd = !showPwd"
          :disabled="loading"
          :loading="loading"
          :hide-details="true"
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="mx-2">
        <v-btn
          block
          large
          color="info"
          :disabled="loading"
          :loading="loading"
          @click="login"
        >
          INICIAR SESIÓN
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Login",
  components: {},  
  data: () => ({
    loading: false,
    showPwd: false,
    snackbar: false,
    snackbarColor: "#424242",
    snackbarText: "",
    username: "",
    password: "",
    staticUsr: "simplisales",
    staticPwd: "simplisales",
  }),
  methods: {
    login() {
      this.loading = true;
      if (this.username && this.password) {
        if (
          this.username === this.staticUsr &&
          this.password === this.staticPwd
        ) {
          this.loading = true;
          setTimeout(() => {
            this.$emit("logged", true);
            this.loading = false;
          }, 1250);
        } else {
          this.snackbar = true;
          this.snackbarColor = "danger";
          this.snackbarText = "Las credenciales ingresadas son incorrectas.";
          this.$emit("logged", false);
          this.loading = false;
        }
      } else {
        this.snackbar = true;
        this.snackbarColor = "danger";
        this.snackbarText = "Ingrese usuario y contraseña.";
        this.$emit("logged", false);
        this.loading = false;
      }
    },
  },
};
</script>
<style scoped>
.login {
  width: 100%;
  min-height: 95vh;
  height: auto;
  display: flex;
  align-items: center;
}
</style>