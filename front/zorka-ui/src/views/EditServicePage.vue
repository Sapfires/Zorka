<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">Edit Service</span>
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
                  v-model="serviceData.name"
                  label="Service Name"
                  :rules="nameRules"
                  required
              ></v-text-field>

              <v-textarea
                  v-model="serviceData.description"
                  label="Service Description"
                  :rules="descriptionRules"
                  required
              ></v-textarea>

              <v-text-field
                  v-model="serviceData.price"
                  label="Price"
                  type="number"
                  :rules="priceRules"
                  required
              ></v-text-field>

              <v-text-field
                  v-model="serviceData.duration"
                  label="Duration (minutes)"
                  type="number"
                  :rules="durationRules"
                  required
              ></v-text-field>

              <v-btn @click="saveService" color="primary" :disabled="isUploading || !valid || !imageBase64">
                Save
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
  name: "ServiceEditPage",
  data() {
    return {
      imageBase64: "",
      isUploading: false,
      error: "",
      valid: false,
      serviceData: {
        name: "",
        description: "",
        price: "",
        duration: "",
      },
      nameRules: [
        v => !!v || "Name is required",
        v => v.length <= 50 || "Name must be less than 50 characters",
      ],
      descriptionRules: [
        v => !!v || "Description is required",
        v => v.length <= 200 || "Description must be less than 200 characters",
      ],
      priceRules: [
        v => !!v || "Price is required",
        v => /^[0-9]+(\.[0-9]{1,2})?$/.test(v) || "Price must be a valid number",
      ],
      durationRules: [
        v => !!v || "Duration is required",
        v => /^[0-9]+$/.test(v) || "Duration must be a valid number",
      ],
      serviceId: this.$route.params.id || null,
    };
  },
  created() {
    if(this.serviceId !== null) {
      this.loadServiceData();
    }

  },
  methods: {
    async loadServiceData() {
      try {
        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const response = await axios.get(`http://localhost:3000/services/${this.serviceId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        this.serviceData = response.data;

        this.imageBase64 = response.data.photo;
      } catch (error) {
        console.error("Error fetching service data:", error);
        this.error = "Failed to load service data. Please try again later.";
      }
    },

    async saveService() {
      try {
        this.isUploading = true;
        this.error = "";

        const token = this.$store.getters.token || localStorage.getItem("token");

        if (!token) {
          await this.$router.push("/login");
          return;
        }

        const payload = {
          name: this.serviceData.name,
          description: this.serviceData.description,
          price: this.serviceData.price,
          duration: this.serviceData.duration,
          photo: this.imageBase64,
        };
        let response = {};
        if(this.serviceId !== null) {
          response = await axios.put(
              `http://localhost:3000/services/${this.serviceId}`,
              payload,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
          );
        } else {
          response = await axios.post(
              `http://localhost:3000/services`,
              payload,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
          );
        }

        this.imageBase64 = response.data.photo;
        this.isUploading = false;
        await this.$router.push("/admin/services");
      } catch (error) {
        console.error("Error saving service:", error);
        this.error = "Failed to save service. Please try again later.";
        this.isUploading = false;
      }
    },

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
  },
};
</script>

<style scoped>
.v-avatar {
  border-radius: 10px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.v-avatar img {
  object-fit: cover;
}
</style>
