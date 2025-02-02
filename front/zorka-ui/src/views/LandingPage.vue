<template>
  <v-container class="landing-page-container">
    <v-row>
      <v-col>
        <v-btn @click="goToLogin">Go to Login</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h1>Welcome to the Beauty Salon</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LandingPage',
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.landing-page-container {
  background: url('@/assets/background.jpg') no-repeat center center fixed;
  background-size: cover;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white; /* Text color */
}

h1 {
  font-size: 3rem;
  font-weight: bold;
}

.v-btn {
  background-color: rgba(255, 255, 255, 0.7);
  color: black;
}
</style>
