<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Master List</span>
            <v-spacer></v-spacer>
            <v-btn @click="addMaster" color="primary" icon>
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-infinite-scroll="loadMasters" :disabled="loading" class="masters-list">
              <v-data-table
                  v-if="masters.length > 0"
                  :headers="headers"
                  :items="masters"
                  item-key="user_id"
                  class="elevation-1"
                  hide-default-footer
              >
                <template v-slot:item="props">
                  <tr @click="editMaster(props.item.user_id)" style="cursor: pointer;">
                    <td>
                      <v-img
                          :src="props.item.photo || 'default-photo-url.jpg'"
                          max-width="50"
                          max-height="50"
                          contain
                      />
                    </td>
                    <td>{{ props.item.login }}</td>
                    <td>{{ props.item.first_name }} {{ props.item.last_name }}</td>
                    <td>{{ props.item.rate_of_salary }}</td>
                    <td>{{ props.item.work_experience }} years</td>
                    <td>{{ props.item.brief_information || 'No information available' }}</td>
                    <td>
                      <div v-if="props.item.services && props.item.services.length > 0">
                        <div v-for="service in props.item.services" :key="service.id">
                          {{ service.name || 'No Name' }}
                        </div>
                      </div>
                      <div v-else>
                        No services available
                      </div>
                    </td>
                    <td>
                      <v-btn @click.stop="deleteMaster(props.item.user_id)" color="red" icon>
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
              <v-progress-circular v-if="loading" indeterminate color="primary" class="ma-3" />
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
  name: "MasterListPage",
  data() {
    return {
      masters: [],
      headers: [
        { text: "Photo", align: "start", key: "photo", sortable: false },
        { text: "Login", align: "start", key: "login", sortable: true },
        { text: "Name", align: "start", key: "name" },
        { text: "Salary Rate", align: "start", key: "rate_of_salary" },
        { text: "Experience", align: "start", key: "work_experience" },
        { text: "Brief Info", align: "start", key: "brief_information" },
        { text: "Services", align: "start", key: "services" },
        { text: "Actions", align: "end", key: "actions", sortable: false },
      ],
      error: "",
      loading: false,
    };
  },
  created() {
    this.loadMasters();
  },
  methods: {
    async loadMasters() {
      if (this.loading) return;
      this.loading = true;

      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/masters", {
          headers: {
            Authorization: `${token}`,
          },
        });

        const newMasters = response.data;

        if (newMasters && newMasters.length > 0) {
          this.masters = [...this.masters, ...newMasters];
        }
      } catch (error) {
        console.error("Error fetching masters:", error);
        this.error = "Failed to load masters. Please try again later.";
      } finally {
        this.loading = false;
      }
    },

    editMaster(userId) {
      this.$router.push(`/edit-master/${userId}`);
    },

    addMaster() {
      this.$router.push("/edit-master");
    },

    async deleteMaster(userId) {
      const confirmation = confirm("Are you sure you want to delete this master?");
      if (!confirmation) return;

      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        await axios.delete(`http://localhost:3000/masters/${userId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        this.masters = this.masters.filter((master) => master.user_id !== userId);
      } catch (error) {
        console.error("Error deleting master:", error);
        this.error = "Failed to delete master. Please try again later.";
      }
    },
  },
};
</script>

<style scoped>
.masters-list {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
