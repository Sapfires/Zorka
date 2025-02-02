<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Edit Service</span>
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

              <!-- Название сервиса -->
              <v-text-field
                  v-model="serviceData.name"
                  label="Service Name"
                  :rules="nameRules"
                  required
              ></v-text-field>

              <!-- Описание сервиса -->
              <v-textarea
                  v-model="serviceData.description"
                  label="Service Description"
                  :rules="descriptionRules"
                  required
              ></v-textarea>

              <!-- Цена -->
              <v-text-field
                  v-model="serviceData.price"
                  label="Price"
                  type="number"
                  :rules="priceRules"
                  required
              ></v-text-field>

              <!-- Продолжительность услуги -->
              <v-text-field
                  v-model="serviceData.duration"
                  label="Duration (minutes)"
                  type="number"
                  :rules="durationRules"
                  required
              ></v-text-field>

              <v-btn @click="saveService" color="primary" :disabled="isUploading || !valid || !imageBase64">
                Save
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
  name: "ServiceEditPage",
  data() {
    return {
      imageBase64: "", // Для хранения Base64 изображения
      isUploading: false, // Индикатор загрузки
      error: "", // Сообщения об ошибке
      valid: false, // Для валидации формы
      serviceData: {
        name: "", // Название услуги
        description: "", // Описание
        price: "", // Цена
        duration: "", // Продолжительность услуги
      },
      nameRules: [
        v => !!v || "Name is required",
        v => v.length <= 50 || "Name must be less than 50 characters",
      ],
      descriptionRules: [
        v => !!v || "Description is required",
        v => v.length <= 200 || "Description must be less than 200 characters",
      ],
      priceRules: [
        v => !!v || "Price is required",
        v => /^[0-9]+(\.[0-9]{1,2})?$/.test(v) || "Price must be a valid number",
      ],
      durationRules: [
        v => !!v || "Duration is required",
        v => /^[0-9]+$/.test(v) || "Duration must be a valid number",
      ],
      serviceId: this.$route.params.id || null, // Получаем ID сервиса из URL
    };
  },
  created() {
    if(this.serviceId !== null) {
      this.loadServiceData(); // Загружаем данные при создании компонента
    }

  },
  methods: {
    // Загрузка данных о сервисе
    async loadServiceData() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const response = await axios.get(`http://localhost:3000/services/${this.serviceId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        // Заполняем данные о сервисе
        this.serviceData = response.data;

        // Если есть изображение, сохраняем его
        this.imageBase64 = response.data.photo;
      } catch (error) {
        console.error("Error fetching service data:", error);
        this.error = "Failed to load service data. Please try again later.";
      }
    },

    // Сохранение данных сервиса
    async saveService() {
      try {
        this.isUploading = true;
        this.error = "";

        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const payload = {
          name: this.serviceData.name,
          description: this.serviceData.description,
          price: this.serviceData.price,
          duration: this.serviceData.duration, // Добавляем поле продолжительности
          photo: this.imageBase64, // Отправляем картинку в формате Base64
        };
        let response = {};
        if(this.serviceId !== null) {
          response = await axios.put(
              `http://localhost:3000/services/${this.serviceId}`,
              payload,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
          );
        } else {
          response = await axios.post(
              `http://localhost:3000/services`,
              payload,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
          );
        }

        // После сохранения обновляем загруженное изображение
        this.imageBase64 = response.data.photo;
        this.isUploading = false;
        await this.$router.push("/admin/services"); // Перенаправляем на страницу мастеров
      } catch (error) {
        console.error("Error saving service:", error);
        this.error = "Failed to save service. Please try again later.";
        this.isUploading = false;
      }
    },

    // Обработчик клика для активации выбора файла
    triggerFileInput() {
      this.$refs.fileInput.click(); // Открываем окно выбора файла
    },

    // Обработчик изменения файла
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
  },
};
</script>

<style scoped>
/* Стиль для картинки */
.v-avatar {
  border-radius: 10px; /* Прямоугольные углы */
  overflow: hidden;
  background-color: #f0f0f0; /* Цвет фона области */
}

.v-avatar img {
  object-fit: cover; /* Чтобы изображение занимало всю область */
}
</style>
