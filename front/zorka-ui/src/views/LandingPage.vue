<template>
  <v-container>
    <v-row>
      <v-col>
        <v-btn @click="goToLogin">Go to Login</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h1>Welcome to the Landing Page</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LandingPage',
  methods: {
    goToLogin() {
      this.$router.push('/login'); // Переход к странице Login
    }
  }
};
</script>

<style scoped>
/* Стили для страницы Landing */
</style>
