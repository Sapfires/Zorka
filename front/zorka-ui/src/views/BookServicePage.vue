<template>
  <div class="demo-app">
    <div class="demo-app-sidebar">
      <div class="demo-app-sidebar-section">
        <h2>Select a Service</h2>
        <v-select
            v-model="selectedService"
            :items="services"
            label="Choose a service"
            item-text="name"
            item-value="id"
            dense
            outlined
            @change="handleServiceChange"
        />
      </div>

      <div class="demo-app-sidebar-section" v-if="masters.length > 0">
        <h2>Select a Master</h2>
        <v-select
            v-model="selectedMaster"
            :items="masters"
            label="Choose a master"
            item-text="fullName"
            item-value="id"
            dense
            outlined
            @change="fetchMasterSchedule"
        />
      </div>

      <div class="demo-app-sidebar-section">
        <v-checkbox
            v-model="calendarOptions.weekends"
            label="Show weekends"
            @change="handleWeekendsToggle"
        />
      </div>

      <div class="demo-app-sidebar-section">
        <v-btn
            @click="toggleEventsVisibility"
            color="primary"
            small
        >
          {{ showEvents ? 'Hide Events' : 'Show Events' }}
        </v-btn>
      </div>

      <div class="demo-app-sidebar-section" v-if="showEvents">
        <h2>All Events ({{ currentEvents.length }})</h2>
        <ul class="event-list">
          <li v-for="event in currentEvents" :key="event.id" class="event-item">
            <b>{{ event.startStr }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>
      </div>
    </div>

    <div class="demo-app-main">
      <FullCalendar
          class="demo-app-calendar"
          :options="calendarOptions"
      >
        <template v-slot:eventContent="arg">
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import {createEventId} from "@/utils/event-utils";

export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      selectedService: null,
      selectedMaster: null,
      services: [],
      masters: [],
      calendarOptions: {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        initialView: 'dayGridMonth',
        initialEvents: [],
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        events: []
      },
      currentEvents: [],
      showEvents: false,
    };
  },
  created() {
    const token = this.$store.getters.token || localStorage.getItem('token');

    if (!token) {
      this.$router.push('/login');
      return;
    }

    axios
        .get('http://localhost:3000/services', {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((response) => {
          this.services = response.data;
          if (this.selectedService) {
            this.fetchAvailability();
          }
        })
        .catch((error) => {
          console.error('Error fetching services:', error);
        });
  },
  methods: {
    handleWeekendsToggle() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends;
    },

    handleDateSelect(selectInfo) {
      if (!this.selectedService || !this.selectedMaster) {
        alert('Please select a service and a master before adding an event.');
        return;
      }

      const selectedServiceName = this.services.find(service => service.id === this.selectedService)?.name;
      const selectedMasterName = this.masters.find(master => master.id === this.selectedMaster)?.fullName;

      const confirmationMessage = `You are about to register for the service: ${selectedServiceName} with master: ${selectedMasterName}. Confirm?`;

      if (confirm(confirmationMessage)) {
        const newEvent = {
          service_id: this.selectedService,
          client_id: this.$store.getters.userId,
          master_id: this.selectedMaster,
          start_time: selectInfo.startStr,
          end_time: selectInfo.endStr,
        };

        axios
            .post('http://localhost:3000/schedule', newEvent, {
              headers: {
                Authorization: `${this.$store.getters.token}`,
              },
            })
            .then(() => {
              const calendarApi = selectInfo.view.calendar;
              calendarApi.unselect();
              calendarApi.addEvent({
                id: createEventId(),
                title: selectedServiceName,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay,
              });
            })
            .catch((error) => {
              console.error('Error saving event:', error);
            });
      }
    },

    handleEventClick(clickInfo) {
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        clickInfo.event.remove();
      }
    },

    handleEvents(events) {
      this.currentEvents = events;
    },

    handleServiceChange() {
      this.fetchMasters();
    },

    fetchMasters() {
      if (!this.selectedService) return;

      const token = this.$store.getters.token || localStorage.getItem('token');

      axios
          .get(`http://localhost:3000/services/${this.selectedService}/masters`, {
            headers: {
              Authorization: `${token}`,
            },
          })
          .then((response) => {
            this.masters = response.data.map(master => ({
              id: master.id,
              fullName: `${master.first_name} ${master.last_name}`,
            }));
          })
          .catch((error) => {
            console.error('Error fetching masters:', error);
          });
    },

    fetchMasterSchedule() {
      if (!this.selectedMaster) return;

      const token = this.$store.getters.token || localStorage.getItem('token');

      axios
          .get(`http://localhost:3000/schedule/master/${this.selectedMaster}`, {
            headers: {
              Authorization: `${token}`,
            },
          })
          .then((response) => {
            const masterEvents = response.data.map(event => ({
              id: event.id,
              title: `${event.service_name} - ${event.description}`,
              start: event.start_time,
              end: event.end_time,
              description: `${event.service_name} for ${event.client_name}`,
              allDay: false,
            }));

            this.calendarOptions.events = [
              ...this.calendarOptions.events,
              ...masterEvents
            ];
          })
          .catch((error) => {
            console.error('Error fetching master schedule:', error);
          });
    },

    toggleEventsVisibility() {
      this.showEvents = !this.showEvents;
    },
  },
};
</script>

<style lang="scss">
.demo-app {
  display: flex;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  background-color: #f8f9fa;
}

.demo-app-sidebar {
  width: 300px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  padding: 1.5em;
}

.demo-app-sidebar-section {
  margin-bottom: 1.5em;

  h2 {
    font-size: 18px;
    color: #333;
    margin-bottom: 0.5em;
  }

  .v-select {
    margin-bottom: 1em;
  }

  .v-checkbox {
    margin-top: 1em;
  }
}

.event-list {
  list-style: none;
  padding: 0;
  margin: 0;

  .event-item {
    padding: 0.5em 0;
    border-bottom: 1px solid #e0e0e0;

    &:last-child {
      border-bottom: none;
    }

    b {
      font-weight: bold;
      margin-right: 0.5em;
    }

    i {
      color: #666;
    }
  }
}

.demo-app-main {
  flex-grow: 1;
  padding: 2em;
  background-color: #ffffff;
}

.fc {
  max-width: 1100px;
  margin: 0 auto;
}

.fc-header-toolbar {
  margin-bottom: 1em;
}

.fc-event {
  background-color: #4a90e2;
  border: none;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  color: #fff;
}

.fc-daygrid-event {
  cursor: pointer;
}

.fc-daygrid-event:hover {
  opacity: 0.9;
}
</style>