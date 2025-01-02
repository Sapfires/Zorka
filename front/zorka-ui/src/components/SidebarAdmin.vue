<template>
  <v-navigation-drawer app>
    <v-list>
      <v-list-item @click="goToDashboard">
        <v-list-item-content>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToManageUsers">
        <v-list-item-content>
          <v-list-item-title>Manage Users</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToReports">
        <v-list-item-content>
          <v-list-item-title>Reports</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "SidebarAdmin",
  methods: {
    goToDashboard() {
      this.$router.push("/dashboard");
    },
    goToManageUsers() {
      this.$router.push("/manage-users");
    },
    goToReports() {
      this.$router.push("/reports");
    },
  },
};
</script>
