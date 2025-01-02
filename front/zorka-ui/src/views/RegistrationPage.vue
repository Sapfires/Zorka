<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="6" offset-md="2" offset-lg="3">
        <v-card>
          <v-card-title>
            <span class="headline">Registration</span>
          </v-card-title>
          <v-card-text>
            <v-form v-model="formValid">
              <v-text-field
                  label="Full Name"
                  v-model="fullName"
                  :rules="[rules.required]"
                  required
              ></v-text-field>

              <v-text-field
                  label="Email"
                  v-model="email"
                  :rules="[rules.required, rules.email]"
                  required
              ></v-text-field>

              <v-text-field
                  label="Password"
                  v-model="password"
                  :rules="[rules.required, rules.minLength]"
                  type="password"
                  required
              ></v-text-field>

              <v-text-field
                  label="Confirm Password"
                  v-model="confirmPassword"
                  :rules="[rules.required, rules.passwordMatch]"
                  type="password"
                  required
              ></v-text-field>

              <v-btn
                  :disabled="!formValid"
                  color="primary"
                  @click="submitForm"
              >
                Register
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "RegistrationPage",
  data() {
    return {
      formValid: false,
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      rules: {
        required: (value) => !!value || "This field is required.",
        email: (value) =>
            /.+@.+\..+/.test(value) || "Please enter a valid email address.",
        minLength: (value) =>
            value.length >= 6 || "Password must be at least 6 characters.",
        passwordMatch: (value) =>
            value === this.password || "Passwords do not match.",
      },
    };
  },
  methods: {
    submitForm() {
      // Логика отправки данных формы
      console.log("Form submitted with the following data:");
      console.log({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
      });

      // После успешной отправки можно, например, перенаправить на страницу входа
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
/* Стили для страницы регистрации */
.v-card {
  max-width: 400px;
  margin: auto;
}

.v-btn {
  width: 100%;
}
</style>
