<template>
  <v-container>
    <v-form v-model="valid" lazy-validation>
      <v-text-field
          v-model="email"
          label="Email"
          :rules="emailRules"
          required
      ></v-text-field>
      <v-text-field
          v-model="password"
          label="Password"
          type="password"
          :rules="passwordRules"
          required
      ></v-text-field>

      <v-btn :disabled="!valid" @click="login">Login</v-btn>

      <v-btn text @click="goToRegistration">Don't have an account? Register</v-btn>
    </v-form>
  </v-container>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
      valid: false,
      email: '',
      password: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters',
      ],
    };
  },
  methods: {
    login() {
      const loginData = {
        login: this.email,
        password: this.password,
      };

      axios.post('http://localhost:3000/login', loginData)
          .then((response) => {
            const token = response.data.token;
            console.log("Received token:", token);

            const decodedToken = jwtDecode(token);
            console.log("Decoded token:", decodedToken);

            const role = decodedToken.role;
            const userId = decodedToken.id;

            console.log("Role from decoded token:", role);
            console.log("User ID from decoded token:", userId);

            this.$store.dispatch('setToken', token);
            console.log("Saving token in Vuex:", token);

            this.$store.dispatch('setRole', role.toUpperCase());
            console.log("Saving role in Vuex:", role.toUpperCase());

            this.$store.dispatch('setUserId', userId);
            console.log("Saving user ID in Vuex:", userId);

            if (role === 'CLIENT') {
              this.$router.push('/profile');
            } else if (role === 'ADMIN') {
              this.$router.push('/admin/clients');
            } else {
              this.$router.push('/');
            }
          })
          .catch((error) => {
            console.error('Login failed:', error);
          });
    },

    goToRegistration() {
      this.$router.push('/register');
    },
  },
};
</script>
