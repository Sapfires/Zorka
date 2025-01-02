<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="6" offset-md="2" offset-lg="3">
        <v-card>
          <v-card-title>
            <span class="headline">Book Service</span>
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-menu
                  v-model="menuDate"
                  :return-value.sync="date"
                  transition="scale-transition"
                  offset-y
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      label="Date"
                      :rules="[rules.required]"
                      readonly
                      :value="date ? date : 'Select Date'"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="date" @input="menuDate = false"></v-date-picker>
              </v-menu>

              <v-menu
                  v-model="menuTime"
                  :return-value.sync="time"
                  transition="scale-transition"
                  offset-y
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      label="Time"
                      :rules="[rules.required]"
                      readonly
                      :value="time ? time : 'Select Time'"
                  ></v-text-field>
                </template>
                <v-time-picker v-model="time" @input="menuTime = false"></v-time-picker>
              </v-menu>

              <v-select
                  label="Master"
                  v-model="master"
                  :items="masters"
                  :rules="[rules.required]"
              ></v-select>

              <v-select
                  label="Service"
                  v-model="service"
                  :items="services"
                  :rules="[rules.required]"
              ></v-select>

              <v-btn color="primary" @click="bookService">Book Service</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "BookServicePage",
  data() {
    return {
      menuDate: false,
      menuTime: false,
      date: "",
      time: "",
      master: null,
      service: null,
      masters: ["Master 1", "Master 2", "Master 3"],
      services: ["Massage", "Facial", "Haircut", "Manicure"],
      rules: {
        required: (value) => !!value || "This field is required.",
      },
    };
  },
  methods: {
    bookService() {
      // Логика для записи на услугу (например, отправка данных на сервер)
      console.log("Service booked with the following details:", {
        date: this.date,
        time: this.time,
        master: this.master,
        service: this.service,
      });
    },
  },
};
</script>

<style scoped>
/* Стили для страницы BookService */
.v-card {
  max-width: 600px;
  margin: auto;
}
</style>
