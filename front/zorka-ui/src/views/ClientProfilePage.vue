<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="6" offset-md="2" offset-lg="3">
        <v-card>
          <v-card-title>
            <span class="headline">Client Profile</span>
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                  label="First Name"
                  v-model="firstName"
                  required
              ></v-text-field>
              <v-text-field
                  label="Last Name"
                  v-model="lastName"
                  required
              ></v-text-field>
              <v-text-field
                  label="Email"
                  v-model="email"
                  required
                  :rules="[rules.email]"
              ></v-text-field>
              <v-text-field
                  label="Phone"
                  v-model="phone"
              ></v-text-field>
              <v-text-field
                  label="Password"
                  v-model="password"
                  type="password"
              ></v-text-field>
              <v-file-input
                  label="Profile Picture"
                  v-model="profilePicture"
                  accept="image/*"
              ></v-file-input>
              <v-btn color="primary" @click="saveProfile">Save Changes</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: "ClientProfilePage",
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      profilePicture: null,
      rules: {
        email: (value) =>
            /.+@.+\..+/.test(value) || "Please enter a valid email address.",
      },
    };
  },
  created() {
    this.fetchUserData();
  },
  methods: {
    // Метод для получения данных пользователя с бэкенда
    async fetchUserData() {
      try {
        // Получаем токен из Vuex или localStorage
        const token = this.$store.getters.token || localStorage.getItem("token");

        // Если токен отсутствует, редиректим на страницу логина
        if (!token) {
          this.$router.push('/login');
          return;
        }

        // Отправляем запрос на сервер
        const response = await axios.get('http://localhost:3000/users/3', {
          headers: {
            Authorization: `${token}` // Передаем токен в заголовке
          }
        });

        // Заполняем форму данными, полученными с сервера
        const { login, phone_number, photo } = response.data;

        this.email = login;
        this.phone = phone_number || ''; // Если нет телефона, оставляем пустое поле
        // Дополнительные данные, которые будут добавляться позже (например, фамилия и имя)
        this.firstName = ''; // Пока оставляем пустыми, добавим позже
        this.lastName = '';  // Пока оставляем пустыми, добавим позже
        this.profilePicture = photo || null; // Если есть фото, загружаем
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data. Please try again later.");
      }
    },

    // Метод для сохранения изменений профиля
    saveProfile() {
      // Логика для сохранения профиля (например, отправка данных на сервер)
      console.log("Profile updated:", {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        password: this.password,
        profilePicture: this.profilePicture,
      });

      // Здесь можно сделать запрос для сохранения данных, например:
      // this.saveProfileToBackend();
    },

    // Метод для отправки обновленных данных на сервер (по желанию)
    // async saveProfileToBackend() {
    //   try {
    //     const response = await axios.put('http://localhost:3000/users/3', {
    //       firstName: this.firstName,
    //       lastName: this.lastName,
    //       email: this.email,
    //       phone: this.phone,
    //       password: this.password,
    //       profilePicture: this.profilePicture,
    //     }, {
    //       headers: {
    //         Authorization: `Bearer ${this.$store.getters.token}`
    //       }
    //     });
    //     alert('Profile updated successfully!');
    //   } catch (error) {
    //     console.error("Error saving profile:", error);
    //     alert('Failed to update profile. Please try again later.');
    //   }
    // }
  },
};
</script>

<style scoped>
/* Стили для страницы профиля */
.v-card {
  max-width: 600px;
  margin: auto;
}
</style>
