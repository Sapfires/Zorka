<template>
  <v-app>
    <!-- Условно показываем Sidebar в зависимости от роли пользователя -->
    <SidebarClient v-if="userRole === 'client'" />
    <SidebarMaster v-if="userRole === 'master'" />
    <SidebarAdmin v-if="userRole === 'admin'" />

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
      return this.$store.getters.userRole;
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
