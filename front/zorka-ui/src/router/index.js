﻿import Vue from 'vue';
import Router from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegistrationPage from '@/views/RegistrationPage.vue';
import ClientProfilePage from '@/views/ClientProfilePage.vue';
import HistoryPage from '@/views/HistoryPage.vue';
import BookServicePage from '@/views/BookServicePage.vue';
import ClientListPage from '@/views/ClientListPage.vue'; // Страница клиентов
import MasterListPage from '@/views/MasterListPage.vue'; // Страница мастеров
import ServiceListPage from '@/views/ServiceListPage.vue'; // Страница услуг
import EditServicePage from '@/views/EditServicePage.vue'; // Страница редактирования услуг
import EditMasterPage from '@/views/EditMasterPage.vue'; // Страница услуг
import CurrentPage from '@/views/CurrentPage.vue'; // Страница услуг

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
        {
            path: '/admin/clients',
            name: 'ClientListPage',
            component: ClientListPage,
        },
        {
            path: '/admin/masters',
            name: 'MasterListPage',
            component: MasterListPage,
        },
        {
            path: '/admin/services',
            name: 'ServiceListPage',
            component: ServiceListPage,
        },
        {
            path: '/admin/current',
            name: 'CurrentPage',
            component: CurrentPage,
        },
        {
            path: '/edit-service/:id?',
            name: 'EditService',
            component: EditServicePage, // Страница редактирования сервиса
        },
        {
            path: '/edit-master/:id?',
            name: 'EditMaster',
            component: EditMasterPage, // Страница редактирования сервиса
        },
    ]
});
