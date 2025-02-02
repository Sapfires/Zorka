<template>
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
    isClient() {
      const role = this.$store.getters.userRole;
      console.log("Current role from Vuex:", role);
      return role === 'CLIENT';
    },
    showSidebar() {
      const currentPath = this.$route.path;
      console.log("Current route path:", currentPath);
      return ['/profile', '/history', '/book-service'].includes(currentPath);
    },
  },
  methods: {
    goToPage(page) {
      console.log("Navigating to:", page);
      if (this.$route.path !== page) {
        this.$router.push(page);
      }
    },
  },
};
</script>
