<template>
  <v-container>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <span class="headline">Revenue by day</span>
          </v-card-title>
          <v-card-text>
            <Bar :data="revenueData" :options="chartOptions"/>
          </v-card-text>
        </v-card>
      </v-col>


      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <span class="headline">Revenue by master</span>
          </v-card-title>
          <v-card-text>
            <Pie :data="mastersRevenueData" :options="chartOptions"/>
          </v-card-text>
        </v-card>
      </v-col>


      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <span class="headline">Revenue by service</span>
          </v-card-title>
          <v-card-text>
            <Pie :data="servicesRevenueData" :options="chartOptions"/>
          </v-card-text>
        </v-card>
      </v-col>




      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <span class="headline">Loyal clients</span>
          </v-card-title>
          <v-card-text>
            <v-data-table
                :items="richClients"
                :headers="clientHeaders"
                item-key="client_id"
                hide-default-footer
            >
              <template v-slot:item="props">
                <tr>
                  <td>{{ props.item.client_name }}</td>
                  <td>{{ props.item.amount }}</td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>


   
    </v-row>
  </v-container>
</template>

<script>
import {Bar, Pie} from "vue-chartjs";
import {Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement} from "chart.js";
import axios from "axios";


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

export default {
  name: "DashboardPage",
  components: {
    Bar,
    Pie
  },
  data() {
    return {

      revenueData: {
        labels: ["2023-01-01", "2023-01-02", "2023-01-03"],
        datasets: [
          {
            label: "Revenue",
            data: [100, 200, 150],
            backgroundColor: "#42A5F5",
            borderColor: "#1E88E5",
            borderWidth: 1
          }
        ]
      },

      mastersRevenueData: {
        labels: ["Мастер 1", "Мастер 2", "Мастер 3"],
        datasets: [
          {
            label: "Revenue",
            data: [500, 300, 700],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
          }
        ]
      },

      servicesRevenueData: {
        labels: ["Услуга 1", "Услуга 2", "Услуга 3"],
        datasets: [
          {
            label: "Revenue",
            data: [400, 600, 800],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
          }
        ]
      },

      // Список богатых клиентов
      richClients: [
        {client_id: "1", client_name: "Клиент 1", amount: 5000},
        {client_id: "2", client_name: "Клиент 2", amount: 7000}
      ],
      // Список лояльных клиентов
      loyalClientsData: {
        labels: ["Клиент 1", "Клиент 2", "Клиент 3"],
        datasets: [
          {
            data: [10, 15, 20],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
          }
        ]
      },
      favoriteMasterData: {
        labels: ["Мастер 1", "Мастер 2", "Мастер 3"],
        datasets: [
          {
            label: "Частота посещений",
            data: [50, 60, 40],
            backgroundColor: "#42A5F5"
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      clientHeaders: [
        {text: "Client", value: "client_name"},
        {text: "Amount", value: "amount"}
      ]
    };
  },
  created() {
    this.fetchRevenueByDay();
    this.fetchRevenueByMaster();
    this.fetchRevenueByService();
    this.fetchRevenueByClient();
  },
  methods: {
    async fetchRevenueByDay() {
      const token = this.$store.getters.token || localStorage.getItem("token");
      if (!token) {
        await this.$router.push("/login");
        return;
      }

      await axios.get('http://localhost:3000/revenue-by-day', {
        headers: {
          Authorization: `${token}`,
        },
      }).then(response => {
        const data = response.data;

        this.revenueData = {
          labels: data.map(item => item.date),
          datasets: [
            {
              label: "Revenue",
              data: data.map(item => item.total_revenue),
              backgroundColor: "#42A5F5",
              borderColor: "#1E88E5",
              borderWidth: 1
            }
          ]
        };
      })
          .catch(error => {
            console.error("Ошибка при получении данных для дохода: ", error);
          });
    },
    async fetchRevenueByMaster() {
      const token = this.$store.getters.token || localStorage.getItem("token");
      if (!token) {
        await this.$router.push("/login");
        return;
      }

      await axios.get('http://localhost:3000/revenue-by-master', {
        headers: {
          Authorization: `${token}`,
        },
      }).then(response => {
        const data = response.data;

        this.mastersRevenueData = {
          labels: data.map(item => item.master_name),
          datasets: [
            {
              label: "Доход",
              data: data.map(item => item.total_revenue),
              backgroundColor: "#42A5F5",
              borderColor: "#1E88E5",
              borderWidth: 1
            }
          ]
        };
      })
          .catch(error => {
            console.error("Ошибка при получении данных для дохода: ", error);
          });
    },
    async fetchRevenueByService() {
      const token = this.$store.getters.token || localStorage.getItem("token");
      if (!token) {
        await this.$router.push("/login");
        return;
      }

      await axios.get('http://localhost:3000/revenue-by-service', {
        headers: {
          Authorization: `${token}`,
        },
      }).then(response => {
        const data = response.data;

        this.servicesRevenueData = {
          labels: data.map(item => item.service_name),
          datasets: [
            {
              label: "Доход",
              data: data.map(item => item.total_revenue),
              backgroundColor: "#42A5F5",
              borderColor: "#1E88E5",
              borderWidth: 1
            }
          ]
        };
      })
          .catch(error => {
            console.error("Ошибка при получении данных для дохода: ", error);
          });
    },
    async fetchRevenueByClient() {
      const token = this.$store.getters.token || localStorage.getItem("token");
      if (!token) {
        await this.$router.push("/login");
        return;
      }

      await axios.get('http://localhost:3000/revenue-by-client', {
        headers: {
          Authorization: `${token}`,
        },
      })
          .then(response => {
            const data = response.data;

            // Преобразуем данные для таблицы
            this.richClients = data.map(item => ({
              client_id: item.client_id,
              client_name: item.client_name,
              amount: parseFloat(item.amount).toFixed(2), // Преобразуем amount в число и форматируем до 2 знаков после запятой
            }));
          })
          .catch(error => {
            console.error("Ошибка при получении данных для дохода: ", error);
          });
    }

  },


};
</script>

<style scoped>
.headline {
  font-weight: bold;
}
</style>
