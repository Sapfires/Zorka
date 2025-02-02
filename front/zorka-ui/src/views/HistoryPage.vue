<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="6" offset-md="2" offset-lg="3">
        <v-card>
          <v-card-title>
            <span class="headline">History</span>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item-group v-if="procedures.length > 0">
                <v-list-item v-for="(item, index) in procedures" :key="index">
                  <v-list-item-content>
                    <v-row align="center" no-gutters>
                      <!-- Колонка 1: Иконка услуги -->
                      <v-col cols="2" class="d-flex justify-center">
                        <v-img :src="item.photo" alt="Service photo" max-width="56" class="rounded-circle"></v-img>
                      </v-col>

                      <!-- Колонка 2: Название услуги, дата и имя мастера -->
                      <v-col cols="8">
                        <v-row class="text-wrap" no-gutters>
                          <v-col cols="12" class="py-0">
                            <v-list-item-title class="font-weight-bold small-text">{{ item.name }}</v-list-item-title>
                          </v-col>
                          <v-col cols="12" class="py-0">
                            <v-list-item-subtitle class="small-text">{{ formatDate(item.start_time) }}</v-list-item-subtitle>
                          </v-col>
                          <v-col cols="12" class="py-0">
                            <p class="small-text">Master: {{ item.first_name }}</p>
                          </v-col>
                        </v-row>
                      </v-col>

                      <!-- Колонка 3: Фото мастера -->
                      <v-col cols="2" class="d-flex justify-center">
                        <v-img :src="item.service_name" alt="Master's photo" max-width="56" class="rounded-circle"></v-img>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
              <v-list-item v-if="procedures.length === 0">
                <v-list-item-content>
                  <v-list-item-title>No procedures found</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: "HistoryPage",
  data() {
    return {
      procedures: [], // Массив для хранения истории
    };
  },
  created() {
    // Получаем данные с сервера при создании компонента
    this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        const userId = this.$store.getters.userId || localStorage.getItem("userId");
        // Если токен отсутствует, редиректим на страницу логина
        if (!token) {
          await this.$router.push('/login');
          return;
        }

        // Отправляем запрос на сервер
        const response = await axios.get(`http://localhost:3000/history/client/${userId}`, {
          headers: {
            Authorization: `${token}` // Передаем токен в заголовке
          }
        });
        this.procedures = response.data.history; // Заполняем массив процедур
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    },
    formatDate(dateString) {
      // Форматируем дату, чтобы она выглядела красиво
      const date = new Date(dateString);
      const options = {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'};
      return date.toLocaleDateString('en-US', options);
    }
  },
};
</script>

<style scoped>
/* Стили для страницы истории */
.v-card {
  max-width: 600px;
  margin: auto;
}

.v-img {
  border-radius: 50%; /* Круглая иконка */
}

.font-weight-bold {
  font-weight: bold;
}

.py-0 {
  padding-top: 0px;
  padding-bottom: 0px;
}

.text-wrap {
  white-space: normal;
}

/* Уменьшаем размер шрифта во второй и третьей колонке */
.small-text {
  font-size: 0.85rem;
}

</style>
