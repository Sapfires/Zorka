<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="headline">{{ isEditing ? 'Edit Service' : 'Service Details' }}</span>
          </v-card-title>

          <v-card-text>
            <v-form ref="serviceForm" v-model="formValid" lazy-validation>
              <v-text-field
                  v-model="service.name"
                  label="Service Name"
                  :rules="[v => !!v || 'Name is required']"
                  :readonly="!isEditing"
              ></v-text-field>

              <v-text-field
                  v-model="service.price"
                  label="Price"
                  type="number"
                  :rules="[v => !!v || 'Price is required']"
                  :readonly="!isEditing"
              ></v-text-field>

              <v-text-field
                  v-model="service.duration"
                  label="Duration (minutes)"
                  type="number"
                  :rules="[v => !!v || 'Duration is required']"
                  :readonly="!isEditing"
              ></v-text-field>

              <v-textarea
                  v-model="service.description"
                  label="Description"
                  :readonly="!isEditing"
              ></v-textarea>

              <v-file-input
                  v-model="service.photo"
                  label="Service Photo"
                  accept="image/*"
                  :disabled="!isEditing"
              ></v-file-input>

              <v-btn
                  v-if="isEditing"
                  color="primary"
                  @click="saveService"
                  :disabled="!formValid"
              >Save</v-btn>

              <v-btn
                  v-else
                  color="primary"
                  @click="editService"
              >Edit</v-btn>

              <v-btn
                  v-if="isEditing"
                  color="secondary"
                  @click="cancelEditing"
              >Cancel</v-btn>
            </v-form>

            <v-divider v-if="!isEditing"></v-divider>
            <v-row v-if="!isEditing">
              <v-col cols="12" sm="6">
                <p><strong>Name:</strong> {{ service.name }}</p>
                <p><strong>Price:</strong> {{ service.price }}</p>
                <p><strong>Duration:</strong> {{ service.duration }} min</p>
                <p><strong>Description:</strong> {{ service.description }}</p>
                <v-img
                    v-if="service.photo"
                    :src="service.photo"
                    max-width="100"
                    max-height="100"
                    alt="Service Photo"
                ></v-img>
              </v-col>
            </v-row>

            <v-alert v-if="error" type="error" dismissible>
              {{ error }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "ServicePage",
  data() {
    return {
      service: {
        id: null,
        name: "",
        price: "",
        duration: "",
        description: "",
        photo: null,
      },
      isEditing: false,
      formValid: false,
      error: "",
    };
  },
  created() {
    const token = this.$store.getters.token || localStorage.getItem("token");

    if (!token) {
      this.$router.push("/login");
      return;
    }

    this.loadService();
  },
  methods: {
    async loadService() {
      const serviceId = this.$route.params.id;

      if (serviceId) {
        try {
          const response = await axios.get(`http://localhost:3000/services/${serviceId}`, {
            headers: {
              Authorization: `${this.$store.getters.token || localStorage.getItem("token")}`,
            },
          });

          this.service = response.data;
        } catch (error) {
          console.error("Error fetching service:", error);
          this.error = "Failed to load service. Please try again later.";
        }
      }
    },

    editService() {
      this.isEditing = true;
    },

    cancelEditing() {
      this.isEditing = false;
      this.loadService();
    },

    async saveService() {
      try {
        const serviceId = this.service.id;
        let response;

        const token = this.$store.getters.token || localStorage.getItem("token");

        if (serviceId) {
          response = await axios.put(`http://localhost:3000/services/${serviceId}`, this.service, {
            headers: {
              Authorization: `${token}`,
            },
          });
        } else {
          response = await axios.post("http://localhost:3000/services", this.service, {
            headers: {
              Authorization: `${token}`,
            },
          });
        }

        this.service = response.data;
        this.isEditing = false;
      } catch (error) {
        console.error("Error saving service:", error);
        this.error = "Failed to save service. Please try again later.";
      }
    },
  },
};
</script>

<style scoped>
</style>
