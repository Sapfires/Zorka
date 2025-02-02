<template>
  <v-app>
    <SidebarClient v-if="userRole === 'CLIENT'" />
    <SidebarMaster v-if="userRole === 'MASTER'" />
    <SidebarAdmin v-if="userRole === 'ADMIN'" />

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
    userRole() {
      const role = this.$store.getters.userRole;
      console.log("Current userRole in App.vue:", role);
      return role;
    },
  },
};
</script>

<style>
.v-app {
  display: flex;
}

.v-main {
  flex: 1;
}
</style>
