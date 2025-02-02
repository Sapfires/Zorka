<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Edit Master</span>
            <v-spacer></v-spacer>
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- Квадратная область для загрузки изображения -->
              <v-avatar
                  size="120"
                  class="mr-4"
                  :style="imageBase64 ? '' : 'cursor: pointer; background-color: #f0f0f0;'"
                  @click="triggerFileInput"
              >
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

              <!-- Логин -->
              <v-text-field
                  v-model="master.login"
                  label="Login"
                  required
              ></v-text-field>

              <!-- Пароль -->
              <v-text-field
                  v-model="master.password"
                  label="Password"
                  type="password"
                  required
              ></v-text-field>

              <!-- Имя мастера -->
              <v-text-field
                  v-model="master.first_name"
                  label="First Name"
                  required
              ></v-text-field>

              <v-text-field
                  v-model="master.last_name"
                  label="Last Name"
                  required
              ></v-text-field>

              <!-- Ставка зарплаты -->
              <v-text-field
                  v-model="master.rate_of_salary"
                  label="Rate of Salary"
                  required
                  type="number"
              ></v-text-field>

              <!-- Опыт работы -->
              <v-text-field
                  v-model="master.work_experience"
                  label="Work Experience (years)"
                  required
                  type="number"
              ></v-text-field>

              <!-- Краткая информация -->
              <v-textarea
                  v-model="master.brief_information"
                  label="Brief Information"
                  required
              ></v-textarea>

              <!-- Выбор услуг -->
              <v-select
                  v-model="selectedServices"
                  :items="allServices"
                  item-text="name"
                  item-value="id"
                  label="Select Services"
                  multiple
                  required
              ></v-select>

              <v-btn @click="saveMaster" color="primary" :disabled="isUploading || !valid">
                Save Changes
              </v-btn>

              <v-alert v-if="error" type="error" dismissible>
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      imageBase64: "", // Для хранения Base64 изображения
      isUploading: false, // Индикатор загрузки
      error: "", // Сообщения об ошибке
      valid: false, // Для валидации формы
      master: {
        login: "",
        password: "",
        first_name: "",
        last_name: "",
        rate_of_salary: "",
        work_experience: "",
        brief_information: "",
      },
      allServices: [], // Список всех доступных сервисов
      selectedServices: [], // Выбранные сервисы для мастера
    };
  },
  created() {
    this.fetchMasterData();
    this.fetchAllServices();
  },
  methods: {
    // Загружаем данные о мастере
    async fetchMasterData() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const response = await axios.get(`http://localhost:3000/masters/${this.$route.params.id}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        this.master = response.data;
        this.selectedServices = response.data.services.map(service => service.id);
        this.imageBase64 = response.data.photo; // Загружаем фото мастера
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    },

    // Загружаем все доступные сервисы
    async fetchAllServices() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/services", {
          headers: {
            Authorization: `${token}`,
          },
        });

        this.allServices = response.data;
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },

    // Метод для сохранения данных о мастере
    async saveMaster() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const updatedMaster = {
          ...this.master,
          services: this.selectedServices.map(serviceId => ({ id: serviceId })), // Преобразуем ID услуг
          photo: this.imageBase64, // Добавляем фото
        };

        if (this.master.user_id) {
          // PUT запрос на обновление существующего мастера
          await axios.put(`http://localhost:3000/masters/${this.master.user_id}`, updatedMaster, {
            headers: {
              Authorization: `${token}`,
            },
          });
        } else {
          // POST запрос на добавление нового мастера
          await axios.post("http://localhost:3000/masters", updatedMaster, {
            headers: {
              Authorization: `${token}`,
            },
          });
        }

        // Перенаправляем на страницу мастеров после сохранения
        this.$router.push("/admin/masters");
      } catch (error) {
        console.error("Error saving master data:", error);
        this.error = "Ошибка при сохранении данных.";
      }
    },

    // Метод для выбора изображения
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageBase64 = reader.result;
        };
        reader.readAsDataURL(file);
      }
    },

    // Метод для вызова input выбора файла
    triggerFileInput() {
      this.$refs.fileInput.click();
    }
  },
};
</script>

<style scoped>
/* Стили можно добавить по необходимости */
</style>
