<template>
  <div class="login">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="username"
            label="Usuario"
            filled
            dense
            single-line
            :hide-details="true"
            :disabled="loading"
            :loading="loading"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="password"
            filled
            dense
            single-line
            :append-icon="showPwd ? 'fas fa-eye' : 'fas fa-eye-slash'"
            :type="showPwd ? 'text' : 'password'"
            label="Contraseña"
            counter
            @click:append="showPwd = !showPwd"
            :disabled="loading"
            :loading="loading"
            :hide-details="true"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-btn
            block
            color="info"
            :disabled="loading"
            :loading="loading"
            @click="login"
          >
            <v-icon class="mr-2">fas fa-save</v-icon>
            Ingresar
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "Login",
  components: {},
  data: () => ({
    loading: false,
    showPwd: false,
    username: "",
    password: "",
    staticUsr: "simplesale",
    staticPwd: "vt4gdm¡n-",
  }),
  methods: {
    login() {
      if (this.username && this.password) {
        this.loading = true;
        if (
          this.username === this.staticUsr &&
          this.password === this.staticPwd
        ) {
          setTimeout(() => {
            this.$emit("logged", true);
            this.loading = false;
          }, 2500);
        } else this.$emit("logged", false);
      } else this.$emit("logged", false);
    },
  },
};
</script>
