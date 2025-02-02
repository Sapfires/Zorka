<template>
  <v-container>
    <h1>Procedures Today</h1>
    <v-data-table :headers="headers" :items="procedures" item-key="id" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Procedures Today</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="fetchProcedures">Refresh</v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item="props">
        <tr>
          <td>
            <div class="d-flex align-center">
              <v-avatar size="40">
                <img :src="props.item.client_photo" alt="Client Photo" />
              </v-avatar>
              <div class="ml-2">
                <div>{{ props.item.client_first_name }}</div>
                <div>{{ props.item.client_last_name }}</div>
              </div>
            </div>
          </td>

          <td>
            <div class="d-flex align-center">
              <v-avatar size="40">
                <img :src="props.item.service_photo" alt="Service Photo" />
              </v-avatar>
              <div class="ml-2">
                <div>{{ props.item.service_name }}</div>
                <div class="text--secondary">{{ props.item.service_price }}</div>
              </div>
            </div>
          </td>

          <td>
            <div class="d-flex align-center">
              <v-avatar size="40">
                <img :src="props.item.master_photo" alt="Master Photo" />
              </v-avatar>
              <div class="ml-2">
                <div>{{ props.item.master_first_name }}</div>
                <div>{{ props.item.master_last_name }}</div>
              </div>
            </div>
          </td>

          <td>
            <div>
              <div><strong>Start:</strong> {{ new Date(props.item.start_time).toLocaleTimeString() }}</div>
              <div><strong>End:</strong> {{ new Date(props.item.end_time).toLocaleTimeString() }}</div>
            </div>
          </td>

          <td>
            <div>
              <div v-if="new Date(props.item.start_time) > new Date()">
                <v-chip color="blue" outlined>
                  Time to Start: {{ formatTime((new Date(props.item.start_time) - new Date()) / 1000) }}
                </v-chip>
              </div>
              <div v-else>
                <v-chip color="green" outlined>
                  Time Remaining: {{ formatTime((new Date(props.item.end_time) - new Date()) / 1000) }}
                </v-chip>
              </div>
            </div>
          </td>

          <td>
            <v-select
                :items="['WAITING', 'PROCESSING', 'COMPLETED', 'EXPECTED', 'CANCELLED', 'PAID']"
                v-model="props.item.status"
                @change="updateStatus(props.item)"
                outlined
            ></v-select>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      headers: [
        { text: 'Client', value: 'client' },
        { text: 'Service', value: 'service' },
        { text: 'Master', value: 'master' },
        { text: 'Time', value: 'time' },
        { text: 'Timers', value: 'timers' },
        { text: 'Status', value: 'status' },
      ],
      procedures: [],
    };
  },
  created() {
    this.fetchProcedures();
  },
  methods: {
    async fetchProcedures() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }
        const response = await axios.get('http://localhost:3000/service-processes', {
          headers: {
            Authorization: `${token}`, // Убедись, что перед токеном
          },
        });
        this.procedures = response.data.map((item) => ({
          ...item,
          start_time: new Date(item.start_time),
          end_time: new Date(item.end_time),
        }));
      } catch (error) {
        console.error('Error fetching procedures:', error);
      }
    },
    async updateStatus(item) {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        await axios.patch(`http://localhost:3000/service-process/${item.id}`, {
          status: item.status,  // Отправляем новый статус
        }, {
          headers: {
            Authorization: `${token}`, // Убедись, что перед токеном
          },
        });


      } catch (error) {
        console.error('Error updating status:', error);
      }
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    },
  },
};
</script>

<style scoped>
.ml-2 {
  margin-left: 8px;
}
</style>
