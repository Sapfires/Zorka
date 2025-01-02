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
      const role = this.$store.getters.userRole; // Получаем роль пользователя из Vuex
      console.log("Current role from Vuex:", role); // Логируем роль для проверки
      return role === 'CLIENT'; // Показываем Sidebar только если роль 'CLIENT'
    },
    // Проверка текущего пути для отображения Sidebar только на нужных страницах
    showSidebar() {
      const currentPath = this.$route.path; // Получаем текущий путь
      console.log("Current route path:", currentPath); // Логируем путь маршрута
      return ['/profile', '/history', '/book-service'].includes(currentPath);
    },
  },
  methods: {
    goToPage(page) {
      console.log("Navigating to:", page); // Логируем, на какую страницу пытаемся перейти
      // Проверка, не находимся ли мы уже на этой странице
      if (this.$route.path !== page) {
        this.$router.push(page); // Если не на текущей странице, выполняем переход
      }
    },
  },
};
</script>
