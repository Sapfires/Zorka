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

              <!-- Квадратная область для загрузки изображения -->
              <v-avatar
                  size="120"
                  class="mr-4"
                  :style="imageBase64 ? '' : 'cursor: pointer; background-color: #f0f0f0;'"
                  @click="triggerFileInput"
              >
                <!-- Обработчик клика -->
                <!-- Отображаем изображение, если оно есть -->
                <v-img
                    v-if="imageBase64"
                    :src="imageBase64"
                    alt="Uploaded Image"
                    class="rounded-lg"
                ></v-img>
                <!-- Если изображения нет, отображаем иконку -->
                <v-icon v-else>mdi-camera</v-icon>
              </v-avatar>

              <!-- Скрытый input для выбора файла -->
              <input
                  ref="fileInput"
                  type="file"
                  style="display: none;"
                  accept="image/*"
                  @change="handleFileChange"
              />


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
      imageBase64: "", // Для хранения Base64 изображения
      isUploading: false, // Индикатор загрузки
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      photo: this.imageBase64,
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
    triggerFileInput() {
      this.$refs.fileInput.click(); // Открываем окно выбора файла
    },

    handleFileChange(event) {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = () => {
          this.imageBase64 = reader.result; // Сохраняем изображение в формате Base64
        };

        reader.readAsDataURL(file); // Чтение файла в формате Base64
      }
    },

    // Метод для получения данных пользователя с бэкенда
    async fetchUserData() {
      try {
        // Получаем токен из Vuex или localStorage
        const token = this.$store.getters.token || localStorage.getItem("token");
        const userId = this.$store.getters.userId || localStorage.getItem("userId");
        // Если токен отсутствует, редиректим на страницу логина
        if (!token) {
          await this.$router.push('/login');
          return;
        }

        // Отправляем запрос на сервер
        const response = await axios.get(`http://localhost:3000/users/${userId}`, {
          headers: {
            Authorization: `${token}` // Передаем токен в заголовке
          }
        });

        // Заполняем форму данными, полученными с сервера
        const { login, phone_number, first_name, last_name, photo } = response.data;

        this.email = login;
        this.phone = phone_number || ''; // Если нет телефона, оставляем пустое поле
        // Дополнительные данные, которые будут добавляться позже (например, фамилия и имя)
        this.firstName = first_name; // Пока оставляем пустыми, добавим позже
        this.lastName = last_name;  // Пока оставляем пустыми, добавим позже
        this.imageBase64 = photo;
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
        photo: this.imageBase64,
      });

      // Здесь можно сделать запрос для сохранения данных, например:
      this.saveProfileToBackend();
    },

    // Метод для отправки обновленных данных на сервер (по желанию)
    async saveProfileToBackend() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        const userId = this.$store.getters.userId || localStorage.getItem("userId");
        // Если токен отсутствует, редиректим на страницу логина
        if (!token) {
          await this.$router.push('/login');
          return;
        }
        await axios.put(`http://localhost:3000/users/${userId}`, {
          first_name: this.firstName,
          last_name: this.lastName,
          email: this.email,
          phone_number: this.phone,
          password: this.password,
          login: this.email,
          photo: this.imageBase64
        }, {
          headers: {
            Authorization: `${token}`
          }
        });
        alert('Profile updated successfully!');
      } catch (error) {
        console.error("Error saving profile:", error);
        alert('Failed to update profile. Please try again later.');
      }
    }
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
