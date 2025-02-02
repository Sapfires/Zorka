<template>
  <v-navigation-drawer app v-if="isAdmin">
    <v-list>
      <v-list-item @click="goToPage('/admin/clients')">
        <v-list-item-content>
          <v-list-item-title>Clients</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToPage('/admin/masters')">
        <v-list-item-content>
          <v-list-item-title>Masters</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToPage('/admin/services')">
        <v-list-item-content>
          <v-list-item-title>Services</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToPage('/admin/current')">
        <v-list-item-content>
          <v-list-item-title>Current</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToPage('/admin/dashboards')">
        <v-list-item-content>
          <v-list-item-title>Dashboards</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "SidebarAdmin",
  computed: {
    isAdmin() {
      const role = this.$store.getters.userRole;
      return role === 'ADMIN';
    },
  },
  methods: {
    goToPage(page) {
      if (this.$route.path !== page) {
        this.$router.push(page);
      }
    },
  },
};
</script>
