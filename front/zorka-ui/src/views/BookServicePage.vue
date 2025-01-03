<template>
  <div class="demo-app">
    <div class="demo-app-sidebar">
      <!-- Секция с выпадающим списком услуг -->
      <div class="demo-app-sidebar-section">
        <h2>Select a Service</h2>
        <v-select
            v-model="selectedService"
            :items="services"
            label="Choose a service"
            item-text="name"
            item-value="id"
            dense
            @change="fetchAvailability"
        />
      </div>

      <div class="demo-app-sidebar-section">
        <label>
          <input
              type="checkbox"
              :checked="calendarOptions.weekends"
              @change="handleWeekendsToggle"
          />
          toggle weekends
        </label>
      </div>

      <div class="demo-app-sidebar-section">
        <h2>All Events ({{ currentEvents.length }})</h2>
        <ul>
          <li v-for="event in currentEvents" :key="event.id">
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
    FullCalendar, // make the <FullCalendar> tag available
  },
  data() {
    return {
      selectedService: null,
      services: [], // массив для хранения данных об услугах
      calendarOptions: {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin, // needed for dateClick
        ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        initialView: 'dayGridMonth',
        initialEvents: [], // initially empty, will be populated dynamically
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
    };
  },
  created() {
    // Получаем токен из Vuex или localStorage
    const token = this.$store.getters.token || localStorage.getItem('token');

    // Если токен отсутствует, перенаправляем на страницу логина
    if (!token) {
      this.$router.push('/login');
      return;
    }

    // Загружаем данные с сервера при создании компонента
    axios
        .get('http://localhost:3000/services', {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((response) => {
          this.services = response.data; // Сохраняем полученные данные в массив
        })
        .catch((error) => {
          console.error('Error fetching services:', error);
        });
  },
  methods: {
    handleWeekendsToggle() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends; // update a property
    },

    handleDateSelect(selectInfo) {
      let title = prompt('Please enter a new title for your event');
      let calendarApi = selectInfo.view.calendar;

      calendarApi.unselect(); // clear date selection

      if (title) {
        calendarApi.addEvent({
          id: createEventId(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
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

    // Новый метод для получения доступности выбранной услуги
    fetchAvailability() {
      if (!this.selectedService) return; // Если услуга не выбрана, ничего не делаем

      const token = this.$store.getters.token || localStorage.getItem('token');

      if (!token) {
        this.$router.push('/login');
        return;
      }

      // Формируем URL для получения доступности
      const url = `http://localhost:3000/availability2/service/${this.selectedService}?range=week&start='2025-01-03'`;

      function incrementHour(dateString) {
        const date = new Date(dateString);

// Увеличиваем время на 2 часа
        date.setHours(date.getHours() + 1);

        return date.toISOString()
      }


      // Загружаем доступные события с сервера
      axios
          .get(url, {
            headers: {
              Authorization: `${token}`, // Добавляем токен в заголовок
            },
          })
          .then((response) => {
            // Обновляем события в календаре
            console.log(response.data.events);
            this.calendarOptions.events = response.data.events.map((event) => ({
              id: createEventId(),
              title: event.description,
              start: event.start_time,
              end: incrementHour(event.start_time),
              description: event.description,
              allDay: false,
            }));
            console.log(this.calendarOptions.events);
          })
          .catch((error) => {
            console.error('Error fetching events:', error);
          });
    },
  },
};
</script>

<style lang="css">
h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b {
  /* used for event dates/times */
  margin-right: 3px;
}

.demo-app {
  display: flex;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.demo-app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.demo-app-sidebar-section {
  padding: 2em;
}

.demo-app-main {
  flex-grow: 1;
  padding: 3em;
}

.fc {
  /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
}
</style>
