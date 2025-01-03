<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Master List</span>
          </v-card-title>
          <v-card-text>
            <v-data-table
                v-if="masters && masters.length > 0"
                :headers="headers"
                :items="masters"
                item-key="user_id"
                class="elevation-1"
            >
              <!-- Слот для каждой строки таблицы -->
              <template v-slot:item="props">
                <tr>
                  <td>{{ props.item.user_id }}</td>
                  <td>{{ props.item.login }}</td>
                  <td>{{ props.item.first_name }} {{ props.item.last_name }}</td>
                  <td>{{ props.item.rate_of_salary }}</td>
                  <td>{{ props.item.work_experience }} years</td>
                  <td>{{ props.item.brief_information || 'No information available' }}</td>
                  <td>
                    <v-btn @click="viewServices(props.item)" color="primary">View Services</v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>

            <div v-else>
              <p>No masters available</p>
            </div>

            <v-btn @click="loadMasters" color="primary">Refresh Masters</v-btn>

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
  name: "MasterListPage",
  data() {
    return {
      masters: [],
      headers: [
        { text: "ID", align: "start", key: "user_id", sortable: true },
        { text: "Login", align: "start", key: "login", sortable: true },
        { text: "Name", align: "start", key: "name" },
        { text: "Salary Rate", align: "start", key: "rate_of_salary" },
        { text: "Experience", align: "start", key: "work_experience" },
        { text: "Brief Info", align: "start", key: "brief_information" },
        { text: "Services", align: "start", key: "services" },
      ],
      error: "",
    };
  },
  created() {
    this.loadMasters(); // Загружаем мастеров при создании компонента
  },
  methods: {
    async loadMasters() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          this.$router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/masters", {
          headers: {
            Authorization: `${token}`, // Убедись, что Bearer перед токеном
          },
        });

        // Проверь данные с сервера
        console.log('Raw masters data:', JSON.stringify(response.data, null, 2));

        // "Сбрось" данные через JSON для устранения проксирования
        this.masters = JSON.parse(JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching masters:", error);
        this.error = "Failed to load masters. Please try again later.";
      }
    },
    viewServices(master) {
      // Здесь можно открыть окно с подробностями об услугах
      console.log("Services for master:", master.services);
    }
  },
};
</script>

<style scoped>
/* Дополнительные стили (если нужно) */
</style>
