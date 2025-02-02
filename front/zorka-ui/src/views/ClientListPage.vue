<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Client List</span>
          </v-card-title>
          <v-card-text>
            <div class="clients-list">
              <v-data-table
                  v-if="clients && clients.length > 0"
                  :headers="headers"
                  :items="clients"
                  item-key="id"
                  class="elevation-1"
                  hide-default-footer
              >
                <template v-slot:item="props">
                  <tr>
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
                    <td>{{ props.item.login }}</td>
                    <td>{{ props.item.phone_number || 'No phone number' }}</td>
                    <td>
                      <v-btn
                          color="primary"
                          @click="toggleBlockStatus(props.item.id, props.item.blocked)"
                          :title="props.item.blocked ? 'Unblock User' : 'Block User'"
                          icon
                      >
                        <v-icon>{{ props.item.blocked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </div>

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
        {text: "Photo", align: "start", key: "photo"},
        {text: "Login", align: "start", key: "login", sortable: true},
        {text: "Phone Number", align: "start", key: "phone_number"},
        {text: "Actions", align: "center", key: "actions"},
      ],
      error: "",
    };
  },
  created() {
    this.loadClients();
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
            Authorization: `${token}`,
          },
        });

        this.clients = response.data;
      } catch (error) {
        console.error("Error fetching clients:", error);
        this.error = "Failed to load clients. Please try again later.";
      }
    },

    async toggleBlockStatus(clientId, currentBlockedStatus) {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        await axios.put(`http://localhost:3000/users/lock/${clientId}`, {
          blocked: !currentBlockedStatus,
        }, {
          headers: {
            Authorization: `${token}`,
          },
        });

        this.clients = this.clients.map(client =>
            client.id === clientId ? {...client, blocked: !currentBlockedStatus} : client
        );
      } catch (error) {
        console.error("Error changing block status:", error);
        this.error = "Failed to update block status. Please try again later.";
      }
    },
  },
};
</script>

<style scoped>
.clients-list {
  max-height: 70vh;
  overflow-y: auto;
}

.v-btn {
  margin: 0 5px;
}
</style>
