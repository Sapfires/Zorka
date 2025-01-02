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
import { jwtDecode } from 'jwt-decode'; // Импортируем библиотеку для декодирования JWT

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
            // Токен приходит в ответе, например, "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            const token = response.data.token;
            console.log("Received token:", token); // Логируем полученный токен

            // Декодируем токен для извлечения данных
            const decodedToken = jwtDecode(token);
            console.log("Decoded token:", decodedToken); // Логируем декодированный токен

            // Извлекаем роль и ID пользователя из декодированного токена
            const role = decodedToken.role; // Предполагаем, что роль хранится в поле 'role'
            const userId = decodedToken.id; // Предполагаем, что ID хранится в поле 'id'

            // Логируем роль и ID
            console.log("Role from decoded token:", role);
            console.log("User ID from decoded token:", userId);

            // Сохраняем токен и роль в Vuex
            this.$store.dispatch('setToken', token);
            console.log("Saving token in Vuex:", token);

            this.$store.dispatch('setRole', role.toUpperCase()); // Сохраняем роль в верхнем регистре
            console.log("Saving role in Vuex:", role.toUpperCase()); // Логируем роль, которая сохраняется

            // Сохраняем ID, если оно нужно
            this.$store.dispatch('setUserId', userId);
            console.log("Saving user ID in Vuex:", userId);

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
