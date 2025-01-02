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

      <!-- Кнопка для входа -->
      <v-btn :disabled="!valid" @click="login">Login</v-btn>

      <!-- Кнопка для перехода на страницу регистрации -->
      <v-btn text @click="goToRegistration">Don't have an account? Register</v-btn>
    </v-form>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      valid: false,
      email: '',
      password: '',
      // Массив с функциями валидации
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

      // Отправка POST-запроса на логин
      axios.post('http://localhost:3000/login', loginData)
          .then((response) => {
            // Токен приходит в поле `token`, например, "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            const token = response.data.token;

            // Сохраняем токен в Vuex
            this.$store.dispatch('setToken', token);

            // Мокаем роль для клиента (поменяйте на нужную роль, если будете делать реальную авторизацию)
            this.$store.dispatch('setRole', 'client');

            // Редирект на профиль после логина
            this.$router.push('/profile');
          })
          .catch((error) => {
            console.error('Login failed:', error);
            // Обработать ошибку (например, показать сообщение об ошибке)
          });
    },

    goToRegistration() {
      // Переход на страницу регистрации
      this.$router.push('/register');
    },
  },
};
</script>
