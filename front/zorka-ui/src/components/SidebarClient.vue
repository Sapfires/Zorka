<template>
  <!-- Показываем Sidebar только если роль 'CLIENT' и текущий маршрут соответствует одному из указанных -->
  <v-navigation-drawer app v-if="isClient">
    <v-list>
      <v-list-item @click="goToPage('/profile')">
        <v-list-item-content>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToPage('/history')">
        <v-list-item-content>
          <v-list-item-title>History</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToPage('/book-service')">
        <v-list-item-content>
          <v-list-item-title>Book Service</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "SidebarClient",
  computed: {
    // Проверка роли из Vuex (показываем Sidebar только если роль 'CLIENT')
    isClient() {
      return this.$store.getters.userRole === 'CLIENT'; // Убедитесь, что роль 'CLIENT' в верхнем регистре
    },
    // Проверка текущего пути для отображения Sidebar только на нужных страницах
    showSidebar() {
      return ['/profile', '/history', '/book-service'].includes(this.$route.path);
    },
  },
  methods: {
    goToPage(page) {
      // Проверка, не находимся ли мы уже на этой странице
      if (this.$route.path !== page) {
        this.$router.push(page); // Если не на текущей странице, выполняем переход
      }
    },
  },
};
</script>
