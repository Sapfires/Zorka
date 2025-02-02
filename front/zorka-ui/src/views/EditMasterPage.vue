<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Edit Master</span>
            <v-spacer></v-spacer>
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
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
                  v-model="master.login"
                  label="Login"
                  required
              ></v-text-field>

              <v-text-field
                  v-model="master.password"
                  label="Password"
                  type="password"
                  required
              ></v-text-field>

              <v-text-field
                  v-model="master.first_name"
                  label="First Name"
                  required
              ></v-text-field>

              <v-text-field
                  v-model="master.last_name"
                  label="Last Name"
                  required
              ></v-text-field>

              <v-text-field
                  v-model="master.rate_of_salary"
                  label="Rate of Salary"
                  required
                  type="number"
              ></v-text-field>

              <v-text-field
                  v-model="master.work_experience"
                  label="Work Experience (years)"
                  required
                  type="number"
              ></v-text-field>

              <v-textarea
                  v-model="master.brief_information"
                  label="Brief Information"
                  required
              ></v-textarea>

              <v-select
                  v-model="selectedServices"
                  :items="allServices"
                  item-text="name"
                  item-value="id"
                  label="Select Services"
                  multiple
                  required
              ></v-select>

              <v-btn @click="saveMaster" color="primary" :disabled="isUploading || !valid">
                Save Changes
              </v-btn>

              <v-alert v-if="error" type="error" dismissible>
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      imageBase64: "",
      isUploading: false,
      error: "",
      valid: false,
      master: {
        login: "",
        password: "",
        first_name: "",
        last_name: "",
        rate_of_salary: "",
        work_experience: "",
        brief_information: "",
      },
      allServices: [],
      selectedServices: [],
    };
  },
  created() {
    this.fetchMasterData();
    this.fetchAllServices();
  },
  methods: {
    async fetchMasterData() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const response = await axios.get(`http://localhost:3000/masters/${this.$route.params.id}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        this.master = response.data;
        this.selectedServices = response.data.services.map(service => service.id);
        this.imageBase64 = response.data.photo;
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    },

    async fetchAllServices() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/services", {
          headers: {
            Authorization: `${token}`,
          },
        });

        this.allServices = response.data;
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },

    async saveMaster() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");
        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const updatedMaster = {
          ...this.master,
          services: this.selectedServices.map(serviceId => ({ id: serviceId })),
          photo: this.imageBase64,
        };

        if (this.master.user_id) {
          await axios.put(`http://localhost:3000/masters/${this.master.user_id}`, updatedMaster, {
            headers: {
              Authorization: `${token}`,
            },
          });
        } else {
          await axios.post("http://localhost:3000/masters", updatedMaster, {
            headers: {
              Authorization: `${token}`,
            },
          });
        }

        this.$router.push("/admin/masters");
      } catch (error) {
        console.error("Error saving master data:", error);
        this.error = "Error during saving the data.";
      }
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

    triggerFileInput() {
      this.$refs.fileInput.click();
    }
  },
};
</script>

<style scoped>
</style>
