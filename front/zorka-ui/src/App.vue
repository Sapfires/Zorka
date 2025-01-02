<template>
  <v-app>
    <!-- Условно показываем Sidebar в зависимости от роли пользователя -->
    <SidebarClient v-if="userRole === 'CLIENT'" />
    <SidebarMaster v-if="userRole === 'MASTER'" />
    <SidebarAdmin v-if="userRole === 'ADMIN'" />

    <!-- Основной контент -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import SidebarClient from '@/components/SidebarClient.vue';
import SidebarMaster from '@/components/SidebarMaster.vue';
import SidebarAdmin from '@/components/SidebarAdmin.vue';

export default {
  name: 'App',
  components: {
    SidebarClient,
    SidebarMaster,
    SidebarAdmin,
  },
  computed: {
    // Получаем роль из Vuex хранилища
    userRole() {
      const role = this.$store.getters.userRole;
      console.log("Current userRole in App.vue:", role); // Логируем роль
      return role;
    },
  },
};
</script>

<style>
/* Стили для главной страницы */
.v-app {
  display: flex;
}

.v-main {
  flex: 1;
}
</style>
