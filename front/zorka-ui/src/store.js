import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userRole: '', // Роль по умолчанию
        token: '', // Токен по умолчанию
        userId: '', // ID пользователя
    },
    mutations: {
        setUserRole(state, role) {
            state.userRole = role.toUpperCase(); // Приводим роль в верхний регистр
        },
        setToken(state, token) {
            state.token = token;
        },
        setUserId(state, userId) {
            state.userId = userId;
        },
    },
    actions: {
        setRole({ commit }, role) {
            commit('setUserRole', role);
        },
        setToken({ commit }, token) {
            commit('setToken', token);
        },
        setUserId({ commit }, userId) {
            commit('setUserId', userId);
        },
    },
    getters: {
        userRole: (state) => state.userRole,
        token: (state) => state.token,
        userId: (state) => state.userId, // Добавляем геттер для userId
    },
});
