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
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.date }}</v-list-item-subtitle>
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
export default {
  name: "HistoryPage",
  data() {
    return {
      procedures: [
        { name: "Massage", date: "2024-12-01" },
        { name: "Facial", date: "2024-11-25" },
        { name: "Haircut", date: "2024-11-20" },
        { name: "Manicure", date: "2024-11-15" },
        // Добавьте еще данных по мере необходимости
      ],
    };
  },
};
</script>

<style scoped>
/* Стили для страницы истории */
.v-card {
  max-width: 600px;
  margin: auto;
}
</style>
