<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Service List</span>
            <v-spacer></v-spacer>
            <!-- Кнопка "Add Service" -->
            <v-btn @click="addService" color="primary" icon>
              <v-icon>mdi-plus</v-icon>  <!-- Иконка плюса -->
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
                v-if="services && services.length > 0"
                :headers="headers"
                :items="services"
                item-key="id"
                class="elevation-1"
                dense
                no-data-text="No services available"
                hide-default-footer
                :items-per-page="services.length"
            >
              <!-- Слот для каждой строки таблицы -->
              <template v-slot:item="props">
                <tr @click="editService(props.item)">
                  <td>
                    <v-img
                        v-if="props.item.photo"
                        :src="props.item.photo"
                        max-width="50"
                        max-height="50"
                        alt="Service Photo"
                    ></v-img>
                    <span v-else>No photo</span>
                  </td>
                  <td>{{ props.item.name }}</td>
                  <td>{{ props.item.price }}</td>
                  <td>{{ props.item.duration }} min</td>
                  <td>
                    <span>{{ props.item.description }}</span>
                  </td>
                  <td>
                    <!-- Кнопка удаления с иконкой корзины -->
                    <v-btn
                        @click.stop="deleteService(props.item.id)"
                        color="red"
                        icon
                        class="delete-btn"
                    >
                      <v-icon>mdi-delete</v-icon>  <!-- Иконка корзины -->
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>

            <v-alert v-if="error" type="error" dismissible>
              {{ error }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "ServiceListPage",
  data() {
    return {
      services: [],
      headers: [
        {text: "Photo", align: "start", key: "photo"},
        {text: "Name", align: "start", key: "name", sortable: true},
        {text: "Price", align: "start", key: "price"},
        {text: "Duration", align: "start", key: "duration"},
        {text: "Description", align: "start", key: "description"},
        {text: "Actions", align: "start", key: "actions"},  // Добавлен заголовок для действий
      ],
      error: "",
    };
  },
  created() {
    this.loadServices(); // Загружаем список услуг при создании компонента
  },
  methods: {
    async loadServices() {
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

        // Сохраняем данные о сервисах
        this.services = response.data;
      } catch (error) {
        console.error("Error fetching services:", error);
        this.error = "Failed to load services. Please try again later.";
      }
    },

    // Метод для добавления нового сервиса
    addService() {
      this.$router.push("/edit-service"); // Переход на страницу добавления нового сервиса
    },

    // Метод для редактирования сервиса
    editService(service) {
      this.$router.push(`/edit-service/${service.id}`); // Переход на страницу редактирования выбранного сервиса
    },

    // Метод для удаления сервиса
    async deleteService(serviceId) {
      const confirmed = confirm("Are you sure you want to delete this service?");

      if (!confirmed) return;

      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        // Отправляем запрос на удаление
        await axios.delete(`http://localhost:3000/services/${serviceId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        // Удаляем услугу из списка на фронте
        this.services = this.services.filter(service => service.id !== serviceId);
      } catch (error) {
        console.error("Error deleting service:", error);
        this.error = "Failed to delete service. Please try again later.";
      }
    },
  },
};
</script>

<style scoped>
/* Стиль кнопки удаления */
.delete-btn {
  background-color: transparent !important;
  color: red !important; /* Красный цвет текста */
  border: none;
}

/* Дополнительные стили для кнопки добавления (если нужно) */
.v-btn.primary {
  margin-right: 10px;
}
</style>
