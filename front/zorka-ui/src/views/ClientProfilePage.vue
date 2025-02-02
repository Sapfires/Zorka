<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="6" offset-md="2" offset-lg="3">
        <v-card>
          <v-card-title>
            <span class="headline">Client Profile</span>
          </v-card-title>
          <v-card-text>
            <v-form>

              <v-avatar
                  size="120"
                  class="mr-4"
                  :style="imageBase64 ? '' : 'cursor: pointer; background-color: #f0f0f0;'"
                  @click="triggerFileInput"
              >
                <v-img
                    v-if="imageBase64"
                    :src="imageBase64"
                    alt="Uploaded Image"
                    class="rounded-lg"
                ></v-img>
                <v-icon v-else>mdi-camera</v-icon>
              </v-avatar>

              <input
                  ref="fileInput"
                  type="file"
                  style="display: none;"
                  accept="image/*"
                  @change="handleFileChange"
              />


              <v-text-field
                  label="First Name"
                  v-model="firstName"
                  required
              ></v-text-field>
              <v-text-field
                  label="Last Name"
                  v-model="lastName"
                  required
              ></v-text-field>
              <v-text-field
                  label="Email"
                  v-model="email"
                  required
                  :rules="[rules.email]"
              ></v-text-field>
              <v-text-field
                  label="Phone"
                  v-model="phone"
              ></v-text-field>
              <v-text-field
                  label="Password"
                  v-model="password"
                  type="password"
              ></v-text-field>

              <v-btn color="primary" @click="saveProfile">Save Changes</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: "ClientProfilePage",
  data() {
    return {
      imageBase64: "",
      isUploading: false,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      photo: this.imageBase64,
      rules: {
        email: (value) =>
            /.+@.+\..+/.test(value) || "Please enter a valid email address.",
      },
    };
  },
  created() {
    this.fetchUserData();
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileChange(event) {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = () => {
          this.imageBase64 = reader.result;
        };

        reader.readAsDataURL(file);
      }
    },

    async fetchUserData() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        const userId = this.$store.getters.userId || localStorage.getItem("userId");
        if (!token) {
          await this.$router.push('/login');
          return;
        }

        const response = await axios.get(`http://localhost:3000/users/${userId}`, {
          headers: {
            Authorization: `${token}`
          }
        });

        const { login, phone_number, first_name, last_name, photo } = response.data;

        this.email = login;
        this.phone = phone_number || '';
        this.firstName = first_name;
        this.lastName = last_name;
        this.imageBase64 = photo;
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load user data. Please try again later.");
      }
    },

    saveProfile() {
      console.log("Profile updated:", {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        password: this.password,
        photo: this.imageBase64,
      });

      this.saveProfileToBackend();
    },

    async saveProfileToBackend() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        const userId = this.$store.getters.userId || localStorage.getItem("userId");
        if (!token) {
          await this.$router.push('/login');
          return;
        }
        await axios.put(`http://localhost:3000/users/${userId}`, {
          first_name: this.firstName,
          last_name: this.lastName,
          email: this.email,
          phone_number: this.phone,
          password: this.password,
          login: this.email,
          photo: this.imageBase64
        }, {
          headers: {
            Authorization: `${token}`
          }
        });
        alert('Profile updated successfully!');
      } catch (error) {
        console.error("Error saving profile:", error);
        alert('Failed to update profile. Please try again later.');
      }
    }
  },
};
</script>

<style scoped>
.v-card {
  max-width: 600px;
  margin: auto;
}
</style>
