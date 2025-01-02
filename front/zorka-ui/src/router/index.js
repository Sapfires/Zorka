import Vue from 'vue';
import Router from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegistrationPage from '@/views/RegistrationPage.vue';
import ClientProfilePage from '@/views/ClientProfilePage.vue';
import HistoryPage from '@/views/HistoryPage.vue';
import BookServicePage from '@/views/BookServicePage.vue';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'LandingPage',
            component: LandingPage
        },
        {
            path: '/login',
            name: 'LoginPage',
            component: LoginPage
        },
        {
            path: '/register',
            name: 'RegistrationPage',
            component: RegistrationPage
        },
        {
            path: '/profile',
            name: 'ClientProfilePage',
            component: ClientProfilePage,
        },
        {
            path: '/history',
            name: 'HistoryPage',
            component: HistoryPage,
        },
        {
            path: '/book-service',
            name: 'BookServicePage',
            component: BookServicePage,
        },
    ]
});
