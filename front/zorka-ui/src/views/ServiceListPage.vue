<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Service List</span>
          </v-card-title>
          <v-card-text>
            <v-data-table
                v-if="services && services.length > 0"
                :headers="headers"
                :items="services"
                item-key="id"
                class="elevation-1"
            >
              <!-- Слот для каждой строки таблицы -->
              <template v-slot:item="props">
                <tr>
                  <td>{{ props.item.id }}</td>
                  <td>{{ props.item.name }}</td>
                  <td>{{ props.item.price }}</td>
                  <td>{{ props.item.duration }} min</td>
                  <td>
                    <span>{{ props.item.description }}</span>
                  </td>
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
                </tr>
              </template>
            </v-data-table>

            <div v-else>
              <p>No services available</p>
            </div>

            <v-btn @click="loadServices" color="primary">Refresh Services</v-btn>

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
        { text: "ID", align: "start", key: "id", sortable: true },
        { text: "Name", align: "start", key: "name", sortable: true },
        { text: "Price", align: "start", key: "price" },
        { text: "Duration", align: "start", key: "duration" },
        { text: "Description", align: "start", key: "description" },
        { text: "Photo", align: "start", key: "photo" },
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
          this.$router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/services", {
          headers: {
            Authorization: `${token}`, // Убедись, что Bearer перед токеном
          },
        });

        // Проверь данные с сервера
        console.log('Raw services data:', JSON.stringify(response.data, null, 2));

        // "Сбрось" данные через JSON для устранения проксирования
        this.services = JSON.parse(JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching services:", error);
        this.error = "Failed to load services. Please try again later.";
      }
    },
  },
};
</script>

<style scoped>
/* Дополнительные стили (если нужно) */
</style>
