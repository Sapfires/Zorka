<template>
  <v-navigation-drawer app>
    <v-list>
      <v-list-item @click="goToProfile">
        <v-list-item-content>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToAppointments">
        <v-list-item-content>
          <v-list-item-title>Appointments</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="goToHistory">
        <v-list-item-content>
          <v-list-item-title>History</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "SidebarMaster",
  methods: {
    goToProfile() {
      this.$router.push("/profile");
    },
    goToAppointments() {
      this.$router.push("/appointments");
    },
    goToHistory() {
      this.$router.push("/history");
    },
  },
};
</script>
