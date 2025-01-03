<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Client List</span>
          </v-card-title>
          <v-card-text>
            <v-data-table
                v-if="clients && clients.length > 0"
                :headers="headers"
                :items="clients"
                item-key="id"
                class="elevation-1"
            >
              <!-- Слот для каждой строки таблицы -->
              <template v-slot:item="props">
                <tr>
                  <td>{{ props.item.id }}</td>
                  <td>{{ props.item.login }}</td>
                  <td>{{ props.item.phone_number || 'No phone number' }}</td>
                  <td>
                    <v-chip :color="props.item.role === 'CLIENT' ? 'blue' : 'green'" dark>
                      {{ props.item.role }}
                    </v-chip>
                  </td>
                  <td>
                    <v-img
                        v-if="props.item.photo"
                        :src="props.item.photo"
                        max-width="50"
                        max-height="50"
                        alt="User Photo"
                    ></v-img>
                    <span v-else>No photo</span>
                  </td>
                </tr>
              </template>
            </v-data-table>

            <div v-else>
              <p>No clients available</p>
            </div>

            <v-btn @click="loadClients" color="primary">Refresh Clients</v-btn>

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
  name: "ClientListPage",
  data() {
    return {
      clients: [],
      headers: [
        { text: "ID", align: "start", key: "id", sortable: true },
        { text: "Login", align: "start", key: "login", sortable: true },
        { text: "Phone Number", align: "start", key: "phone_number" },
        { text: "Role", align: "start", key: "role" },
        { text: "Photo", align: "start", key: "photo" },
      ],
      error: "",
    };
  },
  created() {
    this.loadClients(); // Загружаем клиентов при создании компонента
  },
  methods: {
    async loadClients() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          this.$router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/users", {
          headers: {
            Authorization: `${token}`, // Убедись, что Bearer перед токеном
          },
        });

        // Проверь данные с сервера
        console.log('Raw clients data:', JSON.stringify(response.data, null, 2));

        // "Сбрось" данные через JSON для устранения проксирования
        this.clients = JSON.parse(JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching clients:", error);
        this.error = "Failed to load clients. Please try again later.";
      }
    }
  },
};
</script>

<style scoped>
/* Дополнительные стили (если нужно) */
</style>
